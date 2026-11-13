import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Query, status
from supabase import Client
from app.core.database import get_db
from app.schemas.classroom import PayoutProfileUpsert, CheckoutRequest, WebhookPaymentRequest
from app.services import payment_service

router = APIRouter()

# Bellek içi yedek havuz (Veritabanı veya ağ kesintilerinde bile çalışmayı garanti eder)
IN_MEMORY_PAYOUT_PROFILES: Dict[str, Dict[str, Any]] = {}


def get_user_payout_profile(user_id: str, db: Optional[Client] = None) -> Optional[Dict[str, Any]]:
    """Kullanıcının IBAN / Hakediş profilini getirir."""
    if not user_id:
        return None

    if db:
        try:
            res = db.table("payout_profiles").select("*").eq("user_id", user_id).execute()
            if res.data and len(res.data) > 0:
                profile = res.data[0]
                IN_MEMORY_PAYOUT_PROFILES[user_id] = profile
                return profile
        except Exception as e:
            print(f"[DB Get Payout Profile Error]: {e}")

    return IN_MEMORY_PAYOUT_PROFILES.get(user_id)


def has_payout_profile(user_id: str, db: Optional[Client] = None) -> bool:
    """Kullanıcının geçerli bir IBAN profili olup olmadığını kontrol eder."""
    profile = get_user_payout_profile(user_id, db=db)
    if profile and profile.get("iban"):
        return True
    return False


@router.get("/payout-profile", status_code=status.HTTP_200_OK)
def get_payout_profile_endpoint(
    user_id: str = Query(..., description="Kullanıcı benzersiz ID'si"),
    db: Client = Depends(get_db)
):
    """
    Kullanıcının IBAN / Hakediş kaydını kontrol eder.
    Kayıt yoksa {"has_profile": False, "profile": None} döner.
    """
    if not user_id.strip():
        raise HTTPException(status_code=400, detail="user_id parametresi zorunludur.")

    profile = get_user_payout_profile(user_id=user_id.strip(), db=db)
    if profile:
        return {
            "has_profile": True,
            "profile": profile
        }
    return {
        "has_profile": False,
        "profile": None
    }


@router.post("/payout-profile", status_code=status.HTTP_200_OK)
def upsert_payout_profile_endpoint(
    payload: PayoutProfileUpsert,
    db: Client = Depends(get_db)
):
    """
    IBAN, Yasal Ad Soyad ve T.C. / Vergi Kimlik No alanlarını payout_profiles tablosuna upsert eder.
    IBAN içerisindeki boşlukları temizler ve büyük harfe çevirir.
    """
    user_id = payload.user_id.strip()
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id zorunludur.")

    # IBAN temizleme ve büyük harfe çevirme
    clean_iban = payload.iban.replace(" ", "").upper()
    if not clean_iban:
        raise HTTPException(status_code=400, detail="Geçerli bir IBAN girilmelidir.")

    legal_name = payload.legal_full_name.strip()
    if not legal_name:
        raise HTTPException(status_code=400, detail="Yasal isim alanı zorunludur.")

    identity_num = payload.identity_number.strip()
    if not identity_num:
        raise HTTPException(status_code=400, detail="Kimlik numarası zorunludur.")

    account_type = (payload.account_type or "individual").strip().lower()
    now_iso = datetime.now(timezone.utc).isoformat()

    existing = get_user_payout_profile(user_id, db=db)

    if existing:
        profile_id = existing.get("id") or str(uuid.uuid4())
        update_data = {
            "account_type": account_type,
            "legal_full_name": legal_name,
            "identity_number": identity_num,
            "iban": clean_iban,
            "updated_at": now_iso
        }
        if db:
            try:
                db.table("payout_profiles").update(update_data).eq("user_id", user_id).execute()
            except Exception as e:
                print(f"[DB Payout Profile Update Error]: {e}")
        saved_profile = {**existing, **update_data}
    else:
        profile_id = str(uuid.uuid4())
        insert_data = {
            "id": profile_id,
            "user_id": user_id,
            "account_type": account_type,
            "legal_full_name": legal_name,
            "identity_number": identity_num,
            "iban": clean_iban,
            "created_at": now_iso,
            "updated_at": now_iso
        }
        if db:
            try:
                db.table("payout_profiles").insert(insert_data).execute()
            except Exception as e:
                print(f"[DB Payout Profile Insert Error]: {e}")
        saved_profile = insert_data

    IN_MEMORY_PAYOUT_PROFILES[user_id] = saved_profile

    return {
        "success": True,
        "has_profile": True,
        "profile": saved_profile
    }


# =========================================================================
# FAZ 5: ÖDEME GEÇİDİ, SPLIT PAYMENT, WEBHOOK & HAKEDİŞ RAPORU
# =========================================================================

@router.post("/checkout", status_code=status.HTTP_200_OK)
def create_checkout_endpoint(
    payload: CheckoutRequest,
    db: Client = Depends(get_db)
):
    """
    Ücretli ders için Split Payment (%12 platform, %88 eğitmen) ödeme oturumu başlatır.
    İyziCo veya Stripe anahtarları tanımlıysa sağlayıcı oturumu, değilse güvenli Sandbox URL döner.
    """
    if not payload.user_id.strip() or not payload.class_id.strip():
        raise HTTPException(status_code=400, detail="user_id ve class_id alanları zorunludur.")

    result = payment_service.create_checkout_session(
        user_id=payload.user_id.strip(),
        class_id=payload.class_id.strip(),
        session_id=payload.session_id,
        db=db
    )

    if "error" in result:
        if result["error"] == "CLASS_NOT_FOUND":
            raise HTTPException(status_code=404, detail=result.get("message", "Sınıf bulunamadı."))
        elif result["error"] == "FREE_CLASS":
            return result
        raise HTTPException(status_code=400, detail=result.get("message", "Ödeme oturumu açılamadı."))

    return result


@router.post("/webhook", status_code=status.HTTP_200_OK)
def payment_webhook_endpoint(
    payload: WebhookPaymentRequest,
    db: Client = Depends(get_db)
):
    """
    Ödeme sağlayıcıdan veya Sandbox onayından gelen başarılı ödeme bildirimini işler:
    1. session_attendees tablosunda öğrencinin kaydını payment_status='paid' (veya 'subscription_active') yapar.
    2. Öğrencinin derse ve canlı odaya katılım kilidini anında açar.
    """
    if not payload.transaction_id.strip():
        raise HTTPException(status_code=400, detail="transaction_id zorunludur.")

    if payload.status != "success":
        return {
            "success": False,
            "transaction_id": payload.transaction_id,
            "message": "Ödeme başarısız veya iptal edilmiş durumda."
        }

    result = payment_service.process_successful_payment(
        transaction_id=payload.transaction_id.strip(),
        db=db,
        custom_data=payload.model_dump()
    )

    if "error" in result:
        raise HTTPException(status_code=404, detail=result.get("message", "İşlem bulunamadı."))

    return result


@router.get("/earnings", status_code=status.HTTP_200_OK)
def get_teacher_earnings_endpoint(
    teacher_id: str = Query(..., description="Eğitmenin benzersiz ID'si"),
    db: Client = Depends(get_db)
):
    """
    Eğitmenin verdiği ücretli derslerden elde ettiği toplam brüt tahsilatı,
    %12 platform altyapı komisyonunu ve net %88 IBAN hakedişini döndürür.
    """
    if not teacher_id.strip():
        raise HTTPException(status_code=400, detail="teacher_id parametresi zorunludur.")

    return payment_service.get_teacher_earnings(teacher_id=teacher_id.strip(), db=db)



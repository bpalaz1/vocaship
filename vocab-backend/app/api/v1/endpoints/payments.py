import os
import hmac
import json
import uuid
import hashlib
import urllib.request
import urllib.error
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, Literal
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Depends, Query, Request, status
from supabase import Client
from app.core.database import get_db
from app.core.local_db import LocalDatabaseClient
from app.schemas.classroom import PayoutProfileUpsert, CheckoutRequest, WebhookPaymentRequest
from app.services import payment_service

router = APIRouter()
_local_payment_db = LocalDatabaseClient()
PRO_CHECKOUT_SESSIONS: Dict[str, Dict[str, Any]] = {}

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


# =========================================================================
# BİREYSEL PRO ÜYELİK ÖDEMESİ & SINIF BİLETİ ONAY AKIŞI
# =========================================================================

class UpgradeProCheckoutRequest(BaseModel):
    user_id: str
    plan_period: Literal["monthly", "yearly"] = "monthly"
    provider: Literal["iyzico", "stripe", "sandbox"] = "sandbox"


class ConfirmProCheckoutRequest(BaseModel):
    user_id: str
    transaction_id: Optional[str] = None
    plan_period: Literal["monthly", "yearly"] = "monthly"


class ConfirmClassCheckoutRequest(BaseModel):
    user_id: str
    class_id: str
    session_id: Optional[str] = None
    transaction_id: Optional[str] = None


@router.post("/upgrade-pro", status_code=status.HTTP_200_OK)
def create_pro_checkout_endpoint(payload: UpgradeProCheckoutRequest):
    """
    Bireysel PRO üyelik ödemesi için İyzico / Stripe veya Sandbox checkout oturumu oluşturur.
    """
    if not payload.user_id.strip():
        raise HTTPException(status_code=400, detail="user_id zorunludur.")

    amount = 1790.0 if payload.plan_period == "yearly" else 199.0
    tx_id = f"pro-{uuid.uuid4().hex[:12]}"

    iyzico_key = os.getenv("IYZICO_API_KEY")
    stripe_key = os.getenv("STRIPE_SECRET_KEY")

    resolved_provider = payload.provider
    if payload.provider == "iyzico" and not iyzico_key:
        resolved_provider = "sandbox"
    elif payload.provider == "stripe" and not stripe_key:
        resolved_provider = "sandbox"

    checkout_url = (
        f"/payments/sandbox?tx={tx_id}&plan={payload.plan_period}&provider={resolved_provider}"
        if resolved_provider == "sandbox"
        else f"/payments/{resolved_provider}/checkout?tx={tx_id}&plan={payload.plan_period}"
    )

    session_data = {
        "success": True,
        "transaction_id": tx_id,
        "user_id": payload.user_id.strip(),
        "plan_period": payload.plan_period,
        "provider": resolved_provider,
        "amount": amount,
        "currency": "TRY",
        "checkout_url": checkout_url,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    PRO_CHECKOUT_SESSIONS[tx_id] = session_data
    return session_data


@router.post("/confirm-pro", status_code=status.HTTP_200_OK)
def confirm_pro_checkout_endpoint(
    payload: ConfirmProCheckoutRequest,
    db: Client = Depends(get_db),
):
    """
    PRO üyelik ödemesini onaylar ve kullanıcının is_pro, plan_tier, subscription_status
    ve pro_expires_at alanlarını günceller.
    """
    user_id = payload.user_id.strip()
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id zorunludur.")

    period = payload.plan_period
    if payload.transaction_id and payload.transaction_id in PRO_CHECKOUT_SESSIONS:
        sess = PRO_CHECKOUT_SESSIONS[payload.transaction_id]
        sess["status"] = "completed"
        period = sess.get("plan_period", period)

    days = 365 if period == "yearly" else 30
    expires_at = (datetime.now(timezone.utc) + timedelta(days=days)).isoformat()

    update_fields = {
        "is_pro": True,
        "plan_tier": "pro",
        "subscription_status": "active",
        "pro_expires_at": expires_at,
    }

    if db:
        try:
            db.table("users").update(update_fields).eq("id", user_id).execute()
        except Exception as exc:
            print(f"[DB Confirm PRO Update Warning]: {exc}")

    try:
        _local_payment_db.table("users").update(update_fields).eq("id", user_id).execute()
    except Exception as exc:
        print(f"[LocalDB Confirm PRO Update Warning]: {exc}")

    return {
        "success": True,
        "user_id": user_id,
        "transaction_id": payload.transaction_id,
        "is_pro": True,
        "plan_tier": "pro",
        "subscription_status": "active",
        "pro_expires_at": expires_at,
    }


@router.post("/confirm-class", status_code=status.HTTP_200_OK)
def confirm_class_checkout_endpoint(
    payload: ConfirmClassCheckoutRequest,
    db: Client = Depends(get_db),
):
    """
    Ücretli sınıf/ders bilet ödemesini onaylar ve öğrenciye payment_status='paid' bileti tanımlar.
    """
    if payload.transaction_id:
        result = payment_service.process_successful_payment(
            transaction_id=payload.transaction_id.strip(),
            db=db,
            custom_data=payload.model_dump(),
        )
        if "error" not in result:
            return result

    if not payload.user_id.strip() or not payload.class_id.strip():
        raise HTTPException(status_code=400, detail="user_id ve class_id zorunludur.")

    now_iso = datetime.now(timezone.utc).isoformat()
    attendee_row = {
        "id": str(uuid.uuid4()),
        "class_id": payload.class_id.strip(),
        "session_id": payload.session_id,
        "user_id": payload.user_id.strip(),
        "payment_status": "paid",
        "joined_at": now_iso,
        "created_at": now_iso,
    }
    if db:
        try:
            db.table("session_attendees").insert(attendee_row).execute()
        except Exception as exc:
            print(f"[DB Confirm Class Insert Warning]: {exc}")

    return {
        "success": True,
        "class_id": payload.class_id.strip(),
        "user_id": payload.user_id.strip(),
        "payment_status": "paid",
        "access_granted": True,
    }


# =========================================================================
# PADDLE BILLING CHECKOUT & HMAC-SHA256 WEBHOOK ENTEGRASYONU
# =========================================================================

class PaddleCheckoutRequest(BaseModel):
    user_id: str
    email: Optional[str] = None
    plan_period: Literal["monthly", "yearly"] = "monthly"


class PaddleConfirmClientRequest(BaseModel):
    user_id: str
    transaction_id: str


def _get_paddle_api_base() -> tuple[str, str]:
    env = (os.getenv("PADDLE_ENVIRONMENT") or "sandbox").strip().lower()
    if env == "production":
        return "production", "https://api.paddle.com"
    return "sandbox", "https://sandbox-api.paddle.com"


def _verify_paddle_signature(raw_body: bytes, signature_header: str, secret: str) -> bool:
    """
    Paddle-Signature: ts=<unix_ts>;h1=<hex_hmac_sha256>
    İmzalanan metin: "{ts}:{raw_body_utf8}"
    """
    if not signature_header or not secret:
        return False

    ts_val: Optional[str] = None
    signatures: list[str] = []
    for part in signature_header.split(";"):
        piece = part.strip()
        if "=" not in piece:
            continue
        k, v = piece.split("=", 1)
        k = k.strip().lower()
        v = v.strip()
        if k == "ts":
            ts_val = v
        elif k == "h1" and v:
            signatures.append(v)

    if not ts_val or not signatures:
        return False

    signed_payload = f"{ts_val}:{raw_body.decode('utf-8')}".encode("utf-8")
    expected = hmac.new(secret.encode("utf-8"), signed_payload, hashlib.sha256).hexdigest()
    return any(hmac.compare_digest(expected, sig) for sig in signatures)


def _update_user_subscription(
    db: Optional[Client],
    updates: Dict[str, Any],
    user_id: Optional[str] = None,
    subscription_id: Optional[str] = None,
) -> None:
    if not user_id and not subscription_id:
        return

    def _apply(client: Any, label: str) -> None:
        if not client:
            return
        try:
            q = client.table("users").update(updates)
            if user_id:
                q.eq("id", user_id).execute()
            elif subscription_id:
                q.eq("lemon_subscription_id", subscription_id).execute()
        except Exception as exc:
            print(f"[{label} Paddle Update Warning]: {exc}")
            # Fallback if optional columns don't exist yet on remote Supabase
            safe_updates = {k: v for k, v in updates.items() if k in ("is_pro", "is_educator", "plan_tier", "subscription_status")}
            if safe_updates:
                try:
                    q2 = client.table("users").update(safe_updates)
                    if user_id:
                        q2.eq("id", user_id).execute()
                except Exception:
                    pass

    _apply(db, "PrimaryDB")
    _apply(_local_payment_db, "LocalDB")


@router.post("/paddle/checkout", status_code=status.HTTP_200_OK)
def create_paddle_checkout_endpoint(payload: PaddleCheckoutRequest):
    """
    Paddle Billing Transactions API üzerinden PRO abonelik checkout URL'i oluşturur.
    """
    user_id = payload.user_id.strip()
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id zorunludur.")

    api_key = (os.getenv("PADDLE_API_KEY") or "").strip()
    monthly_price_id = (os.getenv("PADDLE_MONTHLY_PRICE_ID") or "").strip()
    yearly_price_id = (os.getenv("PADDLE_YEARLY_PRICE_ID") or "").strip()
    selected_price_id = yearly_price_id if payload.plan_period == "yearly" else monthly_price_id
    env, base_url = _get_paddle_api_base()

    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Paddle ödeme altyapısı henüz yapılandırılmadı (PADDLE_API_KEY eksik).",
        )
    if not selected_price_id:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Seçilen plan ({payload.plan_period}) için Paddle price_id tanımlı değil.",
        )

    custom_data: Dict[str, Any] = {
        "user_id": user_id,
        "plan_period": payload.plan_period,
    }
    if payload.email and payload.email.strip():
        custom_data["email"] = payload.email.strip().lower()

    paddle_body: Dict[str, Any] = {
        "items": [
            {
                "price_id": selected_price_id,
                "quantity": 1,
            }
        ],
        "custom_data": custom_data,
    }

    url = f"{base_url}/transactions"
    req_bytes = json.dumps(paddle_body).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=req_bytes,
        method="POST",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            resp_data = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as http_err:
        err_text = http_err.read().decode("utf-8", errors="ignore")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Paddle API hatası ({http_err.code}): {err_text or http_err.reason}",
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Paddle API bağlantı hatası: {exc}",
        )

    tx_data = resp_data.get("data") or {}
    checkout_obj = tx_data.get("checkout") or resp_data.get("checkout") or {}
    checkout_url = checkout_obj.get("url")
    tx_id = tx_data.get("id")

    if not checkout_url:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Paddle yanıtında checkout.url bulunamadı. Lütfen Paddle Checkout varsayılan ödeme bağlantısını kontrol edin.",
        )

    return {
        "success": True,
        "environment": env,
        "transaction_id": tx_id,
        "plan_period": payload.plan_period,
        "checkout_url": checkout_url,
        "checkout": {"url": checkout_url},
    }


@router.post("/paddle/confirm-client", status_code=status.HTTP_200_OK)
def confirm_paddle_client_endpoint(
    payload: PaddleConfirmClientRequest,
    db: Client = Depends(get_db),
):
    """
    Paddle.js Overlay Checkout 'checkout.completed' sonrasında client tarafından çağrılır.
    Paddle API üzerinden transaction_id durumunu (completed / paid) sunucu tarafında doğrular
    ve hem Supabase hem SQLite (local_db) users tablosunda kullanıcıyı anında PRO yapar.
    """
    user_id = payload.user_id.strip()
    transaction_id = payload.transaction_id.strip()
    if not user_id or not transaction_id:
        raise HTTPException(
            status_code=400,
            detail="user_id ve transaction_id alanları zorunludur.",
        )

    api_key = (os.getenv("PADDLE_API_KEY") or "").strip()
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Paddle ödeme altyapısı henüz yapılandırılmadı (PADDLE_API_KEY eksik).",
        )

    env, base_url = _get_paddle_api_base()
    url = f"{base_url}/transactions/{transaction_id}"
    req = urllib.request.Request(
        url,
        method="GET",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Accept": "application/json",
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            resp_data = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as http_err:
        err_text = http_err.read().decode("utf-8", errors="ignore")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Paddle işlem doğrulama hatası ({http_err.code}): {err_text or http_err.reason}",
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Paddle API bağlantı hatası: {exc}",
        )

    tx_data = resp_data.get("data") or {}
    tx_status = str(tx_data.get("status") or "").lower().strip()
    payments_list = tx_data.get("payments") or []
    has_captured_payment = any(
        str(p.get("status") or "").lower().strip() in ("captured", "authorized")
        for p in payments_list
        if isinstance(p, dict)
    )

    if tx_status not in ("completed", "paid") and not (tx_status == "billed" and has_captured_payment):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"İşlem henüz tamamlanmamış (status={tx_status or 'unknown'}).",
        )

    custom_data = tx_data.get("custom_data") or {}
    tx_custom_user_id = str(custom_data.get("user_id") or "").strip()
    if tx_custom_user_id and tx_custom_user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem başka bir kullanıcı hesabına aittir.",
        )

    target_user_id = tx_custom_user_id or user_id
    customer_id = tx_data.get("customer_id")
    subscription_id = tx_data.get("subscription_id") or transaction_id

    updates: Dict[str, Any] = {
        "is_pro": True,
        "is_educator": True,
        "plan_tier": "pro",
        "subscription_status": "active",
        "lemon_customer_id": customer_id,
        "lemon_subscription_id": subscription_id,
    }
    _update_user_subscription(
        db=db,
        updates=updates,
        user_id=target_user_id,
        subscription_id=subscription_id,
    )

    return {
        "success": True,
        "environment": env,
        "user_id": target_user_id,
        "transaction_id": transaction_id,
        "transaction_status": tx_status,
        "plan_tier": "pro",
        "is_pro": True,
        "subscription_status": "active",
        "customer_id": customer_id,
        "subscription_id": subscription_id,
    }


@router.post("/paddle/webhook", status_code=status.HTTP_200_OK)
async def paddle_webhook_endpoint(
    request: Request,
    db: Client = Depends(get_db),
):
    """
    Paddle Billing webhook olaylarını Paddle-Signature (HMAC-SHA256) ile doğrular
    ve users tablosundaki abonelik durumunu günceller.
    """
    raw_body = await request.body()
    webhook_secret = (os.getenv("PADDLE_WEBHOOK_SECRET") or "").strip()
    signature_header = request.headers.get("Paddle-Signature") or request.headers.get("paddle-signature") or ""

    if not webhook_secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="PADDLE_WEBHOOK_SECRET tanımlı değil.",
        )

    if not _verify_paddle_signature(raw_body, signature_header, webhook_secret):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçersiz Paddle-Signature imzası.",
        )

    try:
        event = json.loads(raw_body.decode("utf-8"))
    except Exception:
        raise HTTPException(status_code=400, detail="Geçersiz JSON webhook gövdesi.")

    event_type = str(event.get("event_type") or "").strip()
    data = event.get("data") or {}
    custom_data = data.get("custom_data") or {}
    user_id = str(custom_data.get("user_id") or "").strip() or None
    customer_id = data.get("customer_id")
    subscription_id = data.get("subscription_id") or data.get("id")

    if event_type in ("transaction.completed", "subscription.activated"):
        updates: Dict[str, Any] = {
            "is_pro": True,
            "is_educator": True,
            "plan_tier": "pro",
            "subscription_status": "active",
            "lemon_customer_id": customer_id,
            "lemon_subscription_id": subscription_id,
        }
        _update_user_subscription(
            db=db,
            updates=updates,
            user_id=user_id,
            subscription_id=subscription_id,
        )
    elif event_type == "subscription.canceled":
        _update_user_subscription(
            db=db,
            updates={"subscription_status": "canceled"},
            user_id=user_id,
            subscription_id=subscription_id,
        )

    return {
        "success": True,
        "event_type": event_type,
        "user_id": user_id,
        "customer_id": customer_id,
        "subscription_id": subscription_id,
    }



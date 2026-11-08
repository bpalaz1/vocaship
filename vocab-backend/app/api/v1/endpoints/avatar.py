import os
import io
import base64
import logging
import asyncio
from typing import Optional
from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from google.genai import types
from app.services.ai_service import get_client

router = APIRouter()
logger = logging.getLogger(__name__)

# Zorunlu AI Prompt: Cozy Indie Video Game 3D Karakter Portresi
AVATAR_3D_COZY_GAME_PROMPT = (
    "Transform the person in this photo into a charming 3D animated character from a cozy indie video game. "
    "Keep the original facial structure, hair style, eye color, and key likeness clearly recognizable. "
    "Fun, slightly comical expression, soft pastel color palette, subtle magical sparkles floating around, "
    "heartwarming aesthetic, high-detail 3D digital art avatar portrait."
)

IMAGE_MODELS_PRIORITY = [
    "gemini-2.5-flash-image",
    "gemini-3.1-flash-image",
    "gemini-3-pro-image",
    "gemini-3.1-flash-lite-image",
]


@router.post("/transform")
@router.post("/transform-avatar-3d")
async def transform_avatar(
    file: UploadFile = File(...),
    gender: Optional[str] = Form(None),
):
    """
    Kullanıcının yüklediği fotoğrafı Google Gemini görsel üretim modeliyle
    gerçek bir 3D animasyon ve oyun karakteri portresine dönüştürür.
    Model hatası durumunda sahte resim döndürmez, açık ve net HTTPException fırlatır.
    """
    raw_bytes = await file.read()
    if not raw_bytes or len(raw_bytes) < 32:
        raise HTTPException(status_code=400, detail="Yüklenen görsel dosyası geçersiz veya boş.")

    mime_type = file.content_type or "image/jpeg"
    output_png_bytes: Optional[bytes] = None
    last_error_detail: Optional[str] = None

    prompt_to_use = AVATAR_3D_COZY_GAME_PROMPT
    if gender and gender.lower() in ("male", "erkek"):
        prompt_to_use += " The character is male."
    elif gender and gender.lower() in ("female", "kadin", "kadın"):
        prompt_to_use += " The character is female."

    # Google GenAI İstemcisini çağır
    try:
        client = get_client()
    except Exception as client_err:
        raise HTTPException(
            status_code=500,
            detail=f"Google GenAI istemcisi başlatılamadı: {str(client_err)}",
        )

    # Google Gemini Görsel Üretim Modellerini Sırayla Dene
    for model_name in IMAGE_MODELS_PRIORITY:
        try:
            logger.info(f"3D Avatar dönüşümü için model deneniyor: {model_name}")
            resp = await asyncio.wait_for(
                client.aio.models.generate_content(
                    model=model_name,
                    contents=[
                        types.Part.from_bytes(data=raw_bytes, mime_type=mime_type),
                        types.Part.from_text(text=prompt_to_use),
                    ],
                    config=types.GenerateContentConfig(
                        response_modalities=["IMAGE", "TEXT"],
                    ),
                ),
                timeout=25.0,
            )

            # Adaylardan üretilen inline görsel verisini çek
            for cand in getattr(resp, "candidates", []) or []:
                for part in getattr(cand.content, "parts", []) or []:
                    inline = getattr(part, "inline_data", None)
                    if inline and getattr(inline, "data", None):
                        data_val = inline.data
                        output_png_bytes = (
                            base64.b64decode(data_val)
                            if isinstance(data_val, str)
                            else bytes(data_val)
                        )
                        if output_png_bytes and len(output_png_bytes) > 64:
                            break
                if output_png_bytes:
                    break

            if output_png_bytes:
                logger.info(f"Model {model_name} ile 3D görsel başarıyla üretildi ({len(output_png_bytes)} bytes).")
                break

        except Exception as model_err:
            last_error_detail = str(model_err)
            logger.warning(f"Model {model_name} çağrısında hata: {last_error_detail}")
            # Kotada veya geçici hatada kısa bekleme
            if "429" in last_error_detail or "RESOURCE_EXHAUSTED" in last_error_detail:
                await asyncio.sleep(0.4)
            continue

    # Eğer AI görsel üretemediyse KESİNLİKLE sahte resim döndürme, net hata fırlat
    if not output_png_bytes:
        err_msg = last_error_detail or "Görsel üretim modeli geçerli bir çıktı üretemedi."
        if "RESOURCE_EXHAUSTED" in err_msg or "429" in err_msg:
            raise HTTPException(
                status_code=429,
                detail="Google Gemini görsel üretim modeli kotası dolu (429 RESOURCE_EXHAUSTED). Lütfen Google Cloud / AI Studio API planınızı kontrol edin veya hazır karakterlerden birini seçin.",
            )
        elif "NOT_FOUND" in err_msg or "404" in err_msg:
            raise HTTPException(
                status_code=404,
                detail=f"İstenen Gemini görsel modeli bulunamadı: {err_msg[:200]}",
            )
        else:
            raise HTTPException(
                status_code=502,
                detail=f"AI Görsel Üretim Hatası: {err_msg[:250]}",
            )

    # Başarılı görsel: public/avatars/custom_3d_user.png dosyasına kaydet
    public_avatar_rel = "/avatars/custom_3d_user.png"
    try:
        repo_root = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "..")
        )
        frontend_avatars_dir = os.path.join(repo_root, "quizwise-frontend", "public", "avatars")
        if os.path.isdir(frontend_avatars_dir):
            target_path = os.path.join(frontend_avatars_dir, "custom_3d_user.png")
            with open(target_path, "wb") as f_out:
                f_out.write(output_png_bytes)
    except Exception as save_err:
        logger.warning(f"Frontend avatars dizinine kaydedilemedi: {save_err}")

    # Base64 data-url formatında paketle
    b64_str = base64.b64encode(output_png_bytes).decode("utf-8")
    transformed_avatar_url = f"data:image/png;base64,{b64_str}"

    return {
        "success": True,
        "transformed_avatar_url": transformed_avatar_url,
        "avatar_url": public_avatar_rel,
        "data_url": transformed_avatar_url,
        "url": transformed_avatar_url,
        "style": "cozy_indie_3d_avatar",
        "prompt_used": prompt_to_use,
    }

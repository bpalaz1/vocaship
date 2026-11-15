import asyncio
import logging
import os
import time
from typing import Any, Dict, List, Optional

from google import genai
from google.genai import types

from app.core.config import settings

logger = logging.getLogger(__name__)

_MODEL_CACHE: Dict[str, Any] = {
    "api_key": "",
    "models": [],
    "expires_at": 0.0,
}

_EXCLUDED_FLASH_TOKENS = ("image", "tts", "audio", "live", "embedding", "robotics", "computer-use")
_FALLBACK_FLASH_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-3.8-flash",
    "gemini-3.6-flash",
]


def _get_clean_api_key() -> str:
    raw = os.getenv("GEMINI_API_KEY") or getattr(settings, "GEMINI_API_KEY", "") or ""
    return raw.strip().strip("\"'")


def _discover_flash_models(client: genai.Client, api_key: str) -> List[str]:
    now = time.time()
    if (
        _MODEL_CACHE["api_key"] == api_key
        and _MODEL_CACHE["models"]
        and now < _MODEL_CACHE["expires_at"]
    ):
        return list(_MODEL_CACHE["models"])

    discovered: List[str] = []
    try:
        for m in client.models.list():
            raw_name = str(getattr(m, "name", "") or "")
            short_name = raw_name.replace("models/", "").strip()
            lower_name = short_name.lower()
            if not short_name or "gemini" not in lower_name or "flash" not in lower_name:
                continue
            if any(tok in lower_name for tok in _EXCLUDED_FLASH_TOKENS):
                continue

            supported = (
                getattr(m, "supported_actions", None)
                or getattr(m, "supported_generation_methods", None)
                or []
            )
            if supported:
                supports_gen = any(
                    "generatecontent" in str(action).lower() for action in supported
                )
                if not supports_gen:
                    continue

            discovered.append(short_name)
    except Exception as list_err:
        logger.warning(f"client.models.list() failed during dynamic discovery: {list_err}")

    merged: List[str] = []
    seen = set()
    for candidate in [*discovered, *_FALLBACK_FLASH_MODELS]:
        if candidate and candidate not in seen:
            seen.add(candidate)
            merged.append(candidate)

    if discovered:
        _MODEL_CACHE["api_key"] = api_key
        _MODEL_CACHE["models"] = merged
        _MODEL_CACHE["expires_at"] = now + 300.0

    return merged


def _build_generate_config(
    model_name: str,
    json_mode: bool,
    system_instruction: Optional[str],
) -> types.GenerateContentConfig:
    cfg_kwargs: Dict[str, Any] = {
        "temperature": 0.4 if json_mode else 0.75,
    }
    if json_mode:
        cfg_kwargs["response_mime_type"] = "application/json"
    if system_instruction:
        cfg_kwargs["system_instruction"] = system_instruction
    if "2.5" in model_name and hasattr(types, "ThinkingConfig"):
        try:
            cfg_kwargs["thinking_config"] = types.ThinkingConfig(thinking_budget=0)
        except Exception:
            pass
    return types.GenerateContentConfig(**cfg_kwargs)


def get_working_gemini_response(
    prompt: str,
    json_mode: bool = False,
    system_instruction: Optional[str] = None,
    contents: Any = None,
) -> str:
    """
    Dinamik olarak API anahtarına açık Gemini Flash modellerini keşfeder ve
    çalışan ilk modelden yanıt döndürür.
    """
    api_key = _get_clean_api_key()
    if not api_key:
        raise ValueError("GEMINI_API_KEY tanımlı değil.")

    client = genai.Client(api_key=api_key)
    candidates = _discover_flash_models(client, api_key)
    payload_contents = contents if contents is not None else prompt

    last_error: Optional[Exception] = None
    for model_name in candidates:
        try:
            config = _build_generate_config(model_name, json_mode, system_instruction)
            response = client.models.generate_content(
                model=model_name,
                contents=payload_contents,
                config=config,
            )
            text = (getattr(response, "text", None) or "").strip()
            if text:
                return text
            raise ValueError(f"Model '{model_name}' boş yanıt döndürdü.")
        except Exception as err:
            last_error = err
            logger.warning(f"Gemini model '{model_name}' failed: {err}")

    raise last_error or RuntimeError("Hiçbir Gemini Flash modeli yanıt vermedi.")


async def async_get_working_gemini_response(
    prompt: str,
    json_mode: bool = False,
    system_instruction: Optional[str] = None,
    contents: Any = None,
    timeout_seconds: float = 8.0,
) -> str:
    """Asenkron FastAPI uçları için zaman aşımı korumalı dinamik Gemini çağrısı."""
    return await asyncio.wait_for(
        asyncio.to_thread(
            get_working_gemini_response,
            prompt,
            json_mode,
            system_instruction,
            contents,
        ),
        timeout=timeout_seconds,
    )

import asyncio
import logging
import os
import re
import time
from typing import Any, Dict, List, Optional, Tuple

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
_PREFERRED_FLASH_MODELS = [
    "gemini-2.5-flash",
    "gemini-3.8-flash",
    "gemini-3.6-flash",
    "gemini-2.0-flash",
]


def _get_clean_api_key() -> str:
    raw = (os.getenv("GEMINI_API_KEY") or getattr(settings, "GEMINI_API_KEY", "") or "").strip().strip("\"'")
    return raw


def _model_sort_key(model_name: str) -> Tuple[int, int, int, int, str]:
    """
    Sorts Gemini Flash models from newest/highest capability to oldest so
    the latest available Flash model (e.g. gemini-3.6-flash) is tried first,
    and 503/429/404 errors fall back to the next lower model.
    """
    lower = model_name.lower()
    m = re.search(r"gemini-(\d+)(?:\.(\d+))?", lower)
    major = int(m.group(1)) if m else 0
    minor = int(m.group(2)) if (m and m.group(2) is not None) else 0
    is_non_lite = 0 if "lite" in lower else 1
    is_stable = 0 if any(tag in lower for tag in ("preview", "exp", "latest")) else 1
    return (major, minor, is_non_lite, is_stable, lower)


def _discover_flash_models(client: genai.Client, api_key: str) -> List[str]:
    now = time.time()
    if (
        _MODEL_CACHE["api_key"] == api_key
        and _MODEL_CACHE["models"]
        and now < _MODEL_CACHE["expires_at"]
    ):
        return list(_MODEL_CACHE["models"])

    discovered: List[str] = []
    seen = set()
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

            if short_name not in seen:
                seen.add(short_name)
                discovered.append(short_name)
    except Exception as list_err:
        logger.warning(f"client.models.list() failed during dynamic discovery: {list_err}")

    discovered.sort(key=_model_sort_key, reverse=True)

    merged: List[str] = []
    merged_seen = set()
    for candidate in [*_PREFERRED_FLASH_MODELS[:2], *discovered, *_PREFERRED_FLASH_MODELS[2:]]:
        if candidate and candidate not in merged_seen:
            merged_seen.add(candidate)
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
    for idx, model_name in enumerate(candidates):
        config = _build_generate_config(model_name, json_mode, system_instruction)
        for attempt in range(2):
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=payload_contents,
                    config=config,
                )
                text = (getattr(response, "text", None) or "").strip()
                if text:
                    try:
                        from app.core.runtime_guard import runtime_guard
                        runtime_guard.record_gemini_success()
                    except Exception:
                        pass
                    return text
                raise ValueError(f"Model '{model_name}' boş yanıt döndürdü.")
            except Exception as err:
                last_error = err
                err_str = str(err)
                is_503_overload = "503" in err_str or "UNAVAILABLE" in err_str
                if "429" in err_str or "503" in err_str or "RESOURCE_EXHAUSTED" in err_str or "UNAVAILABLE" in err_str:
                    try:
                        from app.core.runtime_guard import runtime_guard
                        runtime_guard.record_gemini_error(err_str)
                    except Exception:
                        pass
                if is_503_overload and attempt == 0:
                    logger.warning(f"Gemini model '{model_name}' 503 overload, retrying after 0.5s...")
                    time.sleep(0.5)
                    continue

                is_rate_or_unavailable = any(
                    code in err_str
                    for code in ("503", "429", "404", "UNAVAILABLE", "RESOURCE_EXHAUSTED", "NOT_FOUND")
                )
                next_model = candidates[idx + 1] if idx + 1 < len(candidates) else None
                if is_rate_or_unavailable and next_model:
                    logger.warning(
                        f"Gemini model '{model_name}' returned transient/unavailable error ({err}); "
                        f"falling back to lower model '{next_model}'."
                    )
                else:
                    logger.warning(f"Gemini model '{model_name}' failed: {err}")
                break

    _MODEL_CACHE["expires_at"] = 0.0
    raise last_error or RuntimeError("Hiçbir Gemini Flash modeli yanıt vermedi.")


async def async_get_working_gemini_response(
    prompt: str,
    json_mode: bool = False,
    system_instruction: Optional[str] = None,
    contents: Any = None,
    timeout_seconds: float = 20.0,
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

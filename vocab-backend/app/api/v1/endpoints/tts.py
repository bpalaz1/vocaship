"""
Neural Text-to-Speech (TTS) Streaming Endpoint.
Powered by Edge-TTS Neural Voice Engine with Emotion, Express-As and SSML Modulation.
"""

import html
import re
from typing import AsyncGenerator, Optional
from fastapi import APIRouter, Query, HTTPException, Body
from fastapi.responses import StreamingResponse
import edge_tts

router = APIRouter()

VOICE_MAP = {
    "female": "en-US-JennyNeural",
    "jenny": "en-US-JennyNeural",
    "narrator": "en-US-JennyNeural",
    "male": "en-US-GuyNeural",
    "guy": "en-US-GuyNeural",
    "british": "en-GB-RyanNeural",
    "ryan": "en-GB-RyanNeural",
    "child": "en-US-AnaNeural",
    "ana": "en-US-AnaNeural",
}

DEFAULT_VOICE = "en-US-JennyNeural"
DEFAULT_RATE = "-4%"
DEFAULT_EMOTION = "cheerful"

VALID_STYLES = {
    "cheerful",
    "excited",
    "friendly",
    "sad",
    "whispering",
    "chat",
    "empathetic",
}


def resolve_voice(voice_input: Optional[str], gender_input: Optional[str] = None) -> str:
    """Resolves short names or genders to full neural voice identifiers."""
    if gender_input:
        g = gender_input.strip().lower()
        if g in ["male", "erkek", "guy", "man"]:
            return "en-US-GuyNeural"
        if g in ["female", "kadin", "kadın", "jenny", "woman"]:
            return "en-US-JennyNeural"

    if not voice_input:
        return DEFAULT_VOICE

    cleaned = voice_input.strip().lower()
    if cleaned in VOICE_MAP:
        return VOICE_MAP[cleaned]
    if "neural" in cleaned:
        return voice_input.strip()

    return DEFAULT_VOICE


def build_ssml_payload(
    text: str,
    voice: str = DEFAULT_VOICE,
    emotion: str = DEFAULT_EMOTION,
    rate: str = DEFAULT_RATE,
) -> str:
    """
    Constructs compliant W3C / Microsoft SSML XML with express-as and prosody:
    - Escapes XML special characters safely.
    - Adds natural breathing pauses for ellipses and commas.
    """
    clean_text = text.strip()
    clean_text = re.sub(r"\s+", " ", clean_text)
    escaped = html.escape(clean_text)
    escaped = re.sub(r"\.{3,}\s*", '... <break time="250ms"/> ', escaped)
    escaped = re.sub(r",\s*(?!<break)", ', <break time="200ms"/> ', escaped)

    style = (emotion or "cheerful").lower().strip()
    if style not in VALID_STYLES:
        style = "cheerful"

    return f"""<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="{voice}">
    <mstts:express-as style="{style}" styledegree="1.5">
      <prosody rate="{rate}" pitch="+2Hz">
        {escaped}
      </prosody>
    </mstts:express-as>
  </voice>
</speak>"""


async def generate_audio_stream(
    text: str,
    voice: str,
    rate: str = DEFAULT_RATE,
    emotion: Optional[str] = None,
) -> AsyncGenerator[bytes, None]:
    """
    Generates streaming mp3 audio chunks directly using Edge-TTS Communicate.
    If emotion is specified, wraps with SSML expression.
    """
    has_streamed = False
    if emotion and emotion.lower().strip() in VALID_STYLES:
        try:
            ssml = build_ssml_payload(text=text, voice=voice, emotion=emotion, rate=rate)
            communicate = edge_tts.Communicate(ssml, voice)
            async for chunk in communicate.stream():
                if chunk["type"] == "audio" and "data" in chunk:
                    has_streamed = True
                    yield chunk["data"]
            if has_streamed:
                return
        except Exception:
            pass

    # Direct Communicate with voice and calibrated rate
    communicate = edge_tts.Communicate(text, voice, rate=rate)
    async for chunk in communicate.stream():
        if chunk["type"] == "audio" and "data" in chunk:
            yield chunk["data"]


@router.get("/stream", summary="Stream Neural Speech Audio")
async def tts_stream_get(
    text: str = Query(..., min_length=1, max_length=2000, description="Metin"),
    voice: str = Query(DEFAULT_VOICE, description="Nöral ses modeli (en-US-JennyNeural, en-US-GuyNeural vb.)"),
    rate: str = Query(DEFAULT_RATE, description="Konuşma hızı (varsayılan: -4%)"),
    emotion: Optional[str] = Query(None, description="Duygu stili (cheerful, friendly, excited, sad, whisper)"),
    gender: Optional[str] = Query(None, description="Mentor cinsiyeti (female / male)"),
):
    """
    Streams high-fidelity neural speech audio (audio/mpeg) using Edge-TTS.
    Zero-fallback: Returns genuine neural audio directly as a StreamingResponse.
    """
    text_clean = text.strip()
    if not text_clean:
        raise HTTPException(status_code=400, detail="Metin boş olamaz.")

    target_voice = resolve_voice(voice, gender)
    target_rate = rate or DEFAULT_RATE

    try:
        audio_stream = generate_audio_stream(
            text=text_clean,
            voice=target_voice,
            rate=target_rate,
            emotion=emotion,
        )

        headers = {
            "Content-Type": "audio/mpeg",
            "Accept-Ranges": "bytes",
            "Cache-Control": "public, max-age=86400",
            "Access-Control-Allow-Origin": "*",
        }
        return StreamingResponse(audio_stream, media_type="audio/mpeg", headers=headers)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"TTS ses üretimi başarısız: {str(exc)}")


@router.post("/stream", summary="Stream Neural Speech Audio (POST)")
async def tts_stream_post(
    payload: dict = Body(..., openapi_examples={"default": {"value": {"text": "Hello world", "voice": "en-US-JennyNeural", "rate": "-6%"}}}),
):
    """POST endpoint for longer texts or client applications."""
    text = payload.get("text", "")
    voice = payload.get("voice", DEFAULT_VOICE)
    rate = payload.get("rate", DEFAULT_RATE)
    emotion = payload.get("emotion")
    gender = payload.get("gender")

    return await tts_stream_get(text=text, voice=voice, rate=rate, emotion=emotion, gender=gender)

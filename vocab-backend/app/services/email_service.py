import os
import json
import smtplib
import logging
import urllib.request
from email.message import EmailMessage

logger = logging.getLogger("vocaship.email")


def _send_html_email(
    to_email: str,
    subject: str,
    plain_text: str,
    html_body: str,
    log_code_hint: str = "",
) -> bool:
    """
    Merkezi e-posta gönderim servisi:
    1. RESEND_API_KEY tanımlıysa Resend API üzerinden HTML e-posta gönderir.
    2. SMTP_HOST / SMTP_USER / SMTP_PASS tanımlıysa smtplib üzerinden gönderir.
    3. İkisi de yoksa doğrulama/sıfırlama kodunu loglara yazdırıp False döner.
    """
    resend_key = (os.getenv("RESEND_API_KEY") or "").strip()
    from_email = (
        os.getenv("RESEND_FROM_EMAIL")
        or os.getenv("SMTP_FROM")
        or "VocaShip <noreply@vocaship.com>"
    ).strip()

    if resend_key:
        try:
            payload = json.dumps(
                {
                    "from": from_email,
                    "to": [to_email],
                    "subject": subject,
                    "html": html_body,
                }
            ).encode("utf-8")
            req = urllib.request.Request(
                "https://api.resend.com/emails",
                data=payload,
                method="POST",
                headers={
                    "Authorization": f"Bearer {resend_key}",
                    "Content-Type": "application/json",
                },
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                if 200 <= resp.status < 300:
                    logger.info(f"[Email] Resend ile gönderildi -> {to_email} ({subject})")
                    return True
        except Exception as exc:
            logger.warning(f"[Email] Resend gönderim hatası: {exc}")

    smtp_host = (os.getenv("SMTP_HOST") or "").strip()
    smtp_user = (os.getenv("SMTP_USER") or "").strip()
    smtp_pass = (os.getenv("SMTP_PASS") or os.getenv("SMTP_PASSWORD") or "").strip()
    smtp_port = int(os.getenv("SMTP_PORT") or "587")

    if smtp_host and smtp_user and smtp_pass:
        try:
            msg = EmailMessage()
            msg["Subject"] = subject
            msg["From"] = from_email
            msg["To"] = to_email
            msg.set_content(plain_text)
            msg.add_alternative(html_body, subtype="html")

            if smtp_port == 465:
                with smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=10) as server:
                    server.login(smtp_user, smtp_pass)
                    server.send_message(msg)
            else:
                with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
                    server.starttls()
                    server.login(smtp_user, smtp_pass)
                    server.send_message(msg)
            logger.info(f"[Email] SMTP ile gönderildi -> {to_email} ({subject})")
            return True
        except Exception as exc:
            logger.warning(f"[Email] SMTP gönderim hatası: {exc}")

    logger.info(
        f"[Email] E-posta sağlayıcısı tanımlı değil (simülasyon) -> {to_email} | {subject} | {log_code_hint}"
    )
    return False


def send_verification_email(to_email: str, full_name: str, code: str) -> bool:
    subject = f"VocaShip E-posta Doğrulama Kodunuz: {code}"
    plain_text = (
        f"Merhaba {full_name},\n\n"
        f"VocaShip e-posta doğrulama kodunuz: {code}\n\n"
        f"VocaShip — Sail to Fluency."
    )
    html_body = (
        f"<div style='font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#0f172a;color:#f8fafc;border-radius:16px;border:1px solid #1e293b;'>"
        f"<h2 style='margin:0 0 8px;color:#fbbf24;'>VocaShip — Sail to Fluency.</h2>"
        f"<p style='color:#cbd5e1;font-size:14px;'>Merhaba <strong>{full_name}</strong>, hesabınızı doğrulamak için aşağıdaki 6 haneli kodu girin:</p>"
        f"<div style='font-size:32px;font-weight:800;letter-spacing:8px;text-align:center;padding:16px;background:#1e293b;border-radius:12px;color:#38bdf8;margin:20px 0;'>{code}</div>"
        f"<p style='font-size:12px;color:#94a3b8;'>Bu işlemi siz yapmadıysanız bu e-postayı görmezden gelebilirsiniz.</p>"
        f"</div>"
    )
    return _send_html_email(
        to_email=to_email,
        subject=subject,
        plain_text=plain_text,
        html_body=html_body,
        log_code_hint=f"verify_code={code}",
    )


def send_password_reset_email(to_email: str, full_name: str, code: str) -> bool:
    subject = "VocaShip Şifre Sıfırlama Kodunuz"
    plain_text = (
        f"Merhaba {full_name},\n\n"
        f"Şifrenizi sıfırlamak için 15 dakika geçerli tek kullanımlık kodunuz: {code}\n\n"
        f"Eğer bu talebi siz oluşturmadıysanız lütfen dikkate almayın.\n"
        f"VocaShip — Sail to Fluency."
    )
    html_body = (
        f"<div style='font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#0f172a;color:#f8fafc;border-radius:16px;border:1px solid #1e293b;'>"
        f"<h2 style='margin:0 0 8px;color:#fbbf24;'>VocaShip — Şifre Sıfırlama</h2>"
        f"<p style='color:#cbd5e1;font-size:14px;'>Merhaba <strong>{full_name}</strong>, hesabınızın şifresini sıfırlamak için aşağıdaki 6 haneli kodu kullanın (15 dakika geçerlidir):</p>"
        f"<div style='font-size:32px;font-weight:800;letter-spacing:8px;text-align:center;padding:16px;background:#1e293b;border-radius:12px;color:#fbbf24;margin:20px 0;'>{code}</div>"
        f"<p style='font-size:12px;color:#94a3b8;'>Bu isteği siz yapmadıysanız şifreniz güvendedir; bu e-postayı görmezden gelebilirsiniz.</p>"
        f"</div>"
    )
    return _send_html_email(
        to_email=to_email,
        subject=subject,
        plain_text=plain_text,
        html_body=html_body,
        log_code_hint=f"reset_code={code}",
    )

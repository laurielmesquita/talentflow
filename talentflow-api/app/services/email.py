import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.core.config import settings

def send_email(to_email: str, subject: str, html_content: str) -> bool:
    """
    Dispara um e-mail formatado em HTML utilizando o servidor SMTP configurado.
    """
    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        print("SMTP_USERNAME ou SMTP_PASSWORD não estão configurados no arquivo .env.")
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    # Brevo permite usar o SMTP_USERNAME como remetente
    msg["From"] = f"TalentFlow <{settings.SMTP_USERNAME}>"
    msg["To"] = to_email

    msg.attach(MIMEText(html_content, "html"))

    try:
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_USERNAME, to_email, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"Falha ao enviar e-mail para {to_email}: {e}")
        return False


def send_invite_email(to_email: str, token: str, inviter_name: str, role: str) -> bool:
    """
    Envia o e-mail de convite para um novo membro da equipe.
    """
    invite_url = f"{settings.FRONTEND_URL}/invite/accept?token={token}"
    role_map = {"SuperAdmin": "Super Administrador", "Manager": "Gerente de Recrutamento", "Recruiter": "Recrutador"}
    role_display = role_map.get(role, role)

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Convite para TalentFlow</title>
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #0b0f19;
                color: #f3f4f6;
                margin: 0;
                padding: 40px 20px;
            }}
            .card {{
                max-width: 500px;
                margin: 0 auto;
                background: rgba(17, 24, 39, 0.7);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 16px;
                padding: 32px;
                box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4);
                backdrop-filter: blur(8px);
            }}
            .logo {{
                font-size: 24px;
                font-weight: 800;
                letter-spacing: -0.5px;
                color: #3b82f6;
                text-align: center;
                margin-bottom: 24px;
            }}
            h2 {{
                font-size: 20px;
                font-weight: 600;
                margin-top: 0;
                text-align: center;
                color: #ffffff;
            }}
            p {{
                font-size: 14px;
                line-height: 1.6;
                color: #9ca3af;
                margin-bottom: 20px;
            }}
            .role-badge {{
                display: inline-block;
                padding: 4px 10px;
                background-color: rgba(59, 130, 246, 0.15);
                border: 1px solid rgba(59, 130, 246, 0.3);
                border-radius: 9999px;
                color: #60a5fa;
                font-weight: 500;
                font-size: 12px;
                margin: 5px 0;
            }}
            .btn-container {{
                text-align: center;
                margin: 32px 0 20px;
            }}
            .btn {{
                background-color: #3b82f6;
                color: #ffffff !important;
                text-decoration: none;
                padding: 12px 28px;
                font-weight: 600;
                font-size: 14px;
                border-radius: 8px;
                display: inline-block;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                transition: background-color 0.2s;
            }}
            .btn:hover {{
                background-color: #2563eb;
            }}
            .footer {{
                text-align: center;
                font-size: 11px;
                color: #4b5563;
                margin-top: 40px;
                border-top: 1px solid rgba(255, 255, 255, 0.05);
                padding-top: 20px;
            }}
        </style>
    </head>
    <body>
        <div class="card">
            <div class="logo">TalentFlow</div>
            <h2>Você foi convidado!</h2>
            <p>Olá,</p>
            <p><strong>{inviter_name}</strong> convidou você para fazer parte do ecossistema de recrutamento e triagem do <strong>TalentFlow</strong>.</p>
            <p>Seu perfil foi configurado com o cargo:</p>
            <div style="text-align: center;">
                <span class="role-badge">{role_display}</span>
            </div>
            <p>Para concluir seu cadastro e definir sua senha pessoal de acesso, clique no botão abaixo:</p>
            <div class="btn-container">
                <a href="{invite_url}" class="btn">Aceitar Convite</a>
            </div>
            <p style="font-size: 12px; color: #6b7280; text-align: center;">
                Se o botão acima não funcionar, copie e cole o link no seu navegador:<br>
                <a href="{invite_url}" style="color: #3b82f6; word-break: break-all;">{invite_url}</a>
            </p>
            <div class="footer">
                Este é um e-mail automático. Por favor, não responda diretamente.<br>
                &copy; {date_year()} Space Square. Todos os direitos reservados.
            </div>
        </div>
    </body>
    </html>
    """
    return send_email(to_email, "Você foi convidado para o TalentFlow", html_content)


def send_reset_password_email(to_email: str, token: str) -> bool:
    """
    Envia o e-mail de recuperação de senha.
    """
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Recuperação de Senha - TalentFlow</title>
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #0b0f19;
                color: #f3f4f6;
                margin: 0;
                padding: 40px 20px;
            }}
            .card {{
                max-width: 500px;
                margin: 0 auto;
                background: rgba(17, 24, 39, 0.7);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 16px;
                padding: 32px;
                box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4);
                backdrop-filter: blur(8px);
            }}
            .logo {{
                font-size: 24px;
                font-weight: 800;
                letter-spacing: -0.5px;
                color: #3b82f6;
                text-align: center;
                margin-bottom: 24px;
            }}
            h2 {{
                font-size: 20px;
                font-weight: 600;
                margin-top: 0;
                text-align: center;
                color: #ffffff;
            }}
            p {{
                font-size: 14px;
                line-height: 1.6;
                color: #9ca3af;
                margin-bottom: 20px;
            }}
            .btn-container {{
                text-align: center;
                margin: 32px 0 20px;
            }}
            .btn {{
                background-color: #ef4444;
                color: #ffffff !important;
                text-decoration: none;
                padding: 12px 28px;
                font-weight: 600;
                font-size: 14px;
                border-radius: 8px;
                display: inline-block;
                box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
                transition: background-color 0.2s;
            }}
            .btn:hover {{
                background-color: #dc2626;
            }}
            .footer {{
                text-align: center;
                font-size: 11px;
                color: #4b5563;
                margin-top: 40px;
                border-top: 1px solid rgba(255, 255, 255, 0.05);
                padding-top: 20px;
            }}
        </style>
    </head>
    <body>
        <div class="card">
            <div class="logo">TalentFlow</div>
            <h2>Recuperação de Senha</h2>
            <p>Olá,</p>
            <p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>TalentFlow</strong>.</p>
            <p>Para prosseguir com a redefinição de sua senha, clique no botão abaixo. Este link expira em 2 horas.</p>
            <div class="btn-container">
                <a href="{reset_url}" class="btn">Redefinir Minha Senha</a>
            </div>
            <p>Se você não solicitou essa redefinição, por favor ignore este e-mail. Sua senha continuará segura e ativa.</p>
            <p style="font-size: 12px; color: #6b7280; text-align: center;">
                Se o botão acima não funcionar, copie e cole o link no seu navegador:<br>
                <a href="{reset_url}" style="color: #ef4444; word-break: break-all;">{reset_url}</a>
            </p>
            <div class="footer">
                Este é um e-mail automático. Por favor, não responda diretamente.<br>
                &copy; {date_year()} Space Square. Todos os direitos reservados.
            </div>
        </div>
    </body>
    </html>
    """
    return send_email(to_email, "Recuperação de Senha - TalentFlow", html_content)


def date_year() -> int:
    from datetime import datetime
    return datetime.now().year

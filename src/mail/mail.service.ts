/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
    private transporter: Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST || 'smtp.ethereal.email',
            port: parseInt(process.env.MAIL_PORT || '587'),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false, // Ignora certificados autofirmados
            },
        });
    }

    async sendVerification(email: string, token: string): Promise<void> {
        const url = `${process.env.APP_URL || 'http://localhost:3000'}/auth/verify-email/${token}`;
        await this.transporter.sendMail({
            from: process.env.MAIL_FROM || '"Rosmarino & Oro" <no-reply@rosmarino.com>',
            to: email,
            subject: 'Verifica tu cuenta',
            html: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Verifica tu cuenta | Rosmarino & Oro</title>
    <style>
        body { background: #fefef0; color: #4b4f3a; font-family: 'Playfair Display', Georgia, serif; margin: 0; padding: 0; }
        .container { max-width: 480px; margin: 40px auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 12px rgba(75, 79, 58, 0.08); overflow: hidden; border: 1px solid #e0e0e0; }
        .header { background: #4b4f3a; color: #fff; padding: 24px 0 16px 0; text-align: center; }
        .header img { width: 56px; height: 56px; border-radius: 50%; margin-bottom: 8px; }
        .header h1 { font-size: 2rem; font-family: 'Playfair Display', Georgia, serif; margin: 0; letter-spacing: 1px; }
        .content { padding: 32px 24px; text-align: center; }
        .content h2 { font-size: 1.3rem; margin-bottom: 12px; color: #7a4b3a; }
        .content p { font-size: 1rem; margin-bottom: 24px; color: #4b4f3a; }
        .button { display: inline-block; background: #d4af37; color: #4b4f3a; font-weight: bold; font-size: 1.1rem; padding: 12px 32px; border-radius: 8px; text-decoration: none; box-shadow: 0 2px 8px rgba(212, 175, 55, 0.08); transition: background 0.2s; }
        .button:hover { background: #bfa233; }
        .footer { background: #fefef0; color: #7a4b3a; font-size: 0.9rem; text-align: center; padding: 18px 12px; border-top: 1px solid #e0e0e0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${process.env.APP_URL || 'http://localhost:3000'}/rosmarino_logo.png" alt="Rosmarino & Oro" />
            <h1>Rosmarino & Oro</h1>
        </div>
        <div class="content">
            <h2>¡Bienvenido a la familia Rosmarino!</h2>
            <p>
                Gracias por registrarte. Para activar tu cuenta, haz clic en el botón de abajo.<br>
                <strong>¡Esperamos verte pronto en nuestro restaurante!</strong>
            </p>
            <a href="${url}" class="button">Verificar mi cuenta</a>
            <p style="margin-top: 24px; font-size: 0.95rem; color: #7a4b3a;">
                Si no creaste esta cuenta, puedes ignorar este correo.
            </p>
        </div>
        <div class="footer">
            &copy; 2025 Rosmarino & Oro · <a href="${process.env.APP_URL || 'http://localhost:3000'}" style="color: #d4af37; text-decoration: none;">rosmarinooro.com</a>
        </div>
    </div>
</body>
</html>
`,
        });
    }
}
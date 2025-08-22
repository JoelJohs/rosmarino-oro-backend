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
            html: `<p>Haz clic <a href="${url}">aquí</a> para verificar tu cuenta.</p>`,
        });
    }
}
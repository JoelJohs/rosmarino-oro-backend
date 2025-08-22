/* eslint-disable prettier/prettier */

import { Injectable, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private mail: MailService,
  ) { }

  async hash(data: string) {
    return bcrypt.hash(data, 10);
  }

  async compare(data: string, hash: string) {
    return bcrypt.compare(data, hash);
  }

  async register(dto: { email: string; firstName: string; middleName?: string; lastName: string; password: string }) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ForbiddenException('Email ya registrado');

    const hashed = await this.hash(dto.password);
    const token = uuid();
    await this.prisma.user.create({
      data: {
        email: dto.email,
        firstName: capitalize(dto.firstName),
        middleName: dto.middleName ? capitalize(dto.middleName) : undefined,
        lastName: capitalize(dto.lastName),
        password: hashed,
        verificationToken: token,
      },
    });

    await this.mail.sendVerification(dto.email, token);
    return { message: 'Revisa tu correo para verificar tu cuenta' };
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({ where: { verificationToken: token } });
    if (!user) throw new ForbiddenException('Token inválido');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true, verificationToken: null },
    });
    return { message: 'Cuenta verificada' };
  }

  async login(dto: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } }) as {
      id: number;
      email: string;
      firstName: string;
      middleName?: string;
      lastName: string;
      password: string;
      role: string;
      isEmailVerified: boolean;
      createdAt: Date;
      updatedAt: Date;
    };
    if (!user || !user.isEmailVerified) throw new ForbiddenException('Credenciales inválidas');

    const valid = await this.compare(dto.password, user.password);
    if (!valid) throw new ForbiddenException('Credenciales inválidas');

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return {
      accessToken: tokens.accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    };
  }

  async getTokens(userId: number, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, { secret: process.env.JWT_SECRET || 'dev-secret', expiresIn: '15m' }),
      this.jwt.signAsync(payload, { secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret', expiresIn: '7d' }),
    ]);
    return { accessToken, refreshToken };
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashed = await this.hash(refreshToken);
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken: hashed,
        refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
      },
    });
  }

  async logout(userId: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken: null,
        refreshTokenExpiresAt: null,
      },
    });
  }

  async refresh(userId: number, refreshToken: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.refreshToken) throw new ForbiddenException('Acceso denegado');

    // Verificar si el refresh token ha expirado
    if (user.refreshTokenExpiresAt && new Date() > user.refreshTokenExpiresAt) {
      throw new ForbiddenException('Token de actualización expirado');
    }

    const matches = await this.compare(refreshToken, user.refreshToken);
    if (!matches) throw new ForbiddenException('Acceso denegado');

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async createEmployee(dto: { email: string; firstName: string; middleName?: string; lastName: string; password: string }) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ForbiddenException('Email ya registrado');

    const hashed = await this.hash(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        firstName: capitalize(dto.firstName),
        middleName: dto.middleName ? capitalize(dto.middleName) : undefined,
        lastName: capitalize(dto.lastName),
        password: hashed,
        role: 'EMPLOYEE',
        isEmailVerified: true,
      },
    });
    return { id: user.id, email: user.email, role: user.role };
  }
}


// Capitaliza la primera letra y pone el resto en minúscula
function capitalize(str: string) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
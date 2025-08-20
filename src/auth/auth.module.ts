/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MailService } from '../mail/mail.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtAuthGuard } from './guards/jwt.guard';
import { RolesGuard } from './guards/roles.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenCleanupService } from './cleanup.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}), // Configuración dinámica en el servicio
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    MailService,
    JwtStrategy,
    JwtRefreshStrategy,
    JwtAuthGuard,
    RolesGuard,
    PrismaService,
    TokenCleanupService
  ],
  exports: [AuthService, JwtAuthGuard, RolesGuard],
})
export class AuthModule { }

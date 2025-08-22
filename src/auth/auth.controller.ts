/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Request } from 'express';
import { JwtAuthGuard } from './guards/jwt.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { AuthenticatedUser } from './interfaces/auth.interface';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) { }

  @Post('register')
  register(@Body() dto: { email: string; firstName: string; lastName: string; middleName?: string; password: string }) {
    return this.auth.register(dto);
  }

  @Get('verify-email/:token')
  verify(@Param('token') token: string) {
    return this.auth.verifyEmail(token);
  }

  @Post('login')
  login(@Body() dto: { email: string; password: string }) {
    return this.auth.login(dto);
  }

  @Post('employee')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  createEmployee(@Body() dto: { email: string; firstName: string; lastName: string; middleName?: string; password: string }) {
    return this.auth.createEmployee(dto);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  refresh(@Req() req: Request & { user: AuthenticatedUser }) {
    const user = req.user;
    const refreshToken = req.headers.authorization?.replace('Bearer', '').trim();
    if (!refreshToken) {
      throw new Error('Refresh token is required');
    }
    return this.auth.refresh(user.userId, refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(@Req() req: Request & { user: AuthenticatedUser }) {
    const user = req.user;
    return this.auth.logout(user.userId);
  }
}
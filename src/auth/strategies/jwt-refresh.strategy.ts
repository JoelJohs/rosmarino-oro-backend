/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface JwtRefreshPayload {
    sub: number;
    email: string;
}

interface AuthenticatedUserWithRefreshToken {
    userId: number;
    refreshToken: string;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
            passReqToCallback: true,
        });
    }

    validate(req: Request, payload: JwtRefreshPayload): AuthenticatedUserWithRefreshToken {
        const authHeader = req.get('authorization');
        if (!authHeader) {
            throw new Error('Authorization header is missing');
        }

        const refreshToken = authHeader.replace('Bearer', '').trim();
        return {
            userId: payload.sub,
            refreshToken
        };
    }
}
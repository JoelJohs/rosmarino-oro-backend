/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TokenCleanupService {
    constructor(private prisma: PrismaService) { }

    @Cron(CronExpression.EVERY_DAY_AT_2AM)
    async cleanupExpiredTokens() {
        const result = await this.prisma.user.updateMany({
            where: {
                refreshTokenExpiresAt: {
                    lt: new Date(),
                },
            },
            data: {
                refreshToken: null,
                refreshTokenExpiresAt: null,
            },
        });

        console.log(`🧹 Limpieza de tokens: ${result.count} tokens expirados eliminados`);
        return result;
    }

    // Método manual para limpiar tokens (útil para testing)
    async cleanupExpiredTokensManual() {
        return this.cleanupExpiredTokens();
    }
}

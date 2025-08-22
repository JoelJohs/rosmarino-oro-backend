/* eslint-disable prettier/prettier */
export class User {
    id: number;
    email: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    phone?: string;
    role: string;
    isEmailVerified: boolean;
    verificationToken?: string;
    refreshToken?: string;
    refreshTokenExpiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

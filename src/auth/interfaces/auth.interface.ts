/* eslint-disable prettier/prettier */
export interface AuthenticatedUser {
    userId: number;
    email: string;
    role: string;
}

export interface RequestWithUser extends Request {
    user: AuthenticatedUser;
}

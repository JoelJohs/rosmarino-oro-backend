/* eslint-disable prettier/prettier */
import { IsEmail, IsString, IsOptional } from 'class-validator';

export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsString()
    firstName: string;

    @IsOptional()
    @IsString()
    middleName?: string;

    @IsString()
    lastName: string;

    @IsOptional()
    @IsString()
    phone?: string;
}
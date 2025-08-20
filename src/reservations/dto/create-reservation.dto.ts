/* eslint-disable prettier/prettier */


import { IsInt, IsDateString, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateReservationDto {
    @IsInt()
    userId: number;

    @IsInt()
    tableId: number;

    @IsDateString()
    date: string; // ISO string

    @IsString()
    time: string; // "19:00"

    @IsOptional()
    @IsInt()
    duration?: number = 60;

    @IsOptional()
    preOrder?: any[];

    @IsOptional()
    @IsBoolean()
    extended?: boolean = false;
}
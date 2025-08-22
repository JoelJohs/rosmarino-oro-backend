/* eslint-disable prettier/prettier */
import {
    IsInt,
    IsDateString,
    IsString,
    IsOptional,
    IsArray,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
    @IsInt()
    menuItemId: number;

    @IsInt()
    quantity: number;
}

export class CreateReservationDto {
    @IsInt()
    tableId: number;

    @IsDateString()
    date: string; // YYYY-MM-DD format

    @IsString()
    time: string; // HH:mm

    @IsOptional()
    @IsInt()
    duration?: number = 60;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    preOrder?: OrderItemDto[];
}
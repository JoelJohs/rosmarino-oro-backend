/* eslint-disable prettier/prettier */
import { IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class CreateMenuItemDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNumber()
    @Min(0)
    price: number;

    @IsString()
    category: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;
}
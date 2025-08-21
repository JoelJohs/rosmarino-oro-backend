/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuItemDto } from './dto/create-menu.dto';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) { }

  findAll() {
    return this.prisma.menuItem.findMany({ where: { deletedAt: null, available: true } });
  }

  findOne(id: number) {
    return this.prisma.menuItem.findFirst({ where: { id, deletedAt: null } });
  }

  create(dto: CreateMenuItemDto) {
    return this.prisma.menuItem.create({ data: dto });
  }

  async update(id: number, dto: Partial<CreateMenuItemDto>) {
    await this.exists(id);
    return this.prisma.menuItem.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.exists(id);
    return this.prisma.menuItem.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  private async exists(id: number) {
    const item = await this.prisma.menuItem.findFirst({ where: { id, deletedAt: null } });
    if (!item) throw new NotFoundException('Platillo no encontrado');
  }
}

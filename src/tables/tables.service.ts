/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTableDto } from './dto/create-table.dto';

@Injectable()
export class TablesService {
  constructor(private prisma: PrismaService) { }

  findAll() {
    return this.prisma.table.findMany({ where: { deletedAt: null } });
  }

  findOne(id: number) {
    return this.prisma.table.findFirst({ where: { id, deletedAt: null } });
  }

  create(dto: CreateTableDto) {
    return this.prisma.table.create({ data: dto });
  }

  async update(id: number, dto: CreateTableDto) {
    await this.exists(id);
    return this.prisma.table.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.exists(id);
    return this.prisma.table.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getAvailability(date: string, time: string, guests: number, duration: number) {
    const start = new Date(`${date}T${time}:00`);
    const end = new Date(start.getTime() + duration * 60000);

    // Buscar reservas del día específico
    const reservationDate = new Date(date);
    const startOfDay = new Date(reservationDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(reservationDate.setHours(23, 59, 59, 999));

    const reservations = await this.prisma.reservation.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });

    const reservedTableIds = reservations
      .filter(r => {
        const rStart = new Date(`${date}T${r.time}:00`);
        const rEnd = new Date(rStart.getTime() + r.duration * 60000);
        return rStart < end && rEnd > start;
      })
      .map(r => r.tableId);

    return this.prisma.table.findMany({
      where: {
        capacity: { gte: guests },
        id: { notIn: reservedTableIds },
        deletedAt: null,
      },
    });
  }

  private async exists(id: number) {
    const table = await this.prisma.table.findFirst({ where: { id, deletedAt: null } });
    if (!table) throw new NotFoundException('Mesa no encontrada');
  }
}

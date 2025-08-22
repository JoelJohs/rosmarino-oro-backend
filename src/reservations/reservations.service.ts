/* eslint-disable prettier/prettier */

import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) { }

  /* ---------- UTILS ---------- */
  private async checkOverlap(
    tableId: number,
    date: string,
    time: string,
    duration: number,
  ) {
    const start = new Date(`${date}T${time}:00`);
    const end = new Date(start.getTime() + duration * 60000);

    const reservations = await this.prisma.reservation.findMany({
      where: { tableId, status: { in: ['PENDING', 'CONFIRMED'] } },
    });

    const overlap = reservations.some((r) => {
      const rStart = new Date(
        `${r.date.toISOString().split('T')[0]}T${r.time}:00`,
      );
      const rEnd = new Date(rStart.getTime() + r.duration * 60000);
      return rStart < end && rEnd > start;
    });

    if (overlap)
      throw new BadRequestException('La mesa ya está reservada en ese horario');
  }

  /* ---------- CRUD ---------- */
  async create(userId: number, dto: CreateReservationDto) {
    // Validaciones
    const duration = dto.duration ?? 60;
    if (duration < 30 || duration > 240)
      throw new BadRequestException('Duración debe estar entre 30 y 240 min');

    const table = await this.prisma.table.findFirst({
      where: { id: dto.tableId, deletedAt: null },
    });
    if (!table) throw new BadRequestException('Mesa no existe'); await this.checkOverlap(dto.tableId, dto.date, dto.time, duration);

    let orderTotal = 0;
    if (dto.preOrder?.length) {
      const items = await this.prisma.menuItem.findMany({
        where: { id: { in: dto.preOrder.map((i) => i.menuItemId) } },
      });
      orderTotal = items.reduce((sum, item) => {
        const qty =
          dto.preOrder?.find((p) => p.menuItemId === item.id)?.quantity ?? 0;
        return sum + item.price * qty;
      }, 0);
    }

    const serviceFee = orderTotal * 0.03;

    return this.prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.create({
        data: {
          userId,
          tableId: dto.tableId,
          date: new Date(dto.date),
          time: dto.time,
          duration,
        },
        include: {
          table: true,
          user: true,
        },
      });

      if (dto.preOrder?.length) {
        await tx.order.create({
          data: {
            reservationId: reservation.id,
            items: JSON.stringify(dto.preOrder),
            total: orderTotal,
            serviceFee,
            status: 'PENDING',
          },
        });
      }

      return reservation;
    });
  }

  findMine(userId: number) {
    return this.prisma.reservation.findMany({
      where: { userId },
      include: { order: true, table: true },
    });
  }

  findAll() {
    return this.prisma.reservation.findMany({
      include: { order: true, table: true, user: true },
    });
  }

  async cancel(userId: number, id: number) {
    const res = await this.prisma.reservation.findUnique({ where: { id } });
    if (!res) throw new BadRequestException('Reserva no encontrada');
    if (res.userId !== userId) throw new ForbiddenException('No autorizado');

    return this.prisma.reservation.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  /* ---------- EXTENSIÓN ---------- */
  async extend(userId: number, id: number, extraMinutes: number) {
    const res = await this.prisma.reservation.findUnique({ where: { id } });
    if (!res) throw new BadRequestException('Reserva no encontrada');
    if (res.userId !== userId) throw new ForbiddenException('No autorizado');
    if (res.status !== 'CONFIRMED')
      throw new BadRequestException('Solo reservas confirmadas');

    const newDuration = res.duration + extraMinutes;
    if (newDuration > 240)
      throw new BadRequestException('Duración máxima 240 min');

    const dateString = res.date.toISOString().split('T')[0];
    await this.checkOverlap(
      res.tableId,
      dateString,
      res.time,
      newDuration,
    );

    return this.prisma.reservation.update({
      where: { id },
      data: { duration: newDuration, extended: true },
    });
  }
}

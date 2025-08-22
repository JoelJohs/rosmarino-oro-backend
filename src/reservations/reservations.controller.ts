/* eslint-disable prettier/prettier */

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  Patch,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type { RequestWithUser } from '../auth/interfaces/auth.interface';

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) { }

  /* Cliente crea su reserva */
  @Post()
  create(@Req() req: RequestWithUser, @Body() dto: CreateReservationDto) {
    return this.reservationsService.create(req.user.userId, dto);
  }

  /* Cliente ve sus reservas */
  @Get('me')
  findMine(@Req() req: RequestWithUser) {
    return this.reservationsService.findMine(req.user.userId);
  }

  /* Cliente cancela la suya */
  @Delete(':id')
  cancel(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.reservationsService.cancel(req.user.userId, +id);
  }

  /* Cliente extiende la duración */
  @Patch(':id/extend')
  extend(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body('extraMinutes') extraMinutes: number,
  ) {
    return this.reservationsService.extend(req.user.userId, +id, extraMinutes);
  }

  /* Empleado/Superadmin ven todas */
  @Get()
  @UseGuards(RolesGuard)
  @Roles('EMPLOYEE', 'SUPERADMIN')
  findAll() {
    return this.reservationsService.findAll();
  }
}

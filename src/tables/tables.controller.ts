/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/create-table.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) { }

  @Get('availability')
  async availability(
    @Query('date') date: string,
    @Query('time') time: string,
    @Query('guests', ParseIntPipe) guests: number,
    @Query('duration', new DefaultValuePipe(60), ParseIntPipe) duration: number,
  ) {
    return await this.tablesService.getAvailability(date, time, guests, duration);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  findAll() {
    return this.tablesService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tablesService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @Roles('SUPERADMIN', 'EMPLOYEE')
  create(@Body() dto: CreateTableDto) {
    return this.tablesService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  @Roles('SUPERADMIN', 'EMPLOYEE')
  update(@Param('id') id: string, @Body() dto: CreateTableDto) {
    return this.tablesService.update(+id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @Roles('SUPERADMIN', 'EMPLOYEE')
  remove(@Param('id') id: string) {
    return this.tablesService.remove(+id);
  }
}

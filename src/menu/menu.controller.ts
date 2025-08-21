/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuItemDto } from './dto/create-menu.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('menu')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) { }

  @Get()
  @Roles('SUPERADMIN', 'EMPLOYEE', 'CLIENT')
  findAll() {
    return this.menuService.findAll();
  }

  @Get(':id')
  @Roles('SUPERADMIN', 'EMPLOYEE', 'CLIENT')
  findOne(@Param('id') id: string) {
    return this.menuService.findOne(+id);
  }

  @Post()
  @Roles('SUPERADMIN', 'EMPLOYEE')
  create(@Body() dto: CreateMenuItemDto) {
    return this.menuService.create(dto);
  }

  @Patch(':id')
  @Roles('SUPERADMIN', 'EMPLOYEE')
  update(@Param('id') id: string, @Body() dto: Partial<CreateMenuItemDto>) {
    return this.menuService.update(+id, dto);
  }

  @Delete(':id')
  @Roles('SUPERADMIN', 'EMPLOYEE')
  remove(@Param('id') id: string) {
    return this.menuService.remove(+id);
  }

  @Post('upload/:id')
  @Roles('SUPERADMIN', 'EMPLOYEE')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file, cb) => {
          const name = `${Date.now()}${extname(file.originalname)}`;
          cb(null, name);
        },
      }),
    }),
  )
  uploadImage(@Param('id') id: string, @UploadedFile() file: any) {
    const imageUrl = `/uploads/${file.filename}`;
    return this.menuService.update(+id, { imageUrl });
  }
}

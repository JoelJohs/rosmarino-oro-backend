/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuItemDto } from './dto/create-menu.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import sharp from 'sharp';
import { promises as fs } from 'fs';

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

  @Post('with-image')
  @Roles('SUPERADMIN', 'EMPLOYEE')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file, cb) => {
          // Nombre temporal, lo cambiaremos después
          const tempName = `temp_${Date.now()}${extname(file.originalname)}`;
          cb(null, tempName);
        },
      }),
    }),
  )
  async createWithImage(@Body() dto: CreateMenuItemDto, @UploadedFile() file: Express.Multer.File) {
    // 1. Crear el plato primero
    const menuItem = await this.menuService.create(dto);

    if (file) {
      // 2. Generar nombre basado en el nombre del plato
      const slug = dto.name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remover caracteres especiales
        .replace(/\s+/g, '-') // Reemplazar espacios con guiones
        .trim();

      const finalFileName = `${slug}.jpg`;
      const tempPath = file.path;
      const finalPath = `./uploads/${finalFileName}`;

      try {
        // 3. Convertir a JPG y redimensionar usando Sharp
        await sharp(tempPath)
          .resize(800, 600, { fit: 'cover' })
          .jpeg({ quality: 85 })
          .toFile(finalPath);

        // 4. Eliminar archivo temporal
        await fs.unlink(tempPath);

        // 5. Actualizar el plato con la URL de la imagen
        const imageUrl = `/uploads/${finalFileName}`;
        return this.menuService.update(menuItem.id, { imageUrl });
      } catch (error) {
        console.error('Error procesando imagen con Sharp:', error);

        // Fallback: solo renombrar sin procesar
        try {
          await fs.rename(tempPath, finalPath);
          const imageUrl = `/uploads/${finalFileName}`;
          return this.menuService.update(menuItem.id, { imageUrl });
        } catch (fallbackError) {
          console.error('Error en fallback:', fallbackError);

          // Si todo falla, limpiar el archivo temporal
          try {
            await fs.unlink(tempPath);
          } catch (unlinkError) {
            console.error('Error al eliminar archivo temporal:', unlinkError);
          }
          throw fallbackError;
        }
      }
    }

    return menuItem;
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
          // Nombre temporal, lo cambiaremos después
          const tempName = `temp_${Date.now()}${extname(file.originalname)}`;
          cb(null, tempName);
        },
      }),
    }),
  )
  async uploadImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    // 1. Obtener el plato para generar el nombre correcto
    const menuItem = await this.menuService.findOne(+id);
    if (!menuItem) {
      throw new Error('Plato no encontrado');
    }

    // 2. Generar nombre basado en el nombre del plato
    const slug = menuItem.name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remover caracteres especiales
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .trim();

    const finalFileName = `${slug}.jpg`;
    const tempPath = file.path;
    const finalPath = `./uploads/${finalFileName}`;

    try {
      // 3. Si ya existe una imagen anterior, eliminarla
      if (menuItem.imageUrl) {
        const oldImagePath = `./uploads/${menuItem.imageUrl.split('/').pop()}`;
        try {
          await fs.unlink(oldImagePath);
        } catch (error) {
          console.log('No se pudo eliminar imagen anterior:', error.message);
        }
      }

      // 4. Convertir a JPG y redimensionar usando Sharp
      await sharp(tempPath)
        .resize(800, 600, { fit: 'cover' })
        .jpeg({ quality: 85 })
        .toFile(finalPath);

      // 5. Eliminar archivo temporal
      await fs.unlink(tempPath);

      // 6. Actualizar el plato con la nueva URL
      const imageUrl = `/uploads/${finalFileName}`;
      return this.menuService.update(+id, { imageUrl });
    } catch (error) {
      console.error('Error procesando imagen con Sharp:', error);

      // Fallback: solo renombrar sin procesar
      try {
        await fs.rename(tempPath, finalPath);
        const imageUrl = `/uploads/${finalFileName}`;
        return this.menuService.update(+id, { imageUrl });
      } catch (fallbackError) {
        console.error('Error en fallback:', fallbackError);

        // Si todo falla, limpiar el archivo temporal
        try {
          await fs.unlink(tempPath);
        } catch (unlinkError) {
          console.error('Error al eliminar archivo temporal:', unlinkError);
        }
        throw fallbackError;
      }
    }
  }
}

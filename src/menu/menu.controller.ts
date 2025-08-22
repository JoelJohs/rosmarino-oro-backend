/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Param, Patch, Delete, UseInterceptors, UploadedFile, NotFoundException, BadRequestException } from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuItemDto } from './dto/create-menu.dto';
// ...existing code...
import { Roles } from '../auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { unlink } from 'fs/promises';
import cloudinary from 'src/cloudinary/cloudinary.provider';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) { }

  @Get()
  findAll() {
    return this.menuService.findAll();
  }

  @Get(':id')
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
  @UseInterceptors(FileInterceptor('image'))
  async createWithImage(@Body() dto: CreateMenuItemDto, @UploadedFile() file: Express.Multer.File) {
    // 1. Crear el plato primero
    const menuItem = await this.menuService.create(dto);

    if (file) {
      try {
        // 2. Generar nombre basado en el nombre del plato
        const publicId = dto.name
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-')
          .trim();

        // 3. Subir a Cloudinary con optimización automática
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'menu',
          public_id: publicId,
          overwrite: true,
          resource_type: 'image',
          // Cloudinary optimiza automáticamente formato y calidad
          fetch_format: 'auto',
          quality: 'auto'
        });

        // 4. Limpiar archivo temporal
        await unlink(file.path);

        // 5. Actualizar el plato con la URL de Cloudinary
        const imageUrl = result.secure_url; // URL completa de Cloudinary
        return this.menuService.update(menuItem.id, { imageUrl });

      } catch (error) {
        console.error('Error subiendo a Cloudinary:', error);

        // Limpiar archivo temporal en caso de error
        try {
          await unlink(file.path);
        } catch (unlinkError) {
          console.error('Error al eliminar archivo temporal:', unlinkError);
        }

        throw new BadRequestException('Error al procesar la imagen');
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
  @UseInterceptors(FileInterceptor('image', { dest: './uploads' }))
  async uploadImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo');
    }

    console.log('Archivo recibido:', file);

    // 1. Obtener el plato
    const menuItem = await this.menuService.findOne(+id);
    if (!menuItem) {
      throw new NotFoundException('Plato no encontrado');
    }

    if (!file) {
      throw new BadRequestException('No se proporcionó ninguna imagen');
    }

    try {
      // 2. Generar nombre basado en el nombre del plato
      const publicId = menuItem.name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .trim();

      // 3. Si existe imagen anterior en Cloudinary, eliminarla
      if (menuItem.imageUrl && menuItem.imageUrl.includes('cloudinary.com')) {
        try {
          // Extraer public_id de la URL
          const urlParts = menuItem.imageUrl.split('/');
          const folder = urlParts[urlParts.length - 2];
          const filename = urlParts[urlParts.length - 1].split('.')[0];
          const publicIdToDelete = `${folder}/${filename}`;

          await cloudinary.uploader.destroy(publicIdToDelete);
        } catch (error) {
          console.log('Could not delete previous image:', typeof error === 'object' && error !== null && 'message' in error ? (error as { message?: string }).message : error);
        }
      }

      // 4. Subir nueva imagen a Cloudinary
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'menu',
        public_id: publicId,
        overwrite: true,
        resource_type: 'image',
        fetch_format: 'auto',
        quality: 'auto'
      });

      // 5. Limpiar archivo temporal
      await unlink(file.path);

      // 6. Actualizar con URL completa de Cloudinary
      const imageUrl = result.secure_url;
      return this.menuService.update(+id, { imageUrl });

    } catch (error) {
      console.error('Error subiendo a Cloudinary:', error);

      // Limpiar archivo temporal
      try {
        await unlink(file.path);
      } catch (unlinkError) {
        console.error('Error al eliminar archivo temporal:', unlinkError);
      }

      throw new BadRequestException('Error al procesar la imagen');
    }
  }
}
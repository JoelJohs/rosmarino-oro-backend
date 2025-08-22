# 🍝 Rosmarino & Oro - Backend

<p align="center">
  <strong>Sistema de gestión de restaurante con reservas y pedidos online</strong>
</p>

<p align="center">
  Backend API desarrollado con NestJS, TypeScript y Prisma para el restaurante Rosmarino & Oro
</p>

## 📋 Descripción

API REST completa para la gestión de un restaurante que incluye:

- **Sistema de autenticación** con JWT y verificación por email
- **Gestión de usuarios** con roles (Cliente, Empleado, Super Admin)
- **Sistema de reservas** para mesas del restaurante
- **Menú digital** con categorías y disponibilidad
- **Sistema de pedidos** con pre-orden y cálculo de servicios
- **Gestión de mesas** con capacidad y estado
- **Notificaciones por email** con Nodemailer/Ethereal

## 🚀 Tecnologías

- **NestJS** - Framework Node.js
- **TypeScript** - Lenguaje de programación
- **Prisma** - ORM y manejo de base de datos
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación y autorización
- **Bcrypt** - Encriptación de contraseñas
- **Nodemailer** - Envío de emails
- **Class Validator** - Validación de DTOs
- **Multer** - Manejo de archivos
- **Sharp** - Procesamiento de imágenes

## ⚙️ Configuración inicial

### 1. Instalación de dependencias

```bash
npm install
```

### 2. Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Base de datos
DATABASE_URL="postgresql://usuario:password@localhost:5432/rosmarino_db"

# JWT
JWT_SECRET="tu-jwt-secret-muy-seguro"
JWT_REFRESH_SECRET="tu-jwt-refresh-secret"

# Email (Ethereal para testing)
MAIL_HOST=smtp.ethereal.email
MAIL_PORT=587
MAIL_USER=tu_usuario_ethereal
MAIL_PASSWORD=tu_password_ethereal
MAIL_FROM="Rosmarino & Oro" <no-reply@rosmarino.com>

# Aplicación
APP_URL=http://localhost:3000
PORT=3001
```

### 3. Base de datos

```bash
# Ejecutar migraciones
npx prisma migrate dev

# Generar cliente de Prisma
npx prisma generate

# Poblar base de datos (opcional)
npx prisma db seed
```

## 🏃‍♂️ Ejecutar el proyecto

```bash
# Desarrollo
npm run start:dev

# Producción
npm run start:prod

# Debug
npm run start:debug
```

## 📊 Estructura del proyecto

```
src/
├── auth/           # Autenticación y autorización
├── users/          # Gestión de usuarios
├── tables/         # Gestión de mesas
├── reservations/   # Sistema de reservas
├── menu/           # Menú del restaurante
├── mail/           # Servicio de emails
├── prisma/         # Configuración de Prisma
└── uploads/        # Archivos subidos
```

## 🔐 Roles y permisos

- **SUPERADMIN**: Acceso completo al sistema
- **EMPLOYEE**: Gestión de reservas, mesas y pedidos
- **CLIENT**: Crear reservas y hacer pedidos

## 📡 Endpoints principales

### Autenticación

- `POST /auth/register` - Registro de usuario
- `POST /auth/login` - Iniciar sesión
- `POST /auth/refresh` - Renovar token
- `GET /auth/verify-email/:token` - Verificar email

### Usuarios

- `GET /users` - Listar usuarios (Admin)
- `GET /users/profile` - Perfil del usuario
- `PATCH /users/:id` - Actualizar usuario

### Reservas

- `POST /reservations` - Crear reserva
- `GET /reservations` - Listar reservas
- `PATCH /reservations/:id` - Actualizar reserva

### Mesas

- `GET /tables` - Listar mesas disponibles
- `POST /tables` - Crear mesa (Admin)

### Menú

- `GET /menu` - Ver menú público
- `POST /menu` - Agregar item (Admin)
- `PATCH /menu/:id` - Actualizar item (Admin)

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests e2e
npm run test:e2e

# Cobertura de tests
npm run test:cov

# Tests en modo watch
npm run test:watch
```

## 🗃️ Base de datos

### Modelos principales

- **User**: Usuarios del sistema con roles
- **Table**: Mesas del restaurante
- **Reservation**: Reservas de mesas
- **Order**: Pedidos asociados a reservas
- **MenuItem**: Items del menú

### Comandos útiles

```bash
# Ver base de datos en Prisma Studio
npx prisma studio

# Reset de base de datos
npx prisma migrate reset

# Nueva migración
npx prisma migrate dev --name descripcion_cambio
```

## 📧 Sistema de emails

El proyecto usa **Ethereal Email** para testing de emails:

1. Ve a [ethereal.email](https://ethereal.email)
2. Genera credenciales de testing
3. Configura las variables de entorno
4. Los emails se pueden ver en la interfaz web de Ethereal

## 🚀 Despliegue

### Variables de entorno para producción

```env
NODE_ENV=production
DATABASE_URL="tu-url-de-produccion"
JWT_SECRET="jwt-secret-muy-seguro-para-produccion"
# ... resto de variables
```

### Build para producción

```bash
npm run build
npm run start:prod
```

## 🛠️ Desarrollo

### Scripts disponibles

```bash
npm run build          # Compilar proyecto
npm run format         # Formatear código con Prettier
npm run lint           # Ejecutar ESLint
npm run start:dev      # Desarrollo con hot reload
npm run start:debug    # Desarrollo con debug
```

### Estructura de módulos

Cada módulo sigue la estructura estándar de NestJS:

- `controller.ts` - Controlador con endpoints
- `service.ts` - Lógica de negocio
- `module.ts` - Definición del módulo
- `dto/` - Data Transfer Objects
- `entities/` - Entidades/interfaces

## 🔧 Tecnologías y librerías

### Core

- **NestJS** `^11.0.1` - Framework principal
- **TypeScript** `^5.7.3` - Lenguaje
- **Prisma** `^6.14.0` - ORM

### Autenticación

- **@nestjs/jwt** `^11.0.0` - JWT tokens
- **@nestjs/passport** `^11.0.5` - Estrategias de autenticación
- **bcrypt** `^6.0.0` - Hash de contraseñas

### Validación y transformación

- **class-validator** `^0.14.2` - Validación de DTOs
- **class-transformer** `^0.5.1` - Transformación de objetos

### Utilidades

- **multer** `^2.0.2` - Upload de archivos
- **sharp** `^0.34.3` - Procesamiento de imágenes
- **nodemailer** `^7.0.5` - Envío de emails
- **uuid** `^11.1.0` - Generación de UUIDs

## 📝 Licencia

Este proyecto es privado y no tiene licencia pública.

---

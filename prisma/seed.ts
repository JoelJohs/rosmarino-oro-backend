/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    // 1. Usuarios admin y empleados
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await prisma.user.upsert({
        where: { email: 'admin@rosmarino.com' },
        update: {},
        create: {
            email: 'admin@rosmarino.com',
            password: hashedPassword,
            name: 'Administrador',
            role: 'SUPERADMIN',
            isEmailVerified: true,
        },
    });

    await prisma.user.upsert({
        where: { email: 'empleado@rosmarino.com' },
        update: {},
        create: {
            email: 'empleado@rosmarino.com',
            password: hashedPassword,
            name: 'Empleado',
            role: 'EMPLOYEE',
            isEmailVerified: true,
        },
    });

    // 2. Mesas
    for (let i = 1; i <= 10; i++) {
        await prisma.table.upsert({
            where: { number: i },
            update: {},
            create: {
                number: i,
                capacity: i <= 5 ? 2 : i <= 8 ? 4 : 6,
            },
        });
    }

    // 2. Menú italiano
    const menuItems = [
        { name: 'Spaghetti Carbonara', description: 'Cremosa salsa carbonara con guanciale', price: 12.5, category: 'Pasta' },
        { name: 'Tagliatelle al Ragù', description: 'Ragù boloñés tradicional', price: 14, category: 'Pasta' },
        { name: 'Lasagna alla Bolognese', description: 'Capas de pasta, ragù y bechamel', price: 15, category: 'Pasta' },
        { name: 'Risotto ai Funghi', description: 'Arroz cremoso con setas porcini', price: 16, category: 'Risotti' },
        { name: 'Margherita Pizza', description: 'Tomate, mozzarella y albahaca', price: 10, category: 'Pizza' },
        { name: 'Calzone', description: 'Pizza rellena de ricotta y espinaca', price: 11, category: 'Pizza' },
        { name: 'Bruschetta Classica', description: 'Pan tostado con tomate y albahaca', price: 6, category: 'Antipasti' },
        { name: 'Arancini di Riso', description: 'Bolas de risotto fritas rellenas', price: 7, category: 'Antipasti' },
        { name: 'Tiramisu', description: 'Postre clásico con café y mascarpone', price: 6, category: 'Dolci' },
        { name: 'Panna Cotta', description: 'Crema de vainilla con salsa de frutos rojos', price: 5.5, category: 'Dolci' },
        { name: 'Gnocchi al Pesto', description: 'Ñoquis con salsa pesto genovese', price: 13, category: 'Pasta' },
        { name: 'Fettuccine Alfredo', description: 'Pasta con crema de parmesano', price: 13.5, category: 'Pasta' },
        { name: 'Osso Buco', description: 'Estofado de ternera con risotto', price: 22, category: 'Segundi Piatti' },
        { name: 'Pollo alla Parmigiana', description: 'Pollo empanizado con mozzarella', price: 18, category: 'Segundi Piatti' },
        { name: 'Insalata Caprese', description: 'Tomate, mozzarella y albahaca', price: 9, category: 'Insalate' },
        { name: 'Pesto alla Genovese', description: 'Pasta con albahaca y piñones', price: 12, category: 'Pasta' },
        { name: 'Ravioli di Ricotta', description: 'Rellenos de ricotta y espinaca', price: 14, category: 'Pasta' },
        { name: 'Minestrone', description: 'Sopa italiana de verduras', price: 7, category: 'Zuppe' },
        { name: 'Prosciutto e Melone', description: 'Jamón serrano con melón', price: 9, category: 'Antipasti' },
        { name: 'Carpaccio di Manzo', description: 'Finas lonchas de ternera cruda', price: 12, category: 'Antipasti' },
    ];

    await prisma.menuItem.createMany({
        data: menuItems,
        skipDuplicates: true,
    });

    console.log('✅ Usuarios, mesas y menú insertados');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => {
        void (prisma.$disconnect as () => Promise<void>)();
    });
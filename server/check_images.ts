
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkImages() {
    const products = await prisma.product.findMany({
        take: 5,
        select: {
            name: true,
            photos: true
        }
    });

    console.log("Checking first 5 products:");
    products.forEach(p => {
        console.log(`Product: ${p.name}`);
        console.log(`Photos: ${p.photos}`);
        console.log("-------------------");
    });
}

checkImages()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());

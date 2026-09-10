import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Check if hero slides already exist
  const existingSlides = await prisma.heroSlide.count();
  
  if (existingSlides === 0) {
    console.log('🌱 Seeding default hero slides...');
    
    // Default slides - these match your original design
    const defaultSlides = [
      {
        title: "Step Into Luxury",
        description: "Handcrafted shoes for the modern connoisseur, tailored from premium selected calfskin and designed in Milan.",
        ctaLabel: "Shop Now",
        ctaHref: "/products",
        order: 0,
        isActive: true,
      },
      {
        title: "The Men's Collection",
        description: "Oxfords, Chelsea boots, and monk straps — heritage Italian craftsmanship for the modern gentleman.",
        ctaLabel: "Shop Men's",
        ctaHref: "/products?category=men",
        order: 1,
        isActive: true,
      },
      {
        title: "The Women's Collection",
        description: "Stilettos, loafers, and sandals crafted from the world's finest full-grain leathers.",
        ctaLabel: "Shop Women's",
        ctaHref: "/products?category=women",
        order: 2,
        isActive: true,
      },
    ];

    for (const slide of defaultSlides) {
      await prisma.heroSlide.create({
        data: slide,
      });
    }

    console.log('✅ Default hero slides seeded!');
  } else {
    console.log('ℹ️ Hero slides already exist, skipping seed.');
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
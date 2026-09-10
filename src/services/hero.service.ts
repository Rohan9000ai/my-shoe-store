import { prisma } from "@/lib/prisma";

export async function getHeroSlides() {
  return prisma.heroSlide.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });
}

export async function getHeroSettings() {
  const settings = await prisma.heroSettings.findFirst();
  return settings || { backgroundImage: null };
}

export async function getAllHeroSlides() {
  return prisma.heroSlide.findMany({
    orderBy: { order: "asc" },
  });
}

export async function createHeroSlide(data: {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  order?: number;
}) {
  const count = await prisma.heroSlide.count();
  return prisma.heroSlide.create({
    data: {
      title: data.title,
      description: data.description,
      ctaLabel: data.ctaLabel || "Shop Now",
      ctaHref: data.ctaHref || "/products",
      order: data.order ?? count,
    },
  });
}

export async function updateHeroSlide(
  id: string,
  data: {
    title?: string;
    description?: string;
    ctaLabel?: string;
    ctaHref?: string;
    order?: number;
    isActive?: boolean;
  }
) {
  return prisma.heroSlide.update({
    where: { id },
    data,
  });
}

export async function deleteHeroSlide(id: string) {
  return prisma.heroSlide.delete({ where: { id } });
}

export async function updateHeroSettings(data: {
  backgroundImage?: string;
}) {
  const existing = await prisma.heroSettings.findFirst();
  if (existing) {
    return prisma.heroSettings.update({
      where: { id: existing.id },
      data,
    });
  }
  return prisma.heroSettings.create({
    data,
  });
}
import { prisma } from "@/lib/prisma";

export interface StoreSettings {
  deliveryCharge: number;
  freeDeliveryThreshold: number;
  taxRate: number;
  whatsappNumber: string;
  raw: Record<string, string>;
}

// Reads all settings rows and shapes them into typed values with
// sensible defaults for any key the admin hasn't configured yet.
export async function getSettings(): Promise<StoreSettings> {
  const rows = await prisma.settings.findMany();

  const settingsMap: Record<string, string> = {};
  for (const row of rows) {
    settingsMap[row.key] = row.value;
  }

  return {
    deliveryCharge: Number(settingsMap.delivery_charge ?? 1500),
    freeDeliveryThreshold: Number(settingsMap.free_delivery_threshold ?? 50000),
    taxRate: Number(settingsMap.tax_rate ?? 0),
    whatsappNumber:
      settingsMap.whatsapp_number ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
    raw: settingsMap,
  };
}

// Creates or updates a single setting (upsert by key) — used by the
// admin Settings page to save each field.
export async function saveSetting(key: string, value: string) {
  return prisma.settings.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}
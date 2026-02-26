"use server";

import { createClient } from "@/lib/supabase/server";

export type DashboardStats = {
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
};

export async function getDashboardStats(startDate: string, endDate: string) {
  const supabase = await createClient();

  // Fetch orders and their items with menu names in the date range
  const { data, error } = await supabase
    .from("order_items_2026")
    .select(
      `
      quantity,
      price_at_time,
      created_at,
      menu_2026 (
        name
      )
    `,
    )
    .gte("created_at", startDate)
    .lte("created_at", endDate + " 23:59:59");

  if (error) {
    console.error("Dashboard fetch error:", error);
    throw new Error("Errore nel recupero dei dati della dashboard.");
  }

  // Aggregate results by product name
  const aggregation: Record<string, DashboardStats> = {};

  data.forEach((row) => {
    // Supabase join result might be an object or an array depending on internal typing
    const menu = row.menu_2026 as unknown as
      | { name: string }
      | { name: string }[]
      | null;
    const name =
      (Array.isArray(menu) ? menu[0]?.name : menu?.name) ||
      "Prodotto Sconosciuto";
    if (!aggregation[name]) {
      aggregation[name] = {
        productName: name,
        totalQuantity: 0,
        totalRevenue: 0,
      };
    }
    aggregation[name].totalQuantity += row.quantity;
    aggregation[name].totalRevenue += row.quantity * row.price_at_time;
  });

  return Object.values(aggregation).sort(
    (a, b) => b.totalRevenue - a.totalRevenue,
  );
}

export async function getRecentOrders() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders_2026")
    .select(
      `
      id,
      total_price,
      created_at,
      order_items_2026 (
        quantity,
        price_at_time,
        menu_2026 (
          name
        )
      )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Recent orders fetch error:", error);
    throw new Error("Errore nel recupero della cronologia ordini.");
  }

  return data.map((order) => ({
    id: order.id,
    totalPrice: order.total_price,
    createdAt: order.created_at,
    items: order.order_items_2026.map((item) => {
      const menu = item.menu_2026 as unknown as
        | { name: string }
        | { name: string }[]
        | null;
      return {
        name:
          (Array.isArray(menu) ? menu[0]?.name : menu?.name) ||
          "Prodotto Sconosciuto",
        quantity: item.quantity,
        price: item.price_at_time,
      };
    }),
  }));
}

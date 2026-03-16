import type { MenuItemTypes } from "@/lib/types";

export interface DashboardStats {
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface RecentOrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface RecentOrder {
  id: string;
  totalPrice: number;
  createdAt: string;
  items: RecentOrderItem[];
}

export interface OrderRowInput {
  orderId: string | number;
  orderDate: string;
  productName: string;
  quantity: number;
  priceAtTime: number;
  isTakeout: boolean;
  type?: MenuItemTypes;
}

export interface DashboardComputedData {
  stats: DashboardStats[];
  recentOrders: RecentOrder[];
  totalRevenue: number;
  totalItems: number;
  barStats: { qty: number; rev: number };
  foodStats: { qty: number; rev: number };
  takeoutStats: { percentage: number; qty: number };
}

export function computeDashboardFromRows(
  rows: OrderRowInput[],
  startDate?: string,
  endDate?: string,
): DashboardComputedData {
  let start: Date | null = null;
  let end: Date | null = null;

  if (startDate) {
    start = new Date(startDate);
  }

  if (endDate) {
    end = new Date(endDate);
  }

  const filteredRows = rows.filter((row) => {
    const orderDate = new Date(row.orderDate);
    if (start && orderDate < start) return false;
    if (end && orderDate > end) return false;
    return true;
  });

  const aggregatedStats: Record<string, DashboardStats> = {};

  filteredRows.forEach((row) => {
    if (!aggregatedStats[row.productName]) {
      aggregatedStats[row.productName] = {
        productName: row.productName,
        totalQuantity: 0,
        totalRevenue: 0,
      };
    }
    aggregatedStats[row.productName].totalQuantity += row.quantity;
    aggregatedStats[row.productName].totalRevenue +=
      row.quantity * row.priceAtTime;
  });

  const stats = Object.values(aggregatedStats).sort(
    (a, b) => b.totalRevenue - a.totalRevenue,
  );

  const totalRevenue = stats.reduce((acc, curr) => acc + curr.totalRevenue, 0);
  const totalItems = stats.reduce((acc, curr) => acc + curr.totalQuantity, 0);

  let barQty = 0;
  let barRev = 0;
  let foodQty = 0;
  let foodRev = 0;
  let takeoutQty = 0;
  let totalOrderItemsQty = 0;

  filteredRows.forEach((row) => {
    const isBar = row.type === "bar";

    if (isBar) {
      barQty += row.quantity;
      barRev += row.quantity * row.priceAtTime;
    } else {
      foodQty += row.quantity;
      foodRev += row.quantity * row.priceAtTime;
    }

    if (row.isTakeout) {
      takeoutQty += row.quantity;
    }
    totalOrderItemsQty += row.quantity;
  });

  const takeoutPercentage =
    totalOrderItemsQty > 0 ? (takeoutQty / totalOrderItemsQty) * 100 : 0;

  const ordersMap = new Map<string, RecentOrder>();

  filteredRows.forEach((row) => {
    const id = String(row.orderId);
    const existing = ordersMap.get(id);

    const lineTotal = row.quantity * row.priceAtTime;

    if (!existing) {
      ordersMap.set(id, {
        id,
        totalPrice: lineTotal,
        createdAt: row.orderDate,
        items: [
          {
            name: row.productName,
            quantity: row.quantity,
            price: row.priceAtTime,
          },
        ],
      });
    } else {
      existing.totalPrice += lineTotal;
      existing.items.push({
        name: row.productName,
        quantity: row.quantity,
        price: row.priceAtTime,
      });

      // Keep the earliest creation date for consistency
      if (new Date(row.orderDate) < new Date(existing.createdAt)) {
        existing.createdAt = row.orderDate;
      }
    }
  });

  const recentOrders = Array.from(ordersMap.values())
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 10);

  return {
    stats,
    recentOrders,
    totalRevenue,
    totalItems,
    barStats: { qty: barQty, rev: barRev },
    foodStats: { qty: foodQty, rev: foodRev },
    takeoutStats: { percentage: takeoutPercentage, qty: takeoutQty },
  };
}

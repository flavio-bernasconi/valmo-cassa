"use client";

import { useState, useMemo } from "react";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { computeDashboardFromRows, type OrderRowInput } from "@/lib/dashboard";

export default function DashboardPage() {
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  // Use useLiveQuery to automatically refresh when DB changes
  const ordersLive = useLiveQuery(() => db.orders.toArray());
  const orderItemsLive = useLiveQuery(() => db.order_items.toArray());
  const menuItemsLive = useLiveQuery(() => db.menu_items.toArray());

  const orders = useMemo(() => ordersLive || [], [ordersLive]);
  const orderItems = useMemo(() => orderItemsLive || [], [orderItemsLive]);
  const menuItems = useMemo(() => menuItemsLive || [], [menuItemsLive]);

  const rows: OrderRowInput[] = useMemo(() => {
    return orderItems.map((oi) => {
      const order = orders.find((o) => o.id === oi.order_id);
      const menuItem = menuItems.find(
        (mi) => String(mi.id) === String(oi.menu_item_id),
      );

      return {
        orderId: order?.id ?? oi.order_id,
        orderDate: order?.created_at ?? new Date().toISOString(),
        productName: menuItem?.name || `Sconosciuto (${oi.menu_item_id})`,
        quantity: oi.quantity,
        priceAtTime: oi.price_at_time,
        isTakeout: oi.is_takeout,
        type: menuItem?.type,
      };
    });
  }, [orders, orderItems, menuItems]);

  const dashboardData = useMemo(
    () => computeDashboardFromRows(rows, startDate, endDate),
    [rows, startDate, endDate],
  );

  const {
    stats,
    recentOrders,
    totalRevenue,
    totalItems,
    barStats,
    foodStats,
    takeoutStats,
  } = dashboardData;

  return (
    <DashboardLayout
      title="Dashboard Ordini"
      subtitle="Monitora le vendite e i prodotti più popolari."
      startDate={startDate}
      endDate={endDate}
      onStartDateChange={setStartDate}
      onEndDateChange={setEndDate}
      stats={stats}
      totalRevenue={totalRevenue}
      totalItems={totalItems}
      barStats={barStats}
      foodStats={foodStats}
      takeoutStats={takeoutStats}
      recentOrders={recentOrders}
    />
  );
}

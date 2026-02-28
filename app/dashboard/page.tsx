"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  TrendingUp,
  Package,
  History,
  Download,
  Coffee,
  Utensils,
  Percent,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";

interface DashboardStats {
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}

interface RecentOrder {
  id: string;
  totalPrice: number;
  createdAt: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
}

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

  const stats = useMemo(() => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const filteredOrders = orders.filter((order) => {
      const orderDate = new Date(order.created_at);
      return orderDate >= start && orderDate <= end;
    });

    const aggregatedStats: Record<string, DashboardStats> = {};

    filteredOrders.forEach((order) => {
      const items = orderItems.filter((oi) => oi.order_id === order.id);
      items.forEach((oi) => {
        const menuItem = menuItems.find((mi) => mi.id === oi.menu_item_id);
        const name = menuItem?.name || `Sconosciuto (${oi.menu_item_id})`;
        if (!aggregatedStats[name]) {
          aggregatedStats[name] = {
            productName: name,
            totalQuantity: 0,
            totalRevenue: 0,
          };
        }
        aggregatedStats[name].totalQuantity += oi.quantity;
        aggregatedStats[name].totalRevenue += oi.quantity * oi.price_at_time;
      });
    });

    return Object.values(aggregatedStats).sort(
      (a, b) => b.totalRevenue - a.totalRevenue,
    );
  }, [orders, orderItems, menuItems, startDate, endDate]);

  const recentOrders: RecentOrder[] = useMemo(() => {
    return orders
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, 10)
      .map((order) => {
        const items = orderItems
          .filter((oi) => oi.order_id === order.id)
          .map((oi) => ({
            name:
              menuItems.find((mi) => mi.id === oi.menu_item_id)?.name ||
              "Sconosciuto",
            quantity: oi.quantity,
            price: oi.price_at_time,
          }));
        return {
          id: order.id!.toString(),
          totalPrice: order.total_price,
          createdAt: order.created_at,
          items,
        };
      });
  }, [orders, orderItems, menuItems]);

  const totalRevenue = stats.reduce((acc, curr) => acc + curr.totalRevenue, 0);
  const totalItems = stats.reduce((acc, curr) => acc + curr.totalQuantity, 0);

  const { barStats, foodStats, takeoutStats } = useMemo(() => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const filteredOrders = orders.filter((order) => {
      const orderDate = new Date(order.created_at);
      return orderDate >= start && orderDate <= end;
    });

    let barQty = 0;
    let barRev = 0;
    let foodQty = 0;
    let foodRev = 0;
    let takeoutQty = 0;
    let totalOrderItemsQty = 0;

    filteredOrders.forEach((order) => {
      const items = orderItems.filter((oi) => oi.order_id === order.id);
      items.forEach((oi) => {
        const menuItem = menuItems.find((mi) => mi.id === oi.menu_item_id);
        const isBar = menuItem?.type === "bar";

        if (isBar) {
          barQty += oi.quantity;
          barRev += oi.quantity * oi.price_at_time;
        } else {
          foodQty += oi.quantity;
          foodRev += oi.quantity * oi.price_at_time;
        }

        if (oi.is_takeout) {
          takeoutQty += oi.quantity;
        }
        totalOrderItemsQty += oi.quantity;
      });
    });

    const takeoutPercentage =
      totalOrderItemsQty > 0 ? (takeoutQty / totalOrderItemsQty) * 100 : 0;

    return {
      barStats: { qty: barQty, rev: barRev },
      foodStats: { qty: foodQty, rev: foodRev },
      takeoutStats: { percentage: takeoutPercentage, qty: takeoutQty },
    };
  }, [orders, orderItems, menuItems, startDate, endDate]);

  const downloadData = async () => {
    const allOrderItems = await db.order_items.toArray();
    const allOrders = await db.orders.toArray();
    const allMenu = await db.menu_items.toArray();

    // Map items with names and dates for easier reading
    const exportData = allOrderItems.map((oi) => {
      const order = allOrders.find((o) => o.id === oi.order_id);
      const menuItem = allMenu.find((mi) => mi.id === oi.menu_item_id);
      return {
        ...oi,
        product_name: menuItem?.name || "Sconosciuto",
        order_date: order?.created_at || "Sconosciuto",
      };
    });

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `order_items_export_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex-1 w-full flex flex-col gap-8 p-8">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Dashboard Ordini</h1>
              <p className="text-muted-foreground">
                Monitora le vendite e i prodotti più popolari.
              </p>
            </div>
            <Button variant="outline" onClick={downloadData} className="gap-2">
              <Download className="w-4 h-4" /> Esporta JSON items
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="grid gap-2 flex-1 min-w-[200px]">
                <Label htmlFor="start-date" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Data Inizio
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="grid gap-2 flex-1 min-w-[200px]">
                <Label htmlFor="end-date" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Data Fine
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Incasso Totale
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                €{totalRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Nel periodo selezionato
              </p>
            </CardContent>
          </Card>
          <Card className="bg-accent/10 border-accent/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Prodotti Venduti
              </CardTitle>
              <Package className="w-4 h-4 text-accent-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalItems}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Quantità totale articoli
              </p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">
                Asporto
              </CardTitle>
              <Percent className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">
                {takeoutStats.percentage.toFixed(1)}%{" "}
                <span className="text-lg font-normal">
                  ({takeoutStats.qty} pz.)
                </span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Percentuale ordini da asporto
              </p>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-orange-900">
                Categoria Bar
              </CardTitle>
              <Coffee className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">
                €{barStats.rev.toFixed(2)}
              </div>
              <div className="text-xl font-semibold text-orange-700">
                {barStats.qty} <span className="text-lg font-normal">pz.</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-green-900">
                Categoria Cibo
              </CardTitle>
              <Utensils className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">
                €{foodStats.rev.toFixed(2)}
              </div>
              <div className="text-xl font-semibold text-green-700">
                {foodStats.qty} <span className="text-lg font-normal">pz.</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Details Table */}
        <Card>
          <CardHeader>
            <CardTitle>Dettaglio Prodotti</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground italic">
                Nessun ordine trovato per questo intervallo di date.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left py-3 font-medium">Prodotto</th>
                      <th className="text-right py-3 font-medium">Quantità</th>
                      <th className="text-right py-3 font-medium">
                        Totale Ricavi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {stats.map((item) => (
                      <tr
                        key={item.productName}
                        className="hover:bg-accent/5 transition-colors"
                      >
                        <td className="py-4 font-medium">{item.productName}</td>
                        <td className="py-4 text-right">
                          <Badge variant="outline" className="font-mono">
                            {item.totalQuantity}
                          </Badge>
                        </td>
                        <td className="py-4 text-right font-bold text-primary">
                          €{item.totalRevenue.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders History */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5" />
            <h2 className="text-xl font-bold">Cronologia Ordini</h2>
            <span className="text-muted-foreground text-sm">(Ultimi 10)</span>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-muted-foreground italic text-sm">
              Nessun ordine trovato.
            </p>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {recentOrders.map((order) => (
                <AccordionItem key={order.id} value={order.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex flex-1 justify-between items-center pr-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className="font-mono text-xs text-muted-foreground">
                          #{order.id.substring(0, 8)}
                        </span>
                        <span className="text-sm">
                          {new Date(order.createdAt).toLocaleString("it-IT")}
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-md font-bold">
                        €{order.totalPrice.toFixed(2)}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-2 pt-2 px-1">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between text-sm py-1 border-b last:border-0"
                        >
                          <span>
                            {item.quantity}x {item.name}
                          </span>
                          <span className="text-muted-foreground">
                            €{(item.quantity * item.price).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { getDashboardStats, DashboardStats, getRecentOrders } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, TrendingUp, Package, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
  const [stats, setStats] = useState<DashboardStats[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getDashboardStats(startDate, endDate);
      setStats(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Errore nel caricamento dei dati.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  const fetchHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const data = await getRecentOrders();
      setRecentOrders(data as RecentOrder[]);
    } catch (err: unknown) {
      console.error("History fetch error:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchHistory();
  }, [fetchStats, fetchHistory]);

  const totalRevenue = stats.reduce((acc, curr) => acc + curr.totalRevenue, 0);
  const totalItems = stats.reduce((acc, curr) => acc + curr.totalQuantity, 0);

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Dashboard Ordini</h1>
        <p className="text-muted-foreground">
          Monitora le vendite e i prodotti più popolari.
        </p>
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
            <Button onClick={fetchStats} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Aggiorna"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Incasso Totale
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">€{totalRevenue.toFixed(2)}</div>
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
      </div>

      {/* Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Dettaglio Prodotti</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-red-500 py-4">{error}</div>
          ) : isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : stats.length === 0 ? (
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

        {isLoadingHistory ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : recentOrders.length === 0 ? (
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
  );
}

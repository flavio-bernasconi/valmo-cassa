"use client";

import { ReactNode, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Calendar,
  TrendingUp,
  Package,
  History,
  Coffee,
  Utensils,
  Percent,
  Trash2,
} from "lucide-react";
import { ProductStatsTable } from "@/components/dashboard/ProductStatsTable";
import type { DashboardStats, RecentOrder } from "@/lib/dashboard";
import { Button } from "../ui/button";
import { ConfirmationModal } from "../ConfirmationModal";
import { deleteOrder } from "@/lib/db";
import { toast } from "sonner";

interface DashboardLayoutProps {
  title: string;
  subtitle: string;
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  stats: DashboardStats[];
  totalRevenue: number;
  totalItems: number;
  barStats: { qty: number; rev: number };
  foodStats: { qty: number; rev: number };
  takeoutStats: { percentage: number; qty: number };
  recentOrders: RecentOrder[];
  headerActions?: ReactNode;
  hasDateFilter?: boolean;
}

export function DashboardLayout({
  title,
  subtitle,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  stats,
  totalRevenue,
  totalItems,
  barStats,
  foodStats,
  takeoutStats,
  recentOrders,
  headerActions,
  hasDateFilter = true,
}: DashboardLayoutProps) {
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex-1 w-full flex flex-col gap-8 p-8">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold">{title}</h1>
              <p className="text-muted-foreground">{subtitle}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        {headerActions && (
          <Card>
            <CardContent className="pt-6">{headerActions}</CardContent>
          </Card>
        )}
        {hasDateFilter && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="grid gap-2 flex-1 min-w-[200px]">
                  <Label
                    htmlFor="start-date"
                    className="flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" /> Data Inizio
                  </Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => onStartDateChange(e.target.value)}
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
                    onChange={(e) => onEndDateChange(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
                {takeoutStats.qty} pz.{" "}
                <span className="text-lg font-normal">
                  {takeoutStats.percentage.toFixed(1)}%
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

        <ProductStatsTable stats={stats} />

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
                    <div className="flex w-full justify-between items-center gap-2">
                      <p className="font-mono block text-xs text-muted-foreground">
                        uuuid: #{order.id}
                      </p>
                      <Button
                        variant="destructive"
                        onClick={() => setOrderToDelete(order.id)}
                      >
                        <Trash2 className="w-4 h-4" /> Cancella ordine
                      </Button>
                    </div>
                    <div className="flex flex-col gap-2 pt-2 px-1">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between text-sm py-1 border-b last:border-0 hover:bg-slate-100"
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

      <ConfirmationModal
        open={orderToDelete !== null}
        onOpenChange={(open) => !open && setOrderToDelete(null)}
        title="Cancella ordine"
        description="Sei sicuro di voler eliminare questo ordine? L'operazione non può essere annullata."
        confirmLabel="Cancella ordine"
        cancelLabel="Annulla"
        confirmVariant="destructive"
        onConfirm={async () => {
          if (!orderToDelete) return;
          try {
            await deleteOrder(orderToDelete);
            toast.success("Ordine cancellato con successo");
          } catch (error) {
            toast.error("Errore durante la cancellazione dell'ordine");
            throw error;
          }
        }}
      />
    </div>
  );
}

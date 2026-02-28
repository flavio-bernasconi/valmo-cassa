"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { db } from "@/lib/db";
import { toast } from "sonner";

interface ExportDataProps {
  variant?: "outline" | "default" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  label?: string;
}

export function ExportData({
  variant = "outline",
  size = "default",
  className = "",
  label = "Esporta ordini",
}: ExportDataProps) {
  const downloadData = async () => {
    try {
      const allOrderItems = await db.order_items.toArray();
      const allOrders = await db.orders.toArray();
      const allMenu = await db.menu_items.toArray();

      if (allOrderItems.length === 0) {
        toast.error("Nessun dato da esportare.");
        return;
      }

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
      const now = new Date();
      const formatDate = new Intl.DateTimeFormat("it-IT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
        .format(now)
        .split(" ")
        .join("_");
      a.download = `order_items_export_${formatDate}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Dati esportati con successo!");
    } catch (error) {
      console.error("Errore durante l'esportazione:", error);
      toast.error("Errore durante l'esportazione dei dati.");
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={downloadData}
      className={`gap-2 ${className}`}
    >
      <Download className="w-4 h-4" /> {label}
    </Button>
  );
}

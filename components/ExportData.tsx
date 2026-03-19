"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { db } from "@/lib/db";
import { toast } from "sonner";
import { useLiveQuery } from "dexie-react-hooks";

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
  const currentCount = useLiveQuery(() => db.orders.count());

  const downloadData = async (isAuto = false) => {
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
        const menuItem = allMenu.find(
          (mi) => String(mi.id) === String(oi.menu_item_id),
        );
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
      const pad = (n: number) => String(n).padStart(2, "0");
      const formatDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}.${pad(now.getMinutes())}.${pad(now.getSeconds())}`;
      a.download = `order_items_export_${formatDate}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (isAuto) {
        toast.info("Backup automatico eseguito!", {
          description: `Raggiunti ${Math.floor(allOrders.length / 100) * 100} ordini.`,
        });
      } else {
        toast.success("Dati esportati con successo!");
      }
    } catch (error) {
      console.error("Errore durante l'esportazione:", error);
      toast.error("Errore durante l'esportazione dei dati.");
    }
  };

  useEffect(() => {
    if (currentCount === undefined || currentCount === 0) return;

    const threshold = Math.floor(currentCount / 100) * 100;
    if (threshold === 0) return;

    const lastTriggered = localStorage.getItem("last_auto_export_threshold");
    if (!lastTriggered || parseInt(lastTriggered, 10) < threshold) {
      downloadData(true);
      localStorage.setItem("last_auto_export_threshold", String(threshold));
    }
  }, [currentCount]);

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => downloadData()}
      className={`gap-2 ${className}`}
    >
      <Download className="w-4 h-4" /> {label}
    </Button>
  );
}

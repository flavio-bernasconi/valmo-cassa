"use client";

import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { computeDashboardFromRows, type OrderRowInput } from "@/lib/dashboard";
import { MenuItemTypes } from "@/lib/types";

interface UploadedJsonRow {
  order_id: number;
  menu_item_id: number;
  quantity: number;
  price_at_time: number;
  is_takeout: boolean;
  id: number;
  product_name: string;
  order_date: string;
  type?: string;
}

export default function DashboardUploadPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [uploadedRows, setUploadedRows] = useState<UploadedJsonRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setStartDate(today);
    setEndDate(today);
  }, []);

  const handleFilesChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const allRows: UploadedJsonRow[] = [];
    let firstError: string | null = null;

    for (const file of Array.from(files)) {
      try {
        const text = await file.text();
        const data = JSON.parse(text) as UploadedJsonRow[];

        if (!Array.isArray(data)) {
          firstError ||= `Il file ${file.name} non contiene un array JSON valido.`;
          continue;
        }

        data.forEach((row) => {
          allRows.push(row);
        });
      } catch (e) {
        console.error(e);
        firstError ||= `Errore nel leggere il file ${file.name}.`;
      }
    }

    setUploadedRows(allRows);
    setError(firstError);
  };

  const rows: OrderRowInput[] = useMemo(
    () =>
      uploadedRows.map((row) => ({
        orderId: row.order_id,
        orderDate: row.order_date,
        productName: row.product_name,
        quantity: row.quantity,
        priceAtTime: row.price_at_time,
        isTakeout: row.is_takeout,
        type: row.type as MenuItemTypes,
      })),
    [uploadedRows],
  );

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

  const handleDownloadCombined = () => {
    if (uploadedRows.length === 0) return;

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const formatDate = `${now.getFullYear()}-${pad(
      now.getMonth() + 1,
    )}-${pad(now.getDate())}_${pad(now.getHours())}.${pad(
      now.getMinutes(),
    )}.${pad(now.getSeconds())}`;

    const blob = new Blob([JSON.stringify(uploadedRows, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `order_items_upload_${formatDate}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout
      title="Dashboard da File JSON"
      subtitle="Carica uno o più file JSON di ordini per visualizzare le stesse statistiche della dashboard."
      startDate={startDate}
      endDate={endDate}
      onStartDateChange={(value) => setStartDate(value)}
      onEndDateChange={(value) => setEndDate(value)}
      stats={stats}
      totalRevenue={totalRevenue}
      totalItems={totalItems}
      barStats={barStats}
      foodStats={foodStats}
      takeoutStats={takeoutStats}
      recentOrders={recentOrders}
      hasDateFilter={false}
      headerActions={
        <div className="flex flex-col items-end gap-2">
          <Input
            type="file"
            accept="application/json"
            multiple
            onChange={handleFilesChange}
            className="w-full h-12"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadCombined}
            disabled={uploadedRows.length === 0}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Scarica JSON combinato
          </Button>
          {error && (
            <p className="text-xs text-red-500 max-w-xs text-right">{error}</p>
          )}
        </div>
      }
    />
  );
}

"use client";

import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardStats } from "@/lib/dashboard";

interface ProductStatsTableProps {
  stats: DashboardStats[];
}

type SortKey = "productName" | "totalQuantity" | "totalRevenue";
type SortOrder = "asc" | "desc";

export function ProductStatsTable({ stats }: ProductStatsTableProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("totalRevenue");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  const filteredAndSortedStats = useMemo(() => {
    return stats
      .filter((item) =>
        item.productName.toLowerCase().includes(search.toLowerCase()),
      )
      .sort((a, b) => {
        const order = sortOrder === "asc" ? 1 : -1;
        if (typeof a[sortKey] === "string") {
          return (
            order * (a[sortKey] as string).localeCompare(b[sortKey] as string)
          );
        }
        return order * ((a[sortKey] as number) - (b[sortKey] as number));
      });
  }, [stats, search, sortKey, sortOrder]);

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column)
      return <ChevronsUpDown className="w-4 h-4 opacity-30" />;
    return sortOrder === "asc" ? (
      <ChevronUp className="w-4 h-4 text-primary" />
    ) : (
      <ChevronDown className="w-4 h-4 text-primary" />
    );
  };

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-bold">Dettaglio Prodotti</CardTitle>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Cerca prodotto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 border-slate-200 focus:ring-blue-500"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto max-h-[500px] border-t">
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-sm z-10 border-b">
              <tr className="text-slate-500 font-semibold uppercase tracking-wider">
                <th
                  className="text-left py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                  onClick={() => handleSort("productName")}
                >
                  <div className="flex items-center gap-2">
                    Prodotto
                    <SortIcon column="productName" />
                  </div>
                </th>
                <th
                  className="text-right py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                  onClick={() => handleSort("totalQuantity")}
                >
                  <div className="flex items-center justify-end gap-2">
                    Quantità
                    <SortIcon column="totalQuantity" />
                  </div>
                </th>
                <th
                  className="text-right py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                  onClick={() => handleSort("totalRevenue")}
                >
                  <div className="flex items-center justify-end gap-2">
                    Totale Ricavi
                    <SortIcon column="totalRevenue" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAndSortedStats.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="text-center py-12 text-slate-400 italic"
                  >
                    Nessun prodotto trovato.
                  </td>
                </tr>
              ) : (
                filteredAndSortedStats.map((item) => (
                  <tr
                    key={item.productName}
                    className="hover:bg-blue-50/50 transition-colors group"
                  >
                    <td className="py-4 px-4 font-medium text-slate-700 group-hover:text-blue-600 transition-colors">
                      {item.productName}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Badge
                        variant="secondary"
                        className="font-mono text-xs px-2 py-0 border-slate-200"
                      >
                        {item.totalQuantity}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-slate-900">
                      €{item.totalRevenue.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

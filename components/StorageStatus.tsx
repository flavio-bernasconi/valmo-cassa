"use client";

import { useStorageEstimate } from "@/lib/hooks/use-storage-estimate";
import { Badge } from "@/components/ui/badge";
import { Database } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export function StorageStatus() {
  const { usage, quota, percentageUsed, remainingMB } = useStorageEstimate();

  if (usage === undefined || quota === undefined) {
    return null;
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const isLowStorage = (percentageUsed || 0) > 80;

  return (
    <HoverCard openDelay={0} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div className="flex items-center gap-2 cursor-help group p-1.5 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200">
          <div
            className={`p-1.5 rounded-md ${
              isLowStorage
                ? "bg-red-100 dark:bg-red-900/30"
                : "bg-blue-100 dark:bg-blue-900/30"
            }`}
          >
            <Database
              className={`w-4 h-4 ${
                isLowStorage
                  ? "text-red-600 dark:text-red-400"
                  : "text-blue-600 dark:text-blue-400"
              }`}
            />
          </div>
          <Badge
            variant={isLowStorage ? "destructive" : "secondary"}
            className="font-mono text-[10px] px-1.5 py-0 h-4"
          >
            {percentageUsed?.toFixed(1)}%
          </Badge>
        </div>
      </HoverCardTrigger>
      <HoverCardContent align="end" className="w-80 p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-tight">
                Database Storage
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatSize(usage)} of {formatSize(quota)} used
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
              <div
                className={`h-full transition-all duration-500 ease-in-out ${
                  isLowStorage ? "bg-red-500" : "bg-blue-500"
                }`}
                style={{ width: `${percentageUsed}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              <span>Quota locale</span>
              <span>{remainingMB?.toFixed(0)} MB rimanenti</span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

"use client";

import { useState, useEffect } from "react";

export interface StorageEstimate {
  usage: number | undefined;
  quota: number | undefined;
  percentageUsed: number | undefined;
  remainingMB: number | undefined;
}

export function useStorageEstimate() {
  const [estimate, setEstimate] = useState<StorageEstimate>({
    usage: undefined,
    quota: undefined,
    percentageUsed: undefined,
    remainingMB: undefined,
  });

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !navigator.storage ||
      !navigator.storage.estimate
    ) {
      return;
    }

    const updateEstimate = async () => {
      try {
        const quota = await navigator.storage.estimate();
        const usage = quota.usage || 0;
        const total = quota.quota || 0;

        setEstimate({
          usage,
          quota: total,
          percentageUsed: total > 0 ? (usage / total) * 100 : 0,
          remainingMB: total > 0 ? (total - usage) / 1024 / 1024 : 0,
        });
      } catch (error) {
        console.error("Failed to get storage estimate:", error);
      }
    };

    updateEstimate();

    // Check every minute or on storage events if necessary
    const interval = setInterval(updateEstimate, 60000);
    return () => clearInterval(interval);
  }, []);

  return estimate;
}

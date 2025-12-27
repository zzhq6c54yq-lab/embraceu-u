import { useState, useEffect, useCallback } from "react";
import { useOnlineStatus } from "./useOnlineStatus";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type TableName = keyof Database["public"]["Tables"];

interface QueuedEntry {
  id: string;
  table: TableName;
  data: Record<string, unknown>;
  timestamp: number;
}

const QUEUE_KEY = "embraceu_offline_queue";

export const useOfflineSync = () => {
  const { isOnline } = useOnlineStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load pending count on mount
  useEffect(() => {
    const queue = getQueue();
    setPendingCount(queue.length);
  }, []);

  const getQueue = (): QueuedEntry[] => {
    try {
      const stored = localStorage.getItem(QUEUE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveQueue = (queue: QueuedEntry[]) => {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    setPendingCount(queue.length);
  };

  const addToQueue = useCallback((table: TableName, data: Record<string, unknown>) => {
    const queue = getQueue();
    const entry: QueuedEntry = {
      id: crypto.randomUUID(),
      table,
      data,
      timestamp: Date.now(),
    };
    queue.push(entry);
    saveQueue(queue);
    return entry.id;
  }, []);

  const syncQueue = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    const queue = getQueue();
    if (queue.length === 0) return;

    setIsSyncing(true);
    let successCount = 0;
    const failedEntries: QueuedEntry[] = [];

    for (const entry of queue) {
      try {
        // Use type assertion for dynamic table insertion
        const { error } = await supabase
          .from(entry.table)
          .insert(entry.data as never);

        if (error) {
          console.error(`Failed to sync entry to ${entry.table}:`, error);
          failedEntries.push(entry);
        } else {
          successCount++;
        }
      } catch (err) {
        console.error("Sync error:", err);
        failedEntries.push(entry);
      }
    }

    saveQueue(failedEntries);
    setIsSyncing(false);

    if (successCount > 0) {
      toast.success(`Synced ${successCount} offline ${successCount === 1 ? 'entry' : 'entries'}`);
    }

    if (failedEntries.length > 0) {
      toast.error(`Failed to sync ${failedEntries.length} ${failedEntries.length === 1 ? 'entry' : 'entries'}`);
    }
  }, [isOnline, isSyncing]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline) {
      syncQueue();
    }
  }, [isOnline, syncQueue]);

  const saveWithOfflineSupport = useCallback(
    async (table: TableName, data: Record<string, unknown>) => {
      if (isOnline) {
        // Try to save directly
        const { error } = await supabase
          .from(table)
          .insert(data as never);

        if (error) {
          // If online save fails, queue it
          console.error("Online save failed, queuing:", error);
          addToQueue(table, data);
          toast.info("Saved locally — will sync when possible");
          return { error: null, queued: true };
        }

        return { error: null, queued: false };
      } else {
        // Offline: queue the entry
        addToQueue(table, data);
        toast.info("Saved locally — will sync when online");
        return { error: null, queued: true };
      }
    },
    [isOnline, addToQueue]
  );

  return {
    isOnline,
    pendingCount,
    isSyncing,
    saveWithOfflineSupport,
    syncQueue,
  };
};

// NetworkMonitor — polls connectivity and auto-flushes the offline queue.
// Mount once at root layout level.

import { useEffect, useRef } from 'react';
import * as Network from 'expo-network';
import { flushOfflineQueue, getPendingCount } from '@/db/offlineQueue';
import { useOfflineStore } from '@/store/useOfflineStore';

const POLL_INTERVAL_MS = 10_000; // check every 10 s

export function useNetworkMonitor() {
  const { setIsOnline, setPendingCount, setIsSyncing, setLastSyncedAt, isOnline } = useOfflineStore();
  const prevOnline = useRef<boolean>(true);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;

    const check = async () => {
      const state = await Network.getNetworkStateAsync();
      const online = state.isConnected === true && state.isInternetReachable === true;
      setIsOnline(online);

      const count = await getPendingCount();
      setPendingCount(count);

      // Just came back online and have pending saves → flush
      if (online && !prevOnline.current && count > 0) {
        setIsSyncing(true);
        await flushOfflineQueue();
        const remaining = await getPendingCount();
        setPendingCount(remaining);
        setIsSyncing(false);
        setLastSyncedAt(new Date());
      }

      // Also flush if online and there are pending items (covers app resume)
      if (online && count > 0 && prevOnline.current) {
        setIsSyncing(true);
        await flushOfflineQueue();
        const remaining = await getPendingCount();
        setPendingCount(remaining);
        setIsSyncing(false);
        if (remaining === 0) setLastSyncedAt(new Date());
      }

      prevOnline.current = online;
    };

    check();
    timer = setInterval(check, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);
}

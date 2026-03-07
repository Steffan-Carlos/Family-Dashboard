import { useEffect, useState } from "react";
import styles from "./SyncIndicator.module.scss";

export function SyncIndicator() {
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/calendar/sync/status");
      const json = await res.json();
      setSyncing(json.syncInProgress);
      const latest = (json.data || [])
        .filter((c: any) => c.lastSyncAt)
        .sort((a: any, b: any) => b.lastSyncAt.localeCompare(a.lastSyncAt))[0];
      setLastSync(latest?.lastSyncAt || null);
    } catch {
      // Silently fail
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    navigator.vibrate?.(10);
    setSyncing(true);
    try {
      await fetch("/api/calendar/sync", { method: "POST" });
      setTimeout(fetchStatus, 3000);
    } catch {
      // Silently fail
    }
  };

  const formatTime = (iso: string | null) => {
    if (!iso) return "";
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <button
      className={styles.indicator}
      onClick={handleSync}
      disabled={syncing}
      title={lastSync ? `Last synced: ${formatTime(lastSync)}` : "Tap to sync"}
    >
      <span className={styles.dot} data-syncing={syncing} />
      <span className={styles.label}>
        {syncing ? "Syncing" : lastSync ? formatTime(lastSync) : "Sync"}
      </span>
    </button>
  );
}

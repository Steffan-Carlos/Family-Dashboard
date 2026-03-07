import { useEffect, useState } from "react";
import styles from "./SyncStatus.module.scss";

interface SyncInfo {
  id: number;
  name: string;
  accountEmail: string;
  lastSyncAt: string | null;
  lastSyncStatus: string;
  lastSyncError: string | null;
}

export function SyncStatus() {
  const [syncData, setSyncData] = useState<SyncInfo[]>([]);
  const [syncing, setSyncing] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/calendar/sync/status");
      const json = await res.json();
      setSyncData(json.data || []);
      setSyncing(json.syncInProgress || false);
    } catch (err) {
      console.error("Failed to fetch sync status:", err);
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
    } catch (err) {
      console.error("Failed to trigger sync:", err);
    }
  };

  const formatTime = (iso: string | null) => {
    if (!iso) return "Never";
    const date = new Date(iso);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <h3 className={styles.sectionTitle}>Sync Status</h3>
        <button className={styles.syncButton} onClick={handleSync} disabled={syncing}>
          {syncing ? "Syncing..." : "Sync Now"}
        </button>
      </div>

      {syncData.length === 0 ? (
        <p className={styles.empty}>No calendars to sync</p>
      ) : (
        <ul className={styles.list}>
          {syncData.map((cal) => (
            <li key={cal.id} className={styles.item}>
              <div className={styles.calInfo}>
                <span className={styles.calName}>{cal.name}</span>
                <span className={styles.calAccount}>{cal.accountEmail}</span>
              </div>
              <div className={styles.statusInfo}>
                <span
                  className={styles.statusBadge}
                  data-status={cal.lastSyncStatus}
                >
                  {cal.lastSyncStatus}
                </span>
                <span className={styles.lastSync}>
                  {formatTime(cal.lastSyncAt)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

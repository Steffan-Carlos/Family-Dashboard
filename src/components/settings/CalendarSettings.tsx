import { useEffect, useState } from "react";
import { AccountList } from "./AccountList";
import { CalendarList } from "./CalendarList";
import { SyncStatus } from "./SyncStatus";
import styles from "./CalendarSettings.module.scss";

interface CalendarAccount {
  id: number;
  provider: string;
  email: string;
  displayName: string;
  calendars: CalendarInfo[];
}

interface CalendarInfo {
  id: number;
  name: string;
  color: string;
  isVisible: boolean;
  isReadOnly: boolean;
  lastSyncAt: string | null;
  lastSyncStatus: string;
  lastSyncError: string | null;
}

export function CalendarSettings() {
  const [accounts, setAccounts] = useState<CalendarAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/calendar/accounts");
      const json = await res.json();
      setAccounts(json.data || []);
    } catch (err) {
      console.error("Failed to fetch accounts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleAddAccount = async (provider: string) => {
    try {
      const res = await fetch(`/api/calendar/auth/${provider}`);
      const json = await res.json();
      window.location.href = json.data.url;
    } catch (err) {
      console.error("Failed to start OAuth:", err);
    }
  };

  const handleDisconnect = async (accountId: number) => {
    try {
      await fetch(`/api/calendar/accounts/${accountId}`, { method: "DELETE" });
      navigator.vibrate?.([50, 30, 50]);
      fetchAccounts();
    } catch (err) {
      console.error("Failed to disconnect:", err);
    }
  };

  const handleToggleCalendar = async (calendarId: number, isVisible: boolean) => {
    try {
      await fetch(`/api/calendar/calendars/${calendarId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible }),
      });
      fetchAccounts();
    } catch (err) {
      console.error("Failed to toggle calendar:", err);
    }
  };

  const handleColorChange = async (calendarId: number, color: string) => {
    try {
      await fetch(`/api/calendar/calendars/${calendarId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ color }),
      });
      fetchAccounts();
    } catch (err) {
      console.error("Failed to change color:", err);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading calendar settings...</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Calendar Settings</h2>

      <AccountList
        accounts={accounts}
        onAddAccount={handleAddAccount}
        onDisconnect={handleDisconnect}
      />

      {accounts.length > 0 && (
        <CalendarList
          accounts={accounts}
          onToggle={handleToggleCalendar}
          onColorChange={handleColorChange}
        />
      )}

      <SyncStatus />
    </div>
  );
}

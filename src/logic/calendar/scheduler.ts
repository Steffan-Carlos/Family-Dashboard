import { syncAllCalendars } from "./sync-engine.js";

let syncInterval: ReturnType<typeof setInterval> | null = null;
let syncInProgress = false;
let lastSyncTrigger = 0;

const DEBOUNCE_MS = 5000;

export function startSyncScheduler(intervalMinutes?: number): void {
  const minutes = intervalMinutes || parseInt(process.env.SYNC_INTERVAL_MINUTES || "15", 10);
  const intervalMs = minutes * 60 * 1000;

  if (syncInterval) {
    clearInterval(syncInterval);
  }

  console.log(`Sync scheduler started: every ${minutes} minutes`);

  // Run initial sync after a brief delay to let the server fully start
  setTimeout(() => {
    runSync().catch(console.error);
  }, 5000);

  syncInterval = setInterval(() => {
    runSync().catch(console.error);
  }, intervalMs);
}

export function stopSyncScheduler(): void {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
    console.log("Sync scheduler stopped");
  }
}

async function runSync(): Promise<void> {
  if (syncInProgress) {
    console.log("Sync already in progress, skipping");
    return;
  }

  syncInProgress = true;
  try {
    console.log("Starting calendar sync...");
    await syncAllCalendars();
    console.log("Calendar sync complete");
  } catch (err) {
    console.error("Calendar sync failed:", err);
  } finally {
    syncInProgress = false;
  }
}

export async function triggerManualSync(): Promise<{ started: boolean }> {
  const now = Date.now();
  if (now - lastSyncTrigger < DEBOUNCE_MS) {
    return { started: false };
  }
  lastSyncTrigger = now;

  // Run async — don't block the request
  runSync().catch(console.error);
  return { started: true };
}

export function isSyncInProgress(): boolean {
  return syncInProgress;
}

import type { CalendarAccount } from "../db/entities/CalendarAccount.js";

export type ProviderType = "google" | "microsoft";

export interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string; // ISO 8601
}

export interface ProviderCalendar {
  id: string; // provider's calendar ID
  name: string;
  color: string;
  isReadOnly: boolean;
}

export interface ProviderEvent {
  id: string; // provider's event ID
  title: string;
  description: string | null;
  location: string | null;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  allDay: boolean;
  recurrenceRule: string | null;
  isRecurringInstance: boolean;
  recurringEventId: string | null;
  status: "confirmed" | "tentative" | "cancelled";
  organizer: string | null;
  attendees: string[];
  lastModified: string | null; // ISO 8601
}

export interface EventInput {
  title: string;
  description?: string;
  location?: string;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  allDay?: boolean;
  recurrenceRule?: string;
}

export interface SyncOptions {
  syncToken?: string;
  timeMin?: string; // ISO 8601
  timeMax?: string; // ISO 8601
}

export interface SyncResult {
  events: ProviderEvent[];
  nextSyncToken: string;
  deleted: string[]; // provider event IDs that were removed
}

export interface CalendarProvider {
  getAuthUrl(state: string): string;
  handleAuthCallback(code: string): Promise<OAuthTokens>;
  refreshAccessToken(account: CalendarAccount): Promise<OAuthTokens>;
  listCalendars(account: CalendarAccount): Promise<ProviderCalendar[]>;
  listEvents(
    account: CalendarAccount,
    calendarId: string,
    opts: SyncOptions,
  ): Promise<SyncResult>;
  createEvent(
    account: CalendarAccount,
    calendarId: string,
    event: EventInput,
  ): Promise<ProviderEvent>;
  updateEvent(
    account: CalendarAccount,
    calendarId: string,
    eventId: string,
    event: EventInput,
  ): Promise<ProviderEvent>;
  deleteEvent(
    account: CalendarAccount,
    calendarId: string,
    eventId: string,
  ): Promise<void>;
}

import { google } from "googleapis";
import type { CalendarAccount } from "../../db/entities/CalendarAccount.js";
import type {
  CalendarProvider,
  OAuthTokens,
  ProviderCalendar,
  ProviderEvent,
  EventInput,
  SyncOptions,
  SyncResult,
} from "../../types/calendar.js";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
];

function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );
}

function getAuthenticatedClient(account: CalendarAccount) {
  const client = createOAuth2Client();
  client.setCredentials({
    access_token: account.accessToken,
    refresh_token: account.refreshToken,
  });
  return client;
}

function mapGoogleEvent(event: any): ProviderEvent {
  const start = event.start?.dateTime || event.start?.date;
  const end = event.end?.dateTime || event.end?.date;
  const allDay = !event.start?.dateTime;

  return {
    id: event.id,
    title: event.summary || "(No title)",
    description: event.description || null,
    location: event.location || null,
    startTime: allDay ? `${start}T00:00:00Z` : start,
    endTime: allDay ? `${end}T00:00:00Z` : end,
    allDay,
    recurrenceRule: event.recurrence?.[0] || null,
    isRecurringInstance: !!event.recurringEventId,
    recurringEventId: event.recurringEventId || null,
    status: event.status || "confirmed",
    organizer: event.organizer?.email || null,
    attendees: (event.attendees || []).map((a: any) => a.email),
    lastModified: event.updated || null,
  };
}

export const googleProvider: CalendarProvider = {
  getAuthUrl(state: string): string {
    const client = createOAuth2Client();
    return client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: SCOPES,
      state,
    });
  },

  async handleAuthCallback(code: string): Promise<OAuthTokens> {
    const client = createOAuth2Client();
    const { tokens } = await client.getToken(code);
    return {
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token!,
      expiresAt: tokens.expiry_date
        ? new Date(tokens.expiry_date).toISOString()
        : new Date(Date.now() + 3600 * 1000).toISOString(),
    };
  },

  async refreshAccessToken(account: CalendarAccount): Promise<OAuthTokens> {
    const client = getAuthenticatedClient(account);
    const { credentials } = await client.refreshAccessToken();
    return {
      accessToken: credentials.access_token!,
      refreshToken: credentials.refresh_token || account.refreshToken,
      expiresAt: credentials.expiry_date
        ? new Date(credentials.expiry_date).toISOString()
        : new Date(Date.now() + 3600 * 1000).toISOString(),
    };
  },

  async listCalendars(account: CalendarAccount): Promise<ProviderCalendar[]> {
    const client = getAuthenticatedClient(account);
    const calendarApi = google.calendar({ version: "v3", auth: client });
    const res = await calendarApi.calendarList.list();
    return (res.data.items || []).map((cal) => ({
      id: cal.id!,
      name: cal.summary || cal.id!,
      color: cal.backgroundColor || "#7BB8A4",
      isReadOnly: cal.accessRole === "reader" || cal.accessRole === "freeBusyReader",
    }));
  },

  async listEvents(
    account: CalendarAccount,
    calendarId: string,
    opts: SyncOptions,
  ): Promise<SyncResult> {
    const client = getAuthenticatedClient(account);
    const calendarApi = google.calendar({ version: "v3", auth: client });

    const params: any = {
      calendarId,
      maxResults: 2500,
      singleEvents: true,
      orderBy: "startTime",
    };

    if (opts.syncToken) {
      params.syncToken = opts.syncToken;
    } else {
      if (opts.timeMin) params.timeMin = opts.timeMin;
      if (opts.timeMax) params.timeMax = opts.timeMax;
      if (!opts.timeMin) {
        // Default: sync 3 months back
        params.timeMin = new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString();
      }
    }

    const events: ProviderEvent[] = [];
    const deleted: string[] = [];
    let nextSyncToken = "";
    let pageToken: string | undefined;

    do {
      if (pageToken) params.pageToken = pageToken;

      try {
        const res = await calendarApi.events.list(params);
        for (const item of res.data.items || []) {
          if (item.status === "cancelled") {
            deleted.push(item.id!);
          } else {
            events.push(mapGoogleEvent(item));
          }
        }
        pageToken = res.data.nextPageToken || undefined;
        if (res.data.nextSyncToken) {
          nextSyncToken = res.data.nextSyncToken;
        }
      } catch (err: any) {
        if (err.code === 410) {
          // syncToken expired — do a full sync
          return this.listEvents(account, calendarId, {
            timeMin: opts.timeMin,
            timeMax: opts.timeMax,
          });
        }
        throw err;
      }
    } while (pageToken);

    return { events, nextSyncToken, deleted };
  },

  async createEvent(
    account: CalendarAccount,
    calendarId: string,
    event: EventInput,
  ): Promise<ProviderEvent> {
    const client = getAuthenticatedClient(account);
    const calendarApi = google.calendar({ version: "v3", auth: client });

    const body: any = {
      summary: event.title,
      description: event.description,
      location: event.location,
    };

    if (event.allDay) {
      body.start = { date: event.startTime.split("T")[0] };
      body.end = { date: event.endTime.split("T")[0] };
    } else {
      body.start = { dateTime: event.startTime };
      body.end = { dateTime: event.endTime };
    }

    if (event.recurrenceRule) {
      body.recurrence = [event.recurrenceRule];
    }

    const res = await calendarApi.events.insert({ calendarId, requestBody: body });
    return mapGoogleEvent(res.data);
  },

  async updateEvent(
    account: CalendarAccount,
    calendarId: string,
    eventId: string,
    event: EventInput,
  ): Promise<ProviderEvent> {
    const client = getAuthenticatedClient(account);
    const calendarApi = google.calendar({ version: "v3", auth: client });

    const body: any = {
      summary: event.title,
      description: event.description,
      location: event.location,
    };

    if (event.allDay) {
      body.start = { date: event.startTime.split("T")[0] };
      body.end = { date: event.endTime.split("T")[0] };
    } else {
      body.start = { dateTime: event.startTime };
      body.end = { dateTime: event.endTime };
    }

    if (event.recurrenceRule) {
      body.recurrence = [event.recurrenceRule];
    }

    const res = await calendarApi.events.patch({
      calendarId,
      eventId,
      requestBody: body,
    });
    return mapGoogleEvent(res.data);
  },

  async deleteEvent(
    account: CalendarAccount,
    calendarId: string,
    eventId: string,
  ): Promise<void> {
    const client = getAuthenticatedClient(account);
    const calendarApi = google.calendar({ version: "v3", auth: client });
    await calendarApi.events.delete({ calendarId, eventId });
  },
};

import { ConfidentialClientApplication } from "@azure/msal-node";
import { Client } from "@microsoft/microsoft-graph-client";
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

const SCOPES = ["Calendars.ReadWrite", "offline_access", "User.Read"];

function getMsalApp() {
  return new ConfidentialClientApplication({
    auth: {
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      authority: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID || "common"}`,
    },
  });
}

function getGraphClient(accessToken: string) {
  return Client.init({
    authProvider: (done) => done(null, accessToken),
  });
}

function mapGraphEvent(event: any): ProviderEvent {
  const allDay = event.isAllDay || false;
  const start = allDay
    ? `${event.start.dateTime.split("T")[0]}T00:00:00Z`
    : new Date(event.start.dateTime + "Z").toISOString();
  const end = allDay
    ? `${event.end.dateTime.split("T")[0]}T00:00:00Z`
    : new Date(event.end.dateTime + "Z").toISOString();

  return {
    id: event.id,
    title: event.subject || "(No title)",
    description: event.body?.content || null,
    location: event.location?.displayName || null,
    startTime: start,
    endTime: end,
    allDay,
    recurrenceRule: event.recurrence
      ? JSON.stringify(event.recurrence)
      : null,
    isRecurringInstance: event.type === "occurrence" || event.type === "exception",
    recurringEventId: event.seriesMasterId || null,
    status: event.isCancelled ? "cancelled" : "confirmed",
    organizer: event.organizer?.emailAddress?.address || null,
    attendees: (event.attendees || []).map(
      (a: any) => a.emailAddress?.address,
    ).filter(Boolean),
    lastModified: event.lastModifiedDateTime || null,
  };
}

function buildGraphEventBody(event: EventInput) {
  const body: any = {
    subject: event.title,
    body: event.description
      ? { contentType: "text", content: event.description }
      : undefined,
    location: event.location ? { displayName: event.location } : undefined,
    isAllDay: event.allDay || false,
  };

  if (event.allDay) {
    body.start = {
      dateTime: event.startTime.split("T")[0] + "T00:00:00",
      timeZone: "UTC",
    };
    body.end = {
      dateTime: event.endTime.split("T")[0] + "T00:00:00",
      timeZone: "UTC",
    };
  } else {
    body.start = { dateTime: event.startTime, timeZone: "UTC" };
    body.end = { dateTime: event.endTime, timeZone: "UTC" };
  }

  return body;
}

export const microsoftProvider: CalendarProvider = {
  getAuthUrl(state: string): string {
    const clientId = process.env.MICROSOFT_CLIENT_ID!;
    const redirectUri = encodeURIComponent(process.env.MICROSOFT_REDIRECT_URI!);
    const scope = encodeURIComponent(SCOPES.join(" "));
    const tenant = process.env.MICROSOFT_TENANT_ID || "common";
    return (
      `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize` +
      `?client_id=${clientId}` +
      `&response_type=code` +
      `&redirect_uri=${redirectUri}` +
      `&scope=${scope}` +
      `&state=${state}` +
      `&response_mode=query`
    );
  },

  async handleAuthCallback(code: string): Promise<OAuthTokens> {
    const msalApp = getMsalApp();
    const result = await msalApp.acquireTokenByCode({
      code,
      scopes: SCOPES,
      redirectUri: process.env.MICROSOFT_REDIRECT_URI!,
    });

    // MSAL doesn't directly expose refresh tokens through this flow.
    // We use the token cache to manage refresh silently.
    const expiresAt = result.expiresOn
      ? result.expiresOn.toISOString()
      : new Date(Date.now() + 3600 * 1000).toISOString();

    return {
      accessToken: result.accessToken,
      refreshToken: msalApp.getTokenCache().serialize(),
      expiresAt,
    };
  },

  async refreshAccessToken(account: CalendarAccount): Promise<OAuthTokens> {
    const msalApp = getMsalApp();

    // Deserialize the cached tokens
    msalApp.getTokenCache().deserialize(account.refreshToken);

    const accounts = await msalApp.getTokenCache().getAllAccounts();
    if (accounts.length === 0) {
      throw new Error("No cached Microsoft account found. Re-authentication required.");
    }

    const result = await msalApp.acquireTokenSilent({
      account: accounts[0],
      scopes: SCOPES,
    });

    return {
      accessToken: result.accessToken,
      refreshToken: msalApp.getTokenCache().serialize(),
      expiresAt: result.expiresOn
        ? result.expiresOn.toISOString()
        : new Date(Date.now() + 3600 * 1000).toISOString(),
    };
  },

  async listCalendars(account: CalendarAccount): Promise<ProviderCalendar[]> {
    const client = getGraphClient(account.accessToken);
    const res = await client.api("/me/calendars").get();
    return (res.value || []).map((cal: any) => ({
      id: cal.id,
      name: cal.name,
      color: mapGraphColor(cal.color),
      isReadOnly: !cal.canEdit,
    }));
  },

  async listEvents(
    account: CalendarAccount,
    calendarId: string,
    opts: SyncOptions,
  ): Promise<SyncResult> {
    const client = getGraphClient(account.accessToken);
    const events: ProviderEvent[] = [];
    const deleted: string[] = [];

    if (opts.syncToken) {
      // Use delta query for incremental sync
      let deltaLink: string | null = opts.syncToken;

      while (deltaLink) {
        try {
          const res = await client.api(deltaLink).get();
          for (const item of res.value || []) {
            if (item["@removed"]) {
              deleted.push(item.id);
            } else {
              events.push(mapGraphEvent(item));
            }
          }
          deltaLink = res["@odata.nextLink"] || null;
          if (res["@odata.deltaLink"]) {
            return {
              events,
              nextSyncToken: res["@odata.deltaLink"],
              deleted,
            };
          }
        } catch (err: any) {
          if (err.statusCode === 410) {
            // Delta token expired — full sync
            return this.listEvents(account, calendarId, {
              timeMin: opts.timeMin,
              timeMax: opts.timeMax,
            });
          }
          throw err;
        }
      }

      return { events, nextSyncToken: "", deleted };
    }

    // Initial full sync via delta
    const timeMin =
      opts.timeMin || new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString();
    let url =
      `/me/calendars/${calendarId}/calendarView/delta` +
      `?startDateTime=${timeMin}` +
      `&endDateTime=${opts.timeMax || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString()}`;
    let nextSyncToken = "";

    while (url) {
      const res = await client.api(url).get();
      for (const item of res.value || []) {
        events.push(mapGraphEvent(item));
      }
      url = res["@odata.nextLink"] || "";
      if (res["@odata.deltaLink"]) {
        nextSyncToken = res["@odata.deltaLink"];
      }
    }

    return { events, nextSyncToken, deleted };
  },

  async createEvent(
    account: CalendarAccount,
    calendarId: string,
    event: EventInput,
  ): Promise<ProviderEvent> {
    const client = getGraphClient(account.accessToken);
    const body = buildGraphEventBody(event);
    const res = await client
      .api(`/me/calendars/${calendarId}/events`)
      .post(body);
    return mapGraphEvent(res);
  },

  async updateEvent(
    account: CalendarAccount,
    calendarId: string,
    eventId: string,
    event: EventInput,
  ): Promise<ProviderEvent> {
    const client = getGraphClient(account.accessToken);
    const body = buildGraphEventBody(event);
    const res = await client.api(`/me/events/${eventId}`).patch(body);
    return mapGraphEvent(res);
  },

  async deleteEvent(
    _account: CalendarAccount,
    _calendarId: string,
    eventId: string,
  ): Promise<void> {
    const client = getGraphClient(_account.accessToken);
    await client.api(`/me/events/${eventId}`).delete();
  },
};

// Map Microsoft's named colors to hex
function mapGraphColor(color: string | undefined): string {
  const colorMap: Record<string, string> = {
    auto: "#7BB8A4",
    lightBlue: "#87CEEB",
    lightGreen: "#A8CFA0",
    lightOrange: "#F5C97A",
    lightGray: "#C0C0C0",
    lightYellow: "#FFEAA7",
    lightTeal: "#7BB8A4",
    lightPink: "#F0A8A0",
    lightBrown: "#C4A882",
    lightRed: "#E88080",
    maxColor: "#B5A8D5",
  };
  return colorMap[color || "auto"] || "#7BB8A4";
}

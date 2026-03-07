import { Calendar } from "../../db/entities/Calendar.js";
import { CalendarAccount } from "../../db/entities/CalendarAccount.js";
import { CalendarEvent } from "../../db/entities/CalendarEvent.js";
import { getProvider } from "./providers.js";
import type { ProviderEvent } from "../../types/calendar.js";

async function ensureValidToken(account: CalendarAccount): Promise<CalendarAccount> {
  if (account.tokenExpiry && new Date(account.tokenExpiry) > new Date()) {
    return account;
  }

  const provider = getProvider(account.provider);
  const tokens = await provider.refreshAccessToken(account);
  account.accessToken = tokens.accessToken;
  account.refreshToken = tokens.refreshToken;
  account.tokenExpiry = tokens.expiresAt;
  await account.save();
  return account;
}

function upsertEventFromProvider(
  calendarId: number,
  providerEvent: ProviderEvent,
): CalendarEvent {
  const event = new CalendarEvent();
  event.calendarId = calendarId;
  event.providerEventId = providerEvent.id;
  event.title = providerEvent.title;
  event.description = providerEvent.description;
  event.location = providerEvent.location;
  event.startTime = providerEvent.startTime;
  event.endTime = providerEvent.endTime;
  event.allDay = providerEvent.allDay;
  event.recurrenceRule = providerEvent.recurrenceRule;
  event.isRecurringInstance = providerEvent.isRecurringInstance;
  event.recurringEventProviderId = providerEvent.recurringEventId;
  event.status = providerEvent.status;
  event.organizer = providerEvent.organizer;
  event.attendeesJson = providerEvent.attendees.length
    ? JSON.stringify(providerEvent.attendees)
    : null;
  event.locallyCreated = false;
  event.lastModifiedAt = providerEvent.lastModified;
  return event;
}

export async function syncCalendar(calendar: Calendar): Promise<void> {
  const account = await CalendarAccount.findOneByOrFail({ id: calendar.accountId });
  const freshAccount = await ensureValidToken(account);
  const provider = getProvider(freshAccount.provider);

  try {
    // Pull changes from provider
    const result = await provider.listEvents(
      freshAccount,
      calendar.providerCalendarId,
      {
        syncToken: calendar.syncToken || undefined,
      },
    );

    // Remove deleted events
    if (result.deleted.length > 0) {
      for (const deletedId of result.deleted) {
        const existing = await CalendarEvent.findOneBy({
          providerEventId: deletedId,
          calendarId: calendar.id,
        });
        if (existing) await existing.remove();
      }
    }

    // Upsert events
    for (const providerEvent of result.events) {
      const existing = await CalendarEvent.findOneBy({
        providerEventId: providerEvent.id,
        calendarId: calendar.id,
      });

      if (existing) {
        // Update existing event (provider wins)
        existing.title = providerEvent.title;
        existing.description = providerEvent.description;
        existing.location = providerEvent.location;
        existing.startTime = providerEvent.startTime;
        existing.endTime = providerEvent.endTime;
        existing.allDay = providerEvent.allDay;
        existing.status = providerEvent.status;
        existing.lastModifiedAt = providerEvent.lastModified;
        existing.recurrenceRule = providerEvent.recurrenceRule;
        existing.organizer = providerEvent.organizer;
        existing.attendeesJson = providerEvent.attendees.length
          ? JSON.stringify(providerEvent.attendees)
          : null;
        await existing.save();
      } else {
        const newEvent = upsertEventFromProvider(calendar.id, providerEvent);
        await newEvent.save();
      }
    }

    // Push locally created events that haven't been pushed yet
    const localEvents = await CalendarEvent.findBy({
      calendarId: calendar.id,
      locallyCreated: true,
      providerEventId: undefined as any, // null check
    });

    for (const localEvent of localEvents) {
      if (localEvent.providerEventId) continue; // already pushed

      try {
        const pushed = await provider.createEvent(
          freshAccount,
          calendar.providerCalendarId,
          {
            title: localEvent.title,
            description: localEvent.description || undefined,
            location: localEvent.location || undefined,
            startTime: localEvent.startTime,
            endTime: localEvent.endTime,
            allDay: localEvent.allDay,
            recurrenceRule: localEvent.recurrenceRule || undefined,
          },
        );
        localEvent.providerEventId = pushed.id;
        localEvent.lastModifiedAt = pushed.lastModified;
        await localEvent.save();
      } catch (err) {
        console.error(`Failed to push local event ${localEvent.id}:`, err);
      }
    }

    // Update sync state
    calendar.syncToken = result.nextSyncToken || calendar.syncToken;
    calendar.lastSyncAt = new Date().toISOString();
    calendar.lastSyncStatus = "ok";
    calendar.lastSyncError = null;
    await calendar.save();
  } catch (err: any) {
    calendar.lastSyncAt = new Date().toISOString();
    calendar.lastSyncStatus = "error";
    calendar.lastSyncError = err.message || String(err);
    await calendar.save();
    console.error(`Sync failed for calendar ${calendar.id} (${calendar.name}):`, err.message);
  }
}

export async function syncAllCalendars(): Promise<void> {
  const calendars = await Calendar.findBy({ isVisible: true });
  for (const calendar of calendars) {
    await syncCalendar(calendar);
  }
}

export async function pushEventToProvider(event: CalendarEvent): Promise<void> {
  const calendar = await Calendar.findOneOrFail({
    where: { id: event.calendarId },
    relations: { account: true },
  });
  const account = await ensureValidToken(calendar.account);
  const provider = getProvider(account.provider);

  const pushed = await provider.createEvent(
    account,
    calendar.providerCalendarId,
    {
      title: event.title,
      description: event.description || undefined,
      location: event.location || undefined,
      startTime: event.startTime,
      endTime: event.endTime,
      allDay: event.allDay,
      recurrenceRule: event.recurrenceRule || undefined,
    },
  );

  event.providerEventId = pushed.id;
  event.lastModifiedAt = pushed.lastModified;
  await event.save();
}

export async function updateEventOnProvider(event: CalendarEvent): Promise<void> {
  if (!event.providerEventId) return;

  const calendar = await Calendar.findOneOrFail({
    where: { id: event.calendarId },
    relations: { account: true },
  });
  const account = await ensureValidToken(calendar.account);
  const provider = getProvider(account.provider);

  const updated = await provider.updateEvent(
    account,
    calendar.providerCalendarId,
    event.providerEventId,
    {
      title: event.title,
      description: event.description || undefined,
      location: event.location || undefined,
      startTime: event.startTime,
      endTime: event.endTime,
      allDay: event.allDay,
    },
  );

  event.lastModifiedAt = updated.lastModified;
  await event.save();
}

export async function deleteEventOnProvider(event: CalendarEvent): Promise<void> {
  if (!event.providerEventId) return;

  const calendar = await Calendar.findOneOrFail({
    where: { id: event.calendarId },
    relations: { account: true },
  });
  const account = await ensureValidToken(calendar.account);
  const provider = getProvider(account.provider);

  await provider.deleteEvent(
    account,
    calendar.providerCalendarId,
    event.providerEventId,
  );
}

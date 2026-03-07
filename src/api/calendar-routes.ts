import { Router } from "express";
import { CalendarAccount } from "../db/entities/CalendarAccount.js";
import { Calendar } from "../db/entities/Calendar.js";
import { CalendarEvent } from "../db/entities/CalendarEvent.js";
import { getProvider } from "../logic/calendar/providers.js";
import {
  pushEventToProvider,
  updateEventOnProvider,
  deleteEventOnProvider,
} from "../logic/calendar/sync-engine.js";
import { triggerManualSync, isSyncInProgress } from "../logic/calendar/scheduler.js";
import { Between, In } from "typeorm";

export const calendarRouter = Router();

// --- OAuth ---

calendarRouter.get("/auth/:provider", (req, res) => {
  try {
    const provider = getProvider(req.params.provider);
    const state = req.params.provider; // simple state for now
    const url = provider.getAuthUrl(state);
    res.json({ data: { url } });
  } catch (err: any) {
    res.status(400).json({ error: err.message, code: "INVALID_PROVIDER" });
  }
});

calendarRouter.get("/callback/:provider", async (req, res) => {
  const { code, state } = req.query;
  if (!code || typeof code !== "string") {
    res.status(400).json({ error: "Missing authorization code", code: "MISSING_CODE" });
    return;
  }

  try {
    const providerName = req.params.provider;
    const provider = getProvider(providerName);
    const tokens = await provider.handleAuthCallback(code);

    // Get user info to identify the account
    const tempAccount = new CalendarAccount();
    tempAccount.accessToken = tokens.accessToken;
    tempAccount.refreshToken = tokens.refreshToken;
    tempAccount.provider = providerName;

    // Fetch calendars to identify user email
    const calendars = await provider.listCalendars(tempAccount);

    // Determine email — for Google we can try userinfo, for now use state or a generic name
    let email = `${providerName}-account`;
    let displayName = `${providerName} Account`;

    if (providerName === "google") {
      try {
        const { google: googleapis } = await import("googleapis");
        const oauth2Client = new googleapis.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: tokens.accessToken });
        const oauth2 = googleapis.oauth2({ version: "v2", auth: oauth2Client });
        const userInfo = await oauth2.userinfo.get();
        email = userInfo.data.email || email;
        displayName = userInfo.data.name || email;
      } catch {
        // Fall through with generic name
      }
    } else if (providerName === "microsoft") {
      try {
        const { Client } = await import("@microsoft/microsoft-graph-client");
        const client = Client.init({
          authProvider: (done) => done(null, tokens.accessToken),
        });
        const me = await client.api("/me").get();
        email = me.mail || me.userPrincipalName || email;
        displayName = me.displayName || email;
      } catch {
        // Fall through with generic name
      }
    }

    // Check if account already exists
    let account = await CalendarAccount.findOneBy({ provider: providerName, email });
    if (account) {
      account.accessToken = tokens.accessToken;
      account.refreshToken = tokens.refreshToken;
      account.tokenExpiry = tokens.expiresAt;
    } else {
      account = new CalendarAccount();
      account.provider = providerName;
      account.email = email;
      account.displayName = displayName;
      account.accessToken = tokens.accessToken;
      account.refreshToken = tokens.refreshToken;
      account.tokenExpiry = tokens.expiresAt;
    }
    await account.save();

    // Sync calendar list
    for (const provCal of calendars) {
      let cal = await Calendar.findOneBy({
        accountId: account.id,
        providerCalendarId: provCal.id,
      });
      if (!cal) {
        cal = new Calendar();
        cal.accountId = account.id;
        cal.providerCalendarId = provCal.id;
        cal.name = provCal.name;
        cal.color = provCal.color;
        cal.isReadOnly = provCal.isReadOnly;
        cal.isVisible = true;
        cal.lastSyncStatus = "pending";
        await cal.save();
      }
    }

    // Redirect back to settings page
    res.redirect("/#/settings/calendars?connected=" + providerName);
  } catch (err: any) {
    console.error("OAuth callback failed:", err);
    res.redirect("/#/settings/calendars?error=" + encodeURIComponent(err.message));
  }
});

// --- Accounts ---

calendarRouter.get("/accounts", async (_req, res) => {
  const accounts = await CalendarAccount.find({
    relations: { calendars: true },
  });

  // Strip tokens from response
  const data = accounts.map((a) => ({
    id: a.id,
    provider: a.provider,
    email: a.email,
    displayName: a.displayName,
    calendars: a.calendars.map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color,
      isVisible: c.isVisible,
      isReadOnly: c.isReadOnly,
      lastSyncAt: c.lastSyncAt,
      lastSyncStatus: c.lastSyncStatus,
      lastSyncError: c.lastSyncError,
    })),
  }));

  res.json({ data });
});

calendarRouter.delete("/accounts/:id", async (req, res) => {
  const account = await CalendarAccount.findOneBy({ id: parseInt(req.params.id) });
  if (!account) {
    res.status(404).json({ error: "Account not found", code: "NOT_FOUND" });
    return;
  }

  // Cascade deletes calendars and events
  await Calendar.delete({ accountId: account.id });
  await account.remove();
  res.json({ data: { deleted: true } });
});

// --- Calendars ---

calendarRouter.get("/calendars", async (_req, res) => {
  const calendars = await Calendar.find({
    relations: { account: true },
  });

  const data = calendars.map((c) => ({
    id: c.id,
    name: c.name,
    color: c.color,
    isVisible: c.isVisible,
    isReadOnly: c.isReadOnly,
    lastSyncAt: c.lastSyncAt,
    lastSyncStatus: c.lastSyncStatus,
    accountId: c.accountId,
    accountEmail: c.account?.email,
    accountProvider: c.account?.provider,
  }));

  res.json({ data });
});

calendarRouter.patch("/calendars/:id", async (req, res) => {
  const calendar = await Calendar.findOneBy({ id: parseInt(req.params.id) });
  if (!calendar) {
    res.status(404).json({ error: "Calendar not found", code: "NOT_FOUND" });
    return;
  }

  if (req.body.isVisible !== undefined) calendar.isVisible = req.body.isVisible;
  if (req.body.color) calendar.color = req.body.color;

  await calendar.save();
  res.json({ data: calendar });
});

// --- Events ---

calendarRouter.get("/events", async (req, res) => {
  const { start, end, calendarIds } = req.query;

  if (!start || !end) {
    res.status(400).json({ error: "start and end query params required", code: "MISSING_PARAMS" });
    return;
  }

  const where: any = {
    startTime: Between(start as string, end as string),
    status: "confirmed",
  };

  if (calendarIds && typeof calendarIds === "string") {
    where.calendarId = In(calendarIds.split(",").map(Number));
  } else {
    // Only show events from visible calendars
    const visibleCalendars = await Calendar.findBy({ isVisible: true });
    if (visibleCalendars.length === 0) {
      res.json({ data: [], total: 0 });
      return;
    }
    where.calendarId = In(visibleCalendars.map((c) => c.id));
  }

  const events = await CalendarEvent.find({
    where,
    order: { startTime: "ASC" },
    relations: { calendar: true },
  });

  const data = events.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    location: e.location,
    startTime: e.startTime,
    endTime: e.endTime,
    allDay: e.allDay,
    status: e.status,
    calendarId: e.calendarId,
    calendarName: e.calendar?.name,
    calendarColor: e.calendar?.color,
    recurrenceRule: e.recurrenceRule,
    organizer: e.organizer,
  }));

  res.json({ data, total: data.length });
});

calendarRouter.post("/events", async (req, res) => {
  const { calendarId, title, description, location, startTime, endTime, allDay } = req.body;

  if (!calendarId || !title || !startTime || !endTime) {
    res.status(400).json({
      error: "calendarId, title, startTime, endTime are required",
      code: "MISSING_FIELDS",
    });
    return;
  }

  const calendar = await Calendar.findOneBy({ id: calendarId });
  if (!calendar) {
    res.status(404).json({ error: "Calendar not found", code: "NOT_FOUND" });
    return;
  }

  if (calendar.isReadOnly) {
    res.status(403).json({ error: "Calendar is read-only", code: "READ_ONLY" });
    return;
  }

  const event = new CalendarEvent();
  event.calendarId = calendarId;
  event.title = title;
  event.description = description || null;
  event.location = location || null;
  event.startTime = startTime;
  event.endTime = endTime;
  event.allDay = allDay || false;
  event.locallyCreated = true;
  event.status = "confirmed";
  await event.save();

  // Push to provider async
  pushEventToProvider(event).catch((err) => {
    console.error("Failed to push event to provider:", err);
  });

  res.status(201).json({ data: event });
});

calendarRouter.put("/events/:id", async (req, res) => {
  const event = await CalendarEvent.findOneBy({ id: parseInt(req.params.id) });
  if (!event) {
    res.status(404).json({ error: "Event not found", code: "NOT_FOUND" });
    return;
  }

  if (req.body.title !== undefined) event.title = req.body.title;
  if (req.body.description !== undefined) event.description = req.body.description;
  if (req.body.location !== undefined) event.location = req.body.location;
  if (req.body.startTime !== undefined) event.startTime = req.body.startTime;
  if (req.body.endTime !== undefined) event.endTime = req.body.endTime;
  if (req.body.allDay !== undefined) event.allDay = req.body.allDay;

  await event.save();

  // Push update to provider async
  updateEventOnProvider(event).catch((err) => {
    console.error("Failed to update event on provider:", err);
  });

  res.json({ data: event });
});

calendarRouter.delete("/events/:id", async (req, res) => {
  const event = await CalendarEvent.findOneBy({ id: parseInt(req.params.id) });
  if (!event) {
    res.status(404).json({ error: "Event not found", code: "NOT_FOUND" });
    return;
  }

  // Delete on provider async
  deleteEventOnProvider(event).catch((err) => {
    console.error("Failed to delete event on provider:", err);
  });

  await event.remove();
  res.json({ data: { deleted: true } });
});

// --- Sync ---

calendarRouter.post("/sync", async (_req, res) => {
  const result = await triggerManualSync();
  if (!result.started) {
    res.json({ data: { message: "Sync already in progress or recently triggered" } });
    return;
  }
  res.json({ data: { message: "Sync started" } });
});

calendarRouter.get("/sync/status", async (_req, res) => {
  const calendars = await Calendar.find({ relations: { account: true } });
  const data = calendars.map((c) => ({
    id: c.id,
    name: c.name,
    accountEmail: c.account?.email,
    lastSyncAt: c.lastSyncAt,
    lastSyncStatus: c.lastSyncStatus,
    lastSyncError: c.lastSyncError,
  }));
  res.json({ data, syncInProgress: isSyncInProgress() });
});

import "reflect-metadata";
import "dotenv/config";
import express from "express";
import { AppDataSource } from "../db/data-source.js";
import { calendarRouter } from "./calendar-routes.js";
import { authRouter } from "./auth-routes.js";
import { sessionMiddleware } from "./middleware/auth.js";
import { startSyncScheduler } from "../logic/calendar/scheduler.js";

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(sessionMiddleware);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRouter);
app.use("/api/calendar", calendarRouter);

async function start() {
  try {
    await AppDataSource.initialize();
    console.log("Database connected");

    startSyncScheduler();

    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();

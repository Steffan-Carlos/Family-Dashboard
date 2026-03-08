import { Request, Response, NextFunction } from "express";
import session from "express-session";

// Extend express-session types to include our custom session data
declare module "express-session" {
  interface SessionData {
    memberId: number;
    role: "parent" | "kid";
  }
}

// Session configuration — memory store is fine for a single-device kiosk app.
// No Redis needed. Sessions survive restarts via the tablet staying on.
export const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "family-dashboard-secret-change-me",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours — reasonable for a family tablet
    httpOnly: true,
    sameSite: "lax",
  },
});

// Middleware: require any authenticated session
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.session.memberId) {
    res.status(401).json({ error: "Not authenticated", code: "UNAUTHENTICATED" });
    return;
  }
  next();
}

// Middleware: require parent role
export function requireParent(req: Request, res: Response, next: NextFunction): void {
  if (!req.session.memberId) {
    res.status(401).json({ error: "Not authenticated", code: "UNAUTHENTICATED" });
    return;
  }
  if (req.session.role !== "parent") {
    res.status(403).json({ error: "Parent access required", code: "FORBIDDEN" });
    return;
  }
  next();
}

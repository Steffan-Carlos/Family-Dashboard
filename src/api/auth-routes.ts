import { Router } from "express";
import { FamilyMember } from "../db/entities/FamilyMember.js";
import { requireParent } from "./middleware/auth.js";

export const authRouter = Router();

// GET /api/auth/members — list all family members (public, used for PIN login screen)
authRouter.get("/members", async (_req, res) => {
  const members = await FamilyMember.find();

  // Never expose pinHash
  const data = members.map((m) => ({
    id: m.id,
    name: m.name,
    role: m.role,
    color: m.color,
    avatarEmoji: m.avatarEmoji,
  }));

  res.json({ data });
});

// POST /api/auth/login — verify PIN and create session
authRouter.post("/login", async (req, res) => {
  const { memberId, pin } = req.body;

  if (!memberId || !pin) {
    res.status(400).json({ error: "memberId and pin are required", code: "MISSING_FIELDS" });
    return;
  }

  const member = await FamilyMember.findOneBy({ id: memberId });
  if (!member) {
    res.status(404).json({ error: "Member not found", code: "NOT_FOUND" });
    return;
  }

  const valid = await member.verifyPin(pin);
  if (!valid) {
    res.status(401).json({ error: "Invalid PIN", code: "INVALID_PIN" });
    return;
  }

  // Set session
  req.session.memberId = member.id;
  req.session.role = member.role;

  res.json({
    data: {
      id: member.id,
      name: member.name,
      role: member.role,
      color: member.color,
      avatarEmoji: member.avatarEmoji,
    },
  });
});

// POST /api/auth/logout — clear session
authRouter.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: "Failed to logout", code: "LOGOUT_FAILED" });
      return;
    }
    res.clearCookie("connect.sid");
    res.json({ data: { loggedOut: true } });
  });
});

// GET /api/auth/session — return current session info
authRouter.get("/session", async (req, res) => {
  if (!req.session.memberId) {
    res.json({ data: null });
    return;
  }

  const member = await FamilyMember.findOneBy({ id: req.session.memberId });
  if (!member) {
    // Session references a deleted member — clean up
    req.session.destroy(() => {});
    res.json({ data: null });
    return;
  }

  res.json({
    data: {
      id: member.id,
      name: member.name,
      role: member.role,
      color: member.color,
      avatarEmoji: member.avatarEmoji,
    },
  });
});

// POST /api/auth/setup — first-run: create initial family members
// Only works when no members exist yet
authRouter.post("/setup", async (req, res) => {
  const existingCount = await FamilyMember.count();
  if (existingCount > 0) {
    res.status(409).json({
      error: "Family members already exist. Use member management endpoints instead.",
      code: "ALREADY_SETUP",
    });
    return;
  }

  const members = req.body.members;
  if (!Array.isArray(members) || members.length === 0) {
    res.status(400).json({
      error: "members array is required with at least one member",
      code: "MISSING_FIELDS",
    });
    return;
  }

  // Validate that at least one parent is included
  const hasParent = members.some((m: any) => m.role === "parent");
  if (!hasParent) {
    res.status(400).json({
      error: "At least one parent is required",
      code: "NO_PARENT",
    });
    return;
  }

  const created = [];
  for (const memberData of members) {
    const { name, role, pin, color, avatarEmoji } = memberData;

    if (!name || !role || !pin || !color) {
      res.status(400).json({
        error: "Each member requires name, role, pin, and color",
        code: "MISSING_FIELDS",
      });
      return;
    }

    if (role !== "parent" && role !== "kid") {
      res.status(400).json({
        error: "Role must be 'parent' or 'kid'",
        code: "INVALID_ROLE",
      });
      return;
    }

    const member = new FamilyMember();
    member.name = name;
    member.role = role;
    member.pinHash = await FamilyMember.hashPin(pin);
    member.color = color;
    member.avatarEmoji = avatarEmoji || null;
    await member.save();

    created.push({
      id: member.id,
      name: member.name,
      role: member.role,
      color: member.color,
      avatarEmoji: member.avatarEmoji,
    });
  }

  res.status(201).json({ data: created });
});

// POST /api/auth/members — (parent only) add a new family member
authRouter.post("/members", requireParent, async (req, res) => {
  const { name, role, pin, color, avatarEmoji } = req.body;

  if (!name || !role || !pin || !color) {
    res.status(400).json({
      error: "name, role, pin, and color are required",
      code: "MISSING_FIELDS",
    });
    return;
  }

  if (role !== "parent" && role !== "kid") {
    res.status(400).json({
      error: "Role must be 'parent' or 'kid'",
      code: "INVALID_ROLE",
    });
    return;
  }

  const member = new FamilyMember();
  member.name = name;
  member.role = role;
  member.pinHash = await FamilyMember.hashPin(pin);
  member.color = color;
  member.avatarEmoji = avatarEmoji || null;
  await member.save();

  res.status(201).json({
    data: {
      id: member.id,
      name: member.name,
      role: member.role,
      color: member.color,
      avatarEmoji: member.avatarEmoji,
    },
  });
});

// DELETE /api/auth/members/:id — (parent only) remove a family member
authRouter.delete("/members/:id", requireParent, async (req, res) => {
  const memberId = parseInt(req.params.id as string);
  const member = await FamilyMember.findOneBy({ id: memberId });

  if (!member) {
    res.status(404).json({ error: "Member not found", code: "NOT_FOUND" });
    return;
  }

  // Prevent deleting yourself
  if (req.session.memberId === memberId) {
    res.status(400).json({
      error: "Cannot delete your own account",
      code: "SELF_DELETE",
    });
    return;
  }

  // Prevent deleting the last parent
  if (member.role === "parent") {
    const parentCount = await FamilyMember.countBy({ role: "parent" });
    if (parentCount <= 1) {
      res.status(400).json({
        error: "Cannot delete the last parent",
        code: "LAST_PARENT",
      });
      return;
    }
  }

  await member.remove();
  res.json({ data: { deleted: true } });
});

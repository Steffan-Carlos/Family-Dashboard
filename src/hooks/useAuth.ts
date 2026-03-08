import { useState, useEffect, useCallback, useRef } from "react";

export interface FamilyMember {
  id: number;
  name: string;
  role: "parent" | "kid";
  color: string;
  avatar: string;
}

export interface AuthUser {
  id: number;
  name: string;
  role: "parent" | "kid";
  color: string;
  avatar: string;
}

interface AuthState {
  members: FamilyMember[];
  currentUser: AuthUser | null;
  isLoading: boolean;
  isSetupNeeded: boolean;
  error: string | null;
}

function mapMember(m: any): FamilyMember {
  return {
    id: m.id,
    name: m.name,
    role: m.role,
    color: m.color,
    avatar: m.avatarEmoji || "",
  };
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    members: [],
    currentUser: null,
    isLoading: true,
    isSetupNeeded: false,
    error: null,
  });

  // Track whether we're in the middle of setup flow so addMember uses the right endpoint
  const inSetupFlow = useRef(false);

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/members");
      if (!res.ok) throw new Error("Failed to fetch members");
      const json = await res.json();
      const members: FamilyMember[] = (json.data || []).map(mapMember);
      setState((prev) => ({
        ...prev,
        members,
        // Only enter setup mode, never exit it via fetch (setup flow controls that)
        isSetupNeeded: prev.isSetupNeeded || members.length === 0,
      }));
    } catch {
      setState((prev) => ({
        ...prev,
        members: [],
        isSetupNeeded: true,
      }));
    }
  }, []);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session");
      if (!res.ok) {
        setState((prev) => ({ ...prev, currentUser: null }));
        return;
      }
      const json = await res.json();
      if (json.data) {
        setState((prev) => ({
          ...prev,
          currentUser: mapMember(json.data),
        }));
      }
    } catch {
      setState((prev) => ({ ...prev, currentUser: null }));
    }
  }, []);

  useEffect(() => {
    async function init() {
      setState((prev) => ({ ...prev, isLoading: true }));
      await Promise.all([fetchMembers(), checkSession()]);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
    init();
  }, [fetchMembers, checkSession]);

  const login = useCallback(
    async (memberId: number, pin: string): Promise<boolean> => {
      setState((prev) => ({ ...prev, error: null }));
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberId, pin }),
        });

        if (!res.ok) {
          setState((prev) => ({ ...prev, error: "Wrong PIN" }));
          return false;
        }

        const json = await res.json();
        setState((prev) => ({
          ...prev,
          currentUser: mapMember(json.data),
          error: null,
        }));
        return true;
      } catch {
        setState((prev) => ({ ...prev, error: "Login failed" }));
        return false;
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Logout locally even if server fails
    }
    setState((prev) => ({ ...prev, currentUser: null }));
  }, []);

  const addMember = useCallback(
    async (member: {
      name: string;
      role: "parent" | "kid";
      pin: string;
      color: string;
      avatar: string;
    }): Promise<boolean> => {
      try {
        const payload = {
          name: member.name,
          role: member.role,
          pin: member.pin,
          color: member.color,
          avatarEmoji: member.avatar,
        };

        if (inSetupFlow.current) {
          // During setup, use the unauthenticated setup endpoint
          const res = await fetch("/api/auth/setup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ members: [payload] }),
          });
          if (!res.ok) return false;
          await fetchMembers();
          return true;
        }

        // Authenticated member add (parent only)
        const res = await fetch("/api/auth/members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) return false;
        await fetchMembers();
        return true;
      } catch {
        return false;
      }
    },
    [fetchMembers]
  );

  const refreshMembers = useCallback(async () => {
    // Called when setup flow completes — exit setup mode
    inSetupFlow.current = false;
    setState((prev) => ({ ...prev, isSetupNeeded: false }));
    await fetchMembers();
  }, [fetchMembers]);

  // Sync the ref with state
  useEffect(() => {
    if (state.isSetupNeeded) {
      inSetupFlow.current = true;
    }
  }, [state.isSetupNeeded]);

  return {
    members: state.members,
    currentUser: state.currentUser,
    isLoading: state.isLoading,
    isSetupNeeded: state.isSetupNeeded,
    error: state.error,
    login,
    logout,
    addMember,
    refreshMembers,
  };
}

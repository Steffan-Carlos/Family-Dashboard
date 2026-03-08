import { useState, useEffect, useCallback } from "react";

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

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    members: [],
    currentUser: null,
    isLoading: true,
    isSetupNeeded: false,
    error: null,
  });

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/members");
      if (!res.ok) throw new Error("Failed to fetch members");
      const data = await res.json();
      const members: FamilyMember[] = data.members || [];
      setState((prev) => ({
        ...prev,
        members,
        isSetupNeeded: members.length === 0,
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
      const data = await res.json();
      if (data.user) {
        setState((prev) => ({ ...prev, currentUser: data.user }));
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

        const data = await res.json();
        setState((prev) => ({ ...prev, currentUser: data.user, error: null }));
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
        const res = await fetch("/api/auth/members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(member),
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

  return {
    members: state.members,
    currentUser: state.currentUser,
    isLoading: state.isLoading,
    isSetupNeeded: state.isSetupNeeded,
    error: state.error,
    login,
    logout,
    addMember,
    refreshMembers: fetchMembers,
  };
}

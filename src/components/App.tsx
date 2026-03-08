import { Routes, Route, NavLink } from "react-router-dom";
import { CalendarView } from "./calendar/CalendarView";
import { CalendarSettings } from "./settings/CalendarSettings";
import { LoginScreen } from "./auth/LoginScreen";
import { SetupFlow } from "./auth/SetupFlow";
import { useAuth } from "@/hooks/useAuth";
import styles from "./App.module.scss";

export function App() {
  const {
    members,
    currentUser,
    isLoading,
    isSetupNeeded,
    login,
    logout,
    addMember,
    refreshMembers,
  } = useAuth();

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <p className={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  if (isSetupNeeded) {
    return (
      <SetupFlow
        onAddMember={addMember}
        onComplete={refreshMembers}
      />
    );
  }

  if (!currentUser) {
    return <LoginScreen members={members} onLogin={login} />;
  }

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <h1 className={styles.title}>Family Dashboard</h1>
        <nav className={styles.nav}>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
            }
          >
            Calendar
          </NavLink>
          <NavLink
            to="/settings/calendars"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
            }
          >
            Settings
          </NavLink>
        </nav>
        <button className={styles.logoutButton} onClick={logout} type="button">
          {currentUser.avatar} {currentUser.name}
        </button>
      </header>
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<CalendarView />} />
          <Route path="/settings/calendars" element={<CalendarSettings />} />
        </Routes>
      </main>
    </div>
  );
}

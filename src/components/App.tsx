import { Routes, Route, NavLink } from "react-router-dom";
import { CalendarView } from "./calendar/CalendarView";
import { CalendarSettings } from "./settings/CalendarSettings";
import styles from "./App.module.scss";

export function App() {
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

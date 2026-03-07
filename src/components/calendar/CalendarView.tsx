import { useEffect, useState } from "react";
import { CalendarDayCell } from "./CalendarDayCell";
import { EventModal } from "./EventModal";
import { SyncIndicator } from "./SyncIndicator";
import styles from "./CalendarView.module.scss";

type ViewMode = "month" | "week" | "day";

interface CalendarEventData {
  id: number;
  title: string;
  description: string | null;
  location: string | null;
  startTime: string;
  endTime: string;
  allDay: boolean;
  calendarId: number;
  calendarName: string;
  calendarColor: string;
}

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [events, setEvents] = useState<CalendarEventData[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEventData | null>(null);

  const fetchEvents = async () => {
    const start = getViewStart(currentDate, viewMode);
    const end = getViewEnd(currentDate, viewMode);
    try {
      const res = await fetch(
        `/api/calendar/events?start=${start.toISOString()}&end=${end.toISOString()}`,
      );
      const json = await res.json();
      setEvents(json.data || []);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentDate, viewMode]);

  const navigatePrev = () => {
    navigator.vibrate?.(10);
    const d = new Date(currentDate);
    if (viewMode === "month") d.setMonth(d.getMonth() - 1);
    else if (viewMode === "week") d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const navigateNext = () => {
    navigator.vibrate?.(10);
    const d = new Date(currentDate);
    if (viewMode === "month") d.setMonth(d.getMonth() + 1);
    else if (viewMode === "week") d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const navigateToday = () => {
    navigator.vibrate?.(10);
    setCurrentDate(new Date());
  };

  const handleDayClick = (date: string) => {
    navigator.vibrate?.(10);
    setSelectedDate(date);
    setEditingEvent(null);
    setShowModal(true);
  };

  const handleEventClick = (event: CalendarEventData) => {
    navigator.vibrate?.(10);
    setEditingEvent(event);
    setSelectedDate(event.startTime);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingEvent(null);
    setSelectedDate(null);
    fetchEvents();
  };

  const monthDays = getMonthDays(currentDate);
  const title = formatTitle(currentDate, viewMode);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.nav}>
          <button className={styles.navButton} onClick={navigatePrev}>
            &#8249;
          </button>
          <h2 className={styles.title}>{title}</h2>
          <button className={styles.navButton} onClick={navigateNext}>
            &#8250;
          </button>
        </div>

        <div className={styles.controls}>
          <button className={styles.todayButton} onClick={navigateToday}>
            Today
          </button>
          <div className={styles.viewToggle}>
            {(["month", "week", "day"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                className={styles.viewButton}
                data-active={viewMode === mode}
                onClick={() => {
                  navigator.vibrate?.(10);
                  setViewMode(mode);
                }}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          <SyncIndicator />
        </div>
      </header>

      {viewMode === "month" && (
        <div className={styles.monthGrid}>
          <div className={styles.weekDayHeaders}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className={styles.weekDayHeader}>
                {d}
              </div>
            ))}
          </div>
          <div className={styles.daysGrid}>
            {monthDays.map((day) => {
              const dayEvents = events.filter((e) => {
                const eventDate = e.startTime.split("T")[0];
                return eventDate === day.date;
              });
              return (
                <CalendarDayCell
                  key={day.date}
                  date={day.date}
                  dayNumber={day.dayNumber}
                  isCurrentMonth={day.isCurrentMonth}
                  isToday={day.isToday}
                  events={dayEvents}
                  onDayClick={handleDayClick}
                  onEventClick={handleEventClick}
                />
              );
            })}
          </div>
        </div>
      )}

      {viewMode !== "month" && (
        <div className={styles.placeholder}>
          {viewMode === "week" ? "Week" : "Day"} view coming soon
        </div>
      )}

      {showModal && (
        <EventModal
          date={selectedDate}
          event={editingEvent}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}

// Helper functions

function getViewStart(date: Date, mode: ViewMode): Date {
  const d = new Date(date);
  if (mode === "month") {
    d.setDate(1);
    d.setDate(d.getDate() - d.getDay());
  } else if (mode === "week") {
    d.setDate(d.getDate() - d.getDay());
  }
  d.setHours(0, 0, 0, 0);
  return d;
}

function getViewEnd(date: Date, mode: ViewMode): Date {
  const d = new Date(date);
  if (mode === "month") {
    d.setMonth(d.getMonth() + 1, 0);
    d.setDate(d.getDate() + (6 - d.getDay()));
  } else if (mode === "week") {
    d.setDate(d.getDate() + (6 - d.getDay()));
  }
  d.setHours(23, 59, 59, 999);
  return d;
}

interface DayInfo {
  date: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

function getMonthDays(date: Date): DayInfo[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const days: DayInfo[] = [];
  const current = new Date(startDate);

  for (let i = 0; i < 42; i++) {
    const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`;
    days.push({
      date: dateStr,
      dayNumber: current.getDate(),
      isCurrentMonth: current.getMonth() === month,
      isToday: dateStr === todayStr,
    });
    current.setDate(current.getDate() + 1);
  }

  return days;
}

function formatTitle(date: Date, mode: ViewMode): string {
  if (mode === "month") {
    return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  } else if (mode === "week") {
    return `Week of ${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
  }
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

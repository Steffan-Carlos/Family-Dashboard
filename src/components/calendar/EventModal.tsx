import { useEffect, useState } from "react";
import { CalendarPicker } from "./CalendarPicker";
import styles from "./EventModal.module.scss";

interface EventData {
  id: number;
  title: string;
  description: string | null;
  location: string | null;
  startTime: string;
  endTime: string;
  allDay: boolean;
  calendarId: number;
}

interface Props {
  date: string | null;
  event: EventData | null;
  onClose: () => void;
}

export function EventModal({ date, event, onClose }: Props) {
  const [title, setTitle] = useState(event?.title || "");
  const [description, setDescription] = useState(event?.description || "");
  const [location, setLocation] = useState(event?.location || "");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [allDay, setAllDay] = useState(event?.allDay || false);
  const [calendarId, setCalendarId] = useState<number | null>(event?.calendarId || null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (event) {
      setStartTime(formatDateTimeLocal(event.startTime));
      setEndTime(formatDateTimeLocal(event.endTime));
    } else if (date) {
      const d = date.includes("T") ? date.split("T")[0] : date;
      setStartTime(`${d}T09:00`);
      setEndTime(`${d}T10:00`);
    }
  }, [event, date]);

  const handleSave = async () => {
    if (!title.trim() || !calendarId) return;
    navigator.vibrate?.([50, 30, 50]);
    setSaving(true);

    try {
      const body = {
        title: title.trim(),
        description: description.trim() || null,
        location: location.trim() || null,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        allDay,
        calendarId,
      };

      if (event) {
        await fetch(`/api/calendar/events/${event.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        await fetch("/api/calendar/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      onClose();
    } catch (err) {
      console.error("Failed to save event:", err);
      navigator.vibrate?.([100, 50, 100, 50, 100]);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    navigator.vibrate?.([50, 30, 50]);
    try {
      await fetch(`/api/calendar/events/${event.id}`, { method: "DELETE" });
      onClose();
    } catch (err) {
      console.error("Failed to delete event:", err);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.heading}>
          {event ? "Edit Event" : "New Event"}
        </h3>

        <div className={styles.field}>
          <label className={styles.label}>Title</label>
          <input
            className={styles.input}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event title"
            autoFocus
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Calendar</label>
          <CalendarPicker
            selectedId={calendarId}
            onChange={setCalendarId}
          />
        </div>

        <div className={styles.row}>
          <label className={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className={styles.checkbox}
            />
            All day
          </label>
        </div>

        {!allDay && (
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Start</label>
              <input
                className={styles.input}
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>End</label>
              <input
                className={styles.input}
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className={styles.field}>
          <label className={styles.label}>Location</label>
          <input
            className={styles.input}
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Optional"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Description</label>
          <textarea
            className={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional"
            rows={3}
          />
        </div>

        <div className={styles.actions}>
          {event && (
            <button className={styles.deleteButton} onClick={handleDelete}>
              Delete
            </button>
          )}
          <div className={styles.actionsSpacer} />
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.saveButton}
            onClick={handleSave}
            disabled={saving || !title.trim() || !calendarId}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDateTimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

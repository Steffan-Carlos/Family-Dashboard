import { useEffect, useState } from "react";
import styles from "./CalendarPicker.module.scss";

interface CalendarOption {
  id: number;
  name: string;
  color: string;
  isReadOnly: boolean;
  accountEmail: string;
  accountProvider: string;
}

interface Props {
  selectedId: number | null;
  onChange: (id: number) => void;
}

export function CalendarPicker({ selectedId, onChange }: Props) {
  const [calendars, setCalendars] = useState<CalendarOption[]>([]);

  useEffect(() => {
    const fetchCalendars = async () => {
      try {
        const res = await fetch("/api/calendar/calendars");
        const json = await res.json();
        setCalendars(
          (json.data || []).filter((c: CalendarOption) => !c.isReadOnly),
        );
      } catch (err) {
        console.error("Failed to fetch calendars:", err);
      }
    };
    fetchCalendars();
  }, []);

  // Group calendars by account
  const grouped = calendars.reduce(
    (acc, cal) => {
      const key = cal.accountEmail;
      if (!acc[key]) acc[key] = [];
      acc[key].push(cal);
      return acc;
    },
    {} as Record<string, CalendarOption[]>,
  );

  return (
    <select
      className={styles.select}
      value={selectedId ?? ""}
      onChange={(e) => {
        navigator.vibrate?.(10);
        onChange(parseInt(e.target.value));
      }}
    >
      <option value="">Select a calendar...</option>
      {Object.entries(grouped).map(([email, cals]) => (
        <optgroup key={email} label={email}>
          {cals.map((cal) => (
            <option key={cal.id} value={cal.id}>
              {cal.name}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

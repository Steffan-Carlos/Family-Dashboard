import { useState } from "react";
import styles from "./CalendarList.module.scss";

interface CalendarInfo {
  id: number;
  name: string;
  color: string;
  isVisible: boolean;
  isReadOnly: boolean;
}

interface CalendarAccount {
  id: number;
  provider: string;
  email: string;
  displayName: string;
  calendars: CalendarInfo[];
}

interface Props {
  accounts: CalendarAccount[];
  onToggle: (calendarId: number, isVisible: boolean) => void;
  onColorChange: (calendarId: number, color: string) => void;
}

const PALETTE = ["#7BB8A4", "#F0A8A0", "#B5A8D5", "#F5C97A", "#87CEEB", "#FFDAB9"];

export function CalendarList({ accounts, onToggle, onColorChange }: Props) {
  const [expandedAccount, setExpandedAccount] = useState<number | null>(null);

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Calendars</h3>

      {accounts.map((account) => (
        <div key={account.id} className={styles.accountGroup}>
          <button
            className={styles.accountHeader}
            onClick={() => {
              navigator.vibrate?.(10);
              setExpandedAccount(expandedAccount === account.id ? null : account.id);
            }}
          >
            <span className={styles.accountName}>
              {account.displayName}
              <span className={styles.accountEmail}>{account.email}</span>
            </span>
            <span className={styles.chevron} data-expanded={expandedAccount === account.id}>
              &#9662;
            </span>
          </button>

          {expandedAccount === account.id && (
            <ul className={styles.calendarList}>
              {account.calendars.map((cal) => (
                <li key={cal.id} className={styles.calendarItem}>
                  <label className={styles.calendarLabel}>
                    <input
                      type="checkbox"
                      checked={cal.isVisible}
                      onChange={(e) => {
                        navigator.vibrate?.(10);
                        onToggle(cal.id, e.target.checked);
                      }}
                      className={styles.checkbox}
                    />
                    <span className={styles.colorDot} style={{ background: cal.color }} />
                    <span className={styles.calendarName}>
                      {cal.name}
                      {cal.isReadOnly && <span className={styles.readOnly}>(read-only)</span>}
                    </span>
                  </label>

                  <div className={styles.colorPicker}>
                    {PALETTE.map((color) => (
                      <button
                        key={color}
                        className={styles.colorOption}
                        style={{ background: color }}
                        data-selected={color === cal.color}
                        onClick={() => {
                          navigator.vibrate?.(10);
                          onColorChange(cal.id, color);
                        }}
                      />
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

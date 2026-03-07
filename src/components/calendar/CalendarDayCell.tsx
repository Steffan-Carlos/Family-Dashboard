import styles from "./CalendarDayCell.module.scss";

interface EventData {
  id: number;
  title: string;
  calendarColor: string;
}

interface Props {
  date: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: EventData[];
  onDayClick: (date: string) => void;
  onEventClick: (event: any) => void;
}

export function CalendarDayCell({
  date,
  dayNumber,
  isCurrentMonth,
  isToday,
  events,
  onDayClick,
  onEventClick,
}: Props) {
  return (
    <div
      className={styles.cell}
      data-current-month={isCurrentMonth}
      data-today={isToday}
      onClick={() => onDayClick(date)}
    >
      <span className={styles.dayNumber} data-today={isToday}>
        {dayNumber}
      </span>

      <div className={styles.events}>
        {events.slice(0, 3).map((event) => (
          <button
            key={event.id}
            className={styles.eventDot}
            style={{ background: event.calendarColor }}
            title={event.title}
            onClick={(e) => {
              e.stopPropagation();
              onEventClick(event);
            }}
          >
            <span className={styles.eventTitle}>{event.title}</span>
          </button>
        ))}
        {events.length > 3 && (
          <span className={styles.moreCount}>+{events.length - 3}</span>
        )}
      </div>
    </div>
  );
}

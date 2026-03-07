import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from "typeorm";
import { Calendar } from "./Calendar.js";

@Entity()
export class CalendarEvent extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text", nullable: true })
  @Index()
  providerEventId: string | null;

  @Column({ type: "integer" })
  calendarId: number;

  @ManyToOne(() => Calendar, (calendar) => calendar.events, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "calendarId" })
  calendar: Calendar;

  @Column({ type: "text" })
  title: string;

  @Column({ type: "text", nullable: true })
  description: string | null;

  @Column({ type: "text", nullable: true })
  location: string | null;

  @Column({ type: "text" })
  @Index()
  startTime: string; // ISO 8601

  @Column({ type: "text" })
  endTime: string; // ISO 8601

  @Column({ type: "boolean", default: false })
  allDay: boolean;

  @Column({ type: "text", nullable: true })
  recurrenceRule: string | null; // RRULE string

  @Column({ type: "boolean", default: false })
  isRecurringInstance: boolean;

  @Column({ type: "text", nullable: true })
  recurringEventProviderId: string | null;

  @Column({ type: "text", default: "confirmed" })
  status: string; // "confirmed" | "tentative" | "cancelled"

  @Column({ type: "text", nullable: true })
  organizer: string | null;

  @Column({ type: "text", nullable: true })
  attendeesJson: string | null; // JSON string

  @Column({ type: "boolean", default: false })
  locallyCreated: boolean;

  @Column({ type: "text", nullable: true })
  lastModifiedAt: string | null; // provider's last-modified timestamp

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

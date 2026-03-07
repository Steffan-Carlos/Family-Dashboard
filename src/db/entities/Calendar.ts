import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
  JoinColumn,
} from "typeorm";
import { CalendarAccount } from "./CalendarAccount.js";
import { CalendarEvent } from "./CalendarEvent.js";

@Entity()
export class Calendar extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text" })
  @Index()
  providerCalendarId: string;

  @Column({ type: "text" })
  name: string;

  @Column({ type: "text", default: "#7BB8A4" })
  color: string;

  @Column({ type: "boolean", default: true })
  isVisible: boolean;

  @Column({ type: "boolean", default: false })
  isReadOnly: boolean;

  @Column({ type: "text", nullable: true })
  syncToken: string | null;

  @Column({ type: "text", nullable: true })
  lastSyncAt: string | null; // ISO 8601

  @Column({ type: "text", default: "pending" })
  lastSyncStatus: string; // "ok" | "error" | "pending"

  @Column({ type: "text", nullable: true })
  lastSyncError: string | null;

  @Column({ type: "integer" })
  accountId: number;

  @ManyToOne(() => CalendarAccount, (account) => account.calendars, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "accountId" })
  account: CalendarAccount;

  @OneToMany(() => CalendarEvent, (event) => event.calendar, {
    cascade: true,
  })
  events: CalendarEvent[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

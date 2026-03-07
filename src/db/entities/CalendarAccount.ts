import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from "typeorm";
import { Calendar } from "./Calendar.js";

@Entity()
export class CalendarAccount extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text" })
  @Index()
  provider: string; // "google" | "microsoft"

  @Column({ type: "text" })
  email: string;

  @Column({ type: "text" })
  displayName: string;

  @Column({ type: "text" })
  accessToken: string;

  @Column({ type: "text" })
  refreshToken: string;

  @Column({ type: "text", nullable: true })
  tokenExpiry: string | null; // ISO 8601

  @Column({ type: "integer", nullable: true })
  familyMemberId: number | null; // FK to FamilyMember (nullable until TASK-002)

  @OneToMany(() => Calendar, (calendar) => calendar.account, {
    cascade: true,
  })
  calendars: Calendar[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

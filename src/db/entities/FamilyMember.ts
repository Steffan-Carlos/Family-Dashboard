import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import bcrypt from "bcryptjs";

export type FamilyMemberRole = "parent" | "kid";

@Entity()
export class FamilyMember extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text" })
  name: string;

  @Column({ type: "text" })
  role: FamilyMemberRole; // "parent" | "kid"

  @Column({ type: "text" })
  pinHash: string;

  @Column({ type: "text" })
  color: string; // assigned pastel from design system palette

  @Column({ type: "text", nullable: true })
  avatarEmoji: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Hash a plaintext PIN for storage. Never store the raw PIN.
   */
  static async hashPin(pin: string): Promise<string> {
    const SALT_ROUNDS = 10;
    return bcrypt.hash(pin, SALT_ROUNDS);
  }

  /**
   * Verify a plaintext PIN against this member's stored hash.
   */
  async verifyPin(pin: string): Promise<boolean> {
    return bcrypt.compare(pin, this.pinHash);
  }
}

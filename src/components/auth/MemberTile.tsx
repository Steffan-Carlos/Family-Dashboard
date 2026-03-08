import type { FamilyMember } from "@/hooks/useAuth";
import styles from "./MemberTile.module.scss";

interface Props {
  member: FamilyMember;
  onSelect: (member: FamilyMember) => void;
}

export function MemberTile({ member, onSelect }: Props) {
  const handleTap = () => {
    navigator.vibrate?.(30);
    onSelect(member);
  };

  return (
    <button
      className={styles.tile}
      style={{ backgroundColor: member.color }}
      onClick={handleTap}
      type="button"
    >
      <span className={styles.avatar}>{member.avatar}</span>
      <span className={styles.name}>{member.name}</span>
    </button>
  );
}

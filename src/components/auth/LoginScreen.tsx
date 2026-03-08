import { useState } from "react";
import type { FamilyMember } from "@/hooks/useAuth";
import { MemberTile } from "./MemberTile";
import { PinPad } from "./PinPad";
import styles from "./LoginScreen.module.scss";

interface Props {
  members: FamilyMember[];
  onLogin: (memberId: number, pin: string) => Promise<boolean>;
}

export function LoginScreen({ members, onLogin }: Props) {
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(
    null
  );

  const handleSelect = (member: FamilyMember) => {
    setSelectedMember(member);
  };

  const handlePinSubmit = async (pin: string): Promise<boolean> => {
    if (!selectedMember) return false;
    return onLogin(selectedMember.id, pin);
  };

  const handlePinCancel = () => {
    setSelectedMember(null);
  };

  return (
    <div className={styles.screen}>
      <h1 className={styles.heading}>Who's here?</h1>
      <div className={styles.grid}>
        {members.map((member) => (
          <MemberTile key={member.id} member={member} onSelect={handleSelect} />
        ))}
      </div>

      {selectedMember && (
        <PinPad
          member={selectedMember}
          onSubmit={handlePinSubmit}
          onCancel={handlePinCancel}
        />
      )}
    </div>
  );
}

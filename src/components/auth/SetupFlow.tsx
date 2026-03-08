import { useState } from "react";
import styles from "./SetupFlow.module.scss";

interface NewMember {
  name: string;
  role: "parent" | "kid";
  pin: string;
  color: string;
  avatar: string;
}

interface Props {
  onAddMember: (member: NewMember) => Promise<boolean>;
  onComplete: () => void;
}

const PASTEL_OPTIONS = [
  { name: "Sage", value: "#7BB8A4" },
  { name: "Coral", value: "#F0A8A0" },
  { name: "Lavender", value: "#B5A8D5" },
  { name: "Amber", value: "#F5C97A" },
  { name: "Sky", value: "#87CEEB" },
  { name: "Peach", value: "#FFDAB9" },
];

const AVATAR_OPTIONS = [
  "\u{1F9D1}", "\u{1F468}", "\u{1F469}", "\u{1F466}", "\u{1F467}",
  "\u{1F476}", "\u{1F431}", "\u{1F436}", "\u{1F98A}", "\u{1F43B}",
  "\u{1F984}", "\u{1F33B}",
];

type Step = "name" | "role" | "color" | "avatar" | "pin" | "confirm";

export function SetupFlow({ onAddMember, onComplete }: Props) {
  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"parent" | "kid">("parent");
  const [color, setColor] = useState(PASTEL_OPTIONS[0].value);
  const [avatar, setAvatar] = useState(AVATAR_OPTIONS[0]);
  const [pin, setPin] = useState("");
  const [addedMembers, setAddedMembers] = useState<
    { name: string; avatar: string; color: string }[]
  >([]);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setStep("name");
    setName("");
    setRole("parent");
    setColor(PASTEL_OPTIONS[0].value);
    setAvatar(AVATAR_OPTIONS[0]);
    setPin("");
  };

  const handleSaveMember = async () => {
    setSaving(true);
    navigator.vibrate?.(30);
    const success = await onAddMember({ name, role, pin, color, avatar });
    setSaving(false);
    if (success) {
      setAddedMembers((prev) => [...prev, { name, avatar, color }]);
      resetForm();
    }
  };

  const handleFinish = () => {
    navigator.vibrate?.([50, 30, 50]);
    onComplete();
  };

  const canProceedName = name.trim().length >= 1;
  const canProceedPin = pin.length === 4;

  return (
    <div className={styles.screen}>
      <div className={styles.card}>
        {addedMembers.length === 0 ? (
          <h1 className={styles.heading}>Let's set up your family!</h1>
        ) : (
          <h1 className={styles.heading}>Add another member?</h1>
        )}

        {addedMembers.length > 0 && (
          <div className={styles.addedList}>
            {addedMembers.map((m, i) => (
              <div
                key={i}
                className={styles.addedChip}
                style={{ backgroundColor: m.color }}
              >
                <span>{m.avatar}</span>
                <span>{m.name}</span>
              </div>
            ))}
          </div>
        )}

        {step === "name" && (
          <div className={styles.stepContent}>
            <p className={styles.stepLabel}>What's their name?</p>
            <input
              className={styles.input}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              autoFocus
            />
            <div className={styles.actions}>
              {addedMembers.length > 0 && (
                <button
                  className={styles.secondaryButton}
                  onClick={handleFinish}
                  type="button"
                >
                  Done adding
                </button>
              )}
              <button
                className={styles.primaryButton}
                onClick={() => setStep("role")}
                disabled={!canProceedName}
                type="button"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === "role" && (
          <div className={styles.stepContent}>
            <p className={styles.stepLabel}>
              Is {name} a parent or a kid?
            </p>
            <div className={styles.roleOptions}>
              <button
                className={`${styles.roleButton} ${
                  role === "parent" ? styles.roleButtonActive : ""
                }`}
                onClick={() => {
                  setRole("parent");
                  navigator.vibrate?.(15);
                }}
                type="button"
              >
                Parent
              </button>
              <button
                className={`${styles.roleButton} ${
                  role === "kid" ? styles.roleButtonActive : ""
                }`}
                onClick={() => {
                  setRole("kid");
                  navigator.vibrate?.(15);
                }}
                type="button"
              >
                Kid
              </button>
            </div>
            <div className={styles.actions}>
              <button
                className={styles.secondaryButton}
                onClick={() => setStep("name")}
                type="button"
              >
                Back
              </button>
              <button
                className={styles.primaryButton}
                onClick={() => setStep("color")}
                type="button"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === "color" && (
          <div className={styles.stepContent}>
            <p className={styles.stepLabel}>Pick a color for {name}</p>
            <div className={styles.colorGrid}>
              {PASTEL_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  className={`${styles.colorSwatch} ${
                    color === c.value ? styles.colorSwatchActive : ""
                  }`}
                  style={{ backgroundColor: c.value }}
                  onClick={() => {
                    setColor(c.value);
                    navigator.vibrate?.(15);
                  }}
                  type="button"
                  aria-label={c.name}
                />
              ))}
            </div>
            <div className={styles.actions}>
              <button
                className={styles.secondaryButton}
                onClick={() => setStep("role")}
                type="button"
              >
                Back
              </button>
              <button
                className={styles.primaryButton}
                onClick={() => setStep("avatar")}
                type="button"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === "avatar" && (
          <div className={styles.stepContent}>
            <p className={styles.stepLabel}>Choose an avatar</p>
            <div className={styles.avatarGrid}>
              {AVATAR_OPTIONS.map((a) => (
                <button
                  key={a}
                  className={`${styles.avatarOption} ${
                    avatar === a ? styles.avatarOptionActive : ""
                  }`}
                  onClick={() => {
                    setAvatar(a);
                    navigator.vibrate?.(15);
                  }}
                  type="button"
                >
                  {a}
                </button>
              ))}
            </div>
            <div className={styles.actions}>
              <button
                className={styles.secondaryButton}
                onClick={() => setStep("color")}
                type="button"
              >
                Back
              </button>
              <button
                className={styles.primaryButton}
                onClick={() => setStep("pin")}
                type="button"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === "pin" && (
          <div className={styles.stepContent}>
            <p className={styles.stepLabel}>Set a 4-digit PIN for {name}</p>
            <div className={styles.pinInputWrap}>
              <input
                className={styles.pinInput}
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setPin(val);
                }}
                placeholder="----"
                autoFocus
              />
            </div>
            <div className={styles.pinDots}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`${styles.pinDot} ${
                    i < pin.length ? styles.pinDotFilled : ""
                  }`}
                />
              ))}
            </div>
            <div className={styles.actions}>
              <button
                className={styles.secondaryButton}
                onClick={() => setStep("avatar")}
                type="button"
              >
                Back
              </button>
              <button
                className={styles.primaryButton}
                onClick={() => setStep("confirm")}
                disabled={!canProceedPin}
                type="button"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === "confirm" && (
          <div className={styles.stepContent}>
            <p className={styles.stepLabel}>Looking good!</p>
            <div className={styles.preview} style={{ backgroundColor: color }}>
              <span className={styles.previewAvatar}>{avatar}</span>
              <span className={styles.previewName}>{name}</span>
              <span className={styles.previewRole}>{role}</span>
            </div>
            <div className={styles.actions}>
              <button
                className={styles.secondaryButton}
                onClick={() => setStep("pin")}
                type="button"
              >
                Back
              </button>
              <button
                className={styles.primaryButton}
                onClick={handleSaveMember}
                disabled={saving}
                type="button"
              >
                {saving ? "Saving..." : "Add member"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

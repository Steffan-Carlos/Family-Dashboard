import { useState, useCallback } from "react";
import type { FamilyMember } from "@/hooks/useAuth";
import styles from "./PinPad.module.scss";

interface Props {
  member: FamilyMember;
  onSubmit: (pin: string) => Promise<boolean>;
  onCancel: () => void;
}

type PadStatus = "idle" | "error" | "success";

const PIN_LENGTH = 4;

export function PinPad({ member, onSubmit, onCancel }: Props) {
  const [digits, setDigits] = useState<string>("");
  const [status, setStatus] = useState<PadStatus>("idle");

  const handleDigit = useCallback(
    (digit: string) => {
      if (status !== "idle" || digits.length >= PIN_LENGTH) return;
      navigator.vibrate?.(15);
      setDigits((prev) => prev + digit);
    },
    [status, digits.length]
  );

  const handleBackspace = useCallback(() => {
    if (status !== "idle") return;
    navigator.vibrate?.(15);
    setDigits((prev) => prev.slice(0, -1));
  }, [status]);

  const handleSubmit = useCallback(async () => {
    if (digits.length < PIN_LENGTH) return;
    navigator.vibrate?.(30);

    const success = await onSubmit(digits);
    if (success) {
      setStatus("success");
      navigator.vibrate?.([50, 30, 50]);
    } else {
      setStatus("error");
      navigator.vibrate?.([80, 40, 80]);
      setTimeout(() => {
        setStatus("idle");
        setDigits("");
      }, 600);
    }
  }, [digits, onSubmit]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const numberButtons = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["back", "0", "go"],
  ];

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div
        className={`${styles.modal} ${status === "error" ? styles.shake : ""} ${
          status === "success" ? styles.successModal : ""
        }`}
      >
        <div
          className={styles.memberBadge}
          style={{ backgroundColor: member.color }}
        >
          <span className={styles.memberAvatar}>{member.avatar}</span>
          <span className={styles.memberName}>{member.name}</span>
        </div>

        <p className={styles.prompt}>Enter your PIN</p>

        <div className={styles.dots}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <div
              key={i}
              className={`${styles.dot} ${
                i < digits.length ? styles.dotFilled : ""
              } ${status === "error" ? styles.dotError : ""} ${
                status === "success" ? styles.dotSuccess : ""
              }`}
            />
          ))}
        </div>

        {status === "success" && (
          <div className={styles.checkmark}>
            <svg viewBox="0 0 52 52" className={styles.checkmarkSvg}>
              <circle
                className={styles.checkmarkCircle}
                cx="26"
                cy="26"
                r="25"
                fill="none"
              />
              <path
                className={styles.checkmarkPath}
                fill="none"
                d="M14.1 27.2l7.1 7.2 16.7-16.8"
              />
            </svg>
          </div>
        )}

        <div className={styles.pad}>
          {numberButtons.map((row, ri) => (
            <div key={ri} className={styles.row}>
              {row.map((key) => {
                if (key === "back") {
                  return (
                    <button
                      key={key}
                      className={`${styles.key} ${styles.keyAction}`}
                      onClick={handleBackspace}
                      type="button"
                      aria-label="Backspace"
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                        <line x1="18" y1="9" x2="12" y2="15" />
                        <line x1="12" y1="9" x2="18" y2="15" />
                      </svg>
                    </button>
                  );
                }
                if (key === "go") {
                  return (
                    <button
                      key={key}
                      className={`${styles.key} ${styles.keySubmit}`}
                      onClick={handleSubmit}
                      disabled={digits.length < PIN_LENGTH}
                      type="button"
                      aria-label="Submit"
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  );
                }
                return (
                  <button
                    key={key}
                    className={styles.key}
                    onClick={() => handleDigit(key)}
                    type="button"
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <button className={styles.cancelButton} onClick={onCancel} type="button">
          Cancel
        </button>
      </div>
    </div>
  );
}

import styles from "./AccountList.module.scss";

interface CalendarAccount {
  id: number;
  provider: string;
  email: string;
  displayName: string;
}

interface Props {
  accounts: CalendarAccount[];
  onAddAccount: (provider: string) => void;
  onDisconnect: (accountId: number) => void;
}

export function AccountList({ accounts, onAddAccount, onDisconnect }: Props) {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Connected Accounts</h3>

      <div className={styles.addButtons}>
        <button
          className={styles.addButton}
          onClick={() => {
            navigator.vibrate?.(10);
            onAddAccount("google");
          }}
        >
          <span className={styles.providerIcon}>G</span>
          Add Google Account
        </button>
        <button
          className={styles.addButton}
          onClick={() => {
            navigator.vibrate?.(10);
            onAddAccount("microsoft");
          }}
        >
          <span className={styles.providerIcon}>M</span>
          Add Microsoft Account
        </button>
      </div>

      {accounts.length === 0 ? (
        <p className={styles.empty}>No accounts connected yet</p>
      ) : (
        <ul className={styles.list}>
          {accounts.map((account) => (
            <li key={account.id} className={styles.item}>
              <div className={styles.accountInfo}>
                <span className={styles.providerBadge} data-provider={account.provider}>
                  {account.provider === "google" ? "G" : "M"}
                </span>
                <div>
                  <div className={styles.displayName}>{account.displayName}</div>
                  <div className={styles.email}>{account.email}</div>
                </div>
              </div>
              <button
                className={styles.disconnectButton}
                onClick={() => onDisconnect(account.id)}
              >
                Disconnect
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

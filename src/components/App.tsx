import styles from "./App.module.scss";

export function App() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <h1 className={styles.title}>Family Dashboard</h1>
      </header>
      <main className={styles.main}>
        <p className={styles.placeholder}>Welcome home</p>
      </main>
    </div>
  );
}

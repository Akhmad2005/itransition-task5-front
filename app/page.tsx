import styles from "./page.module.css";
import HomeTable from "./components/home/table";

export default function Home() {
  return (
    <div className={styles.home}>
      <div className={styles['home-wrapper']}>
        <HomeTable />
      </div>
    </div>
  );
}

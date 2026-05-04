"use client";

import Link from "next/link";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <div className={styles.page}>
      {/* Corporate Nav */}
      <nav className={styles.nav}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" className={styles.logo}>
            <img src="/wfl-logo.png" alt="W-Production Trainee" className={styles.logoImg} />
          </Link>
          <div className={styles.navRight}>
            <span className={styles.navLabel}>W-Production Trainee</span>
          </div>
        </div>
      </nav>

      {/* Hero / Entry Point */}
      <section className={styles.hero} style={{ minHeight: "calc(100vh - 160px)" }}>
        <div className={styles.heroOverlay} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className={styles.heroContent}>
          <span className={styles.heroBadge}>Aptitude Test</span>
          <h1 className={styles.heroTitle}>
            W-Production Trainee<br />Aptitude Test
          </h1>
          <div className={styles.heroBar} />
          <p className={styles.heroSubtitle}>
            Welcome to the aptitude test for the<br />
            Production Trainee program.
          </p>
          <div className={styles.heroActions}>
            <Link href="/t/test" className={`btn btn-primary btn-lg ${styles.heroBtn}`}>
              Start the test
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px' }}><path d="m9 18 6-6-6-6" /></svg>
            </Link>
          </div>
        </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className="container">
          <p>&copy; 2026 Wilmar CLV · W-Production Trainee Program</p>
        </div>
      </footer>
    </div>
  );
}

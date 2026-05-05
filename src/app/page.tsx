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
            <span className={styles.navLabel}>W-Future Leader 2026</span>
          </div>
        </div>
      </nav>

      {/* Hero / Entry Point */}
      <section className={styles.hero} style={{ minHeight: "calc(100vh - 160px)" }}>
        <div className={styles.heroOverlay} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className={styles.heroContent} style={{ maxWidth: "800px" }}>
          <span className={styles.heroBadge}>W-FUTURE LEADER 2026</span>
          <h1 className={styles.heroTitle}>
            Back Office Trainee Program
          </h1>
          <div className={styles.heroBar} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '24px', marginBottom: '16px', color: 'var(--color-primary)' }}>
            About Wilmar-Future Leader 2026
          </h3>
          <p className={styles.heroSubtitle} style={{ textAlign: "justify", fontSize: "1rem", lineHeight: "1.6" }}>
            The W-Future Leader 2026 – Backoffice Trainee Program is designed to identify and develop the next generation of leaders in key strategic functions at Wilmar CLV, including Finance and Supply Chain Management (SCM).
            <br /><br />
            Over a structured 24-month journey, the program offers comprehensive development experience through intensive training, job rotations, and hands-on involvement in real business projects. Participants will have the opportunity to work alongside experienced professionals, gain deep insights into FMCG business operations, and develop strong strategic thinking and leadership capabilities in a dynamic, regional-scale environment. More than just a training program, W-Future Leader serves as a launchpad for high-potential talents to accelerate their growth, make a meaningful impact, and prepare for key roles within Wilmar CLV.
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
          <p>&copy; 2026 Wilmar CLV · W-Future Leader Program</p>
        </div>
      </footer>
    </div>
  );
}

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
            <img src="/wilmar.png" alt="Wilmar CLV" className={styles.logoImgWilmar} />
            <span className={styles.logoDivider} />
            <img src="/wfl-logo.png" alt="W-Future Leader" className={styles.logoImg} />
          </Link>
          <div className={styles.navRight}>
            <span className={styles.navLabel}>W-Future Leader 2026</span>
          </div>
        </div>
      </nav>

      {/* Hero / Entry Point */}
      <section className={styles.hero} style={{ minHeight: "calc(100vh - 160px)" }}>
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitleMain}>
              W-FUTURE<br />LEADER 2026
            </h1>
            <h2 className={styles.heroTitleSub}>
              Back Office Trainee Program
            </h2>
            <div className={styles.heroSlogan}>
              Shine Your Career
            </div>
            
            <div className={styles.heroActions}>
              <Link href="/t/test" className={styles.applyBtn}>
                <span className={styles.applyText}>START ASSESSMENT</span>
                <span className={styles.applyDate}>Begin Your Journey Here</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className={styles.infoSection}>
        <div className="container">
            <h3 className={styles.infoTitle}>About Wilmar-Future Leader 2026</h3>
            <div className={styles.infoBar} />
            <div className={styles.infoContent}>
              <p>The W-Future Leader 2026 – Backoffice Trainee Program is designed to identify and develop the next generation of leaders in key strategic functions at Wilmar CLV, including Finance and Supply Chain Management (SCM).</p>
              <p>Over a structured 24-month journey, the program offers comprehensive development experience through intensive training, job rotations, and hands-on involvement in real business projects. Participants will have the opportunity to work alongside experienced professionals, gain deep insights into FMCG business operations, and develop strong strategic thinking and leadership capabilities in a dynamic, regional-scale environment. More than just a training program, W-Future Leader serves as a launchpad for high-potential talents to accelerate their growth, make a meaningful impact, and prepare for key roles within Wilmar CLV.</p>
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

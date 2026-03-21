"use client";

import Link from "next/link";
import { ThemeToggle } from "./components/ThemeToggle";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <div className={styles.page}>
      {/* Corporate Nav */}
      <nav className={styles.nav}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" className={styles.logo}>
            <img
              src="/wfl-logo.png"
              alt="W-Future Leader"
              className={styles.logoImg}
            />
          </Link>
          <div className={styles.navRight}>
            <span className={styles.navLabel}>W-Future Leader</span>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>Season 2 — 2026</span>
          <h1 className={styles.heroTitle}>
            W-Future Leader<br />Production Trainee
          </h1>
          <div className={styles.heroBar} />
          <p className={styles.heroSubtitle}>
            Chương trình đào tạo nhà quản lý khối sản xuất tương lai<br />
            dành cho TOP ứng viên tài năng nhất — Wilmar CLV.
          </p>
          <div className={styles.heroActions}>
            <Link href="/t/FE2026A" className={`btn btn-accent btn-lg ${styles.heroBtn}`}>
              Bắt đầu làm bài
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Program Info */}
      <section className={styles.infoSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Lộ trình đào tạo</h2>
            <div className="gold-bar" style={{ margin: "0 auto" }} />
          </div>
          <div className={styles.infoGrid}>
            <div className={`card stagger ${styles.infoCard}`}>
              <div className={styles.infoStep}>1</div>
              <div className={styles.infoValue}>Trải nghiệm đa dạng</div>
              <div className={styles.infoLabel}>Luân chuyển qua Tinh chế, Đóng gói, QC, Lab, R&D, Kho hàng...</div>
            </div>
            <div className={`card stagger ${styles.infoCard}`}>
              <div className={styles.infoStep}>2</div>
              <div className={styles.infoValue}>Đương đầu thử thách</div>
              <div className={styles.infoLabel}>Thực chiến với sự hướng dẫn từ đồng nghiệp dày dặn kinh nghiệm</div>
            </div>
            <div className={`card stagger ${styles.infoCard}`}>
              <div className={styles.infoStep}>3</div>
              <div className={styles.infoValue}>Về đích rực rỡ</div>
              <div className={styles.infoLabel}>Trở thành "chiến binh" Wilmar CLV thực thụ</div>
            </div>
          </div>
        </div>
      </section>

      {/* Test Info */}
      <section style={{ padding: "var(--space-3xl) 0", background: "var(--color-bg-primary)" }}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Về bài test</h2>
            <div className="gold-bar" style={{ margin: "0 auto" }} />
          </div>
          <div className={styles.infoGrid}>
            <div className={`card stagger ${styles.infoCard}`}>
              <div className={styles.infoIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></svg>
              </div>
              <div className={styles.infoValue}>3 bộ đề</div>
              <div className={styles.infoLabel}>Marketing · Sales · Kỹ thuật</div>
            </div>
            <div className={`card stagger ${styles.infoCard}`}>
              <div className={styles.infoIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              </div>
              <div className={styles.infoValue}>20–25 phút</div>
              <div className={styles.infoLabel}>Thời gian mỗi bộ</div>
            </div>
            <div className={`card stagger ${styles.infoCard}`}>
              <div className={styles.infoIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              </div>
              <div className={styles.infoValue}>Ban giám khảo</div>
              <div className={styles.infoLabel}>Kết quả được gửi sau bởi ban giám khảo</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className="container">
          <p>&copy; 2026 Wilmar CLV · W-Future Leader Production Trainee Season 2</p>
        </div>
      </footer>
    </div>
  );
}

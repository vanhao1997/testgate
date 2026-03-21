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
        <div className={styles.heroImage}>
          <img
            src="/wilmar-team.png"
            alt="W-Future Leader Team"
            className={styles.heroImg}
          />
        </div>
      </section>

      {/* About Program */}
      <section className={styles.aboutSection}>
        <div className="container">
          <div className={styles.aboutGrid}>
            <div className={styles.aboutImage}>
              <img
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop&q=80"
                alt="Sản xuất hiện đại"
                className={styles.aboutImg}
              />
              <div className={styles.aboutImageOverlay}>
                <span>Wilmar CLV</span>
              </div>
            </div>
            <div className={styles.aboutContent}>
              <span className={styles.aboutBadge}>Giới thiệu chương trình</span>
              <h2 className={styles.aboutTitle}>W-Future Leader là gì?</h2>
              <div className="gold-bar" />
              <p className={styles.aboutDesc}>
                <strong>W-Future Leader — Production Trainee</strong> là chương trình tuyển dụng và đào tạo đặc biệt
                của <strong>Wilmar CLV</strong>, nhằm tìm kiếm và phát triển những nhà quản lý sản xuất tương lai.
              </p>
              <p className={styles.aboutDesc}>
                Ứng viên được chọn sẽ trải qua quá trình đào tạo bài bản tại các nhà máy của Wilmar,
                luân chuyển qua nhiều bộ phận, và được mentor bởi đội ngũ lãnh đạo dày dặn kinh nghiệm.
              </p>
              <div className={styles.aboutStats}>
                <div className={styles.aboutStat}>
                  <div className={styles.aboutStatNum}>18</div>
                  <div className={styles.aboutStatLabel}>tháng đào tạo</div>
                </div>
                <div className={styles.aboutStat}>
                  <div className={styles.aboutStatNum}>6+</div>
                  <div className={styles.aboutStatLabel}>bộ phận luân chuyển</div>
                </div>
                <div className={styles.aboutStat}>
                  <div className={styles.aboutStatNum}>100%</div>
                  <div className={styles.aboutStatLabel}>được mentor 1-1</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Training Roadmap */}
      <section className={styles.infoSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Lộ trình đào tạo</h2>
            <div className="gold-bar" style={{ margin: "0 auto" }} />
            <p className={styles.sectionSubtitle}>3 giai đoạn phát triển toàn diện trở thành nhà quản lý sản xuất</p>
          </div>
          <div className={styles.roadmapGrid}>
            <div className={`card stagger ${styles.roadmapCard}`}>
              <div className={styles.roadmapPhase}>Giai đoạn 1</div>
              <div className={styles.roadmapIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
              </div>
              <h3 className={styles.roadmapTitle}>Trải nghiệm đa dạng</h3>
              <p className={styles.roadmapDesc}>
                Luân chuyển qua các bộ phận: Tinh chế, Đóng gói, QC, Lab, R&D,
                Kho hàng... để hiểu toàn bộ quy trình sản xuất.
              </p>
              <div className={styles.roadmapDuration}>6 tháng</div>
            </div>
            <div className={`card stagger ${styles.roadmapCard}`}>
              <div className={styles.roadmapPhase}>Giai đoạn 2</div>
              <div className={styles.roadmapIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-dark)" strokeWidth="1.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>
              </div>
              <h3 className={styles.roadmapTitle}>Đương đầu thử thách</h3>
              <p className={styles.roadmapDesc}>
                Thực chiến với các dự án cải tiến quy trình, quản lý nhóm nhỏ,
                được hướng dẫn bởi đồng nghiệp dày dặn kinh nghiệm.
              </p>
              <div className={styles.roadmapDuration}>6 tháng</div>
            </div>
            <div className={`card stagger ${styles.roadmapCard}`}>
              <div className={styles.roadmapPhase}>Giai đoạn 3</div>
              <div className={styles.roadmapIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M6 9a9 9 0 0 0 6 13 9 9 0 0 0 6-13M6 9h12M12 2v3" /></svg>
              </div>
              <h3 className={styles.roadmapTitle}>Về đích rực rỡ</h3>
              <p className={styles.roadmapDesc}>
                Trở thành &quot;chiến binh&quot; Wilmar CLV thực thụ, đảm nhận vị trí
                quản lý sản xuất, dẫn dắt đội ngũ vận hành.
              </p>
              <div className={styles.roadmapDuration}>6 tháng</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className={styles.benefitsSection}>
        <div className="container">
          <div className={styles.benefitsGrid}>
            <div className={styles.benefitsContent}>
              <span className={styles.aboutBadge}>Quyền lợi</span>
              <h2 className={styles.aboutTitle}>Tại sao chọn W-Future Leader?</h2>
              <div className="gold-bar" />
              <ul className={styles.benefitsList}>
                <li className={styles.benefitItem}>
                  <div className={styles.benefitIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2"><path d="m9 12 2 2 4-4" /><circle cx="12" cy="12" r="10" /></svg>
                  </div>
                  <div>
                    <strong>Lương cạnh tranh</strong> — Mức lương hấp dẫn từ ngày đầu tiên, cùng đầy đủ phụ cấp
                  </div>
                </li>
                <li className={styles.benefitItem}>
                  <div className={styles.benefitIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2"><path d="m9 12 2 2 4-4" /><circle cx="12" cy="12" r="10" /></svg>
                  </div>
                  <div>
                    <strong>Đào tạo bài bản</strong> — Chương trình training chuyên sâu, chứng chỉ quốc tế
                  </div>
                </li>
                <li className={styles.benefitItem}>
                  <div className={styles.benefitIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2"><path d="m9 12 2 2 4-4" /><circle cx="12" cy="12" r="10" /></svg>
                  </div>
                  <div>
                    <strong>Lộ trình thăng tiến rõ ràng</strong> — Cơ hội lên quản lý sau 18 tháng
                  </div>
                </li>
                <li className={styles.benefitItem}>
                  <div className={styles.benefitIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2"><path d="m9 12 2 2 4-4" /><circle cx="12" cy="12" r="10" /></svg>
                  </div>
                  <div>
                    <strong>Môi trường quốc tế</strong> — Tập đoàn đa quốc gia, network khắp Đông Nam Á
                  </div>
                </li>
                <li className={styles.benefitItem}>
                  <div className={styles.benefitIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2"><path d="m9 12 2 2 4-4" /><circle cx="12" cy="12" r="10" /></svg>
                  </div>
                  <div>
                    <strong>Mentor 1-1</strong> — Được kèm cặp trực tiếp bởi lãnh đạo cấp cao
                  </div>
                </li>
              </ul>
            </div>
            <div className={styles.benefitsImage}>
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=500&fit=crop&q=80"
                alt="Đào tạo tại Wilmar"
                className={styles.aboutImg}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className={styles.reqSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Yêu cầu ứng viên</h2>
            <div className="gold-bar" style={{ margin: "0 auto" }} />
          </div>
          <div className={styles.reqGrid}>
            <div className={`card ${styles.reqCard}`}>
              <div className={styles.reqIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 2 4 3 6 3s6-1 6-3v-5" /></svg>
              </div>
              <h3 className={styles.reqTitle}>Trình độ</h3>
              <p className={styles.reqDesc}>Tốt nghiệp Đại học chuyên ngành Công nghệ thực phẩm, Hóa học, Kỹ thuật hoặc các ngành liên quan</p>
            </div>
            <div className={`card ${styles.reqCard}`}>
              <div className={styles.reqIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /><path d="m9 16 2 2 4-4" /></svg>
              </div>
              <h3 className={styles.reqTitle}>Kinh nghiệm</h3>
              <p className={styles.reqDesc}>Sinh viên mới tốt nghiệp hoặc có dưới 2 năm kinh nghiệm trong lĩnh vực sản xuất</p>
            </div>
            <div className={`card ${styles.reqCard}`}>
              <div className={styles.reqIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="m2 12 5.1 2.8L12 2l4.9 12.8L22 12" /></svg>
              </div>
              <h3 className={styles.reqTitle}>Kỹ năng</h3>
              <p className={styles.reqDesc}>Giao tiếp tốt, tinh thần học hỏi cao, chịu được áp lực, sẵn sàng làm việc theo ca</p>
            </div>
            <div className={`card ${styles.reqCard}`}>
              <div className={styles.reqIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5"><circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 1 0-16 0" /></svg>
              </div>
              <h3 className={styles.reqTitle}>Độ tuổi</h3>
              <p className={styles.reqDesc}>Từ 22 – 28 tuổi, có khát khao phát triển sự nghiệp trong ngành sản xuất FMCG</p>
            </div>
          </div>
        </div>
      </section>

      {/* Company Showcase */}
      <section className={styles.showcaseSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Về Wilmar CLV</h2>
            <div className="gold-bar" style={{ margin: "0 auto" }} />
            <p className={styles.sectionSubtitle}>Một trong những tập đoàn nông nghiệp lớn nhất châu Á</p>
          </div>
          <div className={styles.showcaseGrid}>
            <div className={styles.showcaseItem}>
              <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=280&fit=crop&q=80" alt="Nhà máy hiện đại" className={styles.showcaseImg} />
              <div className={styles.showcaseCaption}>Nhà máy sản xuất hiện đại</div>
            </div>
            <div className={styles.showcaseItem}>
              <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=280&fit=crop&q=80" alt="Đội ngũ chuyên nghiệp" className={styles.showcaseImg} />
              <div className={styles.showcaseCaption}>Đội ngũ chuyên nghiệp</div>
            </div>
            <div className={styles.showcaseItem}>
              <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=280&fit=crop&q=80" alt="Môi trường làm việc" className={styles.showcaseImg} />
              <div className={styles.showcaseCaption}>Môi trường làm việc năng động</div>
            </div>
          </div>
          <div className={styles.companyStats}>
            <div className={styles.companyStat}>
              <div className={styles.companyStatNum}>500+</div>
              <div className={styles.companyStatLabel}>Nhà máy toàn cầu</div>
            </div>
            <div className={styles.companyStat}>
              <div className={styles.companyStatNum}>100,000+</div>
              <div className={styles.companyStatLabel}>Nhân viên</div>
            </div>
            <div className={styles.companyStat}>
              <div className={styles.companyStatNum}>50+</div>
              <div className={styles.companyStatLabel}>Quốc gia hoạt động</div>
            </div>
            <div className={styles.companyStat}>
              <div className={styles.companyStatNum}>#1</div>
              <div className={styles.companyStatLabel}>Dầu thực vật châu Á</div>
            </div>
          </div>
        </div>
      </section>

      {/* Test Info */}
      <section className={styles.testInfoSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle} style={{ color: "#fff" }}>Về bài test sàng lọc</h2>
            <div className="gold-bar" style={{ margin: "0 auto" }} />
          </div>
          <div className={styles.testInfoGrid}>
            <div className={styles.testInfoCard}>
              <div className={styles.testInfoIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></svg>
              </div>
              <div className={styles.testInfoValue}>3 bộ đề</div>
              <div className={styles.testInfoLabel}>Marketing · Sales · Kỹ thuật</div>
            </div>
            <div className={styles.testInfoCard}>
              <div className={styles.testInfoIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              </div>
              <div className={styles.testInfoValue}>20–25 phút</div>
              <div className={styles.testInfoLabel}>Thời gian mỗi bộ</div>
            </div>
            <div className={styles.testInfoCard}>
              <div className={styles.testInfoIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              </div>
              <div className={styles.testInfoValue}>Ban giám khảo</div>
              <div className={styles.testInfoLabel}>Kết quả được gửi sau bởi ban giám khảo</div>
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: "var(--space-2xl)" }}>
            <Link href="/t/FE2026A" className={`btn btn-accent btn-lg ${styles.heroBtn}`}>
              Bắt đầu làm bài ngay
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerContent}>
            <img src="/wfl-logo.png" alt="WFL" className={styles.footerLogo} />
            <div className={styles.footerInfo}>
              <p><strong>Wilmar Agro Việt Nam</strong></p>
              <p>Khu chế xuất Tân Thuận, Quận 7, TP. Hồ Chí Minh</p>
              <p>Website: <a href="https://www.wilmar-agro.com.vn" target="_blank" rel="noreferrer" style={{ color: "var(--color-primary)" }}>wilmar-agro.com.vn</a></p>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>&copy; 2026 Wilmar CLV · W-Future Leader Production Trainee Season 2</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

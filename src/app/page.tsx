import Link from "next/link";
import styles from "./page.module.css";

export default function LandingPage() {
  return (
    <>
      {/* Navigation */}
      <nav className={styles["landing-nav"]}>
        <div className="container">
          <Link href="/" className={styles["logo"]}>
            <span className={styles["logo-icon"]}>⚡</span>
            <span className={styles["logo-text"]}>TestGate</span>
          </Link>
          <div className={styles["nav-links"]}>
            <a href="#features">Tính năng</a>
            <a href="#how-it-works">Cách hoạt động</a>
            <Link href="/login" className="btn btn-secondary">Đăng nhập</Link>
            <Link href="/register" className="btn btn-primary">Dùng thử miễn phí</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles["hero"]}>
        <div className={`${styles["hero-bg-orb"]} ${styles["hero-bg-orb-1"]}`}></div>
        <div className={`${styles["hero-bg-orb"]} ${styles["hero-bg-orb-2"]}`}></div>
        <div className={styles["hero-content"]}>
          <div className={styles["hero-badge"]}>🚀 Nền tảng #1 cho sàng lọc ứng viên</div>
          <h1>
            Tìm đúng người,
            <br />
            <span className={styles["gradient-text"]}>nhanh hơn 10 lần</span>
          </h1>
          <p className={styles["hero-desc"]}>
            Tạo bài test chuyên môn trong 5 phút. Gửi link cho ứng viên.
            Hệ thống tự chấm điểm và xếp hạng. Chỉ gặp những người xứng đáng nhất.
          </p>
          <div className={styles["hero-actions"]}>
            <Link href="/register" className="btn btn-primary btn-lg">
              Bắt đầu miễn phí →
            </Link>
            <Link href="#how-it-works" className="btn btn-secondary btn-lg">
              Xem demo
            </Link>
          </div>
          <div className={styles["hero-stats"]}>
            <div className={styles["hero-stat"]}>
              <div className={styles["number"]}>10K+</div>
              <div className={styles["label"]}>Bài test đã tạo</div>
            </div>
            <div className={styles["hero-stat"]}>
              <div className={styles["number"]}>50K+</div>
              <div className={styles["label"]}>Ứng viên đã làm bài</div>
            </div>
            <div className={styles["hero-stat"]}>
              <div className={styles["number"]}>85%</div>
              <div className={styles["label"]}>Tiết kiệm thời gian</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles["features"]}>
        <div className="container">
          <div className={styles["section-header"]}>
            <h2>Tại sao chọn TestGate?</h2>
            <p>Giải pháp toàn diện giúp quy trình tuyển dụng của bạn chuyên nghiệp và hiệu quả hơn</p>
          </div>
          <div className={styles["features-grid"]}>
            <div className={`card card-highlight ${styles["feature-card"]}`}>
              <div className={`${styles["feature-icon"]} ${styles["feature-icon-primary"]}`}>📝</div>
              <h3>Tạo test đa dạng</h3>
              <p>Hỗ trợ trắc nghiệm, đúng/sai, tự luận ngắn. Dễ dàng tạo bài test chuyên môn cho mọi vị trí tuyển dụng.</p>
            </div>
            <div className={`card card-highlight ${styles["feature-card"]}`}>
              <div className={`${styles["feature-icon"]} ${styles["feature-icon-accent"]}`}>⚡</div>
              <h3>Tự động chấm điểm</h3>
              <p>Hệ thống chấm điểm tự động ngay khi ứng viên nộp bài. Tiết kiệm hàng giờ đánh giá thủ công.</p>
            </div>
            <div className={`card card-highlight ${styles["feature-card"]}`}>
              <div className={`${styles["feature-icon"]} ${styles["feature-icon-warning"]}`}>📊</div>
              <h3>Xếp hạng thông minh</h3>
              <p>Bảng xếp hạng trực quan, lọc theo điểm, export Excel/CSV. So sánh ứng viên một cách công bằng.</p>
            </div>
            <div className={`card card-highlight ${styles["feature-card"]}`}>
              <div className={`${styles["feature-icon"]} ${styles["feature-icon-primary"]}`}>🔗</div>
              <h3>Chia sẻ dễ dàng</h3>
              <p>Tạo link mời duy nhất cho mỗi bài test. Ứng viên không cần tạo tài khoản, chỉ cần nhấp link là làm bài.</p>
            </div>
            <div className={`card card-highlight ${styles["feature-card"]}`}>
              <div className={`${styles["feature-icon"]} ${styles["feature-icon-accent"]}`}>🛡️</div>
              <h3>Bảo mật & chống gian lận</h3>
              <p>Giới hạn thời gian, chống copy, theo dõi hành vi làm bài. Đảm bảo kết quả trung thực.</p>
            </div>
            <div className={`card card-highlight ${styles["feature-card"]}`}>
              <div className={`${styles["feature-icon"]} ${styles["feature-icon-warning"]}`}>📧</div>
              <h3>Thông báo tự động</h3>
              <p>Gửi email kết quả tự động cho ứng viên. Thông báo real-time khi có bài nộp mới.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className={styles["how-it-works"]}>
        <div className="container">
          <div className={styles["section-header"]}>
            <h2>Hoạt động như thế nào?</h2>
            <p>Chỉ 4 bước đơn giản để bắt đầu sàng lọc ứng viên</p>
          </div>
          <div className={styles["steps-grid"]}>
            <div className={`card ${styles["step-card"]}`}>
              <div className={styles["step-number"]}>1</div>
              <h3>Tạo chiến dịch</h3>
              <p>Tạo chiến dịch tuyển dụng với thông tin vị trí, mô tả công việc.</p>
            </div>
            <div className={`card ${styles["step-card"]}`}>
              <div className={styles["step-number"]}>2</div>
              <h3>Soạn bài test</h3>
              <p>Thêm câu hỏi trắc nghiệm, tự luận, đúng/sai. Cài đặt thời gian và điểm đạt.</p>
            </div>
            <div className={`card ${styles["step-card"]}`}>
              <div className={styles["step-number"]}>3</div>
              <h3>Gửi link</h3>
              <p>Chia sẻ link mời cho ứng viên qua email, tin nhắn hoặc job post.</p>
            </div>
            <div className={`card ${styles["step-card"]}`}>
              <div className={styles["step-number"]}>4</div>
              <h3>Xem kết quả</h3>
              <p>Hệ thống tự chấm điểm. Xem bảng xếp hạng và chọn ứng viên tốt nhất.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles["cta-section"]}>
        <div className="container">
          <div className={styles["cta-box"]}>
            <h2>Sẵn sàng tìm ứng viên xuất sắc?</h2>
            <p>Đăng ký miễn phí và tạo bài test đầu tiên trong 5 phút</p>
            <Link href="/register" className="btn btn-lg" style={{ background: "#fff", color: "#6366f1", fontWeight: 700 }}>
              Bắt đầu ngay →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles["landing-footer"]}>
        <div className="container">
          <p>© 2026 TestGate. Nền tảng sàng lọc ứng viên thông minh.</p>
        </div>
      </footer>
    </>
  );
}

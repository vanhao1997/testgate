"use client";

import Link from "next/link";
import { useData } from "../data-provider";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
    const { campaigns, tests, sessions, getCampaignTests, getSessionsByTest } = useData();

    const activeCampaigns = campaigns.filter((c) => c.status === "active").length;
    const totalTests = tests.length;
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter((s) => s.status === "graded").length;

    // Recent activity
    const recentSessions = [...sessions]
        .filter((s) => s.status === "graded")
        .sort((a, b) => new Date(b.submitted_at || "").getTime() - new Date(a.submitted_at || "").getTime())
        .slice(0, 5);

    return (
        <>
            <div className={styles["page-header"]}>
                <div>
                    <h1 className={styles["page-title"]}>Tổng quan</h1>
                    <p className={styles["page-subtitle"]}>Chào mừng trở lại! Đây là tổng quan hoạt động của bạn.</p>
                </div>
                <Link href="/dashboard/campaigns" className="btn btn-primary">
                    + Tạo chiến dịch mới
                </Link>
            </div>

            {/* Stats */}
            <div className={styles["stats-row"]}>
                <div className={`card ${styles["stat-card"]}`}>
                    <div className={styles["stat-card-icon"]} style={{ background: "var(--color-primary-light)" }}>🎯</div>
                    <div className={styles["stat-card-value"]}>{activeCampaigns}</div>
                    <div className={styles["stat-card-label"]}>Chiến dịch đang hoạt động</div>
                </div>
                <div className={`card ${styles["stat-card"]}`}>
                    <div className={styles["stat-card-icon"]} style={{ background: "var(--color-accent-light)" }}>📝</div>
                    <div className={styles["stat-card-value"]}>{totalTests}</div>
                    <div className={styles["stat-card-label"]}>Bài test</div>
                </div>
                <div className={`card ${styles["stat-card"]}`}>
                    <div className={styles["stat-card-icon"]} style={{ background: "var(--color-warning-light)" }}>👥</div>
                    <div className={styles["stat-card-value"]}>{totalSessions}</div>
                    <div className={styles["stat-card-label"]}>Lượt làm bài</div>
                </div>
                <div className={`card ${styles["stat-card"]}`}>
                    <div className={styles["stat-card-icon"]} style={{ background: "rgba(16, 185, 129, 0.1)" }}>✅</div>
                    <div className={styles["stat-card-value"]}>{completedSessions}</div>
                    <div className={styles["stat-card-label"]}>Đã chấm điểm</div>
                </div>
            </div>

            {/* Recent Results */}
            <div className="card" style={{ marginBottom: "var(--space-xl)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-lg)" }}>
                    <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700 }}>Kết quả gần đây</h2>
                </div>
                {recentSessions.length > 0 ? (
                    <table className={styles["data-table"]}>
                        <thead>
                            <tr>
                                <th>Ứng viên</th>
                                <th>Bài test</th>
                                <th>Điểm</th>
                                <th>Trạng thái</th>
                                <th>Thời gian nộp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentSessions.map((s) => {
                                const test = tests.find((t) => t.id === s.test_id);
                                const percentage = s.total_points > 0 ? Math.round((s.score / s.total_points) * 100) : 0;
                                const passed = test ? percentage >= test.passing_score : false;
                                return (
                                    <tr key={s.id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{s.candidate_name}</div>
                                            <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-tertiary)" }}>{s.candidate_email}</div>
                                        </td>
                                        <td>{test?.title || "-"}</td>
                                        <td>
                                            <div className={styles["score-bar-container"]}>
                                                <span style={{ fontWeight: 700, minWidth: "40px" }}>{percentage}%</span>
                                                <div className={styles["score-bar"]}>
                                                    <div
                                                        className={`${styles["score-bar-fill"]} ${passed ? styles["score-bar-pass"] : styles["score-bar-fail"]}`}
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${passed ? "badge-accent" : "badge-danger"}`}>
                                                {passed ? "Đạt" : "Không đạt"}
                                            </span>
                                        </td>
                                        <td style={{ color: "var(--color-text-tertiary)", fontSize: "var(--font-size-xs)" }}>
                                            {s.submitted_at ? new Date(s.submitted_at).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <div className={styles["empty-state"]}>
                        <div className={styles["empty-state-icon"]}>📋</div>
                        <h3>Chưa có kết quả nào</h3>
                        <p>Tạo bài test và gửi link cho ứng viên để bắt đầu nhận kết quả.</p>
                    </div>
                )}
            </div>

            {/* Campaigns overview */}
            <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-lg)" }}>
                    <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700 }}>Chiến dịch của bạn</h2>
                    <Link href="/dashboard/campaigns" className="btn btn-ghost btn-sm">Xem tất cả →</Link>
                </div>
                <div className={styles["campaigns-grid"]}>
                    {campaigns.slice(0, 3).map((campaign) => {
                        const campTests = getCampaignTests(campaign.id);
                        const campSessions = campTests.flatMap((t) => getSessionsByTest(t.id));
                        return (
                            <Link key={campaign.id} href={`/dashboard/campaigns/${campaign.id}`}>
                                <div className={`card card-highlight ${styles["campaign-card"]}`}>
                                    <div className={styles["campaign-card-header"]}>
                                        <div>
                                            <h3>{campaign.title}</h3>
                                            <div className={styles["campaign-card-position"]}>{campaign.position}</div>
                                        </div>
                                        <span className={`badge ${campaign.status === "active" ? "badge-accent" : campaign.status === "draft" ? "badge-warning" : "badge-danger"}`}>
                                            {campaign.status === "active" ? "Hoạt động" : campaign.status === "draft" ? "Nháp" : "Đã đóng"}
                                        </span>
                                    </div>
                                    <div className={styles["campaign-card-meta"]}>
                                        <span>📝 {campTests.length} bài test</span>
                                        <span>👥 {campSessions.length} ứng viên</span>
                                        <span>📅 {new Date(campaign.created_at).toLocaleDateString("vi-VN")}</span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </>
    );
}

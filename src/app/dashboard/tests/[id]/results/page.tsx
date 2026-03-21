"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useData } from "../../../../data-provider";
import styles from "../../../dashboard.module.css";

export default function TestResultsPage() {
    const params = useParams();
    const { tests, campaigns, getSessionsByTest, getTestQuestions } = useData();
    const testId = params.id as string;
    const test = tests.find((t) => t.id === testId);
    const sessions = getSessionsByTest(testId);
    const questions = getTestQuestions(testId);
    const campaign = test ? campaigns.find((c) => c.id === test.campaign_id) : null;

    if (!test) {
        return (
            <div className="card">
                <div className={styles["empty-state"]}>
                    <div className={styles["empty-state-icon"]}>❌</div>
                    <h3>Không tìm thấy bài test</h3>
                    <Link href="/dashboard/campaigns" className="btn btn-primary">← Về danh sách</Link>
                </div>
            </div>
        );
    }

    const gradedSessions = sessions
        .filter((s) => s.status === "graded")
        .sort((a, b) => b.score - a.score);

    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    const avgScore = gradedSessions.length > 0
        ? Math.round(gradedSessions.reduce((sum, s) => sum + (s.total_points > 0 ? (s.score / s.total_points) * 100 : 0), 0) / gradedSessions.length)
        : 0;
    const passCount = gradedSessions.filter((s) => s.total_points > 0 && (s.score / s.total_points) * 100 >= test.passing_score).length;

    const handleExportCSV = () => {
        const headers = ["STT", "Họ tên", "Email", "Điện thoại", "Điểm", "Phần trăm", "Kết quả", "Thời gian nộp"];
        const rows = gradedSessions.map((s, i) => {
            const pct = s.total_points > 0 ? Math.round((s.score / s.total_points) * 100) : 0;
            return [
                i + 1,
                s.candidate_name,
                s.candidate_email,
                s.candidate_phone,
                `${s.score}/${s.total_points}`,
                `${pct}%`,
                pct >= test.passing_score ? "Đạt" : "Không đạt",
                s.submitted_at ? new Date(s.submitted_at).toLocaleString("vi-VN") : "-",
            ];
        });

        const csvContent = [headers, ...rows].map((r) => r.join(",")).join("\n");
        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${test.title.replace(/\s+/g, "_")}_results.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <>
            <div style={{ marginBottom: "var(--space-sm)" }}>
                <Link href={`/dashboard/campaigns/${test.campaign_id}`} style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-tertiary)" }}>
                    ← {campaign?.title || "Chiến dịch"}
                </Link>
            </div>

            <div className={styles["page-header"]}>
                <div>
                    <h1 className={styles["page-title"]}>Kết quả: {test.title}</h1>
                    <p className={styles["page-subtitle"]}>
                        {gradedSessions.length} bài đã chấm · Điểm TB: {avgScore}% · Đạt: {passCount}/{gradedSessions.length}
                    </p>
                </div>
                <div style={{ display: "flex", gap: "var(--space-sm)" }}>
                    <Link href={`/dashboard/tests/${testId}`} className="btn btn-secondary">
                        ✏️ Sửa câu hỏi
                    </Link>
                    {gradedSessions.length > 0 && (
                        <button className="btn btn-accent" onClick={handleExportCSV}>
                            📥 Export CSV
                        </button>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className={styles["stats-row"]} style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                <div className={`card ${styles["stat-card"]}`}>
                    <div className={styles["stat-card-icon"]} style={{ background: "var(--color-primary-light)" }}>👥</div>
                    <div className={styles["stat-card-value"]}>{sessions.length}</div>
                    <div className={styles["stat-card-label"]}>Tổng lượt làm</div>
                </div>
                <div className={`card ${styles["stat-card"]}`}>
                    <div className={styles["stat-card-icon"]} style={{ background: "var(--color-accent-light)" }}>✅</div>
                    <div className={styles["stat-card-value"]}>{passCount}</div>
                    <div className={styles["stat-card-label"]}>Đạt (≥{test.passing_score}%)</div>
                </div>
                <div className={`card ${styles["stat-card"]}`}>
                    <div className={styles["stat-card-icon"]} style={{ background: "var(--color-warning-light)" }}>📊</div>
                    <div className={styles["stat-card-value"]}>{avgScore}%</div>
                    <div className={styles["stat-card-label"]}>Điểm trung bình</div>
                </div>
            </div>

            {/* Results table */}
            {gradedSessions.length > 0 ? (
                <div className="card">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-lg)" }}>
                        <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700 }}>
                            Bảng xếp hạng ứng viên
                        </h2>
                    </div>
                    <table className={styles["data-table"]}>
                        <thead>
                            <tr>
                                <th>Hạng</th>
                                <th>Ứng viên</th>
                                <th>Email</th>
                                <th>SĐT</th>
                                <th>Điểm</th>
                                <th>Kết quả</th>
                                <th>Thời gian nộp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gradedSessions.map((s, idx) => {
                                const pct = s.total_points > 0 ? Math.round((s.score / s.total_points) * 100) : 0;
                                const passed = pct >= test.passing_score;
                                return (
                                    <tr key={s.id}>
                                        <td>
                                            <span style={{
                                                display: "inline-flex", alignItems: "center", justifyContent: "center",
                                                width: 28, height: 28, borderRadius: "50%",
                                                background: idx === 0 ? "linear-gradient(135deg, #f59e0b, #d97706)" : idx === 1 ? "linear-gradient(135deg, #94a3b8, #64748b)" : idx === 2 ? "linear-gradient(135deg, #d97706, #92400e)" : "var(--color-bg-input)",
                                                color: idx < 3 ? "#fff" : "var(--color-text-secondary)",
                                                fontWeight: 700, fontSize: "var(--font-size-xs)",
                                            }}>
                                                {idx + 1}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 600 }}>{s.candidate_name}</td>
                                        <td style={{ color: "var(--color-text-secondary)" }}>{s.candidate_email}</td>
                                        <td style={{ color: "var(--color-text-secondary)" }}>{s.candidate_phone}</td>
                                        <td>
                                            <div className={styles["score-bar-container"]}>
                                                <span style={{ fontWeight: 700, minWidth: "60px" }}>{s.score}/{s.total_points}</span>
                                                <div className={styles["score-bar"]} style={{ minWidth: "80px" }}>
                                                    <div
                                                        className={`${styles["score-bar-fill"]} ${passed ? styles["score-bar-pass"] : styles["score-bar-fail"]}`}
                                                        style={{ width: `${pct}%` }}
                                                    ></div>
                                                </div>
                                                <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-tertiary)", minWidth: "35px" }}>{pct}%</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${passed ? "badge-accent" : "badge-danger"}`}>
                                                {passed ? "✓ Đạt" : "✗ Không đạt"}
                                            </span>
                                        </td>
                                        <td style={{ color: "var(--color-text-tertiary)", fontSize: "var(--font-size-xs)" }}>
                                            {s.submitted_at ? new Date(s.submitted_at).toLocaleDateString("vi-VN", {
                                                day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
                                            }) : "-"}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="card">
                    <div className={styles["empty-state"]}>
                        <div className={styles["empty-state-icon"]}>📊</div>
                        <h3>Chưa có kết quả nào</h3>
                        <p>Gửi link bài test cho ứng viên để nhận kết quả.</p>
                        <div className={styles["invite-link-box"]} style={{ maxWidth: "400px", margin: "0 auto" }}>
                            <span className={styles["invite-link-url"]}>
                                {typeof window !== "undefined" ? `${window.location.origin}/t/${test.invite_code}` : `/t/${test.invite_code}`}
                            </span>
                            <button className="btn btn-primary btn-sm" onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/t/${test.invite_code}`);
                                alert("Đã copy link!");
                            }}>
                                📋 Copy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

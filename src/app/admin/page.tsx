"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import styles from "./admin.module.css";

const ADMIN_PIN = "WFL2026";

/* ====== Types ====== */
interface Submission {
    id: string;
    candidate_name: string;
    candidate_email: string;
    candidate_phone: string;
    candidate_id: string;
    test_group: string;
    score: number;
    total_points: number;
    percentage: number;
    passed: boolean;
    answers: { qid: string; correct: boolean; points: number }[];
    submitted_at: string;
}

interface Judge {
    id: string;
    name: string;
    email: string;
    role: string;
    created_at: string;
}

interface JudgeScore {
    id: string;
    result_id: string;
    judge_id: string;
    score: number;
    notes: string;
    created_at: string;
    judges?: { name: string };
}

/* ====== Questions data (mirror from test page for display) ====== */
const QUESTIONS_MAP: Record<string, { content: string; type: string }[]> = {
    finance: [
        { content: "COGS là viết tắt của thuật ngữ kế toán nào?", type: "single_choice" },
        { content: "Báo cáo tài chính nào thể hiện tình hình lợi nhuận/lỗ của doanh nghiệp?", type: "single_choice" },
        { content: "Công thức tính Gross Profit (Lợi nhuận gộp)?", type: "single_choice" },
        { content: "Trong phân tích tài chính, ROI (Return on Investment) được tính bằng?", type: "single_choice" },
        { content: "Tổng doanh thu của một công ty bao gồm?", type: "multiple_choice" },
        { content: "Những chỉ số nào thuộc nhóm chỉ số thanh khoản?", type: "multiple_choice" },
        { content: "Khấu hao (Depreciation) là chi phí không bằng tiền mặt.", type: "true_false" },
        { content: "Trong ngành sản xuất, Working Capital (Vốn lưu động) âm luôn là dấu hiệu xấu.", type: "true_false" },
        { content: "Trình bày ngắn gọn quy trình lập ngân sách (Budgeting) cơ bản.", type: "short_answer" },
        { content: "Giải thích sự khác biệt giữa OPEX và CAPEX.", type: "short_answer" },
        { content: "Khi gặp vấn đề phức tạp, bạn ưu tiên làm gì đầu tiên?", type: "single_choice" },
        { content: "PDCA trong cải tiến liên tục là viết tắt của gì?", type: "single_choice" },
        { content: "Tư duy Growth Mindset khác Fixed Mindset ở điểm nào?", type: "single_choice" },
        { content: "Kaizen có nghĩa là cải tiến liên tục từng bước nhỏ.", type: "true_false" },
        { content: "Phẩm chất quan trọng nhất của nhà quản lý sản xuất tương lai?", type: "short_answer" },
    ],
    "sc-planning": [
        { content: "S&OP (Sales and Operations Planning) nhằm mục đích gì?", type: "single_choice" },
        { content: "Demand Forecasting sử dụng phương pháp nào?", type: "single_choice" },
        { content: "Safety Stock (Tồn kho an toàn) giúp gì?", type: "single_choice" },
        { content: "MRP (Material Requirements Planning) tính toán dựa trên?", type: "single_choice" },
        { content: "Yếu tố nào ảnh hưởng đến Demand Forecasting?", type: "multiple_choice" },
        { content: "KPI nào đo lường hiệu quả quản lý tồn kho?", type: "multiple_choice" },
        { content: "EOQ giúp tối ưu chi phí đặt hàng và lưu kho.", type: "true_false" },
        { content: "JIT yêu cầu giữ tồn kho lớn để đảm bảo sản xuất.", type: "true_false" },
        { content: "Trình bày ngắn gọn quy trình S&OP.", type: "short_answer" },
        { content: "Giải thích Bullwhip Effect trong chuỗi cung ứng.", type: "short_answer" },
        { content: "Khi làm việc nhóm, điều quan trọng nhất?", type: "single_choice" },
        { content: "5S trong quản lý sản xuất bao gồm?", type: "single_choice" },
        { content: "KPI là viết tắt của gì?", type: "single_choice" },
        { content: "Lean Manufacturing tập trung loại bỏ lãng phí.", type: "true_false" },
        { content: "Xử lý thế nào khi nhận phản hồi tiêu cực từ cấp trên?", type: "short_answer" },
    ],
    "sc-logistics": [
        { content: "3PL (Third-Party Logistics) là gì?", type: "single_choice" },
        { content: "Cross-docking trong logistics giúp gì?", type: "single_choice" },
        { content: "WMS (Warehouse Management System) quản lý gì?", type: "single_choice" },
        { content: "Incoterms 2020 quy định điều gì?", type: "single_choice" },
        { content: "FIFO trong quản lý kho nghĩa là?", type: "single_choice" },
        { content: "Phương thức vận tải nào thường dùng trong logistics?", type: "multiple_choice" },
        { content: "Last Mile Delivery là giai đoạn vận chuyển từ nhà máy đến kho trung chuyển.", type: "true_false" },
        { content: "TMS giúp tối ưu điều gì?", type: "single_choice" },
        { content: "Chỉ số OTD (On-Time Delivery) đo lường điều gì?", type: "single_choice" },
        { content: "Sự khác biệt giữa Reverse và Forward Logistics.", type: "short_answer" },
        { content: "Khi môi trường kinh doanh thay đổi nhanh, kỹ năng nào quan trọng nhất?", type: "single_choice" },
        { content: "An toàn lao động tại nhà máy là trách nhiệm của ai?", type: "single_choice" },
        { content: "Phương pháp 5 Whys được sử dụng để làm gì?", type: "single_choice" },
        { content: "ERP là hệ thống tích hợp quản lý toàn bộ nguồn lực doanh nghiệp.", type: "true_false" },
        { content: "Bạn hiểu thế nào về tư duy chủ động (proactive mindset)?", type: "short_answer" },
    ],
};

export default function AdminPage() {
    const [authed, setAuthed] = useState(false);
    const [pin, setPin] = useState("");
    const [pinError, setPinError] = useState("");
    const [activeTab, setActiveTab] = useState<"dashboard" | "submissions" | "judges">("dashboard");

    // Data
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [judges, setJudges] = useState<Judge[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [filterGroup, setFilterGroup] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchText, setSearchText] = useState("");

    // Detail panel
    const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
    const [subScores, setSubScores] = useState<JudgeScore[]>([]);
    const [scoreInput, setScoreInput] = useState("");
    const [notesInput, setNotesInput] = useState("");
    const [saving, setSaving] = useState(false);

    // Add judge form
    const [newJudgeName, setNewJudgeName] = useState("");
    const [newJudgeEmail, setNewJudgeEmail] = useState("");
    const [newJudgeRole, setNewJudgeRole] = useState("judge");

    // Load data
    const loadData = useCallback(async () => {
        setLoading(true);
        const [subRes, judgeRes] = await Promise.all([
            supabase.from("test_results").select("*").order("submitted_at", { ascending: false }),
            supabase.from("judges").select("*").order("created_at", { ascending: true }),
        ]);
        if (subRes.data) setSubmissions(subRes.data as Submission[]);
        if (judgeRes.data) setJudges(judgeRes.data as Judge[]);
        setLoading(false);
    }, []);

    useEffect(() => {
        if (authed) loadData();
    }, [authed, loadData]);

    // Load scores for selected submission
    useEffect(() => {
        if (!selectedSub) return;
        (async () => {
            const { data } = await supabase
                .from("judge_scores")
                .select("*, judges(name)")
                .eq("result_id", selectedSub.id);
            if (data) setSubScores(data as JudgeScore[]);
        })();
    }, [selectedSub]);

    // Login
    const handleLogin = () => {
        if (pin === ADMIN_PIN) {
            setAuthed(true);
            setPinError("");
        } else {
            setPinError("Mã PIN không đúng");
        }
    };

    // Submit score
    const handleScore = async () => {
        if (!selectedSub || !scoreInput) return;
        setSaving(true);
        const adminJudge = judges.find(j => j.role === "admin") || judges[0];
        if (!adminJudge) { setSaving(false); return; }

        await supabase.from("judge_scores").upsert({
            result_id: selectedSub.id,
            judge_id: adminJudge.id,
            score: parseInt(scoreInput),
            notes: notesInput,
        }, { onConflict: "result_id,judge_id" });

        // Reload scores
        const { data } = await supabase
            .from("judge_scores")
            .select("*, judges(name)")
            .eq("result_id", selectedSub.id);
        if (data) setSubScores(data as JudgeScore[]);
        setSaving(false);
        setScoreInput("");
        setNotesInput("");
    };

    // Add judge
    const handleAddJudge = async () => {
        if (!newJudgeName || !newJudgeEmail) return;
        await supabase.from("judges").insert({
            name: newJudgeName,
            email: newJudgeEmail,
            role: newJudgeRole,
        });
        setNewJudgeName("");
        setNewJudgeEmail("");
        loadData();
    };

    // Delete judge
    const handleDeleteJudge = async (id: string) => {
        if (!confirm("Xóa giám khảo này?")) return;
        await supabase.from("judges").delete().eq("id", id);
        loadData();
    };

    // Stats
    const totalSubs = submissions.length;
    const groupCounts = {
        finance: submissions.filter(s => s.test_group === "finance").length,
        "sc-planning": submissions.filter(s => s.test_group === "sc-planning").length,
        "sc-logistics": submissions.filter(s => s.test_group === "sc-logistics").length,
    };
    const avgPct = totalSubs > 0 ? Math.round(submissions.reduce((a, s) => a + s.percentage, 0) / totalSubs) : 0;
    const passRate = totalSubs > 0 ? Math.round(submissions.filter(s => s.passed).length / totalSubs * 100) : 0;

    // Filter submissions
    const filtered = submissions.filter(s => {
        if (filterGroup !== "all" && s.test_group !== filterGroup) return false;
        if (searchText) {
            const q = searchText.toLowerCase();
            if (!s.candidate_name.toLowerCase().includes(q) &&
                !s.candidate_email.toLowerCase().includes(q) &&
                !(s.candidate_id || "").toLowerCase().includes(q)) return false;
        }
        return true;
    });

    const groupBadge = (g: string) => {
        if (g === "finance") return styles.badgeFinance;
        if (g === "sc-planning") return styles.badgePlanning;
        return styles.badgeLogistics;
    };

    const groupLabel = (g: string) => {
        if (g === "finance") return "Finance";
        if (g === "sc-planning") return "SC Planning";
        return "SC Logistics";
    };

    // ==================== LOGIN ====================
    if (!authed) {
        return (
            <div className={styles.loginPage}>
                <div className={styles.loginCard}>
                    <img src="/wfl-logo.png" alt="WFL" />
                    <h1>Admin Dashboard</h1>
                    <p>Nhập mã PIN để truy cập hệ thống quản lý</p>
                    <input
                        className={styles.loginInput}
                        type="password"
                        placeholder="••••••"
                        value={pin}
                        onChange={e => setPin(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleLogin()}
                    />
                    <button className={styles.loginBtn} onClick={handleLogin}>Đăng nhập</button>
                    {pinError && <p className={styles.loginError}>{pinError}</p>}
                </div>
            </div>
        );
    }

    // ==================== MAIN LAYOUT ====================
    return (
        <div className={styles.adminPage}>
            {/* Nav */}
            <div className={styles.adminNav}>
                <div className={styles.adminNavLeft}>
                    <img src="/wfl-logo.png" alt="WFL" />
                    <h1>Admin Dashboard</h1>
                    <span>W-Future Leader</span>
                </div>
                <div className={styles.adminNavRight}>
                    <button onClick={() => { setAuthed(false); setPin(""); }}>Đăng xuất</button>
                </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button className={`${styles.tab} ${activeTab === "dashboard" ? styles.tabActive : ""}`} onClick={() => setActiveTab("dashboard")}>📊 Tổng quan</button>
                <button className={`${styles.tab} ${activeTab === "submissions" ? styles.tabActive : ""}`} onClick={() => setActiveTab("submissions")}>📋 Bài nộp</button>
                <button className={`${styles.tab} ${activeTab === "judges" ? styles.tabActive : ""}`} onClick={() => setActiveTab("judges")}>👨‍⚖️ Giám khảo</button>
            </div>

            {/* Content */}
            <div className={styles.content}>
                {loading ? (
                    <div className={styles.emptyState}><p>Đang tải dữ liệu...</p></div>
                ) : (
                    <>
                        {/* ====== DASHBOARD ====== */}
                        {activeTab === "dashboard" && (
                            <>
                                <div className={styles.statsGrid}>
                                    <div className={styles.statCard}>
                                        <div className={styles.statLabel}>Tổng bài nộp</div>
                                        <div className={styles.statValue}>{totalSubs}</div>
                                        <div className={styles.statSub}>ứng viên đã thi</div>
                                    </div>
                                    <div className={styles.statCard}>
                                        <div className={styles.statLabel}>Điểm trung bình</div>
                                        <div className={styles.statValue}>{avgPct}%</div>
                                        <div className={styles.statSub}>trung bình % đạt</div>
                                    </div>
                                    <div className={styles.statCard}>
                                        <div className={styles.statLabel}>Tỷ lệ đạt</div>
                                        <div className={styles.statValue}>{passRate}%</div>
                                        <div className={styles.statSub}>≥ 70% đạt chuẩn</div>
                                    </div>
                                    <div className={styles.statCard}>
                                        <div className={styles.statLabel}>Giám khảo</div>
                                        <div className={styles.statValue}>{judges.length}</div>
                                        <div className={styles.statSub}>người đang hoạt động</div>
                                    </div>
                                </div>

                                <div className={styles.tableCard}>
                                    <div className={styles.tableHeader}>
                                        <h3>Phân bổ theo nhóm thi</h3>
                                    </div>
                                    <div style={{ padding: "1.25rem" }}>
                                        <div className={styles.groupBars}>
                                            {Object.entries(groupCounts).map(([key, count]) => (
                                                <div key={key} className={styles.groupBar}>
                                                    <span className={styles.groupBarLabel}>{groupLabel(key)}</span>
                                                    <div className={styles.groupBarTrack}>
                                                        <div className={styles.groupBarFill} style={{ width: totalSubs > 0 ? `${(count / totalSubs) * 100}%` : "0%" }} />
                                                    </div>
                                                    <span className={styles.groupBarCount}>{count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Recent submissions */}
                                <div className={styles.tableCard} style={{ marginTop: "1rem" }}>
                                    <div className={styles.tableHeader}>
                                        <h3>Bài nộp gần đây</h3>
                                    </div>
                                    <table className={styles.dataTable}>
                                        <thead>
                                            <tr><th>SBD</th><th>Họ tên</th><th>Nhóm</th><th>Điểm</th><th>%</th><th>Thời gian</th></tr>
                                        </thead>
                                        <tbody>
                                            {submissions.slice(0, 5).map(s => (
                                                <tr key={s.id} onClick={() => { setSelectedSub(s); setScoreInput(""); setNotesInput(""); }}>
                                                    <td>{s.candidate_id || "—"}</td>
                                                    <td><strong>{s.candidate_name}</strong></td>
                                                    <td><span className={`${styles.badge} ${groupBadge(s.test_group)}`}>{groupLabel(s.test_group)}</span></td>
                                                    <td>{s.score}/{s.total_points}</td>
                                                    <td>{s.percentage}%</td>
                                                    <td>{new Date(s.submitted_at).toLocaleString("vi-VN")}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}

                        {/* ====== SUBMISSIONS ====== */}
                        {activeTab === "submissions" && (
                            <div className={styles.tableCard}>
                                <div className={styles.tableHeader}>
                                    <h3>Tất cả bài nộp ({filtered.length})</h3>
                                    <div className={styles.filters}>
                                        <input className={styles.filterInput} placeholder="Tìm tên, email, SBD..." value={searchText} onChange={e => setSearchText(e.target.value)} />
                                        <select className={styles.filterSelect} value={filterGroup} onChange={e => setFilterGroup(e.target.value)}>
                                            <option value="all">Tất cả nhóm</option>
                                            <option value="finance">Finance</option>
                                            <option value="sc-planning">SC Planning</option>
                                            <option value="sc-logistics">SC Logistics</option>
                                        </select>
                                    </div>
                                </div>
                                <table className={styles.dataTable}>
                                    <thead>
                                        <tr><th>SBD</th><th>Họ tên</th><th>Email</th><th>Nhóm</th><th>Điểm</th><th>%</th><th>Kết quả</th><th>Thời gian</th></tr>
                                    </thead>
                                    <tbody>
                                        {filtered.length === 0 ? (
                                            <tr><td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-tertiary)" }}>Không có bài nộp nào</td></tr>
                                        ) : filtered.map(s => (
                                            <tr key={s.id} onClick={() => { setSelectedSub(s); setScoreInput(""); setNotesInput(""); }}>
                                                <td>{s.candidate_id || "—"}</td>
                                                <td><strong>{s.candidate_name}</strong></td>
                                                <td>{s.candidate_email}</td>
                                                <td><span className={`${styles.badge} ${groupBadge(s.test_group)}`}>{groupLabel(s.test_group)}</span></td>
                                                <td>{s.score}/{s.total_points}</td>
                                                <td>{s.percentage}%</td>
                                                <td><span className={`${styles.badge} ${s.passed ? styles.badgeGraded : styles.badgePending}`}>{s.passed ? "Đạt" : "Chưa đạt"}</span></td>
                                                <td>{new Date(s.submitted_at).toLocaleString("vi-VN")}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* ====== JUDGES ====== */}
                        {activeTab === "judges" && (
                            <>
                                <div className={styles.addJudgeForm}>
                                    <h3>➕ Thêm giám khảo mới</h3>
                                    <div className={styles.addJudgeFields}>
                                        <div className="field">
                                            <label>Họ tên</label>
                                            <input placeholder="Nhập họ tên" value={newJudgeName} onChange={e => setNewJudgeName(e.target.value)} />
                                        </div>
                                        <div className="field">
                                            <label>Email</label>
                                            <input type="email" placeholder="email@wilmar.com" value={newJudgeEmail} onChange={e => setNewJudgeEmail(e.target.value)} />
                                        </div>
                                        <div className="field">
                                            <label>Vai trò</label>
                                            <select value={newJudgeRole} onChange={e => setNewJudgeRole(e.target.value)}>
                                                <option value="judge">Giám khảo</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                        <button onClick={handleAddJudge}>Thêm</button>
                                    </div>
                                </div>
                                <div className={styles.judgeGrid}>
                                    {judges.map(j => (
                                        <div key={j.id} className={styles.judgeCard}>
                                            <div className={styles.judgeInfo}>
                                                <h4>{j.name} <span className={`${styles.judgeRole} ${j.role === "admin" ? styles.roleAdmin : styles.roleJudge}`}>{j.role === "admin" ? "Admin" : "Giám khảo"}</span></h4>
                                                <p>{j.email}</p>
                                            </div>
                                            <button className={styles.deleteJudge} onClick={() => handleDeleteJudge(j.id)} title="Xóa">✕</button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>

            {/* ====== DETAIL PANEL ====== */}
            {selectedSub && (
                <div className={styles.detailOverlay} onClick={() => setSelectedSub(null)}>
                    <div className={styles.detailPanel} onClick={e => e.stopPropagation()}>
                        <div className={styles.detailHeader}>
                            <h2>Chi tiết bài nộp</h2>
                            <button className={styles.closeBtn} onClick={() => setSelectedSub(null)}>✕</button>
                        </div>
                        <div className={styles.detailBody}>
                            {/* Candidate info */}
                            <div className={styles.candidateInfo}>
                                <div className={styles.infoItem}><label>SBD</label><span>{selectedSub.candidate_id || "—"}</span></div>
                                <div className={styles.infoItem}><label>Họ tên</label><span>{selectedSub.candidate_name}</span></div>
                                <div className={styles.infoItem}><label>Email</label><span>{selectedSub.candidate_email}</span></div>
                                <div className={styles.infoItem}><label>SĐT</label><span>{selectedSub.candidate_phone || "—"}</span></div>
                                <div className={styles.infoItem}><label>Nhóm thi</label><span className={`${styles.badge} ${groupBadge(selectedSub.test_group)}`}>{groupLabel(selectedSub.test_group)}</span></div>
                                <div className={styles.infoItem}><label>Điểm tự động</label><span>{selectedSub.score}/{selectedSub.total_points} ({selectedSub.percentage}%)</span></div>
                            </div>

                            {/* Answers */}
                            <div className={styles.answersSection}>
                                <h3>📝 Câu trả lời ({(QUESTIONS_MAP[selectedSub.test_group] || []).length} câu)</h3>
                                {(QUESTIONS_MAP[selectedSub.test_group] || []).map((q, idx) => {
                                    const ansDetail = selectedSub.answers?.[idx];
                                    const answerObj = ansDetail as { qid?: string; correct?: boolean; points?: number } | undefined;
                                    return (
                                        <div key={idx} className={styles.answerItem}>
                                            <div className={styles.answerQuestion}>
                                                Câu {idx + 1}: {q.content}
                                            </div>
                                            <div className={answerObj ? styles.answerText : `${styles.answerText} ${styles.answerEmpty}`}>
                                                {answerObj ? (
                                                    <>
                                                        {answerObj.correct ? "✅" : "❌"} {answerObj.points ?? 0} điểm
                                                    </>
                                                ) : "(Chưa có dữ liệu)"}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Score form */}
                            <div className={styles.scoreForm}>
                                <h3>⭐ Chấm điểm giám khảo</h3>
                                <div className={styles.scoreInputGroup}>
                                    <div style={{ flex: "0 0 120px" }}>
                                        <label>Điểm (0-100)</label>
                                        <input type="number" min="0" max="100" value={scoreInput} onChange={e => setScoreInput(e.target.value)} placeholder="0" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label>Nhận xét</label>
                                        <textarea value={notesInput} onChange={e => setNotesInput(e.target.value)} placeholder="Ghi chú nhận xét cho ứng viên..." />
                                    </div>
                                </div>
                                <div className={styles.scoreActions}>
                                    <button className={`${styles.btnScore} ${styles.btnScorePrimary}`} onClick={handleScore} disabled={saving || !scoreInput}>
                                        {saving ? "Đang lưu..." : "Lưu điểm"}
                                    </button>
                                </div>

                                {/* Existing scores */}
                                {subScores.length > 0 && (
                                    <div className={styles.existingScores}>
                                        <h4>Điểm đã chấm</h4>
                                        {subScores.map(sc => (
                                            <div key={sc.id} className={styles.scoreEntry}>
                                                <span><strong>{sc.judges?.name || "GK"}</strong>: {sc.score} điểm</span>
                                                <span style={{ color: "var(--color-text-tertiary)", fontSize: "0.8rem" }}>{sc.notes || ""}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

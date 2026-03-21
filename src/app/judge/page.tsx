"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import styles from "./judge.module.css";

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

/* ====== Questions ====== */
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

const groupLabel = (g: string) => {
    if (g === "finance") return "Finance";
    if (g === "sc-planning") return "SC Planning";
    return "SC Logistics";
};

export default function JudgePage() {
    const [judge, setJudge] = useState<Judge | null>(null);
    const [email, setEmail] = useState("");
    const [loginError, setLoginError] = useState("");
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [filterGroup, setFilterGroup] = useState("all");
    const [searchText, setSearchText] = useState("");

    // Detail
    const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
    const [subScores, setSubScores] = useState<JudgeScore[]>([]);
    const [myScore, setMyScore] = useState("");
    const [myNotes, setMyNotes] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState("");

    // Login
    const handleLogin = async () => {
        setLoginError("");
        const { data, error } = await supabase
            .from("judges")
            .select("*")
            .eq("email", email.trim().toLowerCase())
            .single();
        if (error || !data) {
            setLoginError("Email chưa được cấp quyền giám khảo. Liên hệ Admin để được thêm.");
            return;
        }
        setJudge(data as Judge);
    };

    // Load submissions
    const loadSubmissions = useCallback(async () => {
        setLoading(true);
        const { data } = await supabase
            .from("test_results")
            .select("*")
            .order("submitted_at", { ascending: false });
        if (data) setSubmissions(data as Submission[]);
        setLoading(false);
    }, []);

    useEffect(() => {
        if (judge) loadSubmissions();
    }, [judge, loadSubmissions]);

    // Load scores for selected submission
    useEffect(() => {
        if (!selectedSub || !judge) return;
        (async () => {
            const { data } = await supabase
                .from("judge_scores")
                .select("*, judges(name)")
                .eq("result_id", selectedSub.id);
            if (data) {
                setSubScores(data as JudgeScore[]);
                // Pre-fill if judge already scored
                const mine = (data as JudgeScore[]).find(s => s.judge_id === judge.id);
                if (mine) {
                    setMyScore(String(mine.score));
                    setMyNotes(mine.notes || "");
                } else {
                    setMyScore("");
                    setMyNotes("");
                }
            }
        })();
    }, [selectedSub, judge]);

    // Submit score
    const handleScore = async () => {
        if (!selectedSub || !judge || !myScore) return;
        setSaving(true);
        setSaveMsg("");
        await supabase.from("judge_scores").upsert({
            result_id: selectedSub.id,
            judge_id: judge.id,
            score: parseInt(myScore),
            notes: myNotes,
        }, { onConflict: "result_id,judge_id" });

        const { data } = await supabase
            .from("judge_scores")
            .select("*, judges(name)")
            .eq("result_id", selectedSub.id);
        if (data) setSubScores(data as JudgeScore[]);
        setSaving(false);
        setSaveMsg("✅ Đã lưu điểm thành công!");
        setTimeout(() => setSaveMsg(""), 3000);
    };

    // Filter
    const filtered = submissions.filter(s => {
        if (filterGroup !== "all" && s.test_group !== filterGroup) return false;
        if (searchText) {
            const q = searchText.toLowerCase();
            if (!s.candidate_name.toLowerCase().includes(q) &&
                !(s.candidate_id || "").toLowerCase().includes(q)) return false;
        }
        return true;
    });

    // Check if judge already scored a submission
    const hasScored = (subId: string) => {
        // We'll track this from loaded scores when panel is open
        return false; // Simplified — full check happens in detail panel
    };

    /* ====== LOGIN ====== */
    if (!judge) {
        return (
            <div className={styles.loginPage}>
                <div className={styles.loginCard}>
                    <img src="/wfl-logo.png" alt="WFL" />
                    <h1>Cổng Giám khảo</h1>
                    <p>Nhập email đã được Admin cấp quyền</p>
                    <input
                        className={styles.loginInput}
                        type="email"
                        placeholder="email@wilmar.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleLogin()}
                    />
                    <button className={styles.loginBtn} onClick={handleLogin}>Đăng nhập</button>
                    {loginError && <p className={styles.loginError}>{loginError}</p>}
                </div>
            </div>
        );
    }

    /* ====== MAIN ====== */
    return (
        <div className={styles.judgePage}>
            {/* Nav */}
            <nav className={styles.nav}>
                <div className={styles.navLeft}>
                    <img src="/wfl-logo.png" alt="WFL" />
                    <div>
                        <h1>Chấm điểm ứng viên</h1>
                        <span>Xin chào, <strong>{judge.name}</strong></span>
                    </div>
                </div>
                <div className={styles.navRight}>
                    <span className={styles.roleBadge}>{judge.role === "admin" ? "Admin" : "Giám khảo"}</span>
                    <button onClick={() => { setJudge(null); setEmail(""); }}>Đăng xuất</button>
                </div>
            </nav>

            {/* Content */}
            <div className={styles.content}>
                {/* Stats row */}
                <div className={styles.statsRow}>
                    <div className={styles.stat}>
                        <span className={styles.statNum}>{submissions.length}</span>
                        <span className={styles.statLabel}>Tổng bài</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statNum}>{submissions.filter(s => s.test_group === "finance").length}</span>
                        <span className={styles.statLabel}>Finance</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statNum}>{submissions.filter(s => s.test_group === "sc-planning").length}</span>
                        <span className={styles.statLabel}>SC Planning</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statNum}>{submissions.filter(s => s.test_group === "sc-logistics").length}</span>
                        <span className={styles.statLabel}>SC Logistics</span>
                    </div>
                </div>

                {/* Filters */}
                <div className={styles.toolbar}>
                    <h2>Danh sách bài nộp ({filtered.length})</h2>
                    <div className={styles.filters}>
                        <input className={styles.searchInput} placeholder="Tìm tên hoặc SBD..." value={searchText} onChange={e => setSearchText(e.target.value)} />
                        <select className={styles.filterSelect} value={filterGroup} onChange={e => setFilterGroup(e.target.value)}>
                            <option value="all">Tất cả nhóm</option>
                            <option value="finance">Finance</option>
                            <option value="sc-planning">SC Planning</option>
                            <option value="sc-logistics">SC Logistics</option>
                        </select>
                    </div>
                </div>

                {/* Submissions grid */}
                {loading ? (
                    <div className={styles.empty}>Đang tải...</div>
                ) : filtered.length === 0 ? (
                    <div className={styles.empty}>Không có bài nộp nào</div>
                ) : (
                    <div className={styles.subGrid}>
                        {filtered.map(s => (
                            <div key={s.id} className={styles.subCard} onClick={() => setSelectedSub(s)}>
                                <div className={styles.subCardTop}>
                                    <div className={styles.subAvatar}>{s.candidate_name.charAt(0).toUpperCase()}</div>
                                    <div>
                                        <h3>{s.candidate_name}</h3>
                                        <p>{s.candidate_id || "Chưa có SBD"}</p>
                                    </div>
                                    <span className={`${styles.groupTag} ${styles["group_" + s.test_group.replace("-", "_")]}`}>
                                        {groupLabel(s.test_group)}
                                    </span>
                                </div>
                                <div className={styles.subCardBody}>
                                    <div className={styles.subScore}>
                                        <span className={styles.subScoreNum}>{s.score}/{s.total_points}</span>
                                        <span className={styles.subScorePct}>{s.percentage}%</span>
                                    </div>
                                    <span className={`${styles.statusBadge} ${s.passed ? styles.statusPass : styles.statusFail}`}>
                                        {s.passed ? "Đạt" : "Chưa đạt"}
                                    </span>
                                </div>
                                <div className={styles.subCardTime}>
                                    {new Date(s.submitted_at).toLocaleString("vi-VN")}
                                </div>
                                <button className={styles.gradeBtn}>📝 Chấm điểm</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ====== DETAIL PANEL ====== */}
            {selectedSub && (
                <div className={styles.overlay} onClick={() => setSelectedSub(null)}>
                    <div className={styles.panel} onClick={e => e.stopPropagation()}>
                        <div className={styles.panelHeader}>
                            <h2>📋 Bài làm của {selectedSub.candidate_name}</h2>
                            <button className={styles.closeBtn} onClick={() => setSelectedSub(null)}>✕</button>
                        </div>

                        <div className={styles.panelBody}>
                            {/* Info */}
                            <div className={styles.infoGrid}>
                                <div><label>SBD</label><span>{selectedSub.candidate_id || "—"}</span></div>
                                <div><label>Họ tên</label><span>{selectedSub.candidate_name}</span></div>
                                <div><label>Email</label><span>{selectedSub.candidate_email}</span></div>
                                <div><label>SĐT</label><span>{selectedSub.candidate_phone || "—"}</span></div>
                                <div><label>Nhóm</label><span className={`${styles.groupTag} ${styles["group_" + selectedSub.test_group.replace("-", "_")]}`}>{groupLabel(selectedSub.test_group)}</span></div>
                                <div><label>Điểm tự động</label><span><strong>{selectedSub.score}/{selectedSub.total_points}</strong> ({selectedSub.percentage}%)</span></div>
                            </div>

                            {/* Answers */}
                            <h3 className={styles.sectionTitle}>📝 Câu trả lời chi tiết</h3>
                            <div className={styles.answersList}>
                                {(QUESTIONS_MAP[selectedSub.test_group] || []).map((q, idx) => {
                                    const detail = selectedSub.answers?.[idx] as { qid?: string; correct?: boolean; points?: number } | undefined;
                                    return (
                                        <div key={idx} className={`${styles.answerItem} ${detail?.correct ? styles.answerCorrect : styles.answerWrong}`}>
                                            <div className={styles.answerQ}>
                                                <span className={styles.qNum}>Câu {idx + 1}</span>
                                                <span className={styles.qType}>{q.type === "short_answer" ? "Tự luận" : q.type === "true_false" ? "Đ/S" : q.type === "multiple_choice" ? "Nhiều đáp án" : "Trắc nghiệm"}</span>
                                            </div>
                                            <p className={styles.qContent}>{q.content}</p>
                                            <div className={styles.answerResult}>
                                                {detail ? (
                                                    <>{detail.correct ? "✅" : "❌"} <strong>{detail.points ?? 0}</strong> điểm</>
                                                ) : (
                                                    <span className={styles.noAnswer}>(Chưa có dữ liệu)</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Score form */}
                            <div className={styles.scoreSection}>
                                <h3 className={styles.sectionTitle}>⭐ Chấm điểm của bạn</h3>
                                <div className={styles.scoreRow}>
                                    <div className={styles.scoreField}>
                                        <label>Điểm (0-100)</label>
                                        <input type="number" min="0" max="100" value={myScore} onChange={e => setMyScore(e.target.value)} placeholder="0" />
                                    </div>
                                    <div className={styles.scoreField} style={{ flex: 2 }}>
                                        <label>Nhận xét</label>
                                        <textarea value={myNotes} onChange={e => setMyNotes(e.target.value)} placeholder="Ghi chú nhận xét cho ứng viên..." rows={2} />
                                    </div>
                                </div>
                                <div className={styles.scoreActions}>
                                    <button className={styles.saveBtn} onClick={handleScore} disabled={saving || !myScore}>
                                        {saving ? "Đang lưu..." : "💾 Lưu điểm"}
                                    </button>
                                    {saveMsg && <span className={styles.saveMsg}>{saveMsg}</span>}
                                </div>

                                {/* All scores from judges */}
                                {subScores.length > 0 && (
                                    <div className={styles.allScores}>
                                        <h4>Điểm từ các giám khảo</h4>
                                        {subScores.map(sc => (
                                            <div key={sc.id} className={styles.scoreItem}>
                                                <div>
                                                    <strong>{sc.judges?.name || "GK"}</strong>
                                                    {sc.judge_id === judge.id && <span className={styles.youBadge}>Bạn</span>}
                                                </div>
                                                <div className={styles.scoreItemRight}>
                                                    <span className={styles.scoreNum}>{sc.score} điểm</span>
                                                    {sc.notes && <span className={styles.scoreNote}>{sc.notes}</span>}
                                                </div>
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

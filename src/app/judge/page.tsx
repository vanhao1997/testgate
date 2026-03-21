"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import styles from "./judge.module.css";
import { ClipboardText, NotePencil, X, ChatText, Star, FloppyDisk, CheckCircle, Warning } from "@phosphor-icons/react";

/* ====== Types ====== */
interface AnswerDetail {
    qid: string;
    question: string;
    type: string;
    answer_text: string;
    correct: boolean;
    points: number;
    max_points: number;
}

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
    answers: AnswerDetail[];
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

const groupLabel = (g: string) => {
    if (g === "finance") return "Finance";
    if (g === "sc-planning") return "SC Planning";
    return "SC Logistics";
};

const typeLabel = (t: string) => {
    if (t === "short_answer") return "Tự luận";
    if (t === "true_false") return "Đúng/Sai";
    if (t === "multiple_choice") return "Nhiều đáp án";
    return "Trắc nghiệm";
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
    const [perQScores, setPerQScores] = useState<Record<number, string>>({});
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
                const mine = (data as JudgeScore[]).find(s => s.judge_id === judge.id);
                if (mine) {
                    // Parse per-question scores from notes if stored as JSON
                    try {
                        const parsed = JSON.parse(mine.notes);
                        if (parsed.perQ) setPerQScores(parsed.perQ);
                        setMyNotes(parsed.comment || "");
                    } catch {
                        setMyNotes(mine.notes || "");
                        setPerQScores({});
                    }
                } else {
                    setPerQScores({});
                    setMyNotes("");
                }
            }
        })();
    }, [selectedSub, judge]);

    // Calculate total judge score
    const totalJudgeScore = Object.values(perQScores).reduce((sum, v) => sum + (parseInt(v) || 0), 0);
    const totalMaxPoints = selectedSub?.answers?.reduce((sum, a) => sum + (a.max_points || 0), 0) || 0;

    // Submit score
    const handleScore = async () => {
        if (!selectedSub || !judge) return;
        setSaving(true);
        setSaveMsg("");
        const notesData = JSON.stringify({ perQ: perQScores, comment: myNotes });
        await supabase.from("judge_scores").upsert({
            result_id: selectedSub.id,
            judge_id: judge.id,
            score: totalJudgeScore,
            notes: notesData,
        }, { onConflict: "result_id,judge_id" });

        const { data } = await supabase
            .from("judge_scores")
            .select("*, judges(name)")
            .eq("result_id", selectedSub.id);
        if (data) setSubScores(data as JudgeScore[]);
        setSaving(false);
        setSaveMsg("Đã lưu điểm thành công!");
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

            <div className={styles.content}>
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

                {loading ? (
                    <div className={styles.empty}>Đang tải...</div>
                ) : filtered.length === 0 ? (
                    <div className={styles.empty}>Không có bài nộp nào</div>
                ) : (
                    <div className={styles.subGrid}>
                        {filtered.map(s => (
                            <div key={s.id} className={styles.subCard} onClick={() => { setSelectedSub(s); setPerQScores({}); setMyNotes(""); setSaveMsg(""); }}>
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
                                <button className={styles.gradeBtn}><NotePencil size={16} /> Chấm điểm</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ====== DETAIL — MANUAL GRADING PANEL ====== */}
            {selectedSub && (
                <div className={styles.overlay} onClick={() => setSelectedSub(null)}>
                    <div className={styles.panel} onClick={e => e.stopPropagation()}>
                        <div className={styles.panelHeader}>
                            <h2><ClipboardText size={22} style={{ verticalAlign: 'middle', marginRight: 6 }} />Chấm điểm — {selectedSub.candidate_name}</h2>
                            <button className={styles.closeBtn} onClick={() => setSelectedSub(null)}><X size={20} /></button>
                        </div>

                        <div className={styles.panelBody}>
                            {/* Candidate info */}
                            <div className={styles.infoGrid}>
                                <div><label>SBD</label><span>{selectedSub.candidate_id || "—"}</span></div>
                                <div><label>Họ tên</label><span>{selectedSub.candidate_name}</span></div>
                                <div><label>Email</label><span>{selectedSub.candidate_email}</span></div>
                                <div><label>Nhóm</label><span className={`${styles.groupTag} ${styles["group_" + selectedSub.test_group.replace("-", "_")]}`}>{groupLabel(selectedSub.test_group)}</span></div>
                            </div>

                            {/* Questions + Answers + Per-Q grading */}
                            <h3 className={styles.sectionTitle}><NotePencil size={20} style={{ verticalAlign: 'middle', marginRight: 6 }} />Đọc câu trả lời và chấm điểm từng câu</h3>
                            <div className={styles.answersList}>
                                {(selectedSub.answers || []).map((a, idx) => (
                                    <div key={idx} className={styles.answerItem}>
                                        <div className={styles.answerQ}>
                                            <span className={styles.qNum}>Câu {idx + 1}</span>
                                            <span className={styles.qType}>{typeLabel(a.type)}</span>
                                            <span className={styles.qMaxPts}>{a.max_points} đ tối đa</span>
                                        </div>
                                        <p className={styles.qContent}>{a.question || `Câu hỏi #${idx + 1}`}</p>

                                        {/* Candidate's actual answer */}
                                        <div className={styles.candidateAnswer}>
                                            <label><ChatText size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />Câu trả lời của ứng viên:</label>
                                            <div className={styles.answerBox}>
                                                {a.answer_text || "(Chưa trả lời)"}
                                            </div>
                                        </div>

                                        {/* Judge score input per question */}
                                        <div className={styles.perQScore}>
                                            <label>Điểm (0-{a.max_points}):</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max={a.max_points}
                                                value={perQScores[idx] ?? ""}
                                                onChange={e => setPerQScores(prev => ({ ...prev, [idx]: e.target.value }))}
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* If old format answers (no answer_text), show fallback */}
                            {selectedSub.answers?.length > 0 && !selectedSub.answers[0]?.question && (
                                <div className={styles.oldFormatNotice}>
                                    <Warning size={18} style={{ verticalAlign: 'middle', marginRight: 4 }} />Bài này được nộp trước bản cập nhật — chưa lưu nội dung câu trả lời. Các bài nộp mới sẽ hiển thị đầy đủ.
                                </div>
                            )}

                            {/* Summary + Notes + Save */}
                            <div className={styles.scoreSection}>
                                <div className={styles.scoreSummary}>
                                    <h3><Star size={20} weight="fill" color="#f59e0b" style={{ verticalAlign: 'middle', marginRight: 6 }} />Tổng điểm của bạn: <strong>{totalJudgeScore}</strong> / {totalMaxPoints}</h3>
                                </div>
                                <div className={styles.scoreField} style={{ marginTop: "0.75rem" }}>
                                    <label>Nhận xét chung</label>
                                    <textarea value={myNotes} onChange={e => setMyNotes(e.target.value)} placeholder="Ghi nhận xét chung cho ứng viên..." rows={3} />
                                </div>
                                <div className={styles.scoreActions}>
                                    <button className={styles.saveBtn} onClick={handleScore} disabled={saving}>
                                        {saving ? "Đang lưu..." : <><FloppyDisk size={18} style={{ verticalAlign: 'middle', marginRight: 4 }} />Lưu tất cả điểm</>}
                                    </button>
                                    {saveMsg && <span className={styles.saveMsg}>{saveMsg}</span>}
                                </div>

                                {/* All judges' scores */}
                                {subScores.length > 0 && (
                                    <div className={styles.allScores}>
                                        <h4>Điểm từ các giám khảo</h4>
                                        {subScores.map(sc => (
                                            <div key={sc.id} className={styles.scoreItem}>
                                                <div>
                                                    <strong>{sc.judges?.name || "GK"}</strong>
                                                    {sc.judge_id === judge.id && <span className={styles.youBadge}>Bạn</span>}
                                                </div>
                                                <span className={styles.scoreNum}>{sc.score} điểm</span>
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

"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import Link from "next/link";
import { supabase, sendToGoogleSheet } from "../../lib/supabase";
import { ThemeToggle } from "../../components/ThemeToggle";
import styles from "../test.module.css";
import { NotePencil, Timer } from "@phosphor-icons/react";

type AnswerMap = Record<string, string | string[]>;

/* ==========================================
   Dữ liệu bộ đề được tải từ Supabase
   ========================================== */
const ICON_CLASS_MAP: Record<string, string> = {
    "finance": "group-icon-marketing",
    "sc-planning": "group-icon-sales",
    "sc-logistics": "group-icon-tech",
};

interface QuestionDef {
    id: string;
    type: "multiple_choice" | "single_choice" | "true_false" | "short_answer";
    content: string;
    points: number;
    correct_answer: string | string[];
    options?: { id: string; content: string; is_correct: boolean }[];
    image_url?: string;
}

interface TestGroup {
    id: string;
    title: string;
    description: string;
    icon: string;
    iconClass: string;
    durationMinutes: number;
    questions: QuestionDef[];
}

/* ==========================================
   Chấm điểm
   ========================================== */
function gradeAnswers(group: TestGroup, answers: AnswerMap) {
    let totalScore = 0;
    let totalPoints = 0;
    const details: { qid: string; question: string; type: string; answer_text: string; correct: boolean; points: number; max_points: number }[] = [];

    group.questions.forEach((q) => {
        totalPoints += q.points;
        const ans = answers[q.id];
        let correct = false;
        let answerText = "";

        // Build answer text
        if (Array.isArray(ans)) {
            answerText = ans.join(", ");
        } else if (ans) {
            answerText = String(ans);
        } else {
            answerText = "(Chưa trả lời)";
        }

        if (q.type === "short_answer") {
            const c = String(q.correct_answer).toLowerCase();
            const r = String(ans || "").toLowerCase();
            correct = r.length > 3 && (r.includes(c) || c.includes(r));
        } else if (q.type === "multiple_choice") {
            const correctOpts = q.options?.filter((o) => o.is_correct).map((o) => o.content).sort() || [];
            const responseArr = (Array.isArray(ans) ? ans : []).sort();
            correct = JSON.stringify(correctOpts) === JSON.stringify(responseArr);
        } else {
            const correctOpt = q.options?.find((o) => o.is_correct);
            correct = correctOpt?.content === ans;
        }

        if (correct) totalScore += q.points;
        details.push({ qid: q.id, question: q.content, type: q.type, answer_text: answerText, correct, points: correct ? q.points : 0, max_points: q.points });
    });

    return { totalScore, totalPoints, details };
}

/* ==========================================
   Component chính
   ========================================== */
export default function CandidateTestPage() {
    const [phase, setPhase] = useState<"entry" | "group" | "test">("entry");
    const [candidateName, setCandidateName] = useState("");
    const [candidateEmail, setCandidateEmail] = useState("");
    const [candidatePhone, setCandidatePhone] = useState("");
    const [candidateId, setCandidateId] = useState("");
    const [selectedGroup, setSelectedGroup] = useState<TestGroup | null>(null);
    const [answers, setAnswers] = useState<AnswerMap>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [totalTime, setTotalTime] = useState(0);
    const [saving, setSaving] = useState(false);
    const [showThankYou, setShowThankYou] = useState(false);

    // === Load test groups from Supabase ===
    const [testGroups, setTestGroups] = useState<TestGroup[]>([]);
    const [loadingGroups, setLoadingGroups] = useState(true);

    useEffect(() => {
        async function fetchGroups() {
            setLoadingGroups(true);
            const { data: groups } = await supabase
                .from("test_groups")
                .select("*")
                .eq("is_active", true)
                .order("sort_order");
            const { data: allQuestions } = await supabase
                .from("questions")
                .select("*")
                .order("sort_order");

            if (groups && allQuestions) {
                const mapped: TestGroup[] = groups.map((g: { id: string; title: string; description: string; icon: string; duration_minutes: number }) => ({
                    id: g.id,
                    title: g.title,
                    description: g.description,
                    icon: g.icon,
                    iconClass: ICON_CLASS_MAP[g.id] || "group-icon-marketing",
                    durationMinutes: g.duration_minutes,
                    questions: allQuestions
                        .filter((q: { group_id: string }) => q.group_id === g.id)
                        .map((q: { id: string; type: string; content: string; points: number; correct_answer: string; options: { id: string; content: string; is_correct: boolean }[]; image_url?: string }) => ({
                            id: q.id,
                            type: q.type as QuestionDef["type"],
                            content: q.content,
                            points: q.points,
                            correct_answer: q.type === "multiple_choice" ? (() => { try { return JSON.parse(q.correct_answer); } catch { return q.correct_answer; } })() : q.correct_answer,
                            options: q.options || [],
                            image_url: q.image_url || undefined,
                        })),
                }));
                setTestGroups(mapped);
            }
            setLoadingGroups(false);
        }
        fetchGroups();
    }, []);

    // Timer
    useEffect(() => {
        if (phase !== "test" || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) { clearInterval(timer); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [phase, timeLeft]);

    // Auto-submit
    const handleSubmit = useCallback(async () => {
        if (!selectedGroup || saving) return;
        setSaving(true);

        const { totalScore, totalPoints, details } = gradeAnswers(selectedGroup, answers);
        const pct = totalPoints > 0 ? Math.round((totalScore / totalPoints) * 100) : 0;
        const passed = pct >= 70;

        // Collect all answers with question text for judges
        const allAnswers = selectedGroup.questions.map((q) => {
            const ans = answers[q.id];
            let answerText = "";
            if (Array.isArray(ans)) {
                answerText = ans.join(", ");
            } else if (ans) {
                answerText = String(ans);
            } else {
                answerText = "(Chưa trả lời)";
            }
            return { question: q.content, answer: answerText };
        });

        // Save to Supabase + Google Sheets (score is saved for judges, NOT shown to candidate)
        const resultPayload = {
            candidate_name: candidateName,
            candidate_email: candidateEmail,
            candidate_phone: candidatePhone,
            candidate_id: candidateId,
            test_group: selectedGroup.id,
            score: totalScore,
            total_points: totalPoints,
            percentage: pct,
            passed,
        };
        try {
            await Promise.all([
                supabase.from("test_results").insert({ ...resultPayload, answers: details }),
                sendToGoogleSheet({ ...resultPayload, all_answers: allAnswers }),
            ]);
        } catch (e) {
            console.error("Failed to save:", e);
        }

        setSaving(false);
        setShowThankYou(true);
    }, [selectedGroup, answers, candidateName, candidateEmail, candidatePhone, candidateId, saving]);

    // Auto-submit when time runs out
    useEffect(() => {
        if (phase === "test" && timeLeft === 0 && totalTime > 0 && !saving && !showThankYou) {
            handleSubmit();
        }
    }, [timeLeft, phase, handleSubmit, totalTime, saving, showThankYou]);

    const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
    const timerState = timeLeft <= 30 ? "danger" : timeLeft <= 120 ? "warning" : "normal";
    const timerProgress = totalTime > 0 ? (timeLeft / totalTime) * 100 : 100;

    const handleSelectOption = (qId: string, qType: string, optContent: string) => {
        setAnswers((prev) => {
            if (qType === "multiple_choice") {
                const cur = (prev[qId] as string[]) || [];
                return { ...prev, [qId]: cur.includes(optContent) ? cur.filter((c) => c !== optContent) : [...cur, optContent] };
            }
            return { ...prev, [qId]: optContent };
        });
    };

    const isSelected = (qId: string, qType: string, optContent: string) => {
        const a = answers[qId];
        if (!a) return false;
        return qType === "multiple_choice" ? (a as string[]).includes(optContent) : a === optContent;
    };

    const questions = selectedGroup?.questions || [];
    const answeredCount = Object.keys(answers).filter((k) => {
        const a = answers[k];
        return Array.isArray(a) ? a.length > 0 : !!a;
    }).length;

    // ==================== ENTRY ====================
    if (phase === "entry") {
        const handleEntry = (e: FormEvent) => {
            e.preventDefault();
            if (candidateName && candidateEmail && candidateId) setPhase("group");
        };
        return (
            <div className={styles["test-page"]}>
                <Nav />
                <div className={styles["test-entry"]}>
                    <div className={`card ${styles["test-entry-card"]}`}>
                        <div className={styles["test-entry-header"]}>
                            <h1>W-Future Leader</h1>
                            <p>Production Trainee Season 2 — Bài test sàng lọc ứng viên</p>
                        </div>
                        <div className={styles["test-info-grid"]}>
                            <div className={styles["test-info-item"]}>
                                <div className={styles["test-info-value"]}>{loadingGroups ? "..." : `${testGroups.length} bộ đề`}</div>
                                <div className={styles["test-info-label"]}>{testGroups.map(g => g.title).join(" · ") || "Đang tải..."}</div>
                            </div>
                            <div className={styles["test-info-item"]}>
                                <div className={styles["test-info-value"]}>20–25 phút</div>
                                <div className={styles["test-info-label"]}>mỗi bộ đề</div>
                            </div>
                        </div>
                        <form onSubmit={handleEntry} style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
                            <div className="form-group">
                                <label className="form-label">Họ và tên *</label>
                                <input className="form-input" placeholder="Nhập họ tên đầy đủ" value={candidateName} onChange={(e) => setCandidateName(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email *</label>
                                <input type="email" className="form-input" placeholder="email@example.com" value={candidateEmail} onChange={(e) => setCandidateEmail(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Số điện thoại</label>
                                <input className="form-input" placeholder="0901234567" value={candidatePhone} onChange={(e) => setCandidatePhone(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Số báo danh *</label>
                                <input className="form-input" placeholder="Nhập số báo danh" value={candidateId} onChange={(e) => setCandidateId(e.target.value)} required />
                            </div>
                            <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%" }}>Tiếp tục chọn bộ đề →</button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // ==================== GROUP SELECT ====================
    if (phase === "group") {
        return (
            <div className={styles["test-page"]}>
                <Nav />
                <div className={styles["group-selection"]}>
                    <div className={styles["group-selection-header"]}>
                        <h2>Chọn bộ đề phù hợp</h2>
                        <p>Xin chào <strong>{candidateName}</strong>, hãy chọn bộ đề phù hợp với vị trí ứng tuyển</p>
                    </div>
                    <div className={styles["group-cards"]}>
                        {testGroups.map((g) => (
                            <div key={g.id} className={`card ${styles["group-card"]} ${selectedGroup?.id === g.id ? styles["group-card-selected"] : ""}`} onClick={() => setSelectedGroup(g)}>
                                <div className={`${styles["group-card-icon"]} ${styles[g.iconClass]}`}>{g.icon}</div>
                                <h3>{g.title}</h3>
                                <p>{g.description}</p>
                                <div className={styles["group-card-meta"]}>
                                    <span><NotePencil size={16} style={{ verticalAlign: 'middle', marginRight: 2 }} />{g.questions.length} câu</span>
                                    <span><Timer size={16} style={{ verticalAlign: 'middle', marginRight: 2 }} />{g.durationMinutes} phút</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className={styles["group-start-btn"]}>
                        <button className="btn btn-primary btn-lg" disabled={!selectedGroup} onClick={() => {
                            if (!selectedGroup) return;
                            setTimeLeft(selectedGroup.durationMinutes * 60);
                            setTotalTime(selectedGroup.durationMinutes * 60);
                            setPhase("test");
                        }} style={{ opacity: selectedGroup ? 1 : 0.5, minWidth: "240px" }}>
                            {selectedGroup ? `Bắt đầu bộ ${selectedGroup.title} →` : "Chọn một bộ đề để tiếp tục"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ==================== TEST ====================
    return (
        <div className={styles["test-page"]}>
            <nav className={styles["test-nav"]}>
                <div className="container">
                    <Link href="/" className={styles["test-logo"]}>
                        <img src="/wfl-logo.png" alt="W-Future Leader" style={{ height: 36, width: "auto" }} />
                    </Link>
                    <div className={styles["timer-container"]}>
                        <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-tertiary)" }}>Bộ: {selectedGroup?.title}</span>
                        <div className={`${styles["timer-box"]} ${timerState === "warning" ? styles["timer-box-warning"] : timerState === "danger" ? styles["timer-box-danger"] : ""}`}>
                            <span className={styles["timer-icon"]}><Timer size={18} /></span>{formatTime(timeLeft)}
                        </div>
                    </div>
                </div>
            </nav>
            <div className={styles["test-content"]}>
                <div className={styles["test-progress"]}>
                    <div className={styles["test-progress-bar"]}>
                        <div className={styles["test-progress-fill"]} style={{ width: `${questions.length > 0 ? (answeredCount / questions.length) * 100 : 0}%` }}></div>
                    </div>
                    <div className={styles["test-progress-text"]}>
                        <span>Đã trả lời: {answeredCount}/{questions.length}</span>
                        <span>{selectedGroup?.title} • {questions.length} câu</span>
                    </div>
                </div>
                {questions.map((q, idx) => (
                    <div key={q.id} className={styles["test-question"]}>
                        <div className={`card ${styles["test-question-card"]}`}>
                            <div className={styles["test-question-header"]}>
                                <div className={styles["test-question-num"]}>{idx + 1}</div>
                                <span className={`badge ${q.type === "multiple_choice" ? "badge-accent" : q.type === "true_false" ? "badge-warning" : q.type === "short_answer" ? "badge-danger" : "badge-primary"}`}>
                                    {q.type === "single_choice" ? "Một đáp án" : q.type === "multiple_choice" ? "Nhiều đáp án" : q.type === "true_false" ? "Đúng/Sai" : "Tự luận"}
                                </span>

                            </div>
                            <div className={styles["test-question-text"]}>{q.content}</div>
                            {q.image_url && (
                                <div className={styles["test-question-image"]}>
                                    <img src={q.image_url} alt={`Minh họa câu ${idx + 1}`} />
                                </div>
                            )}
                            {q.type !== "short_answer" && q.options ? (
                                <div className={styles["test-options"]}>
                                    {q.options.map((opt) => (
                                        <div key={opt.id} className={`${styles["test-option"]} ${isSelected(q.id, q.type, opt.content) ? styles["test-option-selected"] : ""}`} onClick={() => handleSelectOption(q.id, q.type, opt.content)}>
                                            <div className={q.type === "multiple_choice" ? styles["test-option-checkbox"] : styles["test-option-radio"]}></div>
                                            <span>{opt.content}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <textarea className={`form-input ${styles["test-short-answer"]}`} placeholder="Nhập câu trả lời của bạn..." value={(answers[q.id] as string) || ""} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} />
                            )}
                        </div>
                    </div>
                ))}
                <div className={styles["test-submit-area"]}>
                    <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>{answeredCount}/{questions.length} câu đã trả lời</span>
                    <button className="btn btn-primary btn-lg" disabled={saving} onClick={() => handleSubmit()}>{saving ? "Đang nộp..." : "Nộp bài →"}</button>
                </div>
            </div>

            {/* Floating Timer */}
            <div className={`${styles["floating-timer"]} ${timerState === "warning" ? styles["floating-timer-warning"] : timerState === "danger" ? styles["floating-timer-danger"] : ""}`}>
                <div className={styles["floating-timer-label"]}>Thời gian</div>
                <div className={`${styles["floating-timer-value"]} ${timerState === "warning" ? styles["floating-timer-value-warning"] : timerState === "danger" ? styles["floating-timer-value-danger"] : ""}`}>{formatTime(timeLeft)}</div>
                <div className={styles["floating-timer-progress"]}>
                    <div className={`${styles["floating-timer-progress-fill"]} ${timerState === "warning" ? styles["floating-timer-progress-fill-warning"] : timerState === "danger" ? styles["floating-timer-progress-fill-danger"] : styles["floating-timer-progress-fill-normal"]}`} style={{ width: `${timerProgress}%` }}></div>
                </div>
            </div>

            {/* Thank You Popup */}
            {showThankYou && (
                <div style={{
                    position: "fixed", inset: 0, zIndex: 9999,
                    background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "var(--space-xl)",
                    animation: "fadeIn 0.3s ease"
                }}>
                    <div className="card animate-fade-in-up" style={{
                        maxWidth: 480, width: "100%", padding: "var(--space-2xl) var(--space-2xl) var(--space-xl)",
                        textAlign: "center"
                    }}>
                        <img
                            src="/wfl-logo.png"
                            alt="W-Future Leader"
                            style={{ height: 48, margin: "0 auto var(--space-lg)" }}
                        />
                        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--font-size-2xl)", fontWeight: 800, marginBottom: "var(--space-xs)", color: "var(--color-primary)" }}>
                            Cảm ơn bạn!
                        </h2>
                        <div className="gold-bar" style={{ margin: "0 auto var(--space-lg)" }} />
                        <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-sm)", lineHeight: 1.8, marginBottom: "var(--space-xl)" }}>
                            Bài làm của bạn đã được ghi nhận thành công.<br />
                            Kết quả sẽ được <strong style={{ color: "var(--color-text-primary)" }}>ban giám khảo</strong> đánh giá<br />
                            và gửi lại qua email trong thời gian sớm nhất.
                        </p>
                        <div style={{
                            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)",
                            padding: "var(--space-lg)", background: "var(--color-bg-secondary)",
                            borderRadius: "var(--radius-md)", marginBottom: "var(--space-xl)"
                        }}>
                            <div>
                                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "var(--font-size-sm)" }}>{candidateName}</div>
                                <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-tertiary)" }}>Ứng viên</div>
                            </div>
                            <div>
                                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "var(--font-size-sm)" }}>{selectedGroup?.title}</div>
                                <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-tertiary)" }}>Bộ đề</div>
                            </div>
                        </div>
                        <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-tertiary)", marginBottom: "var(--space-lg)" }}>
                            W-Future Leader — Production Trainee Season 2
                        </p>
                        <Link href="/" className="btn btn-primary" style={{ width: "100%" }}>
                            Quay lại trang chủ
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

function Nav() {
    return (
        <nav className={styles["test-nav"]}>
            <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Link href="/" className={styles["test-logo"]}>
                    <img src="/wfl-logo.png" alt="W-Future Leader" style={{ height: 40, width: "auto" }} />
                </Link>
                <ThemeToggle />
            </div>
        </nav>
    );
}

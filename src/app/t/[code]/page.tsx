"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useData, Question } from "../../data-provider";
import styles from "../test.module.css";

type AnswerMap = Record<string, string | string[]>;

export default function CandidateTestPage() {
    const params = useParams();
    const { getTestByInviteCode, getTestQuestions, startSession, submitSession } = useData();
    const inviteCode = params.code as string;
    const test = getTestByInviteCode(inviteCode);
    const questions = test ? getTestQuestions(test.id) : [];

    // States
    const [phase, setPhase] = useState<"entry" | "test" | "result">("entry");
    const [candidateName, setCandidateName] = useState("");
    const [candidateEmail, setCandidateEmail] = useState("");
    const [candidatePhone, setCandidatePhone] = useState("");
    const [sessionId, setSessionId] = useState("");
    const [answers, setAnswers] = useState<AnswerMap>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [resultData, setResultData] = useState<{ score: number; total: number; passed: boolean } | null>(null);
    const [currentQ, setCurrentQ] = useState(0);

    // Timer
    useEffect(() => {
        if (phase !== "test" || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [phase, timeLeft]);

    // Auto-submit when time runs out
    const handleSubmit = useCallback(() => {
        if (!test || !sessionId) return;
        const answerPayload = Object.entries(answers).map(([question_id, response]) => ({
            question_id,
            response,
        }));
        const result = submitSession(sessionId, answerPayload);
        const pct = result.total_points > 0 ? Math.round((result.score / result.total_points) * 100) : 0;
        setResultData({
            score: result.score,
            total: result.total_points,
            passed: pct >= (test.passing_score || 0),
        });
        setPhase("result");
    }, [test, sessionId, answers, submitSession]);

    useEffect(() => {
        if (phase === "test" && timeLeft === 0) {
            handleSubmit();
        }
    }, [timeLeft, phase, handleSubmit]);

    if (!test) {
        return (
            <div className={styles["test-page"]}>
                <nav className={styles["test-nav"]}>
                    <div className="container">
                        <Link href="/" className={styles["test-logo"]}>
                            <span className={styles["test-logo-icon"]}>⚡</span>
                            <span className={styles["test-logo-text"]}>TestGate</span>
                        </Link>
                    </div>
                </nav>
                <div className={styles["test-not-found"]}>
                    <div className="card" style={{ padding: "var(--space-2xl)" }}>
                        <div style={{ fontSize: "64px", marginBottom: "var(--space-lg)" }}>🔍</div>
                        <h1 style={{ fontSize: "var(--font-size-2xl)", fontWeight: 800, marginBottom: "var(--space-sm)" }}>
                            Không tìm thấy bài test
                        </h1>
                        <p style={{ color: "var(--color-text-secondary)", marginBottom: "var(--space-xl)" }}>
                            Link không hợp lệ hoặc bài test đã bị xóa. Vui lòng kiểm tra lại link.
                        </p>
                        <Link href="/" className="btn btn-primary">Về trang chủ</Link>
                    </div>
                </div>
            </div>
        );
    }

    const handleStartTest = (e: FormEvent) => {
        e.preventDefault();
        if (!candidateName || !candidateEmail) return;
        const session = startSession(test.id, candidateName, candidateEmail, candidatePhone);
        setSessionId(session.id);
        setTimeLeft(test.duration_minutes * 60);
        setPhase("test");
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const handleSelectOption = (questionId: string, questionType: string, optionContent: string) => {
        setAnswers((prev) => {
            if (questionType === "multiple_choice") {
                const current = (prev[questionId] as string[]) || [];
                if (current.includes(optionContent)) {
                    return { ...prev, [questionId]: current.filter((c) => c !== optionContent) };
                }
                return { ...prev, [questionId]: [...current, optionContent] };
            }
            return { ...prev, [questionId]: optionContent };
        });
    };

    const isOptionSelected = (questionId: string, questionType: string, optionContent: string) => {
        const ans = answers[questionId];
        if (!ans) return false;
        if (questionType === "multiple_choice") {
            return (ans as string[]).includes(optionContent);
        }
        return ans === optionContent;
    };

    const answeredCount = Object.keys(answers).filter((k) => {
        const a = answers[k];
        if (Array.isArray(a)) return a.length > 0;
        return !!a;
    }).length;

    // Entry phase
    if (phase === "entry") {
        return (
            <div className={styles["test-page"]}>
                <nav className={styles["test-nav"]}>
                    <div className="container">
                        <Link href="/" className={styles["test-logo"]}>
                            <span className={styles["test-logo-icon"]}>⚡</span>
                            <span className={styles["test-logo-text"]}>TestGate</span>
                        </Link>
                    </div>
                </nav>
                <div className={styles["test-entry"]}>
                    <div className={`card ${styles["test-entry-card"]}`}>
                        <div className={styles["test-entry-header"]}>
                            <h1>{test.title}</h1>
                            <p>Vui lòng nhập thông tin để bắt đầu làm bài</p>
                        </div>

                        <div className={styles["test-info-grid"]}>
                            <div className={styles["test-info-item"]}>
                                <div className={styles["test-info-value"]}>⏱ {test.duration_minutes}</div>
                                <div className={styles["test-info-label"]}>phút</div>
                            </div>
                            <div className={styles["test-info-item"]}>
                                <div className={styles["test-info-value"]}>📝 {questions.length}</div>
                                <div className={styles["test-info-label"]}>câu hỏi</div>
                            </div>
                        </div>

                        <form onSubmit={handleStartTest} style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
                            <div className="form-group">
                                <label className="form-label">Họ và tên *</label>
                                <input className="form-input" placeholder="Nhập họ tên" value={candidateName} onChange={(e) => setCandidateName(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email *</label>
                                <input type="email" className="form-input" placeholder="email@example.com" value={candidateEmail} onChange={(e) => setCandidateEmail(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Số điện thoại</label>
                                <input className="form-input" placeholder="0901234567" value={candidatePhone} onChange={(e) => setCandidatePhone(e.target.value)} />
                            </div>
                            <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%" }}>
                                Bắt đầu làm bài →
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // Result phase
    if (phase === "result" && resultData) {
        const pct = resultData.total > 0 ? Math.round((resultData.score / resultData.total) * 100) : 0;
        return (
            <div className={styles["test-page"]}>
                <nav className={styles["test-nav"]}>
                    <div className="container">
                        <Link href="/" className={styles["test-logo"]}>
                            <span className={styles["test-logo-icon"]}>⚡</span>
                            <span className={styles["test-logo-text"]}>TestGate</span>
                        </Link>
                    </div>
                </nav>
                <div className={styles["test-result"]}>
                    <div className={`card ${styles["test-result-card"]}`}>
                        <div className={styles["test-result-icon"]}>
                            {resultData.passed ? "🎉" : "😔"}
                        </div>
                        <div className={`${styles["test-result-score"]} ${resultData.passed ? styles["test-result-pass"] : styles["test-result-fail"]}`}>
                            {pct}%
                        </div>
                        <div className={styles["test-result-label"]}>
                            {resultData.passed ? "Chúc mừng! Bạn đã đạt yêu cầu." : "Rất tiếc, bạn chưa đạt yêu cầu."}
                        </div>

                        <div className={styles["test-result-details"]}>
                            <div className={styles["test-result-detail"]}>
                                <div className={styles["test-result-detail-value"]}>{resultData.score}/{resultData.total}</div>
                                <div className={styles["test-result-detail-label"]}>Điểm đạt được</div>
                            </div>
                            <div className={styles["test-result-detail"]}>
                                <div className={styles["test-result-detail-value"]}>{test.passing_score}%</div>
                                <div className={styles["test-result-detail-label"]}>Điểm yêu cầu</div>
                            </div>
                        </div>

                        <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-sm)", marginBottom: "var(--space-xl)" }}>
                            Kết quả sẽ được nhà tuyển dụng xem xét. Cảm ơn bạn đã tham gia!
                        </p>

                        <Link href="/" className="btn btn-secondary">
                            Về trang chủ
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Test phase
    return (
        <div className={styles["test-page"]}>
            <nav className={styles["test-nav"]}>
                <div className="container">
                    <Link href="/" className={styles["test-logo"]}>
                        <span className={styles["test-logo-icon"]}>⚡</span>
                        <span className={styles["test-logo-text"]}>TestGate</span>
                    </Link>
                    <div className={`${styles["test-timer"]} ${timeLeft < 60 ? styles["test-timer-warning"] : ""}`}>
                        ⏱ {formatTime(timeLeft)}
                    </div>
                </div>
            </nav>

            <div className={styles["test-content"]}>
                {/* Progress */}
                <div className={styles["test-progress"]}>
                    <div className={styles["test-progress-bar"]}>
                        <div className={styles["test-progress-fill"]} style={{ width: `${questions.length > 0 ? (answeredCount / questions.length) * 100 : 0}%` }}></div>
                    </div>
                    <div className={styles["test-progress-text"]}>
                        <span>Đã trả lời: {answeredCount}/{questions.length}</span>
                        <span>Còn lại: {formatTime(timeLeft)}</span>
                    </div>
                </div>

                {/* All questions visible */}
                {questions.map((q, idx) => (
                    <div key={q.id} className={styles["test-question"]}>
                        <div className={`card ${styles["test-question-card"]}`}>
                            <div className={styles["test-question-header"]}>
                                <div className={styles["test-question-num"]}>{idx + 1}</div>
                                <span className={`badge ${q.type === "multiple_choice" ? "badge-accent" :
                                        q.type === "true_false" ? "badge-warning" :
                                            q.type === "short_answer" ? "badge-danger" : "badge-primary"
                                    }`}>
                                    {q.type === "single_choice" ? "Một đáp án" :
                                        q.type === "multiple_choice" ? "Nhiều đáp án" :
                                            q.type === "true_false" ? "Đúng/Sai" : "Tự luận"}
                                </span>
                                <span className={styles["test-question-meta"]}>{q.points} điểm</span>
                            </div>
                            <div className={styles["test-question-text"]}>{q.content}</div>

                            {q.type !== "short_answer" && q.options ? (
                                <div className={styles["test-options"]}>
                                    {q.options.map((opt) => (
                                        <div
                                            key={opt.id}
                                            className={`${styles["test-option"]} ${isOptionSelected(q.id, q.type, opt.content) ? styles["test-option-selected"] : ""}`}
                                            onClick={() => handleSelectOption(q.id, q.type, opt.content)}
                                        >
                                            <div className={q.type === "multiple_choice" ? styles["test-option-checkbox"] : styles["test-option-radio"]}></div>
                                            <span>{opt.content}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <textarea
                                    className={`form-input ${styles["test-short-answer"]}`}
                                    placeholder="Nhập câu trả lời của bạn..."
                                    value={(answers[q.id] as string) || ""}
                                    onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                                />
                            )}
                        </div>
                    </div>
                ))}

                {/* Submit */}
                <div className={styles["test-submit-area"]}>
                    <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>
                        {answeredCount}/{questions.length} câu đã trả lời
                    </span>
                    <button
                        className="btn btn-primary btn-lg"
                        onClick={() => {
                            if (answeredCount < questions.length) {
                                if (!confirm(`Bạn mới trả lời ${answeredCount}/${questions.length} câu. Chắc chắn muốn nộp bài?`)) return;
                            }
                            handleSubmit();
                        }}
                    >
                        Nộp bài →
                    </button>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useData, Question } from "../../../data-provider";
import styles from "../../dashboard.module.css";

type QuestionType = Question["type"];

export default function TestEditorPage() {
    const params = useParams();
    const { tests, campaigns, getTestQuestions, addQuestion, updateQuestion, deleteQuestion } = useData();
    const testId = params.id as string;
    const test = tests.find((t) => t.id === testId);
    const questions = getTestQuestions(testId);
    const campaign = test ? campaigns.find((c) => c.id === test.campaign_id) : null;

    const [showAddQ, setShowAddQ] = useState(false);
    const [qForm, setQForm] = useState<{
        type: QuestionType;
        content: string;
        points: number;
        options: { content: string; is_correct: boolean }[];
        correct_answer: string;
    }>({
        type: "single_choice",
        content: "",
        points: 10,
        options: [
            { content: "", is_correct: true },
            { content: "", is_correct: false },
            { content: "", is_correct: false },
            { content: "", is_correct: false },
        ],
        correct_answer: "",
    });

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

    const resetForm = () => {
        setQForm({
            type: "single_choice",
            content: "",
            points: 10,
            options: [
                { content: "", is_correct: true },
                { content: "", is_correct: false },
                { content: "", is_correct: false },
                { content: "", is_correct: false },
            ],
            correct_answer: "",
        });
    };

    const handleTypeChange = (type: QuestionType) => {
        if (type === "true_false") {
            setQForm({
                ...qForm,
                type,
                options: [
                    { content: "Đúng", is_correct: true },
                    { content: "Sai", is_correct: false },
                ],
            });
        } else if (type === "short_answer") {
            setQForm({ ...qForm, type, options: [] });
        } else {
            setQForm({
                ...qForm,
                type,
                options: qForm.options.length < 2
                    ? [
                        { content: "", is_correct: true },
                        { content: "", is_correct: false },
                        { content: "", is_correct: false },
                        { content: "", is_correct: false },
                    ]
                    : qForm.options,
            });
        }
    };

    const handleAddQuestion = (e: FormEvent) => {
        e.preventDefault();
        if (!qForm.content) return;

        const correctAns =
            qForm.type === "short_answer"
                ? qForm.correct_answer
                : qForm.type === "multiple_choice"
                    ? qForm.options.filter((o) => o.is_correct).map((o) => o.content)
                    : qForm.options.find((o) => o.is_correct)?.content || "";

        const generateId = () => Math.random().toString(36).substring(2, 15);

        addQuestion({
            test_id: testId,
            type: qForm.type,
            content: qForm.content,
            points: qForm.points,
            order_index: questions.length + 1,
            correct_answer: correctAns,
            options:
                qForm.type !== "short_answer"
                    ? qForm.options.map((o, i) => ({
                        id: generateId(),
                        question_id: "",
                        content: o.content,
                        is_correct: o.is_correct,
                        order_index: i + 1,
                    }))
                    : undefined,
        });

        resetForm();
        setShowAddQ(false);
    };

    const handleSetCorrect = (idx: number) => {
        if (qForm.type === "multiple_choice") {
            const newOpts = qForm.options.map((o, i) => (i === idx ? { ...o, is_correct: !o.is_correct } : o));
            setQForm({ ...qForm, options: newOpts });
        } else {
            const newOpts = qForm.options.map((o, i) => ({ ...o, is_correct: i === idx }));
            setQForm({ ...qForm, options: newOpts });
        }
    };

    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

    return (
        <>
            <div style={{ marginBottom: "var(--space-sm)" }}>
                <Link href={`/dashboard/campaigns/${test.campaign_id}`} style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-tertiary)" }}>
                    ← {campaign?.title || "Chiến dịch"}
                </Link>
            </div>

            <div className={styles["page-header"]}>
                <div>
                    <h1 className={styles["page-title"]}>{test.title}</h1>
                    <p className={styles["page-subtitle"]}>
                        {questions.length} câu hỏi · Tổng {totalPoints} điểm · {test.duration_minutes} phút
                    </p>
                </div>
                <div style={{ display: "flex", gap: "var(--space-sm)" }}>
                    <Link href={`/dashboard/tests/${testId}/results`} className="btn btn-secondary">
                        📊 Xem kết quả
                    </Link>
                    <button className="btn btn-primary" onClick={() => { resetForm(); setShowAddQ(true); }}>
                        + Thêm câu hỏi
                    </button>
                </div>
            </div>

            {/* Questions list */}
            {questions.length > 0 ? (
                <div className={styles["question-list"]}>
                    {questions.map((q, idx) => (
                        <div key={q.id} className={`card ${styles["question-card"]}`}>
                            <div className={styles["question-card-header"]}>
                                <div className={styles["question-number"]}>
                                    <span>{idx + 1}</span>
                                    <span className={`badge ${q.type === "single_choice" ? "badge-primary" :
                                            q.type === "multiple_choice" ? "badge-accent" :
                                                q.type === "true_false" ? "badge-warning" : "badge-danger"
                                        }`}>
                                        {q.type === "single_choice" ? "Một đáp án" :
                                            q.type === "multiple_choice" ? "Nhiều đáp án" :
                                                q.type === "true_false" ? "Đúng/Sai" : "Tự luận"}
                                    </span>
                                    <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-tertiary)" }}>
                                        {q.points} điểm
                                    </span>
                                </div>
                                <div className={styles["question-actions"]}>
                                    <button className="btn btn-ghost btn-icon" onClick={() => deleteQuestion(q.id)} title="Xóa">
                                        🗑
                                    </button>
                                </div>
                            </div>
                            <div className={styles["question-content"]}>{q.content}</div>
                            {q.options && q.options.length > 0 && (
                                <div className={styles["options-list"]}>
                                    {q.options.map((opt) => (
                                        <div
                                            key={opt.id}
                                            className={`${styles["option-item"]} ${opt.is_correct ? styles["option-correct"] : ""}`}
                                        >
                                            <div className={styles["option-marker"]}></div>
                                            <span>{opt.content}</span>
                                            {opt.is_correct && <span style={{ marginLeft: "auto", fontSize: "12px" }}>✓</span>}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {q.type === "short_answer" && (
                                <div style={{ padding: "0.5rem 0.75rem", background: "var(--color-accent-light)", borderRadius: "var(--radius-sm)", fontSize: "var(--font-size-sm)" }}>
                                    ✓ Đáp án: {String(q.correct_answer)}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card">
                    <div className={styles["empty-state"]}>
                        <div className={styles["empty-state-icon"]}>📝</div>
                        <h3>Chưa có câu hỏi nào</h3>
                        <p>Thêm câu hỏi đầu tiên cho bài test.</p>
                        <button className="btn btn-primary" onClick={() => { resetForm(); setShowAddQ(true); }}>
                            + Thêm câu hỏi
                        </button>
                    </div>
                </div>
            )}

            {/* Add Question Modal */}
            {showAddQ && (
                <div className={styles["modal-overlay"]} onClick={() => setShowAddQ(false)}>
                    <div className={`card ${styles["modal"]}`} style={{ maxWidth: "640px" }} onClick={(e) => e.stopPropagation()}>
                        <div className={styles["modal-header"]}>
                            <h2>Thêm câu hỏi mới</h2>
                            <button className={styles["modal-close"]} onClick={() => setShowAddQ(false)}>✕</button>
                        </div>
                        <form onSubmit={handleAddQuestion} style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-lg)" }}>
                                <div className="form-group">
                                    <label className="form-label">Loại câu hỏi</label>
                                    <select className="form-input form-select" value={qForm.type} onChange={(e) => handleTypeChange(e.target.value as QuestionType)}>
                                        <option value="single_choice">Trắc nghiệm (1 đáp án)</option>
                                        <option value="multiple_choice">Trắc nghiệm (nhiều đáp án)</option>
                                        <option value="true_false">Đúng / Sai</option>
                                        <option value="short_answer">Tự luận ngắn</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Điểm</label>
                                    <input type="number" className="form-input" min={1} max={100} value={qForm.points} onChange={(e) => setQForm({ ...qForm, points: parseInt(e.target.value) || 10 })} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Nội dung câu hỏi *</label>
                                <textarea
                                    className="form-input form-textarea"
                                    placeholder="Nhập câu hỏi..."
                                    value={qForm.content}
                                    onChange={(e) => setQForm({ ...qForm, content: e.target.value })}
                                    required
                                />
                            </div>

                            {qForm.type !== "short_answer" ? (
                                <div className="form-group">
                                    <label className="form-label">
                                        Đáp án {qForm.type === "multiple_choice" ? "(chọn nhiều đáp án đúng)" : "(chọn 1 đáp án đúng)"}
                                    </label>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
                                        {qForm.options.map((opt, idx) => (
                                            <div key={idx} style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleSetCorrect(idx)}
                                                    style={{
                                                        width: 24, height: 24, borderRadius: qForm.type === "multiple_choice" ? 4 : "50%",
                                                        border: `2px solid ${opt.is_correct ? "var(--color-accent)" : "var(--color-border)"}`,
                                                        background: opt.is_correct ? "var(--color-accent)" : "transparent",
                                                        flexShrink: 0, cursor: "pointer", transition: "all 0.2s",
                                                    }}
                                                />
                                                {qForm.type === "true_false" ? (
                                                    <span style={{ fontSize: "var(--font-size-sm)" }}>{opt.content}</span>
                                                ) : (
                                                    <input
                                                        className="form-input"
                                                        style={{ flex: 1 }}
                                                        placeholder={`Đáp án ${String.fromCharCode(65 + idx)}`}
                                                        value={opt.content}
                                                        onChange={(e) => {
                                                            const newOpts = [...qForm.options];
                                                            newOpts[idx] = { ...newOpts[idx], content: e.target.value };
                                                            setQForm({ ...qForm, options: newOpts });
                                                        }}
                                                    />
                                                )}
                                                {qForm.type !== "true_false" && qForm.options.length > 2 && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-ghost btn-icon"
                                                        onClick={() => {
                                                            const newOpts = qForm.options.filter((_, i) => i !== idx);
                                                            setQForm({ ...qForm, options: newOpts });
                                                        }}
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        {qForm.type !== "true_false" && qForm.options.length < 6 && (
                                            <button
                                                type="button"
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => setQForm({ ...qForm, options: [...qForm.options, { content: "", is_correct: false }] })}
                                            >
                                                + Thêm đáp án
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="form-group">
                                    <label className="form-label">Đáp án đúng (từ khóa)</label>
                                    <input
                                        className="form-input"
                                        placeholder="Nhập từ khóa đáp án..."
                                        value={qForm.correct_answer}
                                        onChange={(e) => setQForm({ ...qForm, correct_answer: e.target.value })}
                                    />
                                </div>
                            )}

                            <div className={styles["modal-actions"]}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddQ(false)}>Hủy</button>
                                <button type="submit" className="btn btn-primary">Thêm câu hỏi</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

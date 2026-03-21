"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import Link from "next/link";
import { supabase, sendToGoogleSheet } from "../../lib/supabase";
import { ThemeToggle } from "../../components/ThemeToggle";
import styles from "../test.module.css";

type AnswerMap = Record<string, string | string[]>;

/* ==========================================
   3 bộ câu hỏi cho 3 nhóm ứng viên (HARDCODE)
   ========================================== */
interface QuestionDef {
    id: string;
    type: "multiple_choice" | "single_choice" | "true_false" | "short_answer";
    content: string;
    points: number;
    correct_answer: string | string[];
    options?: { id: string; content: string; is_correct: boolean }[];
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

const TEST_GROUPS: TestGroup[] = [
    {
        id: "marketing",
        title: "Marketing",
        description: "Kiến thức Digital Marketing, Content, SEO, và Chiến lược truyền thông",
        icon: "📢",
        iconClass: "group-icon-marketing",
        durationMinutes: 20,
        questions: [
            {
                id: "mkt-1", type: "single_choice", content: "CTR là viết tắt của thuật ngữ nào?", points: 10,
                correct_answer: "Click-Through Rate",
                options: [
                    { id: "mo-1", content: "Click-Through Rate", is_correct: true },
                    { id: "mo-2", content: "Cost-To-Revenue", is_correct: false },
                    { id: "mo-3", content: "Customer Tracking Report", is_correct: false },
                    { id: "mo-4", content: "Click-Time Ratio", is_correct: false },
                ],
            },
            {
                id: "mkt-2", type: "single_choice", content: "Trong SEO, thẻ HTML nào quan trọng nhất cho tiêu đề trang?", points: 10,
                correct_answer: "<title>",
                options: [
                    { id: "mo-5", content: "<h1>", is_correct: false },
                    { id: "mo-6", content: "<title>", is_correct: true },
                    { id: "mo-7", content: "<meta>", is_correct: false },
                    { id: "mo-8", content: "<header>", is_correct: false },
                ],
            },
            {
                id: "mkt-3", type: "true_false", content: "Google Ads hoạt động theo mô hình đấu giá (auction-based model).", points: 5,
                correct_answer: "true",
                options: [
                    { id: "mo-9", content: "Đúng", is_correct: true },
                    { id: "mo-10", content: "Sai", is_correct: false },
                ],
            },
            {
                id: "mkt-4", type: "single_choice", content: "KPI nào phù hợp nhất để đo lường hiệu quả chiến dịch email marketing?", points: 10,
                correct_answer: "Open Rate và Click Rate",
                options: [
                    { id: "mo-11", content: "Số lượng email gửi đi", is_correct: false },
                    { id: "mo-12", content: "Open Rate và Click Rate", is_correct: true },
                    { id: "mo-13", content: "Số người follow fanpage", is_correct: false },
                    { id: "mo-14", content: "Lượt truy cập website", is_correct: false },
                ],
            },
            {
                id: "mkt-5", type: "multiple_choice", content: "Những kênh nào thuộc Digital Marketing? (chọn nhiều)", points: 15,
                correct_answer: ["Google Ads", "Facebook Ads", "Email Marketing"],
                options: [
                    { id: "mo-15", content: "Google Ads", is_correct: true },
                    { id: "mo-16", content: "Facebook Ads", is_correct: true },
                    { id: "mo-17", content: "Email Marketing", is_correct: true },
                    { id: "mo-18", content: "Billboard truyền thống", is_correct: false },
                ],
            },
            {
                id: "mkt-6", type: "single_choice", content: "Conversion Rate là gì?", points: 10,
                correct_answer: "Tỷ lệ người dùng thực hiện hành động mong muốn",
                options: [
                    { id: "mo-19", content: "Tỷ lệ thoát trang", is_correct: false },
                    { id: "mo-20", content: "Tỷ lệ người dùng thực hiện hành động mong muốn", is_correct: true },
                    { id: "mo-21", content: "Số lượng click vào quảng cáo", is_correct: false },
                    { id: "mo-22", content: "Tỷ lệ mở email", is_correct: false },
                ],
            },
            {
                id: "mkt-7", type: "true_false", content: "Content Marketing chỉ bao gồm viết blog.", points: 5,
                correct_answer: "false",
                options: [
                    { id: "mo-23", content: "Đúng", is_correct: false },
                    { id: "mo-24", content: "Sai", is_correct: true },
                ],
            },
            {
                id: "mkt-8", type: "short_answer", content: "Giải thích ngắn gọn sự khác biệt giữa SEO và SEM.", points: 15,
                correct_answer: "SEO là tối ưu tự nhiên, SEM là quảng cáo trả phí",
            },
        ],
    },
    {
        id: "sales",
        title: "Sales",
        description: "Kỹ năng bán hàng, chăm sóc khách hàng, đàm phán và xử lý tình huống",
        icon: "💼",
        iconClass: "group-icon-sales",
        durationMinutes: 20,
        questions: [
            {
                id: "sal-1", type: "single_choice", content: "Bước đầu tiên trong quy trình bán hàng B2B thường là gì?", points: 10,
                correct_answer: "Nghiên cứu khách hàng tiềm năng",
                options: [
                    { id: "so-1", content: "Gửi báo giá", is_correct: false },
                    { id: "so-2", content: "Nghiên cứu khách hàng tiềm năng", is_correct: true },
                    { id: "so-3", content: "Đàm phán giá", is_correct: false },
                    { id: "so-4", content: "Ký hợp đồng", is_correct: false },
                ],
            },
            {
                id: "sal-2", type: "single_choice", content: "Khi khách hàng phản đối 'giá cao quá', bạn nên làm gì?", points: 10,
                correct_answer: "Phân tích giá trị sản phẩm so với chi phí",
                options: [
                    { id: "so-5", content: "Giảm giá ngay lập tức", is_correct: false },
                    { id: "so-6", content: "Phân tích giá trị sản phẩm so với chi phí", is_correct: true },
                    { id: "so-7", content: "Bỏ qua và nói về tính năng khác", is_correct: false },
                    { id: "so-8", content: "So sánh với đối thủ", is_correct: false },
                ],
            },
            {
                id: "sal-3", type: "true_false", content: "Cross-selling là bán sản phẩm phiên bản cao cấp hơn cho khách hàng.", points: 5,
                correct_answer: "false",
                options: [
                    { id: "so-9", content: "Đúng", is_correct: false },
                    { id: "so-10", content: "Sai", is_correct: true },
                ],
            },
            {
                id: "sal-4", type: "single_choice", content: "CRM là viết tắt của gì?", points: 10,
                correct_answer: "Customer Relationship Management",
                options: [
                    { id: "so-11", content: "Customer Revenue Model", is_correct: false },
                    { id: "so-12", content: "Customer Relationship Management", is_correct: true },
                    { id: "so-13", content: "Client Resource Management", is_correct: false },
                    { id: "so-14", content: "Corporate Risk Management", is_correct: false },
                ],
            },
            {
                id: "sal-5", type: "multiple_choice", content: "Kỹ năng nào quan trọng với một Sales? (chọn nhiều)", points: 15,
                correct_answer: ["Lắng nghe chủ động", "Đàm phán", "Quản lý thời gian"],
                options: [
                    { id: "so-15", content: "Lắng nghe chủ động", is_correct: true },
                    { id: "so-16", content: "Đàm phán", is_correct: true },
                    { id: "so-17", content: "Quản lý thời gian", is_correct: true },
                    { id: "so-18", content: "Viết code", is_correct: false },
                ],
            },
            {
                id: "sal-6", type: "single_choice", content: "Phương pháp SPIN Selling tập trung vào điều gì?", points: 10,
                correct_answer: "Đặt câu hỏi để hiểu nhu cầu khách hàng",
                options: [
                    { id: "so-19", content: "Giảm giá sâu để thu hút khách", is_correct: false },
                    { id: "so-20", content: "Đặt câu hỏi để hiểu nhu cầu khách hàng", is_correct: true },
                    { id: "so-21", content: "Telesales gọi nhiều nhất có thể", is_correct: false },
                    { id: "so-22", content: "Demo sản phẩm liên tục", is_correct: false },
                ],
            },
            {
                id: "sal-7", type: "true_false", content: "Upselling là đề xuất sản phẩm bổ sung liên quan cho khách hàng.", points: 5,
                correct_answer: "false",
                options: [
                    { id: "so-23", content: "Đúng", is_correct: false },
                    { id: "so-24", content: "Sai", is_correct: true },
                ],
            },
            {
                id: "sal-8", type: "short_answer", content: "Bạn sẽ xử lý thế nào khi khách hàng nói 'Để tôi suy nghĩ thêm'?", points: 15,
                correct_answer: "tìm hiểu lý do thực sự và giải quyết vấn đề",
            },
        ],
    },
    {
        id: "technical",
        title: "Kỹ thuật",
        description: "Kiến thức lập trình, thuật toán, cơ sở dữ liệu và tư duy logic",
        icon: "💻",
        iconClass: "group-icon-tech",
        durationMinutes: 25,
        questions: [
            {
                id: "tech-1", type: "single_choice", content: "Độ phức tạp thời gian (Time Complexity) của Binary Search là gì?", points: 10,
                correct_answer: "O(log n)",
                options: [
                    { id: "to-1", content: "O(n)", is_correct: false },
                    { id: "to-2", content: "O(log n)", is_correct: true },
                    { id: "to-3", content: "O(n²)", is_correct: false },
                    { id: "to-4", content: "O(1)", is_correct: false },
                ],
            },
            {
                id: "tech-2", type: "single_choice", content: "REST API sử dụng phương thức HTTP nào để xóa tài nguyên?", points: 10,
                correct_answer: "DELETE",
                options: [
                    { id: "to-5", content: "POST", is_correct: false },
                    { id: "to-6", content: "PUT", is_correct: false },
                    { id: "to-7", content: "DELETE", is_correct: true },
                    { id: "to-8", content: "REMOVE", is_correct: false },
                ],
            },
            {
                id: "tech-3", type: "true_false", content: "Git merge và Git rebase đều dùng để tích hợp thay đổi từ branch khác.", points: 5,
                correct_answer: "true",
                options: [
                    { id: "to-9", content: "Đúng", is_correct: true },
                    { id: "to-10", content: "Sai", is_correct: false },
                ],
            },
            {
                id: "tech-4", type: "single_choice", content: "Trong SQL, lệnh nào dùng để nhóm dữ liệu?", points: 10,
                correct_answer: "GROUP BY",
                options: [
                    { id: "to-11", content: "ORDER BY", is_correct: false },
                    { id: "to-12", content: "GROUP BY", is_correct: true },
                    { id: "to-13", content: "CLUSTER BY", is_correct: false },
                    { id: "to-14", content: "SORT BY", is_correct: false },
                ],
            },
            {
                id: "tech-5", type: "multiple_choice", content: "Ngôn ngữ nào là strongly-typed? (chọn nhiều)", points: 15,
                correct_answer: ["TypeScript", "Java", "C#"],
                options: [
                    { id: "to-15", content: "JavaScript", is_correct: false },
                    { id: "to-16", content: "TypeScript", is_correct: true },
                    { id: "to-17", content: "Java", is_correct: true },
                    { id: "to-18", content: "C#", is_correct: true },
                ],
            },
            {
                id: "tech-6", type: "single_choice", content: "Docker container khác gì Virtual Machine?", points: 10,
                correct_answer: "Container chia sẻ kernel với OS host, VM có kernel riêng",
                options: [
                    { id: "to-19", content: "Container chạy chậm hơn VM", is_correct: false },
                    { id: "to-20", content: "Container chia sẻ kernel với OS host, VM có kernel riêng", is_correct: true },
                    { id: "to-21", content: "Container và VM giống hệt nhau", is_correct: false },
                    { id: "to-22", content: "VM nhẹ hơn Container", is_correct: false },
                ],
            },
            {
                id: "tech-7", type: "true_false", content: "NoSQL database không hỗ trợ bất kỳ loại query nào.", points: 5,
                correct_answer: "false",
                options: [
                    { id: "to-23", content: "Đúng", is_correct: false },
                    { id: "to-24", content: "Sai", is_correct: true },
                ],
            },
            {
                id: "tech-8", type: "short_answer", content: "Giải thích ngắn gọn SOLID principles trong lập trình hướng đối tượng.", points: 15,
                correct_answer: "5 nguyên tắc thiết kế phần mềm: Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion",
            },
        ],
    },
];

/* ==========================================
   Chấm điểm
   ========================================== */
function gradeAnswers(group: TestGroup, answers: AnswerMap) {
    let totalScore = 0;
    let totalPoints = 0;
    const details: { qid: string; correct: boolean; points: number }[] = [];

    group.questions.forEach((q) => {
        totalPoints += q.points;
        const ans = answers[q.id];
        let correct = false;

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
        details.push({ qid: q.id, correct, points: correct ? q.points : 0 });
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
    const [selectedGroup, setSelectedGroup] = useState<TestGroup | null>(null);
    const [answers, setAnswers] = useState<AnswerMap>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [totalTime, setTotalTime] = useState(0);
    const [saving, setSaving] = useState(false);
    const [showThankYou, setShowThankYou] = useState(false);

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

        // Save to Supabase + Google Sheets (score is saved for judges, NOT shown to candidate)
        const resultPayload = {
            candidate_name: candidateName,
            candidate_email: candidateEmail,
            candidate_phone: candidatePhone,
            test_group: selectedGroup.id,
            score: totalScore,
            total_points: totalPoints,
            percentage: pct,
            passed,
        };
        try {
            await Promise.all([
                supabase.from("test_results").insert({ ...resultPayload, answers: details }),
                sendToGoogleSheet(resultPayload),
            ]);
        } catch (e) {
            console.error("Failed to save:", e);
        }

        setSaving(false);
        setShowThankYou(true);
    }, [selectedGroup, answers, candidateName, candidateEmail, candidatePhone, saving]);

    useEffect(() => {
        if (phase === "test" && timeLeft === 0 && totalTime > 0) handleSubmit();
    }, [timeLeft, phase, handleSubmit, totalTime]);

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
            if (candidateName && candidateEmail) setPhase("group");
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
                                <div className={styles["test-info-value"]}>3 bộ đề</div>
                                <div className={styles["test-info-label"]}>Marketing · Sales · Kỹ thuật</div>
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
                        {TEST_GROUPS.map((g) => (
                            <div key={g.id} className={`card ${styles["group-card"]} ${selectedGroup?.id === g.id ? styles["group-card-selected"] : ""}`} onClick={() => setSelectedGroup(g)}>
                                <div className={`${styles["group-card-icon"]} ${styles[g.iconClass]}`}>{g.icon}</div>
                                <h3>{g.title}</h3>
                                <p>{g.description}</p>
                                <div className={styles["group-card-meta"]}>
                                    <span>📝 {g.questions.length} câu</span>
                                    <span>⏱ {g.durationMinutes} phút</span>
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
                            <span className={styles["timer-icon"]}>⏱</span>{formatTime(timeLeft)}
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

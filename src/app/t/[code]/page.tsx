"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import Link from "next/link";
import { supabase, sendToGoogleSheet } from "../../lib/supabase";
import styles from "../test.module.css";
import { NotePencil, Timer } from "@phosphor-icons/react";

type AnswerMap = Record<string, string | string[]>;

/* ==========================================
   Chấm điểm
   ========================================== */
function gradeAnswers(group: any, answers: AnswerMap) {
    let totalScore = 0;
    let totalPoints = 0;
    const details: { qid: string; question: string; type: string; answer_text: string; correct: boolean; points: number; max_points: number }[] = [];

    group.questions.forEach((q: any) => {
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
            answerText = "(Not answered)";
        }

        const correctOpt = q.options.find((o: any) => o.is_correct);
        correct = correctOpt?.content === ans;

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
    const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
    const [answers, setAnswers] = useState<AnswerMap>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [totalTime, setTotalTime] = useState(0);
    const [saving, setSaving] = useState(false);
    const [showThankYou, setShowThankYou] = useState(false);

    const [testGroups, setTestGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchGroups() {
            const { data: groups } = await supabase.from('test_groups').select('*').eq('is_active', true).order('sort_order');
            const { data: questions } = await supabase.from('questions').select('*').order('sort_order');
            
            if (groups && questions) {
                // Common questions shared across all groups (Q1-Q12)
                const commonQuestions = questions.filter((q: any) => q.group_id === 'common');
                
                const formattedGroups = groups.map((g: any) => {
                    // Merge common questions + group-specific questions
                    const groupSpecific = questions.filter((q: any) => q.group_id === g.id);
                    const merged = [...commonQuestions, ...groupSpecific].sort((a: any, b: any) => a.sort_order - b.sort_order);
                    
                    let newDescription = g.description;
                    if (g.title.includes('Finance') || g.title.includes('BPM')) newDescription = "You will undergo structured rotations across Finance and Business Process Management (BPM), gain hands-on experience in financial operations, reporting, and process improvement within a dynamic FMCG environment.";
                    else if (g.title.includes('Strategic')) newDescription = "Play role acting as assistant of business head to support business growth through data analysis, reporting, and strategic insights, while gaining hands-on exposure to end-to-end business operations in a dynamic FMCG environment.";
                    else if (g.title.includes('Logistics')) newDescription = "As a Logistics Management Trainee, you will be directly involved in core logistics operations, ranging from central warehouse management to transportation coordination and product distribution across the entire supply chain. Through rotations and hands-on exposure to different logistics functions, you will gradually build a solid understanding of how supply chain operations are managed and optimized in a fast-paced FMCG environment. Beyond daily operations, you will also have the opportunity to work on data analysis, process improvement, and cost optimization initiatives, enabling you to develop a strong systems-thinking mindset in supply chain management.";

                    return {
                        ...g,
                        description: newDescription,
                        durationMinutes: g.duration_minutes,
                        iconClass: 'group-icon-marketing',
                        questions: merged,
                    };
                });
                setTestGroups(formattedGroups);
            }
            setLoading(false);
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
    }, [phase]);

    // Auto-submit
    const handleSubmit = useCallback(async () => {
        if (!selectedGroup || saving) return;
        setSaving(true);

        const { totalScore, totalPoints, details } = gradeAnswers(selectedGroup, answers);
        const pct = totalPoints > 0 ? Math.round((totalScore / totalPoints) * 100) : 0;
        const passed = pct >= 70;

        // Collect all answers with question text for judges
        const allAnswers = selectedGroup.questions.map((q: any) => {
            const ans = answers[q.id];
            let answerText = "";
            if (Array.isArray(ans)) {
                answerText = ans.join(", ");
            } else if (ans) {
                answerText = String(ans);
            } else {
                answerText = "(Not answered)";
            }
            const correctOpt = q.options.find((o: any) => o.is_correct);
            const isCorrect = correctOpt?.content === ans;
            return { question: q.content, answer: answerText, correct: isCorrect, points: isCorrect ? q.points : 0, max_points: q.points };
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
            return { ...prev, [qId]: optContent };
        });
    };

    const isSelected = (qId: string, qType: string, optContent: string) => {
        const a = answers[qId];
        if (!a) return false;
        return a === optContent;
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
                            <h1>W-Future Leader 2026</h1>
                            <p style={{ fontWeight: 600, marginTop: '8px', marginBottom: '16px' }}>Backoffice Trainee Program — Aptitude Test</p>
                            <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--color-text-secondary)', textAlign: 'justify' }}>
                                The W-Future Leader 2026 – Backoffice Trainee Program is designed to identify and develop the next generation of leaders in key strategic functions at Wilmar CLV, including Finance and Supply Chain Management (SCM). Over a structured 24-month journey, the program offers comprehensive development experience through intensive training, job rotations, and hands-on involvement in real business projects. Participants will have the opportunity to work alongside experienced professionals, gain deep insights into FMCG business operations, and develop strong strategic thinking and leadership capabilities in a dynamic, regional-scale environment. More than just a training program, W-Future Leader serves as a launchpad for high-potential talents to accelerate their growth, make a meaningful impact, and prepare for key roles within Wilmar CLV.
                            </p>
                        </div>
                        <div className={styles["test-info-grid"]}>
                            <div className={styles["test-info-item"]}>
                                <div className={styles["test-info-value"]}>{`${testGroups.length} tracks`}</div>
                                <div className={styles["test-info-label"]}>{testGroups.map(g => g.title).join(" · ")}</div>
                            </div>
                            <div className={styles["test-info-item"]}>
                                <div className={styles["test-info-value"]}>30 mins</div>
                                <div className={styles["test-info-label"]}>per track • 15 questions</div>
                            </div>
                        </div>
                        <form onSubmit={handleEntry} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-lg)" }}>
                            <div className="form-group" style={{ gridColumn: "span 2" }}>
                                <label className="form-label">Full Name *</label>
                                <input className="form-input" placeholder="Enter your full name" value={candidateName} onChange={(e) => setCandidateName(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email *</label>
                                <input type="email" className="form-input" placeholder="email@example.com" value={candidateEmail} onChange={(e) => setCandidateEmail(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <input className="form-input" placeholder="0901234567" value={candidatePhone} onChange={(e) => setCandidatePhone(e.target.value)} />
                            </div>
                            <div className="form-group" style={{ gridColumn: "span 2" }}>
                                <label className="form-label">Candidate ID *</label>
                                <input className="form-input" placeholder="Enter candidate ID" value={candidateId} onChange={(e) => setCandidateId(e.target.value)} required />
                            </div>
                            <div style={{ gridColumn: "span 2" }}>
                                <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%" }}>Continue to select track →</button>
                            </div>
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
                        <h2>Select your track</h2>
                        <p>Hello <strong>{candidateName}</strong>, please select the track corresponding to your applied position</p>
                    </div>
                    <div className={styles["group-cards"]}>
                        {testGroups.map((g) => (
                            <div key={g.id} className={`card ${styles["group-card"]} ${selectedGroup?.id === g.id ? styles["group-card-selected"] : ""}`} onClick={() => setSelectedGroup(g)}>
                                <div className={`${styles["group-card-icon"]} ${styles[g.iconClass]}`}>{g.icon}</div>
                                <h3>{g.title}</h3>
                                <p>{g.description}</p>
                                <div className={styles["group-card-meta"]}>
                                    <span><NotePencil size={16} style={{ verticalAlign: 'middle', marginRight: 2 }} />{g.questions.length} questions</span>
                                    <span><Timer size={16} style={{ verticalAlign: 'middle', marginRight: 2 }} />{g.durationMinutes} mins</span>
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
                            {selectedGroup ? `Start ${selectedGroup.title} track →` : "Select a track to continue"}
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
                        <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-tertiary)" }}>Track: {selectedGroup?.title}</span>
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
                        <span>Answered: {answeredCount}/{questions.length}</span>
                        <span>{selectedGroup?.title} • {questions.length} questions</span>
                    </div>
                </div>
                {questions.map((q, idx) => (
                    <div key={q.id} className={styles["test-question"]}>
                        <div className={`card ${styles["test-question-card"]}`}>
                            <div className={styles["test-question-header"]}>
                                <div className={styles["test-question-num"]}>{idx + 1}</div>
                                <span className={`badge badge-primary`}>
                                    Single choice
                                </span>
                            </div>
                            <div className={styles["test-question-text"]} style={{ whiteSpace: 'pre-line' }}>{q.content}</div>
                            {q.image_url && (
                                <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                                    <img src={q.image_url} alt="Question illustration" style={{ maxWidth: "100%", borderRadius: "8px" }} />
                                </div>
                            )}
                            <div className={styles["test-options"]}>
                                {q.options.map((opt) => (
                                    <div key={opt.id} className={`${styles["test-option"]} ${isSelected(q.id, q.type, opt.content) ? styles["test-option-selected"] : ""}`} onClick={() => handleSelectOption(q.id, q.type, opt.content)}>
                                        <div className={styles["test-option-radio"]}></div>
                                        <span>{opt.content}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
                <div className={styles["test-submit-area"]}>
                    <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>{answeredCount}/{questions.length} questions answered</span>
                    <button className="btn btn-primary btn-lg" disabled={saving} onClick={() => handleSubmit()}>{saving ? "Submitting..." : "Submit →"}</button>
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
                            Thank you!
                        </h2>
                        <div className="gold-bar" style={{ margin: "0 auto var(--space-lg)" }} />
                        <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-sm)", lineHeight: 1.8, marginBottom: "var(--space-xl)" }}>
                            Your test has been successfully submitted.<br />
                            The results will be evaluated by <strong style={{ color: "var(--color-text-primary)" }}>the jury</strong><br />
                            and sent to your email shortly.
                        </p>
                        <div style={{
                            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)",
                            padding: "var(--space-lg)", background: "var(--color-bg-secondary)",
                            borderRadius: "var(--radius-md)", marginBottom: "var(--space-xl)"
                        }}>
                            <div>
                                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "var(--font-size-sm)" }}>{candidateName}</div>
                                <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-tertiary)" }}>Candidate</div>
                            </div>
                            <div>
                                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "var(--font-size-sm)" }}>{selectedGroup?.title}</div>
                                <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-tertiary)" }}>Track</div>
                            </div>
                        </div>
                        <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-tertiary)", marginBottom: "var(--space-lg)" }}>
                            W-Future Leader — Production Trainee Season 2
                        </p>
                        <Link href="/" className="btn btn-primary" style={{ width: "100%" }}>
                            Return to homepage
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
            </div>
        </nav>
    );
}

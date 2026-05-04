"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import styles from "./judge.module.css";
import { ClipboardText, NotePencil, X, ChatText, Star, FloppyDisk, CheckCircle, Warning, Funnel, SortAscending, ThumbsUp, ThumbsDown } from "@phosphor-icons/react";

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

interface TestGroupInfo {
    id: string;
    title: string;
    description: string;
}

const groupLabel = (g: string) => {
    if (g === "finance") return "Finance";
    if (g === "sc-planning") return "SC Planning";
    return "SC Logistics";
};

const typeLabel = (t: string) => {
    if (t === "short_answer") return "Essay";
    if (t === "true_false") return "True/False";
    if (t === "multiple_choice") return "Multiple Choice";
    return "Quiz";
};

export default function JudgePage() {
    const [judge, setJudge] = useState<Judge | null>(null);
    const [email, setEmail] = useState("");
    const [loginError, setLoginError] = useState("");

    // Restore session from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem("judge_session");
            if (saved) {
                const { judge: j, ts } = JSON.parse(saved);
                if (Date.now() - ts < 24 * 60 * 60 * 1000 && j) setJudge(j);
                else localStorage.removeItem("judge_session");
            }
        } catch { /* ignore */ }
    }, []);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(false);

    const [filterGroup, setFilterGroup] = useState("all");
    const [searchText, setSearchText] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "graded" | "ungraded">("all");
    const [sortBy, setSortBy] = useState<"time" | "score_asc" | "score_desc" | "name">("time");

    // All scores for grading status
    const [allScores, setAllScores] = useState<JudgeScore[]>([]);

    // Detail
    const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
    const [subScores, setSubScores] = useState<JudgeScore[]>([]);
    const [perQScores, setPerQScores] = useState<Record<number, string>>({});
    const [myNotes, setMyNotes] = useState("");
    const [myVerdict, setMyVerdict] = useState<"" | "pass" | "fail">("");
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState("");

    // Test group titles
    const [testGroupInfos, setTestGroupInfos] = useState<TestGroupInfo[]>([]);

    // Login
    const handleLogin = async () => {
        setLoginError("");
        const { data, error } = await supabase
            .from("judges")
            .select("*")
            .eq("email", email.trim().toLowerCase())
            .single();
        if (error || !data) {
            setLoginError("Email is not authorized as a judge. Contact Admin to be added.");
            return;
        }
        setJudge(data as Judge);
        localStorage.setItem("judge_session", JSON.stringify({ judge: data, ts: Date.now() }));
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

    const loadAllScores = useCallback(async () => {
        if (!judge) return;
        const { data } = await supabase.from("judge_scores").select("*").eq("judge_id", judge.id);
        if (data) setAllScores(data as JudgeScore[]);
    }, [judge]);

    useEffect(() => {
        if (judge) { loadSubmissions(); loadAllScores(); }
    }, [judge, loadSubmissions, loadAllScores]);

    // Load test group titles
    useEffect(() => {
        (async () => {
            const { data } = await supabase.from("test_groups").select("id,title,description");
            if (data) setTestGroupInfos(data as TestGroupInfo[]);
        })();
    }, []);

    const getGroupTitle = (gid: string) => {
        const found = testGroupInfos.find(g => g.id === gid);
        return found ? found.title : groupLabel(gid);
    };

    // Graded status helpers
    const gradedIds = new Set(allScores.map(s => s.result_id));
    const isGraded = (id: string) => gradedIds.has(id);
    const gradedCount = submissions.filter(s => isGraded(s.id)).length;
    const ungradedCount = submissions.length - gradedCount;

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
                        setMyVerdict(parsed.verdict || "");
                    } catch {
                        setMyNotes(mine.notes || "");
                        setPerQScores({});
                        setMyVerdict("");
                    }
                } else {
                    setPerQScores({});
                    setMyNotes("");
                    setMyVerdict("");
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
        const notesData = JSON.stringify({ perQ: perQScores, comment: myNotes, verdict: myVerdict });
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
        setSaveMsg("Scores saved successfully!");
        loadAllScores();
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

    // Apply status filter
    const statusFiltered = filtered.filter(s => {
        if (filterStatus === "graded") return isGraded(s.id);
        if (filterStatus === "ungraded") return !isGraded(s.id);
        return true;
    });

    // Apply sort
    const sorted = [...statusFiltered].sort((a, b) => {
        if (sortBy === "score_asc") return a.percentage - b.percentage;
        if (sortBy === "score_desc") return b.percentage - a.percentage;
        if (sortBy === "name") return a.candidate_name.localeCompare(b.candidate_name);
        return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
    });

    /* ====== LOGIN ====== */
    if (!judge) {
        return (
            <div className={styles.loginPage}>
                <div className={styles.loginCard}>
                    <img src="/wfl-logo.png" alt="WFL" />
                    <h1>Judge Portal</h1>
                    <p>Enter email authorized by Admin</p>
                    <input
                        className={styles.loginInput}
                        type="email"
                        placeholder="email@wilmar.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleLogin()}
                    />
                    <button className={styles.loginBtn} onClick={handleLogin}>Login</button>
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
                        <h1>Grade Candidates</h1>
                        <span>Hello, <strong>{judge.name}</strong></span>
                    </div>
                </div>
                <div className={styles.navRight}>
                    <span className={styles.roleBadge}>{judge.role === "admin" ? "Admin" : "Judge"}</span>
                    <button onClick={() => { setJudge(null); setEmail(""); localStorage.removeItem("judge_session"); }}>Logout</button>
                </div>
            </nav>

            <div className={styles.content}>
                <div className={styles.statsRow}>
                    <div className={styles.stat}>
                        <span className={styles.statNum}>{submissions.length}</span>
                        <span className={styles.statLabel}>Total</span>
                    </div>
                    <div className={`${styles.stat} ${styles.statGraded}`}>
                        <span className={styles.statNum}>{gradedCount}</span>
                        <span className={styles.statLabel}>Graded</span>
                    </div>
                    <div className={`${styles.stat} ${styles.statUngraded}`}>
                        <span className={styles.statNum}>{ungradedCount}</span>
                        <span className={styles.statLabel}>Ungraded</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statNum}>{submissions.filter(s => s.test_group === "finance").length}</span>
                        <span className={styles.statLabel}>Finance</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statNum}>{submissions.filter(s => s.test_group === "sc-planning").length}</span>
                        <span className={styles.statLabel}>SC Planning</span>
                    </div>
                </div>

                <div className={styles.toolbar}>
                    <h2>Submission List ({sorted.length})</h2>
                    <div className={styles.filters}>
                        <input className={styles.searchInput} placeholder="Search name or ID..." value={searchText} onChange={e => setSearchText(e.target.value)} />
                        <select className={styles.filterSelect} value={filterGroup} onChange={e => setFilterGroup(e.target.value)}>
                            <option value="all">All Groups</option>
                            <option value="finance">Finance</option>
                            <option value="sc-planning">SC Planning</option>
                            <option value="sc-logistics">SC Logistics</option>
                        </select>
                        <select className={styles.filterSelect} value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}>
                            <option value="all">All Status</option>
                            <option value="graded">Graded</option>
                            <option value="ungraded">Ungraded</option>
                        </select>
                        <select className={styles.filterSelect} value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
                            <option value="time">Newest</option>
                            <option value="score_desc">Score High → Low</option>
                            <option value="score_asc">Score Low → High</option>
                            <option value="name">Name A-Z</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className={styles.empty}>Loading...</div>
                ) : sorted.length === 0 ? (
                    <div className={styles.empty}>No submissions found</div>
                ) : (
                    <div className={styles.subGrid}>
                        {sorted.map(s => (
                            <div key={s.id} className={styles.subCard} onClick={() => { setSelectedSub(s); setPerQScores({}); setMyNotes(""); setSaveMsg(""); }}>
                                <div className={styles.subCardTop}>
                                    <div className={styles.subAvatar}>{s.candidate_name.charAt(0).toUpperCase()}</div>
                                    <div>
                                        <h3>{s.candidate_name}</h3>
                                        <p>{s.candidate_id || "No ID"}</p>
                                    </div>
                                    <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                                        <span className={`${styles.groupTag} ${styles["group_" + s.test_group.replace("-", "_")]}`}>
                                            {groupLabel(s.test_group)}
                                        </span>
                                        <span style={{ fontSize: '0.6rem', color: '#64748b' }}>{getGroupTitle(s.test_group)}</span>
                                        {isGraded(s.id) ? (
                                            <span className={styles.gradedBadge}><CheckCircle size={12} weight="fill" /> Graded</span>
                                        ) : (
                                            <span className={styles.ungradedBadge}>Ungraded</span>
                                        )}
                                    </div>
                                </div>
                                <div className={styles.subCardBody}>
                                    <div className={styles.subScore}>
                                        <span className={styles.subScoreNum}>{s.score}/{s.total_points}</span>
                                        <span className={styles.subScorePct}>{s.percentage}%</span>
                                    </div>
                                    <span className={`${styles.statusBadge} ${s.passed ? styles.statusPass : styles.statusFail}`}>
                                        {s.passed ? "Passed" : "Failed"}
                                    </span>
                                </div>
                                <div className={styles.subCardTime}>
                                    {new Date(s.submitted_at).toLocaleString("en-US")}
                                </div>
                                <button className={styles.gradeBtn}><NotePencil size={16} /> Grade</button>
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
                            <h2><ClipboardText size={22} style={{ verticalAlign: 'middle', marginRight: 6 }} />Grade — {selectedSub.candidate_name}</h2>
                            <button className={styles.closeBtn} onClick={() => setSelectedSub(null)}><X size={20} /></button>
                        </div>

                        <div className={styles.panelBody}>
                            {/* Candidate info */}
                            <div className={styles.infoGrid}>
                                <div><label>ID</label><span>{selectedSub.candidate_id || "—"}</span></div>
                                <div><label>Name</label><span>{selectedSub.candidate_name}</span></div>
                                <div><label>Email</label><span>{selectedSub.candidate_email}</span></div>
                                <div><label>Group</label><span className={`${styles.groupTag} ${styles["group_" + selectedSub.test_group.replace("-", "_")]}`}>{groupLabel(selectedSub.test_group)}</span></div>
                                <div><label>Topic</label><span>{getGroupTitle(selectedSub.test_group)}</span></div>
                            </div>

                            {/* Questions + Answers + Per-Q grading */}
                            <h3 className={styles.sectionTitle}><NotePencil size={20} style={{ verticalAlign: 'middle', marginRight: 6 }} />Read answers and grade each question</h3>
                            <div className={styles.answersList}>
                                {(selectedSub.answers || []).map((a, idx) => (
                                    <div key={idx} className={styles.answerItem}>
                                        <div className={styles.answerQ}>
                                            <span className={styles.qNum}>Question {idx + 1}</span>
                                            <span className={styles.qType}>{typeLabel(a.type)}</span>
                                            <span className={styles.qMaxPts}>{a.max_points} max pts</span>
                                        </div>
                                        <p className={styles.qContent}>{a.question || `Question #${idx + 1}`}</p>

                                        {/* Candidate's actual answer */}
                                        <div className={styles.candidateAnswer}>
                                            <label><ChatText size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />Candidate's answer:</label>
                                            <div className={styles.answerBox}>
                                                {a.answer_text || "(Not answered)"}
                                            </div>
                                        </div>

                                        {/* Judge score input per question */}
                                        <div className={styles.perQScore}>
                                            <label>Score (0-{a.max_points}):</label>
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
                                    <Warning size={18} style={{ verticalAlign: 'middle', marginRight: 4 }} />This was submitted before the update - answers are not saved. New submissions will show properly.
                                </div>
                            )}

                            {/* Summary + Notes + Save */}
                            <div className={styles.scoreSection}>
                                <div className={styles.scoreSummary}>
                                    <h3><Star size={20} weight="fill" color="#f59e0b" style={{ verticalAlign: 'middle', marginRight: 6 }} />Your total score: <strong>{totalJudgeScore}</strong> / {totalMaxPoints}</h3>
                                </div>
                                <div className={styles.scoreField} style={{ marginTop: "0.75rem" }}>
                                    <label>General Notes</label>
                                    <textarea value={myNotes} onChange={e => setMyNotes(e.target.value)} placeholder="Write general notes for the candidate..." rows={3} />
                                </div>

                                {/* Verdict: Pass / Fail */}
                                <div className={styles.verdictSection}>
                                    <label>Evaluation Result</label>
                                    <div className={styles.verdictBtns}>
                                        <button
                                            className={`${styles.verdictBtn} ${myVerdict === "pass" ? styles.verdictPass : ""}`}
                                            onClick={() => setMyVerdict(myVerdict === "pass" ? "" : "pass")}
                                        >
                                            <ThumbsUp size={18} weight={myVerdict === "pass" ? "fill" : "regular"} /> Passed
                                        </button>
                                        <button
                                            className={`${styles.verdictBtn} ${myVerdict === "fail" ? styles.verdictFail : ""}`}
                                            onClick={() => setMyVerdict(myVerdict === "fail" ? "" : "fail")}
                                        >
                                            <ThumbsDown size={18} weight={myVerdict === "fail" ? "fill" : "regular"} /> Failed
                                        </button>
                                    </div>
                                </div>
                                <div className={styles.scoreActions}>
                                    <button className={styles.saveBtn} onClick={handleScore} disabled={saving}>
                                        {saving ? "Saving..." : <><FloppyDisk size={18} style={{ verticalAlign: 'middle', marginRight: 4 }} />Save all scores</>}
                                    </button>
                                    {saveMsg && <span className={styles.saveMsg}>{saveMsg}</span>}
                                </div>

                                {/* All judges' scores */}
                                {subScores.length > 0 && (
                                    <div className={styles.allScores}>
                                        <h4>Scores from judges</h4>
                                        {subScores.map(sc => (
                                            <div key={sc.id} className={styles.scoreItem}>
                                                <div>
                                                    <strong>{sc.judges?.name || "Judge"}</strong>
                                                    {sc.judge_id === judge.id && <span className={styles.youBadge}>You</span>}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <span className={styles.scoreNum}>{sc.score} pts</span>
                                                    {(() => {
                                                        try {
                                                            const p = JSON.parse(sc.notes);
                                                            if (p.verdict === "pass") return <span className={styles.verdictPassBadge}>Passed</span>;
                                                            if (p.verdict === "fail") return <span className={styles.verdictFailBadge}>Failed</span>;
                                                        } catch { /* no verdict */ }
                                                        return null;
                                                    })()}
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

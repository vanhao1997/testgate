"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import styles from "./admin.module.css";
import * as XLSX from "xlsx";
import { GroupPieChart, PassFailPieChart, ScoreDistributionChart, AvgByGroupChart, TimelineChart } from "./charts";
import QuestionEditor from "./question-editor";
import AdminGuide from "./admin-guide";
import { ChartPie, ClipboardText, Gavel, NotePencil, DownloadSimple, X, CheckCircle, XCircle, ChartBar, Trophy, PencilSimple, Eye, EyeSlash, Info, Funnel } from "@phosphor-icons/react";

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
    answers: { qid: string; question?: string; type?: string; answer_text?: string; correct: boolean; points: number; max_points?: number }[];
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

export default function AdminPage() {
    const [authed, setAuthed] = useState(false);
    const [pin, setPin] = useState("");
    const [pinError, setPinError] = useState("");
    const [showPin, setShowPin] = useState(false);
    const [activeTab, setActiveTab] = useState<"dashboard" | "submissions" | "judges" | "questions" | "guide">("dashboard");

    // Restore session from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem("admin_session");
            if (saved) {
                const { ts } = JSON.parse(saved);
                if (Date.now() - ts < 24 * 60 * 60 * 1000) setAuthed(true);
                else localStorage.removeItem("admin_session");
            }
        } catch { /* ignore */ }
    }, []);

    // Export modal
    const [showExport, setShowExport] = useState(false);
    const [exportOpts, setExportOpts] = useState({
        sbd: true, name: true, email: true, phone: true, group: true,
        score: true, total: true, pct: true, result: true, time: true,
        answers: true, judgeSheet: true,
        filterGroup: "all" as string,
    });

    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [judges, setJudges] = useState<Judge[]>([]);
    const [loading, setLoading] = useState(true);

    const [filterGroup, setFilterGroup] = useState("all");
    const [searchText, setSearchText] = useState("");

    const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
    const [subScores, setSubScores] = useState<JudgeScore[]>([]);
    const [scoreInput, setScoreInput] = useState("");
    const [notesInput, setNotesInput] = useState("");
    const [saving, setSaving] = useState(false);

    const [newJudgeName, setNewJudgeName] = useState("");
    const [newJudgeEmail, setNewJudgeEmail] = useState("");
    const [newJudgeRole, setNewJudgeRole] = useState("judge");

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

    useEffect(() => { if (authed) loadData(); }, [authed, loadData]);

    useEffect(() => {
        if (!selectedSub) return;
        (async () => {
            const { data } = await supabase.from("judge_scores").select("*, judges(name)").eq("result_id", selectedSub.id);
            if (data) setSubScores(data as JudgeScore[]);
        })();
    }, [selectedSub]);

    const handleLogin = () => {
        if (pin === ADMIN_PIN) { setAuthed(true); setPinError(""); localStorage.setItem("admin_session", JSON.stringify({ ts: Date.now() })); } else { setPinError("Invalid PIN"); }
    };

    const handleScore = async () => {
        if (!selectedSub || !scoreInput) return;
        setSaving(true);
        const adminJudge = judges.find(j => j.role === "admin") || judges[0];
        if (!adminJudge) { setSaving(false); return; }
        await supabase.from("judge_scores").upsert({ result_id: selectedSub.id, judge_id: adminJudge.id, score: parseInt(scoreInput), notes: notesInput }, { onConflict: "result_id,judge_id" });
        const { data } = await supabase.from("judge_scores").select("*, judges(name)").eq("result_id", selectedSub.id);
        if (data) setSubScores(data as JudgeScore[]);
        setSaving(false); setScoreInput(""); setNotesInput("");
    };

    const handleAddJudge = async () => {
        if (!newJudgeName || !newJudgeEmail) return;
        await supabase.from("judges").insert({ name: newJudgeName, email: newJudgeEmail, role: newJudgeRole });
        setNewJudgeName(""); setNewJudgeEmail(""); loadData();
    };

    const handleDeleteJudge = async (id: string) => {
        if (!confirm("Delete this judge?")) return;
        await supabase.from("judges").delete().eq("id", id); loadData();
    };

    /* ====== Excel Export ====== */
    const exportToExcel = () => {
        const o = exportOpts;
        const dataToExport = (o.filterGroup === "all" ? submissions : submissions.filter(s => s.test_group === o.filterGroup));
        const rows = dataToExport.map(s => {
            const base: Record<string, string | number | boolean> = {};
            if (o.sbd) base["Candidate ID"] = s.candidate_id || "";
            if (o.name) base["Full Name"] = s.candidate_name;
            if (o.email) base["Email"] = s.candidate_email;
            if (o.phone) base["Phone"] = s.candidate_phone || "";
            if (o.group) base["Test Group"] = groupLabel(s.test_group);
            if (o.score) base["Score"] = s.score;
            if (o.total) base["Total Points"] = s.total_points;
            if (o.pct) base["Percentage (%)"] = s.percentage;
            if (o.result) base["Result"] = s.passed ? "Passed" : "Failed";
            if (o.time) base["Submitted At"] = new Date(s.submitted_at).toLocaleString("en-US");
            if (o.answers) {
                (s.answers || []).forEach((ans, idx) => {
                    base[`Question ${idx + 1}`] = ans.answer_text || (ans.correct ? "Correct" : "Incorrect");
                    base[`Points Q${idx + 1}`] = ans.points;
                });
            }
            return base;
        });
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Test Results");

        if (o.judgeSheet) {
            const judgeRows = judges.map(j => ({ "Full Name": j.name, "Email": j.email, "Role": j.role === "admin" ? "Admin" : "Judge" }));
            const ws2 = XLSX.utils.json_to_sheet(judgeRows);
            XLSX.utils.book_append_sheet(wb, ws2, "Judges");
        }

        XLSX.writeFile(wb, `WFL_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
        setShowExport(false);
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

    // Chart data
    const pieData = [
        { name: "Finance", value: groupCounts.finance },
        { name: "SC Planning", value: groupCounts["sc-planning"] },
        { name: "SC Logistics", value: groupCounts["sc-logistics"] },
    ].filter(d => d.value > 0);

    const passFailData = [
        { name: "Passed", value: submissions.filter(s => s.passed).length },
        { name: "Failed", value: submissions.filter(s => !s.passed).length },
    ];

    const scoreBuckets = [
        { range: "0-20%", count: 0 }, { range: "21-40%", count: 0 }, { range: "41-60%", count: 0 },
        { range: "61-80%", count: 0 }, { range: "81-100%", count: 0 },
    ];
    submissions.forEach(s => {
        if (s.percentage <= 20) scoreBuckets[0].count++;
        else if (s.percentage <= 40) scoreBuckets[1].count++;
        else if (s.percentage <= 60) scoreBuckets[2].count++;
        else if (s.percentage <= 80) scoreBuckets[3].count++;
        else scoreBuckets[4].count++;
    });

    const avgByGroup = [
        { group: "Finance", avg: groupCounts.finance > 0 ? Math.round(submissions.filter(s => s.test_group === "finance").reduce((a, s) => a + s.percentage, 0) / groupCounts.finance) : 0 },
        { group: "SC Planning", avg: groupCounts["sc-planning"] > 0 ? Math.round(submissions.filter(s => s.test_group === "sc-planning").reduce((a, s) => a + s.percentage, 0) / groupCounts["sc-planning"]) : 0 },
        { group: "SC Logistics", avg: groupCounts["sc-logistics"] > 0 ? Math.round(submissions.filter(s => s.test_group === "sc-logistics").reduce((a, s) => a + s.percentage, 0) / groupCounts["sc-logistics"]) : 0 },
    ];

    const timelineMap: Record<string, number> = {};
    submissions.forEach(s => { const d = new Date(s.submitted_at).toLocaleDateString("en-US"); timelineMap[d] = (timelineMap[d] || 0) + 1; });
    const timelineData = Object.entries(timelineMap).map(([date, count]) => ({ date, count })).reverse();

    // Filter
    const filtered = submissions.filter(s => {
        if (filterGroup !== "all" && s.test_group !== filterGroup) return false;
        if (searchText) {
            const q = searchText.toLowerCase();
            if (!s.candidate_name.toLowerCase().includes(q) && !s.candidate_email.toLowerCase().includes(q) && !(s.candidate_id || "").toLowerCase().includes(q)) return false;
        }
        return true;
    });

    const groupBadge = (g: string) => { if (g === "finance") return styles.badgeFinance; if (g === "sc-planning") return styles.badgePlanning; return styles.badgeLogistics; };
    const groupLabel = (g: string) => { if (g === "finance") return "Finance"; if (g === "sc-planning") return "SC Planning"; return "SC Logistics"; };

    // LOGIN
    if (!authed) {
        return (
            <div className={styles.loginPage}>
                <div className={styles.loginCard}>
                    <img src="/wfl-logo.png" alt="WFL" />
                    <h1>Admin Dashboard</h1>
                    <p>Enter PIN to access the admin system</p>
                    <div style={{ position: 'relative' }}>
                        <input className={styles.loginInput} type={showPin ? "text" : "password"} placeholder="••••••" value={pin} onChange={e => setPin(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} style={{ paddingRight: 44 }} />
                        <button onClick={() => setShowPin(!showPin)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', padding: 4 }} title={showPin ? "Hide password" : "Show password"}>
                            {showPin ? <EyeSlash size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    <button className={styles.loginBtn} onClick={handleLogin}>Log In</button>
                    {pinError && <p className={styles.loginError}>{pinError}</p>}
                </div>
            </div>
        );
    }

    // MAIN
    return (
        <div className={styles.adminPage}>
            <div className={styles.adminNav}>
                <div className={styles.adminNavLeft}>
                    <img src="/wfl-logo.png" alt="WFL" />
                    <h1>Admin Dashboard</h1>
                    <span>W-Future Leader</span>
                </div>
                <div className={styles.adminNavRight}>
                    <button className={styles.exportBtn} onClick={() => setShowExport(true)}><DownloadSimple size={18} weight="bold" /> Export Excel</button>
                    <button onClick={() => { setAuthed(false); setPin(""); localStorage.removeItem("admin_session"); }}>Log Out</button>
                </div>
            </div>

            <div className={styles.tabs}>
                <button className={`${styles.tab} ${activeTab === "dashboard" ? styles.tabActive : ""}`} onClick={() => setActiveTab("dashboard")}><ChartPie size={18} /> Overview</button>
                <button className={`${styles.tab} ${activeTab === "submissions" ? styles.tabActive : ""}`} onClick={() => setActiveTab("submissions")}><ClipboardText size={18} /> Submissions</button>
                <button className={`${styles.tab} ${activeTab === "judges" ? styles.tabActive : ""}`} onClick={() => setActiveTab("judges")}><Gavel size={18} /> Judges</button>
                <button className={`${styles.tab} ${activeTab === "questions" ? styles.tabActive : ""}`} onClick={() => setActiveTab("questions")}><NotePencil size={18} /> Question Sets</button>
                <button className={`${styles.tab} ${activeTab === "guide" ? styles.tabActive : ""}`} onClick={() => setActiveTab("guide")}><Info size={18} /> Guide</button>
            </div>

            <div className={styles.content}>
                {loading ? (
                    <div className={styles.emptyState}><p>Loading data...</p></div>
                ) : (
                    <>
                        {/* ====== DASHBOARD ====== */}
                        {activeTab === "dashboard" && (
                            <>
                                <div className={styles.statsGrid}>
                                    <div className={styles.statCard}>
                                        <div className={styles.statLabel}>Total Submissions</div>
                                        <div className={styles.statValue}>{totalSubs}</div>
                                        <div className={styles.statSub}>candidates took the test</div>
                                    </div>
                                    <div className={styles.statCard}>
                                        <div className={styles.statLabel}>Average Score</div>
                                        <div className={styles.statValue}>{avgPct}%</div>
                                        <div className={styles.statSub}>average %</div>
                                    </div>
                                    <div className={styles.statCard}>
                                        <div className={styles.statLabel}>Pass Rate</div>
                                        <div className={styles.statValue}>{passRate}%</div>
                                        <div className={styles.statSub}>≥ 70% to pass</div>
                                    </div>
                                    <div className={styles.statCard}>
                                        <div className={styles.statLabel}>Judges</div>
                                        <div className={styles.statValue}>{judges.length}</div>
                                        <div className={styles.statSub}>active users</div>
                                    </div>
                                </div>

                                {/* Charts Row 1: Pie charts */}
                                <div className={styles.chartsRow}>
                                    <div className={styles.chartCard}>
                                        <h3><ChartPie size={20} style={{ verticalAlign: 'middle', marginRight: 6 }} />Distribution by Test Group</h3>
                                        <div className={styles.chartWrap}>
                                            <GroupPieChart data={pieData} />
                                        </div>
                                    </div>
                                    <div className={styles.chartCard}>
                                        <h3><CheckCircle size={20} style={{ verticalAlign: 'middle', marginRight: 6 }} />Pass / Fail Ratio</h3>
                                        <div className={styles.chartWrap}>
                                            <PassFailPieChart data={passFailData} />
                                        </div>
                                    </div>
                                </div>

                                {/* Charts Row 2: Bar charts */}
                                <div className={styles.chartsRow}>
                                    <div className={styles.chartCard}>
                                        <h3><ChartBar size={20} style={{ verticalAlign: 'middle', marginRight: 6 }} />Score Distribution</h3>
                                        <div className={styles.chartWrap}>
                                            <ScoreDistributionChart data={scoreBuckets} />
                                        </div>
                                    </div>
                                    <div className={styles.chartCard}>
                                        <h3><Trophy size={20} style={{ verticalAlign: 'middle', marginRight: 6 }} />Average Score by Group</h3>
                                        <div className={styles.chartWrap}>
                                            <AvgByGroupChart data={avgByGroup} />
                                        </div>
                                    </div>
                                </div>

                                {/* Timeline */}
                                {timelineData.length > 1 && (
                                    <div className={styles.chartCardFull}>
                                        <h3>📅 Submissions by Date</h3>
                                        <div className={styles.chartWrap}>
                                            <TimelineChart data={timelineData} />
                                        </div>
                                    </div>
                                )}

                                {/* Recent submissions */}
                                <div className={styles.tableCard} style={{ marginTop: "1rem" }}>
                                    <div className={styles.tableHeader}><h3>Recent Submissions</h3></div>
                                    <table className={styles.dataTable}>
                                        <thead><tr><th>ID</th><th>Full Name</th><th>Group</th><th>Score</th><th>%</th><th>Time</th></tr></thead>
                                        <tbody>
                                            {submissions.slice(0, 5).map(s => (
                                                <tr key={s.id} onClick={() => { setSelectedSub(s); setScoreInput(""); setNotesInput(""); }}>
                                                    <td>{s.candidate_id || "—"}</td>
                                                    <td><strong>{s.candidate_name}</strong></td>
                                                    <td><span className={`${styles.badge} ${groupBadge(s.test_group)}`}>{groupLabel(s.test_group)}</span></td>
                                                    <td>{s.score}/{s.total_points}</td>
                                                    <td>{s.percentage}%</td>
                                                    <td>{new Date(s.submitted_at).toLocaleString("en-US")}</td>
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
                                    <h3>All Submissions ({filtered.length})</h3>
                                    <div className={styles.filters}>
                                        <input className={styles.filterInput} placeholder="Search name, email, ID..." value={searchText} onChange={e => setSearchText(e.target.value)} />
                                        <select className={styles.filterSelect} value={filterGroup} onChange={e => setFilterGroup(e.target.value)}>
                                            <option value="all">All Groups</option>
                                            <option value="finance">Finance</option>
                                            <option value="sc-planning">SC Planning</option>
                                            <option value="sc-logistics">SC Logistics</option>
                                        </select>
                                        <button className={styles.exportBtnSm} onClick={() => setShowExport(true)}><DownloadSimple size={16} /> Excel</button>
                                    </div>
                                </div>
                                <table className={styles.dataTable}>
                                    <thead><tr><th>ID</th><th>Full Name</th><th>Email</th><th>Group</th><th>Score</th><th>%</th><th>Result</th><th>Time</th></tr></thead>
                                    <tbody>
                                        {filtered.length === 0 ? (
                                            <tr><td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>No submissions found</td></tr>
                                        ) : filtered.map(s => (
                                            <tr key={s.id} onClick={() => { setSelectedSub(s); setScoreInput(""); setNotesInput(""); }}>
                                                <td>{s.candidate_id || "—"}</td>
                                                <td><strong>{s.candidate_name}</strong></td>
                                                <td>{s.candidate_email}</td>
                                                <td><span className={`${styles.badge} ${groupBadge(s.test_group)}`}>{groupLabel(s.test_group)}</span></td>
                                                <td>{s.score}/{s.total_points}</td>
                                                <td>{s.percentage}%</td>
                                                <td><span className={`${styles.badge} ${s.passed ? styles.badgeGraded : styles.badgePending}`}>{s.passed ? "Passed" : "Failed"}</span></td>
                                                <td>{new Date(s.submitted_at).toLocaleString("en-US")}</td>
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
                                    <h3>➕ Add New Judge</h3>
                                    <div className={styles.addJudgeFields}>
                                        <div className="field"><label>Full Name</label><input placeholder="Enter full name" value={newJudgeName} onChange={e => setNewJudgeName(e.target.value)} /></div>
                                        <div className="field"><label>Email</label><input type="email" placeholder="email@wilmar.com" value={newJudgeEmail} onChange={e => setNewJudgeEmail(e.target.value)} /></div>
                                        <div className="field"><label>Role</label><select value={newJudgeRole} onChange={e => setNewJudgeRole(e.target.value)}><option value="judge">Judge</option><option value="admin">Admin</option></select></div>
                                        <button onClick={handleAddJudge}>Add</button>
                                    </div>
                                </div>
                                <div className={styles.judgeGrid}>
                                    {judges.map(j => (
                                        <div key={j.id} className={styles.judgeCard}>
                                            <div className={styles.judgeInfo}>
                                                <h4>{j.name} <span className={`${styles.judgeRole} ${j.role === "admin" ? styles.roleAdmin : styles.roleJudge}`}>{j.role === "admin" ? "Admin" : "Judge"}</span></h4>
                                                <p>{j.email}</p>
                                            </div>
                                            <button className={styles.deleteJudge} onClick={() => handleDeleteJudge(j.id)} title="Delete"><X size={16} /></button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* ====== QUESTIONS ====== */}
                        {activeTab === "questions" && <QuestionEditor />}
                        {activeTab === "guide" && <AdminGuide />}
                    </>
                )}
            </div>

            {/* ====== DETAIL PANEL ====== */}
            {selectedSub && (
                <div className={styles.detailOverlay} onClick={() => setSelectedSub(null)}>
                    <div className={styles.detailPanel} onClick={e => e.stopPropagation()}>
                        <div className={styles.detailHeader}>
                            <h2>Submission Details</h2>
                            <button className={styles.closeBtn} onClick={() => setSelectedSub(null)}><X size={20} /></button>
                        </div>
                        <div className={styles.detailBody}>
                            <div className={styles.candidateInfo}>
                                <div className={styles.infoItem}><label>ID</label><span>{selectedSub.candidate_id || "—"}</span></div>
                                <div className={styles.infoItem}><label>Full Name</label><span>{selectedSub.candidate_name}</span></div>
                                <div className={styles.infoItem}><label>Email</label><span>{selectedSub.candidate_email}</span></div>
                                <div className={styles.infoItem}><label>Phone</label><span>{selectedSub.candidate_phone || "—"}</span></div>
                                <div className={styles.infoItem}><label>Test Group</label><span className={`${styles.badge} ${groupBadge(selectedSub.test_group)}`}>{groupLabel(selectedSub.test_group)}</span></div>
                                <div className={styles.infoItem}><label>Auto Score</label><span>{selectedSub.score}/{selectedSub.total_points} ({selectedSub.percentage}%)</span></div>
                            </div>

                            <div className={styles.answersSection}>
                                <h3><PencilSimple size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />Answers ({(selectedSub.answers || []).length} questions)</h3>
                                {(selectedSub.answers || []).map((a, idx) => (
                                    <div key={idx} className={styles.answerItem}>
                                        <div className={styles.answerQuestion}>Question {idx + 1}: {a.question || `Question #${idx + 1}`}</div>
                                        {a.answer_text && <div className={styles.answerTextBox}><strong>Answer:</strong> {a.answer_text}</div>}
                                        <div className={a.correct ? styles.answerCorrect : styles.answerWrong}>
                                            {a.correct ? <CheckCircle size={16} color="#16a34a" weight="fill" /> : <XCircle size={16} color="#ef4444" weight="fill" />} {a.points ?? 0}/{a.max_points || "?"} points
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.scoreForm}>
                                <h3>⭐ Judge Scoring</h3>
                                <div className={styles.scoreInputGroup}>
                                    <div style={{ flex: "0 0 120px" }}><label>Score (0-100)</label><input type="number" min="0" max="100" value={scoreInput} onChange={e => setScoreInput(e.target.value)} placeholder="0" /></div>
                                    <div style={{ flex: 1 }}><label>Notes</label><textarea value={notesInput} onChange={e => setNotesInput(e.target.value)} placeholder="Add notes for candidate..." /></div>
                                </div>
                                <div className={styles.scoreActions}>
                                    <button className={`${styles.btnScore} ${styles.btnScorePrimary}`} onClick={handleScore} disabled={saving || !scoreInput}>{saving ? "Saving..." : "Save Score"}</button>
                                </div>
                                {subScores.length > 0 && (
                                    <div className={styles.existingScores}>
                                        <h4>Existing Scores</h4>
                                        {subScores.map(sc => (
                                            <div key={sc.id} className={styles.scoreEntry}>
                                                <span><strong>{sc.judges?.name || "Judge"}</strong>: {sc.score} points</span>
                                                <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>{sc.notes || ""}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ====== EXPORT MODAL ====== */}
            {showExport && (
                <div className={styles.detailOverlay} onClick={() => setShowExport(false)}>
                    <div className={styles.detailPanel} onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
                        <div className={styles.detailHeader}>
                            <h2><Funnel size={20} style={{ verticalAlign: 'middle', marginRight: 6 }} />Custom Excel Export</h2>
                            <button className={styles.closeBtn} onClick={() => setShowExport(false)}><X size={20} /></button>
                        </div>
                        <div className={styles.detailBody} style={{ padding: "1.25rem" }}>
                            {/* Group filter */}
                            <div style={{ marginBottom: "1rem" }}>
                                <label style={{ fontWeight: 600, fontSize: "0.82rem", display: "block", marginBottom: 4 }}>Filter by Test Group</label>
                                <select value={exportOpts.filterGroup} onChange={e => setExportOpts({ ...exportOpts, filterGroup: e.target.value })} style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid var(--color-bg-tertiary)", fontSize: "0.85rem" }}>
                                    <option value="all">All Groups</option>
                                    <option value="finance">Finance</option>
                                    <option value="sc-planning">SC Planning</option>
                                    <option value="sc-logistics">SC Logistics</option>
                                </select>
                            </div>

                            {/* Column checkboxes */}
                            <div style={{ marginBottom: "1rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                    <label style={{ fontWeight: 600, fontSize: "0.82rem" }}>Candidate Information</label>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <button onClick={() => setExportOpts({ ...exportOpts, sbd: true, name: true, email: true, phone: true })} style={{ fontSize: "0.72rem", background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", fontWeight: 600 }}>Select All</button>
                                        <button onClick={() => setExportOpts({ ...exportOpts, sbd: false, name: false, email: false, phone: false })} style={{ fontSize: "0.72rem", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontWeight: 600 }}>Deselect All</button>
                                    </div>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px" }}>
                                    <ExportCheck label="Candidate ID" checked={exportOpts.sbd} onChange={v => setExportOpts({ ...exportOpts, sbd: v })} />
                                    <ExportCheck label="Full Name" checked={exportOpts.name} onChange={v => setExportOpts({ ...exportOpts, name: v })} />
                                    <ExportCheck label="Email" checked={exportOpts.email} onChange={v => setExportOpts({ ...exportOpts, email: v })} />
                                    <ExportCheck label="Phone Number" checked={exportOpts.phone} onChange={v => setExportOpts({ ...exportOpts, phone: v })} />
                                </div>
                            </div>

                            <div style={{ marginBottom: "1rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                    <label style={{ fontWeight: 600, fontSize: "0.82rem" }}>Test Results</label>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <button onClick={() => setExportOpts({ ...exportOpts, group: true, score: true, total: true, pct: true, result: true, time: true })} style={{ fontSize: "0.72rem", background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", fontWeight: 600 }}>Select All</button>
                                        <button onClick={() => setExportOpts({ ...exportOpts, group: false, score: false, total: false, pct: false, result: false, time: false })} style={{ fontSize: "0.72rem", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontWeight: 600 }}>Deselect All</button>
                                    </div>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px" }}>
                                    <ExportCheck label="Test Group" checked={exportOpts.group} onChange={v => setExportOpts({ ...exportOpts, group: v })} />
                                    <ExportCheck label="Score" checked={exportOpts.score} onChange={v => setExportOpts({ ...exportOpts, score: v })} />
                                    <ExportCheck label="Total Points" checked={exportOpts.total} onChange={v => setExportOpts({ ...exportOpts, total: v })} />
                                    <ExportCheck label="Percentage (%)" checked={exportOpts.pct} onChange={v => setExportOpts({ ...exportOpts, pct: v })} />
                                    <ExportCheck label="Result (Passed/Failed)" checked={exportOpts.result} onChange={v => setExportOpts({ ...exportOpts, result: v })} />
                                    <ExportCheck label="Submitted Time" checked={exportOpts.time} onChange={v => setExportOpts({ ...exportOpts, time: v })} />
                                </div>
                            </div>

                            <div style={{ marginBottom: "1.25rem" }}>
                                <label style={{ fontWeight: 600, fontSize: "0.82rem", display: "block", marginBottom: 8 }}>Additional Content</label>
                                <ExportCheck label="Detailed answers for each question" checked={exportOpts.answers} onChange={v => setExportOpts({ ...exportOpts, answers: v })} />
                                <ExportCheck label="Judges list sheet" checked={exportOpts.judgeSheet} onChange={v => setExportOpts({ ...exportOpts, judgeSheet: v })} />
                            </div>

                            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                <button onClick={() => setShowExport(false)} style={{ padding: "8px 20px", background: "var(--color-bg-tertiary)", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}>Cancel</button>
                                <button onClick={exportToExcel} style={{ padding: "8px 24px", background: "var(--color-primary)", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 6 }}>
                                    <DownloadSimple size={16} weight="bold" /> Download
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ExportCheck({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem", cursor: "pointer", padding: "3px 0" }}>
            <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ width: 15, height: 15, accentColor: "var(--color-primary)" }} />
            {label}
        </label>
    );
}

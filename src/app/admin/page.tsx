"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import styles from "./admin.module.css";
import * as XLSX from "xlsx";
import { GroupPieChart, PassFailPieChart, ScoreDistributionChart, AvgByGroupChart, TimelineChart } from "./charts";

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
    const [activeTab, setActiveTab] = useState<"dashboard" | "submissions" | "judges">("dashboard");

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
        if (pin === ADMIN_PIN) { setAuthed(true); setPinError(""); } else { setPinError("Mã PIN không đúng"); }
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
        if (!confirm("Xóa giám khảo này?")) return;
        await supabase.from("judges").delete().eq("id", id); loadData();
    };

    /* ====== Excel Export ====== */
    const exportToExcel = () => {
        const dataToExport = (filterGroup === "all" ? submissions : submissions.filter(s => s.test_group === filterGroup));
        const rows = dataToExport.map(s => {
            const base: Record<string, string | number | boolean> = {
                "Số báo danh": s.candidate_id || "",
                "Họ tên": s.candidate_name,
                "Email": s.candidate_email,
                "SĐT": s.candidate_phone || "",
                "Nhóm thi": groupLabel(s.test_group),
                "Điểm": s.score,
                "Tổng điểm": s.total_points,
                "Phần trăm (%)": s.percentage,
                "Kết quả": s.passed ? "Đạt" : "Chưa đạt",
                "Thời gian nộp": new Date(s.submitted_at).toLocaleString("vi-VN"),
            };
            (s.answers || []).forEach((ans, idx) => {
                base[`Câu ${idx + 1}`] = ans.answer_text || (ans.correct ? "Đúng" : "Sai");
                base[`Điểm C${idx + 1}`] = ans.points;
            });
            return base;
        });
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Kết quả thi");

        const judgeRows = judges.map(j => ({ "Họ tên": j.name, "Email": j.email, "Vai trò": j.role === "admin" ? "Admin" : "Giám khảo" }));
        const ws2 = XLSX.utils.json_to_sheet(judgeRows);
        XLSX.utils.book_append_sheet(wb, ws2, "Giám khảo");

        XLSX.writeFile(wb, `WFL_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
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
        { name: "Đạt", value: submissions.filter(s => s.passed).length },
        { name: "Chưa đạt", value: submissions.filter(s => !s.passed).length },
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
    submissions.forEach(s => { const d = new Date(s.submitted_at).toLocaleDateString("vi-VN"); timelineMap[d] = (timelineMap[d] || 0) + 1; });
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
                    <p>Nhập mã PIN để truy cập hệ thống quản lý</p>
                    <input className={styles.loginInput} type="password" placeholder="••••••" value={pin} onChange={e => setPin(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
                    <button className={styles.loginBtn} onClick={handleLogin}>Đăng nhập</button>
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
                    <button className={styles.exportBtn} onClick={exportToExcel}>📥 Tải Excel</button>
                    <button onClick={() => { setAuthed(false); setPin(""); }}>Đăng xuất</button>
                </div>
            </div>

            <div className={styles.tabs}>
                <button className={`${styles.tab} ${activeTab === "dashboard" ? styles.tabActive : ""}`} onClick={() => setActiveTab("dashboard")}>📊 Tổng quan</button>
                <button className={`${styles.tab} ${activeTab === "submissions" ? styles.tabActive : ""}`} onClick={() => setActiveTab("submissions")}>📋 Bài nộp</button>
                <button className={`${styles.tab} ${activeTab === "judges" ? styles.tabActive : ""}`} onClick={() => setActiveTab("judges")}>👨‍⚖️ Giám khảo</button>
            </div>

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

                                {/* Charts Row 1: Pie charts */}
                                <div className={styles.chartsRow}>
                                    <div className={styles.chartCard}>
                                        <h3>📊 Phân bổ theo nhóm thi</h3>
                                        <div className={styles.chartWrap}>
                                            <GroupPieChart data={pieData} />
                                        </div>
                                    </div>
                                    <div className={styles.chartCard}>
                                        <h3>✅ Tỷ lệ Đạt / Chưa đạt</h3>
                                        <div className={styles.chartWrap}>
                                            <PassFailPieChart data={passFailData} />
                                        </div>
                                    </div>
                                </div>

                                {/* Charts Row 2: Bar charts */}
                                <div className={styles.chartsRow}>
                                    <div className={styles.chartCard}>
                                        <h3>📈 Phân bổ điểm số</h3>
                                        <div className={styles.chartWrap}>
                                            <ScoreDistributionChart data={scoreBuckets} />
                                        </div>
                                    </div>
                                    <div className={styles.chartCard}>
                                        <h3>🏆 Điểm trung bình theo nhóm</h3>
                                        <div className={styles.chartWrap}>
                                            <AvgByGroupChart data={avgByGroup} />
                                        </div>
                                    </div>
                                </div>

                                {/* Timeline */}
                                {timelineData.length > 1 && (
                                    <div className={styles.chartCardFull}>
                                        <h3>📅 Số bài nộp theo ngày</h3>
                                        <div className={styles.chartWrap}>
                                            <TimelineChart data={timelineData} />
                                        </div>
                                    </div>
                                )}

                                {/* Recent submissions */}
                                <div className={styles.tableCard} style={{ marginTop: "1rem" }}>
                                    <div className={styles.tableHeader}><h3>Bài nộp gần đây</h3></div>
                                    <table className={styles.dataTable}>
                                        <thead><tr><th>SBD</th><th>Họ tên</th><th>Nhóm</th><th>Điểm</th><th>%</th><th>Thời gian</th></tr></thead>
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
                                        <button className={styles.exportBtnSm} onClick={exportToExcel}>📥 Excel</button>
                                    </div>
                                </div>
                                <table className={styles.dataTable}>
                                    <thead><tr><th>SBD</th><th>Họ tên</th><th>Email</th><th>Nhóm</th><th>Điểm</th><th>%</th><th>Kết quả</th><th>Thời gian</th></tr></thead>
                                    <tbody>
                                        {filtered.length === 0 ? (
                                            <tr><td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>Không có bài nộp nào</td></tr>
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
                                        <div className="field"><label>Họ tên</label><input placeholder="Nhập họ tên" value={newJudgeName} onChange={e => setNewJudgeName(e.target.value)} /></div>
                                        <div className="field"><label>Email</label><input type="email" placeholder="email@wilmar.com" value={newJudgeEmail} onChange={e => setNewJudgeEmail(e.target.value)} /></div>
                                        <div className="field"><label>Vai trò</label><select value={newJudgeRole} onChange={e => setNewJudgeRole(e.target.value)}><option value="judge">Giám khảo</option><option value="admin">Admin</option></select></div>
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
                            <div className={styles.candidateInfo}>
                                <div className={styles.infoItem}><label>SBD</label><span>{selectedSub.candidate_id || "—"}</span></div>
                                <div className={styles.infoItem}><label>Họ tên</label><span>{selectedSub.candidate_name}</span></div>
                                <div className={styles.infoItem}><label>Email</label><span>{selectedSub.candidate_email}</span></div>
                                <div className={styles.infoItem}><label>SĐT</label><span>{selectedSub.candidate_phone || "—"}</span></div>
                                <div className={styles.infoItem}><label>Nhóm thi</label><span className={`${styles.badge} ${groupBadge(selectedSub.test_group)}`}>{groupLabel(selectedSub.test_group)}</span></div>
                                <div className={styles.infoItem}><label>Điểm tự động</label><span>{selectedSub.score}/{selectedSub.total_points} ({selectedSub.percentage}%)</span></div>
                            </div>

                            <div className={styles.answersSection}>
                                <h3>📝 Câu trả lời ({(selectedSub.answers || []).length} câu)</h3>
                                {(selectedSub.answers || []).map((a, idx) => (
                                    <div key={idx} className={styles.answerItem}>
                                        <div className={styles.answerQuestion}>Câu {idx + 1}: {a.question || `Câu hỏi #${idx + 1}`}</div>
                                        {a.answer_text && <div className={styles.answerTextBox}><strong>Trả lời:</strong> {a.answer_text}</div>}
                                        <div className={a.correct ? styles.answerCorrect : styles.answerWrong}>
                                            {a.correct ? "✅" : "❌"} {a.points ?? 0}/{a.max_points || "?"} điểm
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.scoreForm}>
                                <h3>⭐ Chấm điểm giám khảo</h3>
                                <div className={styles.scoreInputGroup}>
                                    <div style={{ flex: "0 0 120px" }}><label>Điểm (0-100)</label><input type="number" min="0" max="100" value={scoreInput} onChange={e => setScoreInput(e.target.value)} placeholder="0" /></div>
                                    <div style={{ flex: 1 }}><label>Nhận xét</label><textarea value={notesInput} onChange={e => setNotesInput(e.target.value)} placeholder="Ghi chú nhận xét cho ứng viên..." /></div>
                                </div>
                                <div className={styles.scoreActions}>
                                    <button className={`${styles.btnScore} ${styles.btnScorePrimary}`} onClick={handleScore} disabled={saving || !scoreInput}>{saving ? "Đang lưu..." : "Lưu điểm"}</button>
                                </div>
                                {subScores.length > 0 && (
                                    <div className={styles.existingScores}>
                                        <h4>Điểm đã chấm</h4>
                                        {subScores.map(sc => (
                                            <div key={sc.id} className={styles.scoreEntry}>
                                                <span><strong>{sc.judges?.name || "GK"}</strong>: {sc.score} điểm</span>
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
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase, TestResult } from "../lib/supabase";
import { ThemeToggle } from "../components/ThemeToggle";

const PIN = "team2026";

const GROUP_LABELS: Record<string, string> = {
    marketing: "Marketing",
    sales: "Sales",
    technical: "Technical",
};

export default function KetQuaPage() {
    const [pinInput, setPinInput] = useState("");
    const [authed, setAuthed] = useState(false);
    const [results, setResults] = useState<TestResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<string>("all");

    const handleAuth = () => {
        if (pinInput === PIN) {
            setAuthed(true);
            loadResults();
        } else {
            alert("Incorrect PIN!");
        }
    };

    const loadResults = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("test_results")
            .select("*")
            .order("submitted_at", { ascending: false });
        if (!error && data) setResults(data);
        setLoading(false);
    };

    const filtered = filter === "all" ? results : results.filter((r) => r.test_group === filter);

    const stats = {
        total: results.length,
        passed: results.filter((r) => r.passed).length,
        avg: results.length > 0 ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length) : 0,
    };

    const groupStats = (group: string) => {
        const g = results.filter((r) => r.test_group === group);
        return {
            count: g.length,
            avg: g.length > 0 ? Math.round(g.reduce((s, r) => s + r.percentage, 0) / g.length) : 0,
            passed: g.filter((r) => r.passed).length,
        };
    };

    const exportCSV = () => {
        const header = "Full Name,Email,Phone,Track,Score,Total Points,%,Passed,Time\n";
        const rows = filtered.map((r) =>
            `"${r.candidate_name}","${r.candidate_email}","${r.candidate_phone}","${GROUP_LABELS[r.test_group] || r.test_group}",${r.score},${r.total_points},${r.percentage}%,${r.passed ? "Passed" : "Failed"},"${new Date(r.submitted_at || "").toLocaleString("en-US")}"`
        ).join("\n");
        const blob = new Blob(["\uFEFF" + header + rows], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `wilmar-testgate-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
    };

    // PIN gate
    if (!authed) {
        return (
            <div style={{ minHeight: "100dvh", background: "var(--color-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div className="card animate-fade-in-up" style={{ padding: "var(--space-2xl)", maxWidth: "400px", width: "100%", textAlign: "center" }}>
                    <img src="https://www.wilmar-agro.com.vn/_next/static/media/logo.ed31d771.webp" alt="Wilmar" style={{ height: 48, margin: "0 auto var(--space-lg)" }} />
                    <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--font-size-xl)", fontWeight: 700, marginBottom: "var(--space-xs)" }}>Candidate Results</h2>
                    <div className="gold-bar" style={{ margin: "0 auto var(--space-md)" }} />
                    <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-sm)", marginBottom: "var(--space-xl)", lineHeight: 1.6 }}>Enter internal PIN to view results table</p>
                    <input className="form-input" type="password" placeholder="Enter PIN" value={pinInput} onChange={(e) => setPinInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAuth()} style={{ marginBottom: "var(--space-lg)", textAlign: "center", fontSize: "var(--font-size-lg)", letterSpacing: "0.2em" }} />
                    <button className="btn btn-primary btn-lg" style={{ width: "100%" }} onClick={handleAuth}>View results</button>
                    <Link href="/" style={{ display: "block", marginTop: "var(--space-lg)", fontSize: "var(--font-size-sm)", color: "var(--color-text-tertiary)" }}>Return to homepage</Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100dvh", background: "var(--color-bg-secondary)" }}>
            {/* Header */}
            <header style={{ padding: "0.75rem 0", borderBottom: "1px solid var(--color-border)", background: "var(--color-bg-primary)", position: "sticky", top: 0, zIndex: 100 }}>
                <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Link href="/">
                        <img src="https://www.wilmar-agro.com.vn/_next/static/media/logo.ed31d771.webp" alt="Wilmar Agro Vietnam" style={{ height: 40, width: "auto" }} />
                    </Link>
                    <div style={{ display: "flex", gap: "var(--space-sm)", alignItems: "center" }}>
                        <button className="btn btn-secondary" onClick={loadResults} disabled={loading}>
                            {loading ? "Loading..." : "Refresh"}
                        </button>
                        <button className="btn btn-primary" onClick={exportCSV}>
                            Export CSV
                        </button>
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            <div className="container" style={{ padding: "var(--space-2xl) 0" }}>
                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--space-md)", marginBottom: "var(--space-2xl)" }}>
                    <div className="card stagger" style={{ padding: "var(--space-lg)", textAlign: "center" }}>
                        <div style={{ fontFamily: "var(--font-heading)", fontSize: "var(--font-size-2xl)", fontWeight: 800 }}>{stats.total}</div>
                        <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-tertiary)", fontWeight: 500 }}>Total Candidates</div>
                    </div>
                    <div className="card stagger" style={{ padding: "var(--space-lg)", textAlign: "center" }}>
                        <div style={{ fontFamily: "var(--font-heading)", fontSize: "var(--font-size-2xl)", fontWeight: 800, color: "var(--color-success)" }}>{stats.passed}</div>
                        <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-tertiary)", fontWeight: 500 }}>Passed Candidates</div>
                    </div>
                    <div className="card stagger" style={{ padding: "var(--space-lg)", textAlign: "center" }}>
                        <div style={{ fontFamily: "var(--font-heading)", fontSize: "var(--font-size-2xl)", fontWeight: 800, color: "var(--color-primary)" }}>{stats.avg}%</div>
                        <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-tertiary)", fontWeight: 500 }}>Avg Score</div>
                    </div>
                    {["marketing", "sales", "technical"].map((g) => {
                        const s = groupStats(g);
                        return (
                            <div key={g} className="card stagger" style={{ padding: "var(--space-lg)", textAlign: "center" }}>
                                <div style={{ fontFamily: "var(--font-heading)", fontSize: "var(--font-size-sm)", fontWeight: 700, marginBottom: "var(--space-xs)" }}>
                                    {GROUP_LABELS[g]}
                                </div>
                                <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-tertiary)" }}>
                                    {s.count} · Avg {s.avg}% · {s.passed} passed
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Filter */}
                <div style={{ display: "flex", gap: "var(--space-sm)", marginBottom: "var(--space-lg)", flexWrap: "wrap" }}>
                    {[{ value: "all", label: "All" }, { value: "marketing", label: "Marketing" }, { value: "sales", label: "Sales" }, { value: "technical", label: "Technical" }].map((f) => (
                        <button key={f.value} className={`btn ${filter === f.value ? "btn-primary" : "btn-secondary"}`} onClick={() => setFilter(f.value)} style={{ fontSize: "var(--font-size-sm)" }}>
                            {f.label} ({f.value !== "all" ? results.filter((r) => r.test_group === f.value).length : results.length})
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="card" style={{ overflow: "hidden", padding: 0 }}>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--font-size-sm)" }}>
                            <thead>
                                <tr style={{ borderBottom: "2px solid var(--color-border)", background: "var(--color-bg-secondary)" }}>
                                    <th style={{ padding: "var(--space-md)", textAlign: "left", fontFamily: "var(--font-heading)", fontWeight: 600, color: "var(--color-text-tertiary)", fontSize: "var(--font-size-xs)", textTransform: "uppercase", letterSpacing: "0.05em" }}>#</th>
                                    <th style={{ padding: "var(--space-md)", textAlign: "left", fontFamily: "var(--font-heading)", fontWeight: 600, color: "var(--color-text-tertiary)", fontSize: "var(--font-size-xs)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Candidate</th>
                                    <th style={{ padding: "var(--space-md)", textAlign: "left", fontFamily: "var(--font-heading)", fontWeight: 600, color: "var(--color-text-tertiary)", fontSize: "var(--font-size-xs)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Track</th>
                                    <th style={{ padding: "var(--space-md)", textAlign: "center", fontFamily: "var(--font-heading)", fontWeight: 600, color: "var(--color-text-tertiary)", fontSize: "var(--font-size-xs)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Score</th>
                                    <th style={{ padding: "var(--space-md)", textAlign: "center", fontFamily: "var(--font-heading)", fontWeight: 600, color: "var(--color-text-tertiary)", fontSize: "var(--font-size-xs)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Result</th>
                                    <th style={{ padding: "var(--space-md)", textAlign: "right", fontFamily: "var(--font-heading)", fontWeight: 600, color: "var(--color-text-tertiary)", fontSize: "var(--font-size-xs)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 && (
                                    <tr><td colSpan={6} style={{ padding: "var(--space-2xl)", textAlign: "center", color: "var(--color-text-tertiary)" }}>No results found</td></tr>
                                )}
                                {filtered.map((r, i) => (
                                    <tr key={r.id} style={{ borderBottom: "1px solid var(--color-border)", transition: "background 150ms ease" }}>
                                        <td style={{ padding: "var(--space-md)", color: "var(--color-text-tertiary)", fontVariantNumeric: "tabular-nums" }}>{i + 1}</td>
                                        <td style={{ padding: "var(--space-md)" }}>
                                            <div style={{ fontWeight: 600 }}>{r.candidate_name}</div>
                                            <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-tertiary)" }}>{r.candidate_email}</div>
                                        </td>
                                        <td style={{ padding: "var(--space-md)" }}>
                                            <span className="badge badge-primary">{GROUP_LABELS[r.test_group] || r.test_group}</span>
                                        </td>
                                        <td style={{ padding: "var(--space-md)", textAlign: "center" }}>
                                            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "var(--font-size-lg)", color: r.percentage >= 70 ? "var(--color-success)" : "var(--color-danger)", fontVariantNumeric: "tabular-nums" }}>{r.percentage}%</div>
                                            <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-tertiary)", fontVariantNumeric: "tabular-nums" }}>{r.score}/{r.total_points}</div>
                                        </td>
                                        <td style={{ padding: "var(--space-md)", textAlign: "center" }}>
                                            <span className={`badge ${r.passed ? "badge-accent" : "badge-danger"}`}>{r.passed ? "Passed" : "Failed"}</span>
                                        </td>
                                        <td style={{ padding: "var(--space-md)", textAlign: "right", fontSize: "var(--font-size-xs)", color: "var(--color-text-tertiary)", fontVariantNumeric: "tabular-nums" }}>
                                            {r.submitted_at ? new Date(r.submitted_at).toLocaleString("en-US") : "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

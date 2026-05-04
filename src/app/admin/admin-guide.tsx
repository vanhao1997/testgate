"use client";
import { Info, UserCircle, ClipboardText, Gavel, NotePencil, LockKey, Globe, Database } from "@phosphor-icons/react";
import styles from "./admin.module.css";

export default function AdminGuide() {
    return (
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <div style={{ background: "white", borderRadius: 12, padding: "2rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid var(--color-bg-tertiary)" }}>
                <h2 style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 0 1.5rem 0", fontSize: "1.2rem" }}>
                    <Info size={24} weight="fill" color="var(--color-primary)" /> Admin Dashboard User Guide
                </h2>

                {/* Sections */}
                <Section icon={<LockKey size={20} weight="duotone" />} title="Admin Login">
                    <p>Access the <code>/admin</code> page and enter the provided PIN. Click the <strong>👁</strong> icon to view the password before logging in.</p>
                </Section>

                <Section icon={<ClipboardText size={20} weight="duotone" />} title="Overview Tab">
                    <ul>
                        <li><strong>Quick Stats:</strong> Total submissions, average score, pass rate, number of judges</li>
                        <li><strong>Charts:</strong> Distribution by test group, pass/fail rate, score distribution, average score by group</li>
                        <li><strong>Download Excel:</strong> Click the "Download Excel" button to export all test data</li>
                    </ul>
                </Section>

                <Section icon={<ClipboardText size={20} weight="duotone" />} title="Submissions Tab">
                    <ul>
                        <li>View the list of all candidate submissions</li>
                        <li>Filter by test group (Finance, SC Planning, SC Logistics)</li>
                        <li>Search by candidate name or ID</li>
                        <li>Click on each submission to view detailed answers</li>
                    </ul>
                </Section>

                <Section icon={<Gavel size={20} weight="duotone" />} title="Judges Tab">
                    <ul>
                        <li><strong>Add Judge:</strong> Enter name and email, click "Add"</li>
                        <li><strong>Delete Judge:</strong> Click the "✕" button next to the judge</li>
                        <li>Judges log in via email on the <code>/judge</code> page</li>
                        <li>Judges will manually enter scores for each question of the candidate</li>
                    </ul>
                </Section>

                <Section icon={<NotePencil size={20} weight="duotone" />} title="Question Sets Tab">
                    <ul>
                        <li><strong>View Question Set:</strong> Click on the question set title to expand/collapse the question list</li>
                        <li><strong>Add New Question Set:</strong> Click "+ Add Question Set", enter ID, title, icon, time</li>
                        <li><strong>Edit Question Set:</strong> Click the pencil icon, edit info, click "Save"</li>
                        <li><strong>Delete Question Set:</strong> Click the trash icon (will also delete all questions inside)</li>
                        <li><strong>Add Question:</strong> Open question set → Click "+ Add Question" at the bottom</li>
                        <li><strong>4 Question Types:</strong> Single Choice, Multiple Choice, True/False, Essay</li>
                    </ul>
                </Section>

                <Section icon={<UserCircle size={20} weight="duotone" />} title="Candidate Page">
                    <ul>
                        <li>URL format: <code>/t/[link-code]</code></li>
                        <li>Candidate enters info → chooses test group → takes test → submits</li>
                        <li>Submissions will automatically appear on the Admin Dashboard</li>
                    </ul>
                </Section>

                <Section icon={<Globe size={20} weight="duotone" />} title="Quick Links">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginTop: 4 }}>
                        <LinkCard label="Admin Page" href="/admin" />
                        <LinkCard label="Judge Page" href="/judge" />
                        <LinkCard label="Test Page (Sample)" href="/t/default" />
                        <LinkCard label="Supabase Dashboard" href="https://supabase.com/dashboard" external />
                    </div>
                </Section>

                <Section icon={<Database size={20} weight="duotone" />} title="Data Structure">
                    <table style={{ width: "100%", fontSize: "0.82rem", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "2px solid var(--color-bg-tertiary)", textAlign: "left" }}>
                                <th style={{ padding: "6px 8px" }}>Table</th>
                                <th style={{ padding: "6px 8px" }}>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                ["test_groups", "Question sets (title, duration, icon)"],
                                ["questions", "Questions (content, type, answer, points)"],
                                ["test_results", "Candidate submissions"],
                                ["judges", "List of judges"],
                                ["judge_scores", "Scores from judges"],
                                ["test_links", "Custom test links"],
                            ].map(([name, desc]) => (
                                <tr key={name} style={{ borderBottom: "1px solid var(--color-bg-tertiary)" }}>
                                    <td style={{ padding: "6px 8px", fontFamily: "monospace", fontWeight: 600 }}>{name}</td>
                                    <td style={{ padding: "6px 8px", color: "var(--color-text-secondary)" }}>{desc}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Section>
            </div>
        </div>
    );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: "1.25rem", paddingBottom: "1.25rem", borderBottom: "1px solid var(--color-bg-tertiary)" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.95rem", fontWeight: 700, margin: "0 0 0.5rem 0", color: "var(--color-primary)" }}>
                {icon} {title}
            </h3>
            <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
                {children}
            </div>
        </div>
    );
}

function LinkCard({ label, href, external }: { label: string; href: string; external?: boolean }) {
    return (
        <a href={href} target={external ? "_blank" : "_self"} rel={external ? "noopener noreferrer" : undefined}
            style={{ display: "block", padding: "10px 14px", background: "var(--color-bg-secondary)", borderRadius: 8, textDecoration: "none", color: "var(--color-text-primary)", fontSize: "0.82rem", fontWeight: 600, border: "1px solid var(--color-bg-tertiary)", transition: "background 0.15s" }}>
            {label} {external && "↗"}
        </a>
    );
}

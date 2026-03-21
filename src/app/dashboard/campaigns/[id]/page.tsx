"use client";

import { useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useData, Test } from "../../../data-provider";
import styles from "../../dashboard.module.css";

export default function CampaignDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { campaigns, getCampaignTests, getSessionsByTest, addTest, deleteTest, deleteCampaign, updateCampaign } = useData();
    const [showCreateTest, setShowCreateTest] = useState(false);
    const [testForm, setTestForm] = useState({ title: "", duration_minutes: 30, passing_score: 60, show_result: true, status: "active" as Test["status"] });

    const campaignId = params.id as string;
    const campaign = campaigns.find((c) => c.id === campaignId);
    const campTests = getCampaignTests(campaignId);

    if (!campaign) {
        return (
            <div className="card">
                <div className={styles["empty-state"]}>
                    <div className={styles["empty-state-icon"]}>❌</div>
                    <h3>Không tìm thấy chiến dịch</h3>
                    <Link href="/dashboard/campaigns" className="btn btn-primary" style={{ marginTop: "var(--space-md)" }}>← Về danh sách</Link>
                </div>
            </div>
        );
    }

    const handleCreateTest = (e: FormEvent) => {
        e.preventDefault();
        if (!testForm.title) return;
        addTest({ ...testForm, campaign_id: campaignId });
        setShowCreateTest(false);
        setTestForm({ title: "", duration_minutes: 30, passing_score: 60, show_result: true, status: "active" });
    };

    const handleDeleteCampaign = () => {
        if (confirm("Bạn có chắc muốn xóa chiến dịch này? Tất cả bài test và kết quả sẽ bị xóa.")) {
            deleteCampaign(campaignId);
            router.push("/dashboard/campaigns");
        }
    };

    const handleCopyLink = (code: string) => {
        const url = `${window.location.origin}/t/${code}`;
        navigator.clipboard.writeText(url);
        alert("Đã copy link!");
    };

    return (
        <>
            {/* Header */}
            <div style={{ marginBottom: "var(--space-sm)" }}>
                <Link href="/dashboard/campaigns" style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-tertiary)" }}>
                    ← Chiến dịch
                </Link>
            </div>
            <div className={styles["page-header"]}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
                        <h1 className={styles["page-title"]}>{campaign.title}</h1>
                        <span className={`badge ${campaign.status === "active" ? "badge-accent" : campaign.status === "draft" ? "badge-warning" : "badge-danger"}`}>
                            {campaign.status === "active" ? "Hoạt động" : campaign.status === "draft" ? "Nháp" : "Đã đóng"}
                        </span>
                    </div>
                    <p className={styles["page-subtitle"]}>{campaign.position}</p>
                </div>
                <div style={{ display: "flex", gap: "var(--space-sm)" }}>
                    <button className="btn btn-danger btn-sm" onClick={handleDeleteCampaign}>🗑 Xóa</button>
                    <button className="btn btn-primary" onClick={() => setShowCreateTest(true)}>+ Thêm bài test</button>
                </div>
            </div>

            {campaign.description && (
                <div className="card" style={{ marginBottom: "var(--space-xl)" }}>
                    <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-sm)", lineHeight: 1.7 }}>{campaign.description}</p>
                </div>
            )}

            {/* Tests list */}
            <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, marginBottom: "var(--space-lg)" }}>
                Bài test ({campTests.length})
            </h2>

            {campTests.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
                    {campTests.map((test) => {
                        const testSessions = getSessionsByTest(test.id);
                        const gradedSessions = testSessions.filter((s) => s.status === "graded");
                        const avgScore = gradedSessions.length > 0
                            ? Math.round(gradedSessions.reduce((sum, s) => sum + (s.total_points > 0 ? (s.score / s.total_points) * 100 : 0), 0) / gradedSessions.length)
                            : 0;

                        return (
                            <div key={test.id} className="card card-highlight" style={{ padding: "var(--space-xl)" }}>
                                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", marginBottom: "var(--space-sm)" }}>
                                            <h3 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700 }}>{test.title}</h3>
                                            <span className={`badge ${test.status === "active" ? "badge-accent" : "badge-warning"}`}>
                                                {test.status === "active" ? "Hoạt động" : "Nháp"}
                                            </span>
                                        </div>
                                        <div style={{ display: "flex", gap: "var(--space-xl)", fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>
                                            <span>⏱ {test.duration_minutes} phút</span>
                                            <span>🎯 Điểm đạt: {test.passing_score}%</span>
                                            <span>👥 {testSessions.length} lượt làm</span>
                                            <span>📊 Điểm TB: {avgScore}%</span>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: "var(--space-sm)" }}>
                                        <Link href={`/dashboard/tests/${test.id}`} className="btn btn-secondary btn-sm">
                                            ✏️ Sửa câu hỏi
                                        </Link>
                                        <Link href={`/dashboard/tests/${test.id}/results`} className="btn btn-secondary btn-sm">
                                            📊 Kết quả
                                        </Link>
                                        <button className="btn btn-danger btn-sm" onClick={() => { if (confirm("Xóa bài test này?")) deleteTest(test.id); }}>
                                            🗑
                                        </button>
                                    </div>
                                </div>

                                {/* Invite link */}
                                <div className={styles["invite-link-box"]}>
                                    <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-tertiary)" }}>Link mời:</span>
                                    <span className={styles["invite-link-url"]}>
                                        {typeof window !== "undefined" ? `${window.location.origin}/t/${test.invite_code}` : `/t/${test.invite_code}`}
                                    </span>
                                    <button className="btn btn-primary btn-sm" onClick={() => handleCopyLink(test.invite_code)}>
                                        📋 Copy
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="card">
                    <div className={styles["empty-state"]}>
                        <div className={styles["empty-state-icon"]}>📝</div>
                        <h3>Chưa có bài test nào</h3>
                        <p>Tạo bài test đầu tiên cho chiến dịch này.</p>
                        <button className="btn btn-primary" onClick={() => setShowCreateTest(true)}>+ Tạo bài test</button>
                    </div>
                </div>
            )}

            {/* Create Test Modal */}
            {showCreateTest && (
                <div className={styles["modal-overlay"]} onClick={() => setShowCreateTest(false)}>
                    <div className={`card ${styles["modal"]}`} onClick={(e) => e.stopPropagation()}>
                        <div className={styles["modal-header"]}>
                            <h2>Tạo bài test mới</h2>
                            <button className={styles["modal-close"]} onClick={() => setShowCreateTest(false)}>✕</button>
                        </div>
                        <form onSubmit={handleCreateTest}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
                                <div className="form-group">
                                    <label className="form-label">Tên bài test *</label>
                                    <input className="form-input" placeholder="VD: Kiến thức React cơ bản" value={testForm.title} onChange={(e) => setTestForm({ ...testForm, title: e.target.value })} required />
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-lg)" }}>
                                    <div className="form-group">
                                        <label className="form-label">Thời gian (phút)</label>
                                        <input type="number" className="form-input" min={5} max={180} value={testForm.duration_minutes} onChange={(e) => setTestForm({ ...testForm, duration_minutes: parseInt(e.target.value) || 30 })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Điểm đạt (%)</label>
                                        <input type="number" className="form-input" min={0} max={100} value={testForm.passing_score} onChange={(e) => setTestForm({ ...testForm, passing_score: parseInt(e.target.value) || 60 })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", cursor: "pointer" }}>
                                        <input type="checkbox" checked={testForm.show_result} onChange={(e) => setTestForm({ ...testForm, show_result: e.target.checked })} />
                                        <span className="form-label" style={{ marginBottom: 0 }}>Hiển thị kết quả cho ứng viên sau khi nộp</span>
                                    </label>
                                </div>
                            </div>
                            <div className={styles["modal-actions"]}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateTest(false)}>Hủy</button>
                                <button type="submit" className="btn btn-primary">Tạo bài test</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useData, Campaign } from "../../data-provider";
import styles from "../dashboard.module.css";

export default function CampaignsPage() {
    const { campaigns, tests, sessions, addCampaign, deleteCampaign, getCampaignTests, getSessionsByTest } = useData();
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ title: "", position: "", description: "", status: "active" as Campaign["status"] });

    const handleCreate = (e: FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.position) return;
        const c = addCampaign(form);
        setShowModal(false);
        setForm({ title: "", position: "", description: "", status: "active" });
        router.push(`/dashboard/campaigns/${c.id}`);
    };

    return (
        <>
            <div className={styles["page-header"]}>
                <div>
                    <h1 className={styles["page-title"]}>Chiến dịch tuyển dụng</h1>
                    <p className={styles["page-subtitle"]}>Quản lý các chiến dịch tuyển dụng và bài test</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    + Tạo chiến dịch mới
                </button>
            </div>

            {campaigns.length > 0 ? (
                <div className={styles["campaigns-grid"]}>
                    {campaigns.map((campaign) => {
                        const campTests = getCampaignTests(campaign.id);
                        const campSessions = campTests.flatMap((t) => getSessionsByTest(t.id));
                        const gradedCount = campSessions.filter((s) => s.status === "graded").length;
                        return (
                            <Link key={campaign.id} href={`/dashboard/campaigns/${campaign.id}`}>
                                <div className={`card card-highlight ${styles["campaign-card"]}`}>
                                    <div className={styles["campaign-card-header"]}>
                                        <div>
                                            <h3>{campaign.title}</h3>
                                            <div className={styles["campaign-card-position"]}>{campaign.position}</div>
                                        </div>
                                        <span className={`badge ${campaign.status === "active" ? "badge-accent" : campaign.status === "draft" ? "badge-warning" : "badge-danger"}`}>
                                            {campaign.status === "active" ? "Hoạt động" : campaign.status === "draft" ? "Nháp" : "Đã đóng"}
                                        </span>
                                    </div>
                                    {campaign.description && (
                                        <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", marginTop: "var(--space-sm)", lineHeight: 1.6 }}>
                                            {campaign.description.length > 120 ? campaign.description.substring(0, 120) + "..." : campaign.description}
                                        </p>
                                    )}
                                    <div className={styles["campaign-card-meta"]}>
                                        <span>📝 {campTests.length} bài test</span>
                                        <span>👥 {campSessions.length} ứng viên</span>
                                        <span>✅ {gradedCount} đã chấm</span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="card">
                    <div className={styles["empty-state"]}>
                        <div className={styles["empty-state-icon"]}>🎯</div>
                        <h3>Chưa có chiến dịch nào</h3>
                        <p>Tạo chiến dịch tuyển dụng đầu tiên để bắt đầu sàng lọc ứng viên.</p>
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Tạo chiến dịch</button>
                    </div>
                </div>
            )}

            {/* Create Campaign Modal */}
            {showModal && (
                <div className={styles["modal-overlay"]} onClick={() => setShowModal(false)}>
                    <div className={`card ${styles["modal"]}`} onClick={(e) => e.stopPropagation()}>
                        <div className={styles["modal-header"]}>
                            <h2>Tạo chiến dịch mới</h2>
                            <button className={styles["modal-close"]} onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
                                <div className="form-group">
                                    <label className="form-label">Tên chiến dịch *</label>
                                    <input
                                        className="form-input"
                                        placeholder="VD: Tuyển Frontend Developer Q1/2026"
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Vị trí tuyển dụng *</label>
                                    <input
                                        className="form-input"
                                        placeholder="VD: Frontend Developer (React)"
                                        value={form.position}
                                        onChange={(e) => setForm({ ...form, position: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Mô tả</label>
                                    <textarea
                                        className="form-input form-textarea"
                                        placeholder="Mô tả ngắn về chiến dịch tuyển dụng..."
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Trạng thái</label>
                                    <select className="form-input form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Campaign["status"] })}>
                                        <option value="active">Hoạt động</option>
                                        <option value="draft">Nháp</option>
                                    </select>
                                </div>
                            </div>
                            <div className={styles["modal-actions"]}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                                <button type="submit" className="btn btn-primary">Tạo chiến dịch</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

"use client";
import { Info, UserCircle, ClipboardText, Gavel, NotePencil, LockKey, Globe, Database } from "@phosphor-icons/react";
import styles from "./admin.module.css";

export default function AdminGuide() {
    return (
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <div style={{ background: "white", borderRadius: 12, padding: "2rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid var(--color-bg-tertiary)" }}>
                <h2 style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 0 1.5rem 0", fontSize: "1.2rem" }}>
                    <Info size={24} weight="fill" color="var(--color-primary)" /> Hướng dẫn sử dụng Admin Dashboard
                </h2>

                {/* Sections */}
                <Section icon={<LockKey size={20} weight="duotone" />} title="Đăng nhập Admin">
                    <p>Truy cập trang <code>/admin</code> và nhập mã PIN được cấp. Bấm icon <strong>👁</strong> để hiện mật khẩu kiểm tra trước khi đăng nhập.</p>
                </Section>

                <Section icon={<ClipboardText size={20} weight="duotone" />} title="Tab Tổng quan">
                    <ul>
                        <li><strong>Thống kê nhanh:</strong> Tổng bài nộp, điểm trung bình, tỷ lệ đạt, số giám khảo</li>
                        <li><strong>Biểu đồ:</strong> Phân bổ theo nhóm thi, tỷ lệ đạt/chưa đạt, phân bổ điểm, điểm TB theo nhóm</li>
                        <li><strong>Tải Excel:</strong> Bấm nút &quot;Tải Excel&quot; để xuất toàn bộ dữ liệu bài thi</li>
                    </ul>
                </Section>

                <Section icon={<ClipboardText size={20} weight="duotone" />} title="Tab Bài nộp">
                    <ul>
                        <li>Xem danh sách tất cả bài nộp của ứng viên</li>
                        <li>Lọc theo nhóm thi (Finance, SC Planning, SC Logistics)</li>
                        <li>Tìm kiếm theo tên hoặc SBD ứng viên</li>
                        <li>Bấm vào từng bài để xem chi tiết câu trả lời</li>
                    </ul>
                </Section>

                <Section icon={<Gavel size={20} weight="duotone" />} title="Tab Giám khảo">
                    <ul>
                        <li><strong>Thêm giám khảo:</strong> Nhập tên và email, bấm &quot;Thêm&quot;</li>
                        <li><strong>Xóa giám khảo:</strong> Bấm nút &quot;✕&quot; bên cạnh giám khảo</li>
                        <li>Giám khảo đăng nhập qua email tại trang <code>/judge</code></li>
                        <li>Giám khảo sẽ tự nhập điểm cho từng câu hỏi của ứng viên</li>
                    </ul>
                </Section>

                <Section icon={<NotePencil size={20} weight="duotone" />} title="Tab Bộ đề">
                    <ul>
                        <li><strong>Xem bộ đề:</strong> Bấm vào tiêu đề bộ đề để mở/đóng danh sách câu hỏi</li>
                        <li><strong>Thêm bộ đề mới:</strong> Bấm &quot;+ Thêm bộ đề&quot;, nhập ID, tiêu đề, icon, thời gian</li>
                        <li><strong>Sửa bộ đề:</strong> Bấm icon bút chì, sửa thông tin, bấm &quot;Lưu&quot;</li>
                        <li><strong>Xóa bộ đề:</strong> Bấm icon thùng rác (sẽ xóa luôn tất cả câu hỏi bên trong)</li>
                        <li><strong>Thêm câu hỏi:</strong> Mở bộ đề → Bấm &quot;+ Thêm câu hỏi&quot; ở cuối</li>
                        <li><strong>4 loại câu hỏi:</strong> Trắc nghiệm (1 đáp án), Trắc nghiệm (nhiều đáp án), Đúng/Sai, Tự luận</li>
                    </ul>
                </Section>

                <Section icon={<UserCircle size={20} weight="duotone" />} title="Trang ứng viên">
                    <ul>
                        <li>URL dạng: <code>/t/[mã-link]</code></li>
                        <li>Ứng viên nhập thông tin → chọn bộ đề → làm bài → nộp</li>
                        <li>Bài nộp sẽ tự động hiển thị trên Admin Dashboard</li>
                    </ul>
                </Section>

                <Section icon={<Globe size={20} weight="duotone" />} title="Liên kết nhanh">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginTop: 4 }}>
                        <LinkCard label="Trang Admin" href="/admin" />
                        <LinkCard label="Trang Giám khảo" href="/judge" />
                        <LinkCard label="Trang Thi (mẫu)" href="/t/default" />
                        <LinkCard label="Supabase Dashboard" href="https://supabase.com/dashboard" external />
                    </div>
                </Section>

                <Section icon={<Database size={20} weight="duotone" />} title="Cấu trúc dữ liệu">
                    <table style={{ width: "100%", fontSize: "0.82rem", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "2px solid var(--color-bg-tertiary)", textAlign: "left" }}>
                                <th style={{ padding: "6px 8px" }}>Bảng</th>
                                <th style={{ padding: "6px 8px" }}>Mô tả</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                ["test_groups", "Bộ đề thi (tiêu đề, thời gian, icon)"],
                                ["questions", "Câu hỏi (nội dung, loại, đáp án, điểm)"],
                                ["test_results", "Bài nộp của ứng viên"],
                                ["judges", "Danh sách giám khảo"],
                                ["judge_scores", "Điểm chấm từ giám khảo"],
                                ["test_links", "Link thi tùy chỉnh"],
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

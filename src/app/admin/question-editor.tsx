"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import styles from "./qeditor.module.css";
import { NotePencil, PencilSimple, Trash, X, Plus, CaretDown, CaretRight, ImageSquare } from "@phosphor-icons/react";

interface TestGroup {
    id: string; title: string; description: string; icon: string;
    duration_minutes: number; is_active: boolean; sort_order: number;
}

interface Question {
    id: string; group_id: string; type: string; content: string;
    points: number; correct_answer: string; options: any[]; sort_order: number;
    image_url?: string;
}

interface OptionItem { id: string; content: string; is_correct: boolean; }

const Q_TYPES = [
    { value: "single_choice", label: "Trắc nghiệm (1 đáp án)" },
    { value: "multiple_choice", label: "Trắc nghiệm (nhiều đáp án)" },
    { value: "true_false", label: "Đúng / Sai" },
    { value: "short_answer", label: "Tự luận" },
];

export default function QuestionEditor() {
    const [groups, setGroups] = useState<TestGroup[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [editGroup, setEditGroup] = useState<TestGroup | null>(null);
    const [editQ, setEditQ] = useState<Question | null>(null);
    const [saving, setSaving] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    const toggleGroup = (id: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    // New group form
    const [showNewGroup, setShowNewGroup] = useState(false);
    const [newGroup, setNewGroup] = useState<Partial<TestGroup>>({ id: "", title: "", description: "", icon: "📝", duration_minutes: 25, is_active: true, sort_order: 0 });

    // New question form
    const [showNewQ, setShowNewQ] = useState(false);
    const [newQ, setNewQ] = useState<Partial<Question>>({ type: "single_choice", content: "", points: 10, correct_answer: "", options: [], sort_order: 0 });

    const loadData = useCallback(async () => {
        setLoading(true);
        const [gRes, qRes] = await Promise.all([
            supabase.from("test_groups").select("*").order("sort_order"),
            supabase.from("questions").select("*").order("sort_order"),
        ]);
        if (gRes.data) setGroups(gRes.data);
        if (qRes.data) setQuestions(qRes.data);
        setLoading(false);
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const groupQuestions = (gid: string) => questions.filter(q => q.group_id === gid);

    /* === Group CRUD === */
    const saveGroup = async (g: Partial<TestGroup>, isNew: boolean) => {
        setSaving(true);
        if (isNew) {
            await supabase.from("test_groups").insert(g);
        } else {
            await supabase.from("test_groups").update({ title: g.title, description: g.description, icon: g.icon, duration_minutes: g.duration_minutes, is_active: g.is_active }).eq("id", g.id);
        }
        await loadData();
        setSaving(false); setEditGroup(null); setShowNewGroup(false);
        setNewGroup({ id: "", title: "", description: "", icon: "📝", duration_minutes: 25, is_active: true, sort_order: 0 });
    };

    const deleteGroup = async (id: string) => {
        if (!confirm(`Xóa bộ đề "${id}" và toàn bộ câu hỏi bên trong?`)) return;
        await supabase.from("test_groups").delete().eq("id", id);
        loadData();
    };

    /* === Question CRUD === */
    const saveQuestion = async (q: Partial<Question>, gid: string, isNew: boolean) => {
        setSaving(true);
        const payload = { group_id: gid, type: q.type, content: q.content, points: q.points, correct_answer: q.correct_answer, options: q.options || [], sort_order: q.sort_order || 0, image_url: q.image_url || null };
        if (isNew) {
            await supabase.from("questions").insert(payload);
        } else {
            await supabase.from("questions").update(payload).eq("id", q.id);
        }
        await loadData();
        setSaving(false); setEditQ(null); setShowNewQ(false);
        setNewQ({ type: "single_choice", content: "", points: 10, correct_answer: "", options: [], sort_order: 0, image_url: "" });
    };

    const deleteQuestion = async (id: string) => {
        if (!confirm("Xóa câu hỏi này?")) return;
        await supabase.from("questions").delete().eq("id", id);
        loadData();
    };

    /* === Option helpers === */
    const addOption = (opts: OptionItem[]): OptionItem[] => [...opts, { id: `opt-${Date.now()}`, content: "", is_correct: false }];
    const removeOption = (opts: OptionItem[], idx: number) => opts.filter((_, i) => i !== idx);
    const updateOption = (opts: OptionItem[], idx: number, field: string, value: any) => opts.map((o, i) => i === idx ? { ...o, [field]: value } : o);

    const typeLabel = (t: string) => Q_TYPES.find(x => x.value === t)?.label || t;

    if (loading) return <div className={styles.emptyState}><p>Đang tải bộ đề...</p></div>;

    return (
        <div>
            {/* Header */}
            <div className={styles.qeHeader}>
                <h3><NotePencil size={20} style={{ verticalAlign: 'middle', marginRight: 6 }} />Quản lý bộ đề thi ({groups.length} bộ)</h3>
                <button className={styles.qeAddBtn} onClick={() => setShowNewGroup(true)}><Plus size={16} weight="bold" /> Thêm bộ đề</button>
            </div>

            {/* New Group Form */}
            {showNewGroup && (
                <div className={styles.qeFormCard}>
                    <h4>Tạo bộ đề mới</h4>
                    <div className={styles.qeFormGrid}>
                        <div><label>ID (slug)</label><input placeholder="finance, hr, etc." value={newGroup.id || ""} onChange={e => setNewGroup({ ...newGroup, id: e.target.value })} /></div>
                        <div><label>Tiêu đề</label><input placeholder="Finance" value={newGroup.title || ""} onChange={e => setNewGroup({ ...newGroup, title: e.target.value })} /></div>
                        <div><label>Icon</label><input placeholder="💰" value={newGroup.icon || ""} onChange={e => setNewGroup({ ...newGroup, icon: e.target.value })} /></div>
                        <div><label>Thời gian (phút)</label><input type="number" value={newGroup.duration_minutes || 25} onChange={e => setNewGroup({ ...newGroup, duration_minutes: parseInt(e.target.value) || 25 })} /></div>
                    </div>
                    <div><label>Mô tả</label><input style={{ width: "100%" }} placeholder="Mô tả ngắn về bộ đề" value={newGroup.description || ""} onChange={e => setNewGroup({ ...newGroup, description: e.target.value })} /></div>
                    <div className={styles.qeFormActions}>
                        <button className={styles.qeSaveBtn} disabled={saving || !newGroup.id || !newGroup.title} onClick={() => saveGroup(newGroup, true)}>{saving ? "Đang lưu..." : "Tạo bộ đề"}</button>
                        <button className={styles.qeCancelBtn} onClick={() => setShowNewGroup(false)}>Hủy</button>
                    </div>
                </div>
            )}

            {/* Groups */}
            {groups.map(g => {
                const gqs = groupQuestions(g.id);
                const totalPts = gqs.reduce((a, q) => a + q.points, 0);
                return (
                    <div key={g.id} className={styles.qeGroupCard}>
                        {/* Group header */}
                        <div className={styles.qeGroupHeader} onClick={() => editGroup?.id !== g.id && toggleGroup(g.id)} style={{ cursor: editGroup?.id === g.id ? 'default' : 'pointer' }}>
                            {editGroup?.id === g.id ? (
                                <div className={styles.qeEditInline}>
                                    <input value={editGroup.icon} onChange={e => setEditGroup({ ...editGroup, icon: e.target.value })} style={{ width: 50 }} onClick={e => e.stopPropagation()} />
                                    <input value={editGroup.title} onChange={e => setEditGroup({ ...editGroup, title: e.target.value })} style={{ flex: 1 }} onClick={e => e.stopPropagation()} />
                                    <input type="number" value={editGroup.duration_minutes} onChange={e => setEditGroup({ ...editGroup, duration_minutes: parseInt(e.target.value) || 25 })} style={{ width: 80 }} onClick={e => e.stopPropagation()} />
                                    <span>phút</span>
                                    <button className={styles.qeSaveBtn} disabled={saving} onClick={(e) => { e.stopPropagation(); saveGroup(editGroup, false); }}>Lưu</button>
                                    <button className={styles.qeCancelBtn} onClick={(e) => { e.stopPropagation(); setEditGroup(null); }}>Hủy</button>
                                </div>
                            ) : (
                                <>
                                    <div className={styles.qeGroupTitle}>
                                        <span className={styles.qeGroupCaret}>
                                            {expandedGroups.has(g.id) ? <CaretDown size={18} weight="bold" /> : <CaretRight size={18} weight="bold" />}
                                        </span>
                                        <span className={styles.qeGroupIcon}>{g.icon}</span>
                                        <h4>{g.title}</h4>
                                        <span className={styles.qeGroupMeta}>{gqs.length} câu · {totalPts} điểm · {g.duration_minutes} phút</span>
                                        {!g.is_active && <span className={styles.qeBadgeInactive}>Ẩn</span>}
                                    </div>
                                    <div className={styles.qeGroupActions}>
                                        <button onClick={(e) => { e.stopPropagation(); setEditGroup({ ...g }); }} title="Sửa"><PencilSimple size={18} /></button>
                                        <button onClick={(e) => { e.stopPropagation(); deleteGroup(g.id); }} title="Xóa"><Trash size={18} /></button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Questions list — collapsible */}
                        {expandedGroups.has(g.id) && (
                            <>
                                <div className={styles.qeQuestionList}>
                                    {gqs.map((q, idx) => (
                                        <div key={q.id} className={styles.qeQuestionItem}>
                                            {editQ?.id === q.id ? (
                                                <QuestionForm q={editQ} setQ={setEditQ as any} saving={saving}
                                                    onSave={() => saveQuestion(editQ, g.id, false)}
                                                    onCancel={() => setEditQ(null)}
                                                    addOption={addOption} removeOption={removeOption} updateOption={updateOption} />
                                            ) : (
                                                <div className={styles.qeQuestionRow}>
                                                    <span className={styles.qeQNum}>{idx + 1}</span>
                                                    <div className={styles.qeQContent}>
                                                        <span className={styles.qeQType}>{typeLabel(q.type)}</span>
                                                        <span className={styles.qeQText}>{q.content}</span>
                                                    </div>
                                                    <span className={styles.qeQPoints}>{q.points}đ</span>
                                                    <div className={styles.qeQActions}>
                                                        <button onClick={() => setEditQ({ ...q })} title="Sửa"><PencilSimple size={16} /></button>
                                                        <button onClick={() => deleteQuestion(q.id)} title="Xóa"><X size={16} /></button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Add question */}
                                {showNewQ && editGroup === null && (
                                    <div style={{ padding: "1rem" }}>
                                        <QuestionForm q={newQ as Question} setQ={setNewQ as any} saving={saving}
                                            onSave={() => saveQuestion({ ...newQ, sort_order: gqs.length + 1 }, g.id, true)}
                                            onCancel={() => setShowNewQ(false)}
                                            addOption={addOption} removeOption={removeOption} updateOption={updateOption} />
                                    </div>
                                )}
                                <button className={styles.qeAddQBtn} onClick={() => { setShowNewQ(true); setNewQ({ type: "single_choice", content: "", points: 10, correct_answer: "", options: [], sort_order: gqs.length + 1 }); }}>
                                    <Plus size={14} weight="bold" /> Thêm câu hỏi
                                </button>
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

/* === Question Form Sub-component === */
function QuestionForm({ q, setQ, saving, onSave, onCancel, addOption, removeOption, updateOption }: {
    q: Question; setQ: (q: Question) => void; saving: boolean;
    onSave: () => void; onCancel: () => void;
    addOption: (o: OptionItem[]) => OptionItem[];
    removeOption: (o: OptionItem[], i: number) => OptionItem[];
    updateOption: (o: OptionItem[], i: number, f: string, v: any) => OptionItem[];
}) {
    const opts = (q.options || []) as OptionItem[];
    const handleTypeChange = (type: string) => {
        if (type === "true_false") {
            setQ({ ...q, type, options: [{ id: "tf-1", content: "Đúng", is_correct: true }, { id: "tf-2", content: "Sai", is_correct: false }], correct_answer: "true" });
        } else if (type === "short_answer") {
            setQ({ ...q, type, options: [] });
        } else {
            setQ({ ...q, type });
        }
    };

    return (
        <div className={styles.qeQForm}>
            <div className={styles.qeQFormRow}>
                <div style={{ flex: "0 0 200px" }}>
                    <label>Loại câu hỏi</label>
                    <select value={q.type} onChange={e => handleTypeChange(e.target.value)}>
                        {Q_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                </div>
                <div style={{ flex: 1 }}>
                    <label>Nội dung câu hỏi</label>
                    <textarea value={q.content} onChange={e => setQ({ ...q, content: e.target.value })} placeholder="Nhập nội dung câu hỏi..." />
                </div>
                <div style={{ flex: "0 0 80px" }}>
                    <label>Điểm</label>
                    <input type="number" value={q.points} onChange={e => setQ({ ...q, points: parseInt(e.target.value) || 0 })} />
                </div>
            </div>

            {/* Image upload */}
            <div className={styles.qeImageSection}>
                <label><ImageSquare size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />Hình ảnh minh họa (tùy chọn)</label>
                {q.image_url ? (
                    <div className={styles.qeImagePreview}>
                        <img src={q.image_url} alt="Minh họa" />
                        <button onClick={() => setQ({ ...q, image_url: "" })} title="Xóa ảnh"><X size={14} /></button>
                    </div>
                ) : (
                    <div className={styles.qeImageUpload}>
                        <input type="file" accept="image/*" onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const ext = file.name.split('.').pop();
                            const path = `questions/${Date.now()}.${ext}`;
                            const { error } = await supabase.storage.from('question-images').upload(path, file);
                            if (error) {
                                // If bucket doesn't exist or error, use base64 fallback
                                const reader = new FileReader();
                                reader.onload = () => setQ({ ...q, image_url: reader.result as string });
                                reader.readAsDataURL(file);
                                return;
                            }
                            const { data: urlData } = supabase.storage.from('question-images').getPublicUrl(path);
                            setQ({ ...q, image_url: urlData.publicUrl });
                        }} />
                    </div>
                )}
            </div>

            {/* Options for choice questions */}
            {(q.type === "single_choice" || q.type === "multiple_choice") && (
                <div className={styles.qeOptions}>
                    <label>Đáp án ({q.type === "multiple_choice" ? "chọn nhiều" : "chọn 1"})</label>
                    {opts.map((opt, i) => (
                        <div key={i} className={styles.qeOptionRow}>
                            <input type={q.type === "multiple_choice" ? "checkbox" : "radio"} name={`opt-${q.id}`} checked={opt.is_correct}
                                onChange={() => {
                                    if (q.type === "single_choice") {
                                        const newOpts = opts.map((o, j) => ({ ...o, is_correct: j === i }));
                                        setQ({ ...q, options: newOpts, correct_answer: opt.content });
                                    } else {
                                        const newOpts = updateOption(opts, i, "is_correct", !opt.is_correct);
                                        const correctArr = newOpts.filter(o => o.is_correct).map(o => o.content);
                                        setQ({ ...q, options: newOpts, correct_answer: JSON.stringify(correctArr) });
                                    }
                                }} />
                            <input className={styles.qeOptionInput} value={opt.content} placeholder={`Đáp án ${i + 1}`}
                                onChange={e => {
                                    const newOpts = updateOption(opts, i, "content", e.target.value);
                                    // Update correct_answer when text changes
                                    if (q.type === "single_choice" && opt.is_correct) {
                                        setQ({ ...q, options: newOpts, correct_answer: e.target.value });
                                    } else if (q.type === "multiple_choice") {
                                        const correctArr = newOpts.filter(o => o.is_correct).map(o => o.content);
                                        setQ({ ...q, options: newOpts, correct_answer: JSON.stringify(correctArr) });
                                    } else {
                                        setQ({ ...q, options: newOpts });
                                    }
                                }} />
                            <button className={styles.qeOptDelete} onClick={() => setQ({ ...q, options: removeOption(opts, i) })}><X size={16} /></button>
                        </div>
                    ))}
                    <button className={styles.qeAddOptBtn} onClick={() => setQ({ ...q, options: addOption(opts) })}><Plus size={14} /> Thêm đáp án</button>
                </div>
            )}

            {/* True/False options */}
            {q.type === "true_false" && (
                <div className={styles.qeOptions}>
                    <label>Đáp án đúng</label>
                    <div className={styles.qeTFRow}>
                        <label><input type="radio" name={`tf-${q.id}`} checked={q.correct_answer === "true"} onChange={() => {
                            setQ({ ...q, correct_answer: "true", options: [{ id: "tf-1", content: "Đúng", is_correct: true }, { id: "tf-2", content: "Sai", is_correct: false }] });
                        }} /> Đúng</label>
                        <label><input type="radio" name={`tf-${q.id}`} checked={q.correct_answer === "false"} onChange={() => {
                            setQ({ ...q, correct_answer: "false", options: [{ id: "tf-1", content: "Đúng", is_correct: false }, { id: "tf-2", content: "Sai", is_correct: true }] });
                        }} /> Sai</label>
                    </div>
                </div>
            )}

            {/* Short answer */}
            {q.type === "short_answer" && (
                <div className={styles.qeOptions}>
                    <label>Đáp án gợi ý (dùng để chấm tham khảo)</label>
                    <textarea value={q.correct_answer} onChange={e => setQ({ ...q, correct_answer: e.target.value })} placeholder="Nhập từ khóa / đáp án mẫu..." />
                </div>
            )}

            <div className={styles.qeFormActions}>
                <button className={styles.qeSaveBtn} disabled={saving || !q.content} onClick={onSave}>{saving ? "Đang lưu..." : "Lưu"}</button>
                <button className={styles.qeCancelBtn} onClick={onCancel}>Hủy</button>
            </div>
        </div>
    );
}

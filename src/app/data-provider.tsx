"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";

/* ==========================================
   Types
   ========================================== */
export interface User {
    id: string;
    email: string;
    full_name: string;
    role: "admin" | "recruiter";
}

export interface Campaign {
    id: string;
    user_id: string;
    title: string;
    position: string;
    description: string;
    status: "active" | "draft" | "closed";
    created_at: string;
    tests?: Test[];
}

export interface Test {
    id: string;
    campaign_id: string;
    title: string;
    duration_minutes: number;
    passing_score: number;
    show_result: boolean;
    invite_code: string;
    status: "draft" | "active" | "closed";
    created_at: string;
    questions?: Question[];
}

export interface Question {
    id: string;
    test_id: string;
    type: "multiple_choice" | "single_choice" | "true_false" | "short_answer";
    content: string;
    points: number;
    order_index: number;
    correct_answer: string | string[];
    options?: Option[];
}

export interface Option {
    id: string;
    question_id: string;
    content: string;
    is_correct: boolean;
    order_index: number;
}

export interface TestSession {
    id: string;
    test_id: string;
    candidate_name: string;
    candidate_email: string;
    candidate_phone: string;
    score: number;
    total_points: number;
    status: "in_progress" | "submitted" | "graded";
    started_at: string;
    submitted_at: string | null;
}

export interface Answer {
    id: string;
    session_id: string;
    question_id: string;
    response: string | string[];
    points_earned: number;
    is_correct: boolean;
}

/* ==========================================
   Mock Data Store (simulating Supabase)
   ========================================== */
const generateId = () => Math.random().toString(36).substring(2, 15);
const generateInviteCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

const INITIAL_CAMPAIGNS: Campaign[] = [
    {
        id: "camp-1",
        user_id: "user-1",
        title: "Tuyển Frontend Developer Q1/2026",
        position: "Frontend Developer (React)",
        description: "Tuyển dụng Frontend Developer với kinh nghiệm React, TypeScript cho dự án mới.",
        status: "active",
        created_at: "2026-03-15T08:00:00Z",
    },
    {
        id: "camp-2",
        user_id: "user-1",
        title: "Data Analyst Intern 2026",
        position: "Data Analyst Intern",
        description: "Chương trình thực tập vị trí Data Analyst cho sinh viên năm cuối.",
        status: "active",
        created_at: "2026-03-10T10:00:00Z",
    },
    {
        id: "camp-3",
        user_id: "user-1",
        title: "Senior Backend Engineer",
        position: "Senior Backend Engineer (Node.js)",
        description: "Tuyển Senior Backend có kinh nghiệm thiết kế hệ thống và microservices.",
        status: "draft",
        created_at: "2026-03-18T14:00:00Z",
    },
];

const INITIAL_TESTS: Test[] = [
    {
        id: "test-1",
        campaign_id: "camp-1",
        title: "Kiến thức React & TypeScript",
        duration_minutes: 45,
        passing_score: 70,
        show_result: true,
        invite_code: "FE2026A",
        status: "active",
        created_at: "2026-03-15T09:00:00Z",
    },
    {
        id: "test-2",
        campaign_id: "camp-2",
        title: "SQL & Phân tích dữ liệu cơ bản",
        duration_minutes: 30,
        passing_score: 60,
        show_result: true,
        invite_code: "DA2026B",
        status: "active",
        created_at: "2026-03-10T11:00:00Z",
    },
];

const INITIAL_QUESTIONS: Question[] = [
    {
        id: "q-1", test_id: "test-1", type: "single_choice", content: "React sử dụng kiến trúc nào để cập nhật DOM?", points: 10, order_index: 1,
        correct_answer: "Virtual DOM",
        options: [
            { id: "o-1", question_id: "q-1", content: "Virtual DOM", is_correct: true, order_index: 1 },
            { id: "o-2", question_id: "q-1", content: "Shadow DOM", is_correct: false, order_index: 2 },
            { id: "o-3", question_id: "q-1", content: "Real DOM", is_correct: false, order_index: 3 },
            { id: "o-4", question_id: "q-1", content: "DOM trực tiếp", is_correct: false, order_index: 4 },
        ],
    },
    {
        id: "q-2", test_id: "test-1", type: "single_choice", content: "Hook nào được sử dụng để quản lý state trong functional component?", points: 10, order_index: 2,
        correct_answer: "useState",
        options: [
            { id: "o-5", question_id: "q-2", content: "useEffect", is_correct: false, order_index: 1 },
            { id: "o-6", question_id: "q-2", content: "useState", is_correct: true, order_index: 2 },
            { id: "o-7", question_id: "q-2", content: "useRef", is_correct: false, order_index: 3 },
            { id: "o-8", question_id: "q-2", content: "useMemo", is_correct: false, order_index: 4 },
        ],
    },
    {
        id: "q-3", test_id: "test-1", type: "true_false", content: "TypeScript là superset của JavaScript.", points: 5, order_index: 3,
        correct_answer: "true",
        options: [
            { id: "o-9", question_id: "q-3", content: "Đúng", is_correct: true, order_index: 1 },
            { id: "o-10", question_id: "q-3", content: "Sai", is_correct: false, order_index: 2 },
        ],
    },
    {
        id: "q-4", test_id: "test-1", type: "multiple_choice", content: "Những Hook nào là built-in Hook của React? (chọn nhiều)", points: 15, order_index: 4,
        correct_answer: ["useEffect", "useContext", "useReducer"],
        options: [
            { id: "o-11", question_id: "q-4", content: "useEffect", is_correct: true, order_index: 1 },
            { id: "o-12", question_id: "q-4", content: "useContext", is_correct: true, order_index: 2 },
            { id: "o-13", question_id: "q-4", content: "useRouter", is_correct: false, order_index: 3 },
            { id: "o-14", question_id: "q-4", content: "useReducer", is_correct: true, order_index: 4 },
        ],
    },
    {
        id: "q-5", test_id: "test-1", type: "short_answer", content: "Trong React, prop 'key' được sử dụng để làm gì?", points: 10, order_index: 5,
        correct_answer: "giúp React xác định phần tử nào đã thay đổi",
    },
    // Test 2 questions
    {
        id: "q-6", test_id: "test-2", type: "single_choice", content: "Câu lệnh SQL nào được sử dụng để lấy dữ liệu từ bảng?", points: 10, order_index: 1,
        correct_answer: "SELECT",
        options: [
            { id: "o-15", question_id: "q-6", content: "GET", is_correct: false, order_index: 1 },
            { id: "o-16", question_id: "q-6", content: "SELECT", is_correct: true, order_index: 2 },
            { id: "o-17", question_id: "q-6", content: "FETCH", is_correct: false, order_index: 3 },
            { id: "o-18", question_id: "q-6", content: "RETRIEVE", is_correct: false, order_index: 4 },
        ],
    },
    {
        id: "q-7", test_id: "test-2", type: "true_false", content: "JOIN trong SQL chỉ có duy nhất một loại.", points: 5, order_index: 2,
        correct_answer: "false",
        options: [
            { id: "o-19", question_id: "q-7", content: "Đúng", is_correct: false, order_index: 1 },
            { id: "o-20", question_id: "q-7", content: "Sai", is_correct: true, order_index: 2 },
        ],
    },
];

const INITIAL_SESSIONS: TestSession[] = [
    {
        id: "sess-1", test_id: "test-1", candidate_name: "Nguyễn Văn An", candidate_email: "an.nguyen@email.com", candidate_phone: "0901234567",
        score: 45, total_points: 50, status: "graded", started_at: "2026-03-16T09:00:00Z", submitted_at: "2026-03-16T09:35:00Z",
    },
    {
        id: "sess-2", test_id: "test-1", candidate_name: "Trần Thị Bình", candidate_email: "binh.tran@email.com", candidate_phone: "0912345678",
        score: 30, total_points: 50, status: "graded", started_at: "2026-03-16T10:00:00Z", submitted_at: "2026-03-16T10:40:00Z",
    },
    {
        id: "sess-3", test_id: "test-1", candidate_name: "Lê Minh Châu", candidate_email: "chau.le@email.com", candidate_phone: "0923456789",
        score: 50, total_points: 50, status: "graded", started_at: "2026-03-17T08:00:00Z", submitted_at: "2026-03-17T08:30:00Z",
    },
    {
        id: "sess-4", test_id: "test-2", candidate_name: "Phạm Đức Dũng", candidate_email: "dung.pham@email.com", candidate_phone: "0934567890",
        score: 10, total_points: 15, status: "graded", started_at: "2026-03-17T14:00:00Z", submitted_at: "2026-03-17T14:25:00Z",
    },
    {
        id: "sess-5", test_id: "test-1", candidate_name: "Hoàng Thị Em", candidate_email: "em.hoang@email.com", candidate_phone: "0945678901",
        score: 0, total_points: 50, status: "in_progress", started_at: "2026-03-21T09:00:00Z", submitted_at: null,
    },
];

/* ==========================================
   Data Context
   ========================================== */
interface DataContextType {
    user: User | null;
    campaigns: Campaign[];
    tests: Test[];
    questions: Question[];
    sessions: TestSession[];
    login: (email: string, password: string) => boolean;
    register: (email: string, password: string, name: string) => boolean;
    logout: () => void;
    addCampaign: (c: Omit<Campaign, "id" | "user_id" | "created_at">) => Campaign;
    updateCampaign: (id: string, data: Partial<Campaign>) => void;
    deleteCampaign: (id: string) => void;
    addTest: (t: Omit<Test, "id" | "invite_code" | "created_at">) => Test;
    updateTest: (id: string, data: Partial<Test>) => void;
    deleteTest: (id: string) => void;
    addQuestion: (q: Omit<Question, "id">) => Question;
    updateQuestion: (id: string, data: Partial<Question>) => void;
    deleteQuestion: (id: string) => void;
    getTestByInviteCode: (code: string) => Test | undefined;
    startSession: (testId: string, name: string, email: string, phone: string) => TestSession;
    submitSession: (sessionId: string, answers: { question_id: string; response: string | string[] }[]) => TestSession;
    getSessionsByTest: (testId: string) => TestSession[];
    getCampaignTests: (campaignId: string) => Test[];
    getTestQuestions: (testId: string) => Question[];
}

const DataContext = createContext<DataContextType | null>(null);

export function useData() {
    const ctx = useContext(DataContext);
    if (!ctx) throw new Error("useData must be inside DataProvider");
    return ctx;
}

export function DataProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
    const [tests, setTests] = useState<Test[]>(INITIAL_TESTS);
    const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
    const [sessions, setSessions] = useState<TestSession[]>(INITIAL_SESSIONS);

    // Check localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("testgate_user");
        if (saved) setUser(JSON.parse(saved));
    }, []);

    const login = (email: string, _password: string) => {
        const u: User = { id: "user-1", email, full_name: email.split("@")[0], role: "recruiter" };
        setUser(u);
        localStorage.setItem("testgate_user", JSON.stringify(u));
        return true;
    };

    const register = (email: string, _password: string, name: string) => {
        const u: User = { id: generateId(), email, full_name: name, role: "recruiter" };
        setUser(u);
        localStorage.setItem("testgate_user", JSON.stringify(u));
        return true;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("testgate_user");
    };

    const addCampaign = (c: Omit<Campaign, "id" | "user_id" | "created_at">) => {
        const newC: Campaign = { ...c, id: generateId(), user_id: user?.id || "", created_at: new Date().toISOString() };
        setCampaigns((prev) => [newC, ...prev]);
        return newC;
    };

    const updateCampaign = (id: string, data: Partial<Campaign>) => {
        setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
    };

    const deleteCampaign = (id: string) => {
        setCampaigns((prev) => prev.filter((c) => c.id !== id));
        // Also delete associated tests
        const testIds = tests.filter((t) => t.campaign_id === id).map((t) => t.id);
        setTests((prev) => prev.filter((t) => t.campaign_id !== id));
        setQuestions((prev) => prev.filter((q) => !testIds.includes(q.test_id)));
    };

    const addTest = (t: Omit<Test, "id" | "invite_code" | "created_at">) => {
        const newT: Test = { ...t, id: generateId(), invite_code: generateInviteCode(), created_at: new Date().toISOString() };
        setTests((prev) => [newT, ...prev]);
        return newT;
    };

    const updateTest = (id: string, data: Partial<Test>) => {
        setTests((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
    };

    const deleteTest = (id: string) => {
        setTests((prev) => prev.filter((t) => t.id !== id));
        setQuestions((prev) => prev.filter((q) => q.test_id !== id));
    };

    const addQuestion = (q: Omit<Question, "id">) => {
        const newQ: Question = { ...q, id: generateId() };
        setQuestions((prev) => [...prev, newQ]);
        return newQ;
    };

    const updateQuestion = (id: string, data: Partial<Question>) => {
        setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...data } : q)));
    };

    const deleteQuestion = (id: string) => {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
    };

    const getTestByInviteCode = (code: string) => tests.find((t) => t.invite_code === code);

    const startSession = (testId: string, name: string, email: string, phone: string) => {
        const s: TestSession = {
            id: generateId(), test_id: testId, candidate_name: name, candidate_email: email, candidate_phone: phone,
            score: 0, total_points: 0, status: "in_progress", started_at: new Date().toISOString(), submitted_at: null,
        };
        setSessions((prev) => [s, ...prev]);
        return s;
    };

    const submitSession = (sessionId: string, answers: { question_id: string; response: string | string[] }[]) => {
        let totalScore = 0;
        let totalPoints = 0;

        const session = sessions.find((s) => s.id === sessionId);
        if (!session) throw new Error("Session not found");

        const testQuestions = questions.filter((q) => q.test_id === session.test_id);

        answers.forEach((ans) => {
            const question = testQuestions.find((q) => q.id === ans.question_id);
            if (!question) return;
            totalPoints += question.points;

            if (question.type === "short_answer") {
                // Simple contains check for short answers
                const correct = String(question.correct_answer).toLowerCase();
                const response = String(ans.response).toLowerCase();
                if (response.includes(correct) || correct.includes(response)) {
                    totalScore += question.points;
                }
            } else if (question.type === "multiple_choice") {
                const correctOpts = question.options?.filter((o) => o.is_correct).map((o) => o.content).sort() || [];
                const responseArr = (Array.isArray(ans.response) ? ans.response : [ans.response]).sort();
                if (JSON.stringify(correctOpts) === JSON.stringify(responseArr)) {
                    totalScore += question.points;
                }
            } else {
                // single_choice, true_false
                const correctOpt = question.options?.find((o) => o.is_correct);
                if (correctOpt && correctOpt.content === ans.response) {
                    totalScore += question.points;
                }
            }
        });

        const updated: TestSession = {
            ...session,
            score: totalScore,
            total_points: totalPoints,
            status: "graded",
            submitted_at: new Date().toISOString(),
        };

        setSessions((prev) => prev.map((s) => (s.id === sessionId ? updated : s)));
        return updated;
    };

    const getSessionsByTest = (testId: string) => sessions.filter((s) => s.test_id === testId);
    const getCampaignTests = (campaignId: string) => tests.filter((t) => t.campaign_id === campaignId);
    const getTestQuestions = (testId: string) => questions.filter((q) => q.test_id === testId).sort((a, b) => a.order_index - b.order_index);

    return (
        <DataContext.Provider
            value={{
                user, campaigns, tests, questions, sessions,
                login, register, logout,
                addCampaign, updateCampaign, deleteCampaign,
                addTest, updateTest, deleteTest,
                addQuestion, updateQuestion, deleteQuestion,
                getTestByInviteCode, startSession, submitSession,
                getSessionsByTest, getCampaignTests, getTestQuestions,
            }}
        >
            {children}
        </DataContext.Provider>
    );
}

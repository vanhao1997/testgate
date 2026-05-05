import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fshfwrvgxvdiyqszrtbc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzaGZ3cnZneHZkaXlxc3pydGJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNjYxMjQsImV4cCI6MjA4OTY0MjEyNH0.yPJeDUH4lVUfnYwWfW2IibRJbtXqmbzOWEZvbsv9a-A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ====== GOOGLE SHEETS ======
export const GOOGLE_SHEET_WEBHOOK = 'https://script.google.com/macros/s/AKfycbwu5kcKV4ZFwHfa5zTOkKhKZdOY6qbnoCwSNjo72PtQLTJ_Mpm5uFK6AZ9RlzZL5TNh/exec';

export interface TestResult {
    id?: string;
    candidate_name: string;
    candidate_email: string;
    candidate_phone: string;
    candidate_id: string;
    test_group: string;
    score: number;
    total_points: number;
    percentage: number;
    passed: boolean;
    answers: Record<string, unknown>[];
    submitted_at?: string;
    created_at?: string;
}

/**
 * Gửi kết quả + toàn bộ câu trả lời lên Google Sheets
 */
export async function sendToGoogleSheet(data: {
    candidate_id: string;
    candidate_name: string;
    candidate_email: string;
    candidate_phone: string;
    test_group: string;
    score: number;
    total_points: number;
    percentage: number;
    passed: boolean;
    all_answers: { question: string; answer: string; correct?: boolean; points?: number; max_points?: number }[];
}) {
    if (!GOOGLE_SHEET_WEBHOOK) return;
    try {
        // Flatten answers
        const flatAnswers: Record<string, string> = {};
        (data.all_answers || []).forEach((a, i) => {
            flatAnswers[`Question ${i + 1}`] = a.answer || '';
        });

        const payload = {
            "Timestamp": new Date().toISOString(),
            "Candidate ID": data.candidate_id,
            "Full Name": data.candidate_name,
            "Email": data.candidate_email,
            "Phone Number": data.candidate_phone,
            "Test Group": data.test_group,
            ...flatAnswers,
        };

        await fetch(GOOGLE_SHEET_WEBHOOK, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload),
        });
    } catch (e) {
        console.error('Google Sheets webhook failed:', e);
    }
}

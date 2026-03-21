import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fshfwrvgxvdiyqszrtbc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzaGZ3cnZneHZkaXlxc3pydGJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNjYxMjQsImV4cCI6MjA4OTY0MjEyNH0.yPJeDUH4lVUfnYwWfW2IibRJbtXqmbzOWEZvbsv9a-A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ====== GOOGLE SHEETS ======
// Paste URL webhook từ Google Apps Script vào đây:
export const GOOGLE_SHEET_WEBHOOK = '';
// Ví dụ: 'https://script.google.com/macros/s/AKfycbx.../exec'

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
 * Gửi kết quả lên Google Sheets (nếu đã cấu hình webhook)
 */
export async function sendToGoogleSheet(data: Omit<TestResult, 'id' | 'answers' | 'submitted_at' | 'created_at'>) {
    if (!GOOGLE_SHEET_WEBHOOK) return;
    try {
        await fetch(GOOGLE_SHEET_WEBHOOK, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
    } catch (e) {
        console.error('Google Sheets webhook failed:', e);
    }
}

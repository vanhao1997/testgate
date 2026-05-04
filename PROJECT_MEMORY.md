# Ký ức Dự án: TestGate (W-Production Trainee Aptitude Test)

## Thông tin chung
- **Tên dự án:** TestGate
- **Mục đích:** Cổng đánh giá năng lực ứng viên W-Production Trainee Season 2 (Wilmar CLV).
- **Tech Stack:** Next.js 16.2.1, React 19, Supabase, Google Sheets Webhook, Recharts, Phosphor Icons.

## Cấu trúc Hệ thống
1. **Ứng viên (`/t/[code]`):** 
   - Điền thông tin -> Chọn 1 trong 3 nhóm đề (Finance/BPM, SC-Planning, SC-Logistics).
   - Làm bài test trắc nghiệm tính giờ (25 phút). Có Floating timer.
   - Tự động nộp bài khi hết giờ.
2. **Admin (`/admin`):**
   - Dashboard quản lý chung.
   - Trình chỉnh sửa câu hỏi (`question-editor.tsx`).
   - Biểu đồ phân tích (`charts.tsx`).
3. **Judge (`/judge`):**
   - Giao diện dành cho ban giám khảo để review bài làm chi tiết của từng ứng viên.

## Data Flow
- Logic chấm điểm (`gradeAnswers`) chạy trực tiếp ở client.
- Khi submit:
  1. Gọi API Supabase `supabase.from("test_results").insert(...)`.
  2. Gọi Webhook Google Sheets (`sendToGoogleSheet`) lưu data sang Sheet tên "TestGate".

## Điểm cần lưu ý (Ghi nhớ cho các lần phát triển sau)
- Câu hỏi bài test hiện đang hardcode trong `src/app/t/[code]/page.tsx` thay vì đọc từ Database. Cần tích hợp với `question-editor.tsx` nếu thay đổi luồng đề.
- Chấm điểm đang nằm ở phía client, rủi ro bảo mật (thấy đáp án đúng trên trình duyệt). Có thể chuyển qua Server Actions / Edge Functions của Supabase.

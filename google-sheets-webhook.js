/**
 * Google Apps Script — TestGate Webhook
 * 
 * HƯỚNG DẪN SETUP:
 * 
 * 1. Mở Google Sheets → tạo 1 sheet mới tên "TestGate"
 * 2. Ở dòng 1, điền header:
 *    A1: Thời gian | B1: Họ tên | C1: Email | D1: SĐT | E1: Bộ đề | F1: Điểm | G1: Tổng | H1: % | I1: Kết quả
 * 
 * 3. Vào menu "Extensions" → "Apps Script"
 * 4. Xóa code mẫu, paste toàn bộ code này vào
 * 5. Click "Deploy" → "New deployment"
 * 6. Type: "Web app"
 * 7. Execute as: "Me"  
 * 8. Who has access: "Anyone"
 * 9. Click "Deploy" → Copy URL
 * 10. Paste URL đó vào file src/app/lib/supabase.ts (biến GOOGLE_SHEET_WEBHOOK)
 */

function doPost(e) {
    try {
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("TestGate");
        if (!sheet) {
            sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
            sheet.setName("TestGate");
            // Add headers if empty
            if (sheet.getLastRow() === 0) {
                sheet.appendRow(["Thời gian", "Họ tên", "Email", "SĐT", "Bộ đề", "Điểm", "Tổng điểm", "%", "Kết quả"]);
            }
        }

        var data = JSON.parse(e.postData.contents);

        var groupLabel = {
            "marketing": "📢 Marketing",
            "sales": "💼 Sales",
            "technical": "💻 Kỹ thuật"
        };

        sheet.appendRow([
            new Date().toLocaleString("vi-VN"),
            data.candidate_name,
            data.candidate_email,
            data.candidate_phone || "",
            groupLabel[data.test_group] || data.test_group,
            data.score,
            data.total_points,
            data.percentage + "%",
            data.passed ? "✅ Đạt" : "❌ Không đạt"
        ]);

        return ContentService
            .createTextOutput(JSON.stringify({ success: true }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (err) {
        return ContentService
            .createTextOutput(JSON.stringify({ error: err.message }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

function doGet() {
    return ContentService
        .createTextOutput("TestGate webhook is running!")
        .setMimeType(ContentService.MimeType.TEXT);
}

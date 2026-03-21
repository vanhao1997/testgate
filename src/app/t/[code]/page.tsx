"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import Link from "next/link";
import { supabase, sendToGoogleSheet } from "../../lib/supabase";
import { ThemeToggle } from "../../components/ThemeToggle";
import styles from "../test.module.css";

type AnswerMap = Record<string, string | string[]>;

/* ==========================================
   3 bộ câu hỏi cho 3 nhóm ứng viên (HARDCODE)
   ========================================== */
interface QuestionDef {
    id: string;
    type: "multiple_choice" | "single_choice" | "true_false" | "short_answer";
    content: string;
    points: number;
    correct_answer: string | string[];
    options?: { id: string; content: string; is_correct: boolean }[];
}

interface TestGroup {
    id: string;
    title: string;
    description: string;
    icon: string;
    iconClass: string;
    durationMinutes: number;
    questions: QuestionDef[];
}

const TEST_GROUPS: TestGroup[] = [
    {
        id: "finance",
        title: "Finance",
        description: "Kế toán, tài chính doanh nghiệp, phân tích chi phí và quản trị ngân sách",
        icon: "💰",
        iconClass: "group-icon-marketing",
        durationMinutes: 25,
        questions: [
            {
                id: "fin-1", type: "single_choice", content: "COGS là viết tắt của thuật ngữ nào?", points: 10,
                correct_answer: "Cost of Goods Sold",
                options: [
                    { id: "fo-1", content: "Cost of Goods Sold", is_correct: true },
                    { id: "fo-2", content: "Cost of General Services", is_correct: false },
                    { id: "fo-3", content: "Cash on Goods Supplied", is_correct: false },
                    { id: "fo-4", content: "Cost of Global Sales", is_correct: false },
                ],
            },
            {
                id: "fin-2", type: "single_choice", content: "Báo cáo tài chính nào thể hiện tình hình tài sản, nợ phải trả và vốn chủ sở hữu tại một thời điểm?", points: 10,
                correct_answer: "Bảng cân đối kế toán (Balance Sheet)",
                options: [
                    { id: "fo-5", content: "Báo cáo kết quả kinh doanh", is_correct: false },
                    { id: "fo-6", content: "Bảng cân đối kế toán (Balance Sheet)", is_correct: true },
                    { id: "fo-7", content: "Báo cáo lưu chuyển tiền tệ", is_correct: false },
                    { id: "fo-8", content: "Thuyết minh báo cáo tài chính", is_correct: false },
                ],
            },
            {
                id: "fin-3", type: "true_false", content: "Gross Profit = Revenue - COGS.", points: 5,
                correct_answer: "true",
                options: [
                    { id: "fo-9", content: "Đúng", is_correct: true },
                    { id: "fo-10", content: "Sai", is_correct: false },
                ],
            },
            {
                id: "fin-4", type: "single_choice", content: "ROI (Return on Investment) được tính bằng công thức nào?", points: 10,
                correct_answer: "(Lợi nhuận ròng / Chi phí đầu tư) × 100%",
                options: [
                    { id: "fo-11", content: "(Doanh thu / Chi phí) × 100%", is_correct: false },
                    { id: "fo-12", content: "(Lợi nhuận ròng / Chi phí đầu tư) × 100%", is_correct: true },
                    { id: "fo-13", content: "(Doanh thu - Chi phí) / Doanh thu", is_correct: false },
                    { id: "fo-14", content: "Lợi nhuận ròng / Tổng tài sản", is_correct: false },
                ],
            },
            {
                id: "fin-5", type: "single_choice", content: "Trong phân tích Break-even, điểm hòa vốn xảy ra khi nào?", points: 10,
                correct_answer: "Tổng doanh thu = Tổng chi phí",
                options: [
                    { id: "fo-15", content: "Tổng doanh thu > Tổng chi phí", is_correct: false },
                    { id: "fo-16", content: "Tổng doanh thu = Tổng chi phí", is_correct: true },
                    { id: "fo-17", content: "Lợi nhuận gộp = 0", is_correct: false },
                    { id: "fo-18", content: "Biến phí = Định phí", is_correct: false },
                ],
            },
            {
                id: "fin-6", type: "multiple_choice", content: "Những chỉ số nào thuộc nhóm chỉ số thanh khoản (Liquidity Ratios)? (chọn nhiều)", points: 15,
                correct_answer: ["Current Ratio", "Quick Ratio", "Cash Ratio"],
                options: [
                    { id: "fo-19", content: "Current Ratio", is_correct: true },
                    { id: "fo-20", content: "Quick Ratio", is_correct: true },
                    { id: "fo-21", content: "Cash Ratio", is_correct: true },
                    { id: "fo-22", content: "Debt-to-Equity Ratio", is_correct: false },
                ],
            },
            {
                id: "fin-7", type: "true_false", content: "Khấu hao (Depreciation) là chi phí bằng tiền mặt thực tế phát sinh.", points: 5,
                correct_answer: "false",
                options: [
                    { id: "fo-23", content: "Đúng", is_correct: false },
                    { id: "fo-24", content: "Sai", is_correct: true },
                ],
            },
            {
                id: "fin-8", type: "single_choice", content: "Working Capital (Vốn lưu động) được tính bằng công thức nào?", points: 10,
                correct_answer: "Tài sản ngắn hạn - Nợ ngắn hạn",
                options: [
                    { id: "fo-25", content: "Tổng tài sản - Tổng nợ", is_correct: false },
                    { id: "fo-26", content: "Tài sản ngắn hạn - Nợ ngắn hạn", is_correct: true },
                    { id: "fo-27", content: "Vốn chủ sở hữu - Nợ dài hạn", is_correct: false },
                    { id: "fo-28", content: "Doanh thu - Chi phí hoạt động", is_correct: false },
                ],
            },
            {
                id: "fin-9", type: "single_choice", content: "Trong ngành sản xuất FMCG, chi phí nào thường chiếm tỷ trọng lớn nhất?", points: 10,
                correct_answer: "Chi phí nguyên vật liệu",
                options: [
                    { id: "fo-29", content: "Chi phí marketing", is_correct: false },
                    { id: "fo-30", content: "Chi phí nguyên vật liệu", is_correct: true },
                    { id: "fo-31", content: "Chi phí nhân sự văn phòng", is_correct: false },
                    { id: "fo-32", content: "Chi phí nghiên cứu phát triển", is_correct: false },
                ],
            },
            {
                id: "fin-10", type: "short_answer", content: "Giải thích ngắn gọn sự khác biệt giữa OPEX (Operating Expenditure) và CAPEX (Capital Expenditure).", points: 15,
                correct_answer: "OPEX là chi phí vận hành hàng ngày, CAPEX là chi phí đầu tư tài sản dài hạn",
            },
            // --- Mindset & Kiến thức chung ---
            {
                id: "ms-f1", type: "single_choice", content: "Khi gặp một vấn đề phức tạp trong công việc, bạn nên ưu tiên làm gì đầu tiên?", points: 10,
                correct_answer: "Phân tích nguyên nhân gốc rễ trước khi đưa ra giải pháp",
                options: [
                    { id: "mf-1", content: "Báo cáo ngay cho cấp trên và chờ chỉ đạo", is_correct: false },
                    { id: "mf-2", content: "Phân tích nguyên nhân gốc rễ trước khi đưa ra giải pháp", is_correct: true },
                    { id: "mf-3", content: "Áp dụng cách giải quyết từ kinh nghiệm cũ ngay lập tức", is_correct: false },
                    { id: "mf-4", content: "Bỏ qua và tập trung vào công việc khác", is_correct: false },
                ],
            },
            {
                id: "ms-f2", type: "single_choice", content: "PDCA trong cải tiến liên tục là viết tắt của gì?", points: 10,
                correct_answer: "Plan - Do - Check - Act",
                options: [
                    { id: "mf-5", content: "Plan - Do - Check - Act", is_correct: true },
                    { id: "mf-6", content: "Process - Design - Control - Analyze", is_correct: false },
                    { id: "mf-7", content: "Prepare - Deliver - Confirm - Adjust", is_correct: false },
                    { id: "mf-8", content: "Plan - Develop - Complete - Assess", is_correct: false },
                ],
            },
            {
                id: "ms-f3", type: "single_choice", content: "Tư duy 'Growth Mindset' khác với 'Fixed Mindset' ở điểm nào?", points: 10,
                correct_answer: "Tin rằng năng lực có thể phát triển qua nỗ lực và học hỏi",
                options: [
                    { id: "mf-9", content: "Tin rằng năng lực có thể phát triển qua nỗ lực và học hỏi", is_correct: true },
                    { id: "mf-10", content: "Luôn tập trung vào kết quả cuối cùng", is_correct: false },
                    { id: "mf-11", content: "Tránh nhận thêm trách nhiệm mới", is_correct: false },
                    { id: "mf-12", content: "Chỉ làm những việc mình giỏi sẵn", is_correct: false },
                ],
            },
            {
                id: "ms-f4", type: "true_false", content: "Trong môi trường sản xuất, Kaizen có nghĩa là cải tiến liên tục từng bước nhỏ.", points: 5,
                correct_answer: "true",
                options: [
                    { id: "mf-13", content: "Đúng", is_correct: true },
                    { id: "mf-14", content: "Sai", is_correct: false },
                ],
            },
            {
                id: "ms-f5", type: "short_answer", content: "Theo bạn, đâu là phẩm chất quan trọng nhất của một nhà quản lý sản xuất tương lai? Giải thích ngắn gọn.", points: 15,
                correct_answer: "khả năng lãnh đạo, trách nhiệm, học hỏi, giải quyết vấn đề",
            },
        ],
    },
    {
        id: "sc-planning",
        title: "Supply Chain Planning",
        description: "Hoạch định chuỗi cung ứng, dự báo nhu cầu, quản lý tồn kho và S&OP",
        icon: "📊",
        iconClass: "group-icon-sales",
        durationMinutes: 25,
        questions: [
            {
                id: "scp-1", type: "single_choice", content: "S&OP là viết tắt của thuật ngữ nào?", points: 10,
                correct_answer: "Sales and Operations Planning",
                options: [
                    { id: "spo-1", content: "Sales and Operations Planning", is_correct: true },
                    { id: "spo-2", content: "Supply and Order Processing", is_correct: false },
                    { id: "spo-3", content: "Strategic Operational Plan", is_correct: false },
                    { id: "spo-4", content: "Stock and Output Planning", is_correct: false },
                ],
            },
            {
                id: "scp-2", type: "single_choice", content: "Phương pháp dự báo nhu cầu nào sử dụng dữ liệu lịch sử để dự đoán tương lai?", points: 10,
                correct_answer: "Phương pháp định lượng (Quantitative forecasting)",
                options: [
                    { id: "spo-5", content: "Phương pháp Delphi", is_correct: false },
                    { id: "spo-6", content: "Phương pháp định lượng (Quantitative forecasting)", is_correct: true },
                    { id: "spo-7", content: "Phương pháp khảo sát thị trường", is_correct: false },
                    { id: "spo-8", content: "Phương pháp chuyên gia", is_correct: false },
                ],
            },
            {
                id: "scp-3", type: "true_false", content: "Safety Stock (tồn kho an toàn) giúp giảm thiểu rủi ro hết hàng khi nhu cầu biến động.", points: 5,
                correct_answer: "true",
                options: [
                    { id: "spo-9", content: "Đúng", is_correct: true },
                    { id: "spo-10", content: "Sai", is_correct: false },
                ],
            },
            {
                id: "scp-4", type: "single_choice", content: "MRP là viết tắt của gì?", points: 10,
                correct_answer: "Material Requirements Planning",
                options: [
                    { id: "spo-11", content: "Manufacturing Resource Planning", is_correct: false },
                    { id: "spo-12", content: "Material Requirements Planning", is_correct: true },
                    { id: "spo-13", content: "Market Research Planning", is_correct: false },
                    { id: "spo-14", content: "Maintenance Repair Protocol", is_correct: false },
                ],
            },
            {
                id: "scp-5", type: "single_choice", content: "Phân tích ABC trong quản lý tồn kho dựa trên nguyên tắc nào?", points: 10,
                correct_answer: "Nguyên tắc Pareto 80/20",
                options: [
                    { id: "spo-15", content: "Phân loại theo kích thước sản phẩm", is_correct: false },
                    { id: "spo-16", content: "Nguyên tắc Pareto 80/20", is_correct: true },
                    { id: "spo-17", content: "Phân loại theo ngày hết hạn", is_correct: false },
                    { id: "spo-18", content: "Phân loại theo nhà cung cấp", is_correct: false },
                ],
            },
            {
                id: "scp-6", type: "multiple_choice", content: "Những yếu tố nào ảnh hưởng đến Demand Planning? (chọn nhiều)", points: 15,
                correct_answer: ["Mùa vụ / Seasonality", "Chương trình khuyến mãi", "Xu hướng thị trường"],
                options: [
                    { id: "spo-19", content: "Mùa vụ / Seasonality", is_correct: true },
                    { id: "spo-20", content: "Chương trình khuyến mãi", is_correct: true },
                    { id: "spo-21", content: "Xu hướng thị trường", is_correct: true },
                    { id: "spo-22", content: "Màu sắc logo công ty", is_correct: false },
                ],
            },
            {
                id: "scp-7", type: "true_false", content: "EOQ (Economic Order Quantity) là mô hình giúp xác định số lượng đặt hàng tối ưu nhằm giảm thiểu tổng chi phí tồn kho.", points: 5,
                correct_answer: "true",
                options: [
                    { id: "spo-23", content: "Đúng", is_correct: true },
                    { id: "spo-24", content: "Sai", is_correct: false },
                ],
            },
            {
                id: "scp-8", type: "single_choice", content: "Lead Time trong chuỗi cung ứng là gì?", points: 10,
                correct_answer: "Thời gian từ khi đặt hàng đến khi nhận hàng",
                options: [
                    { id: "spo-25", content: "Thời gian sản xuất một sản phẩm", is_correct: false },
                    { id: "spo-26", content: "Thời gian từ khi đặt hàng đến khi nhận hàng", is_correct: true },
                    { id: "spo-27", content: "Thời gian giao hàng đến khách hàng", is_correct: false },
                    { id: "spo-28", content: "Thời gian kiểm tra chất lượng", is_correct: false },
                ],
            },
            {
                id: "scp-9", type: "single_choice", content: "KPI nào đo lường độ chính xác của dự báo nhu cầu?", points: 10,
                correct_answer: "Forecast Accuracy (MAPE)",
                options: [
                    { id: "spo-29", content: "Inventory Turnover", is_correct: false },
                    { id: "spo-30", content: "Forecast Accuracy (MAPE)", is_correct: true },
                    { id: "spo-31", content: "Fill Rate", is_correct: false },
                    { id: "spo-32", content: "On-Time Delivery", is_correct: false },
                ],
            },
            {
                id: "scp-10", type: "short_answer", content: "Giải thích ngắn gọn Bullwhip Effect (Hiệu ứng roi da) trong chuỗi cung ứng.", points: 15,
                correct_answer: "Hiện tượng biến động đơn hàng tăng dần khi đi ngược chuỗi cung ứng từ khách hàng đến nhà cung cấp",
            },
            // --- Mindset & Kiến thức chung ---
            {
                id: "ms-s1", type: "single_choice", content: "Khi làm việc nhóm, điều quan trọng nhất để đạt hiệu quả là gì?", points: 10,
                correct_answer: "Giao tiếp rõ ràng và phân công trách nhiệm cụ thể",
                options: [
                    { id: "ms-1", content: "Mỗi người tự làm phần việc của mình", is_correct: false },
                    { id: "ms-2", content: "Giao tiếp rõ ràng và phân công trách nhiệm cụ thể", is_correct: true },
                    { id: "ms-3", content: "Luôn đồng ý với ý kiến số đông", is_correct: false },
                    { id: "ms-4", content: "Tập trung hoàn thành nhanh nhất có thể", is_correct: false },
                ],
            },
            {
                id: "ms-s2", type: "single_choice", content: "5S trong quản lý sản xuất bao gồm những gì?", points: 10,
                correct_answer: "Sàng lọc, Sắp xếp, Sạch sẽ, Săn sóc, Sẵn sàng",
                options: [
                    { id: "ms-5", content: "Sàng lọc, Sắp xếp, Sạch sẽ, Săn sóc, Sẵn sàng", is_correct: true },
                    { id: "ms-6", content: "Speed, Safety, Service, Skill, Standard", is_correct: false },
                    { id: "ms-7", content: "Sáng tạo, Siêng năng, Sẵn sàng, Số liệu, Sức khỏe", is_correct: false },
                    { id: "ms-8", content: "Sort, Set, Shine, Standardize, Sustain (nhưng không phiên bản trên)", is_correct: false },
                ],
            },
            {
                id: "ms-s3", type: "single_choice", content: "KPI là viết tắt của gì?", points: 10,
                correct_answer: "Key Performance Indicator",
                options: [
                    { id: "ms-9", content: "Key Performance Indicator", is_correct: true },
                    { id: "ms-10", content: "Knowledge Process Integration", is_correct: false },
                    { id: "ms-11", content: "Key Product Index", is_correct: false },
                    { id: "ms-12", content: "Knowledgeable Professional Input", is_correct: false },
                ],
            },
            {
                id: "ms-s4", type: "true_false", content: "Lean Manufacturing tập trung vào việc loại bỏ lãng phí (waste) trong quy trình sản xuất.", points: 5,
                correct_answer: "true",
                options: [
                    { id: "ms-13", content: "Đúng", is_correct: true },
                    { id: "ms-14", content: "Sai", is_correct: false },
                ],
            },
            {
                id: "ms-s5", type: "short_answer", content: "Bạn xử lý thế nào khi nhận được phản hồi tiêu cực từ cấp trên về công việc của mình?", points: 15,
                correct_answer: "lắng nghe, rút kinh nghiệm, cải thiện, không phòng thủ",
            },
        ],
    },
    {
        id: "sc-logistics",
        title: "Supply Chain Logistics",
        description: "Vận tải, kho bãi, phân phối, quản lý đơn hàng và tối ưu logistics",
        icon: "🚛",
        iconClass: "group-icon-tech",
        durationMinutes: 25,
        questions: [
            {
                id: "scl-1", type: "single_choice", content: "3PL là viết tắt của thuật ngữ nào?", points: 10,
                correct_answer: "Third-Party Logistics",
                options: [
                    { id: "lo-1", content: "Third-Party Logistics", is_correct: true },
                    { id: "lo-2", content: "Three-Phase Loading", is_correct: false },
                    { id: "lo-3", content: "Third-Point Leverage", is_correct: false },
                    { id: "lo-4", content: "Total Product Lifecycle", is_correct: false },
                ],
            },
            {
                id: "scl-2", type: "single_choice", content: "Incoterms 2020 quy định điều gì trong thương mại quốc tế?", points: 10,
                correct_answer: "Trách nhiệm chi phí và rủi ro giữa người mua và người bán",
                options: [
                    { id: "lo-5", content: "Thuế nhập khẩu giữa các quốc gia", is_correct: false },
                    { id: "lo-6", content: "Trách nhiệm chi phí và rủi ro giữa người mua và người bán", is_correct: true },
                    { id: "lo-7", content: "Tiêu chuẩn chất lượng sản phẩm", is_correct: false },
                    { id: "lo-8", content: "Quy trình thông quan hải quan", is_correct: false },
                ],
            },
            {
                id: "scl-3", type: "true_false", content: "Cross-docking là phương pháp giúp hàng hóa đi thẳng từ xe nhận đến xe giao mà không cần lưu kho.", points: 5,
                correct_answer: "true",
                options: [
                    { id: "lo-9", content: "Đúng", is_correct: true },
                    { id: "lo-10", content: "Sai", is_correct: false },
                ],
            },
            {
                id: "scl-4", type: "single_choice", content: "WMS là viết tắt của gì?", points: 10,
                correct_answer: "Warehouse Management System",
                options: [
                    { id: "lo-11", content: "Warehouse Management System", is_correct: true },
                    { id: "lo-12", content: "Wholesale Market Strategy", is_correct: false },
                    { id: "lo-13", content: "Workflow Monitoring Software", is_correct: false },
                    { id: "lo-14", content: "Weight Measurement Standard", is_correct: false },
                ],
            },
            {
                id: "scl-5", type: "single_choice", content: "Trong quản lý kho, phương pháp FIFO có nghĩa là gì?", points: 10,
                correct_answer: "First In, First Out — Hàng nhập trước được xuất trước",
                options: [
                    { id: "lo-15", content: "First In, First Out — Hàng nhập trước được xuất trước", is_correct: true },
                    { id: "lo-16", content: "First In, Final Output — Kiểm tra lô đầu tiên", is_correct: false },
                    { id: "lo-17", content: "Final Inventory For Order — Tồn kho cuối kỳ", is_correct: false },
                    { id: "lo-18", content: "Fast Input, Fast Output — Xử lý nhanh", is_correct: false },
                ],
            },
            {
                id: "scl-6", type: "multiple_choice", content: "Những phương thức vận tải nào thường được sử dụng trong logistics? (chọn nhiều)", points: 15,
                correct_answer: ["Đường bộ (Road)", "Đường biển (Sea)", "Đường hàng không (Air)"],
                options: [
                    { id: "lo-19", content: "Đường bộ (Road)", is_correct: true },
                    { id: "lo-20", content: "Đường biển (Sea)", is_correct: true },
                    { id: "lo-21", content: "Đường hàng không (Air)", is_correct: true },
                    { id: "lo-22", content: "Đường ống dẫn tâm linh", is_correct: false },
                ],
            },
            {
                id: "scl-7", type: "true_false", content: "Last Mile Delivery là giai đoạn vận chuyển hàng từ nhà máy đến kho trung chuyển.", points: 5,
                correct_answer: "false",
                options: [
                    { id: "lo-23", content: "Đúng", is_correct: false },
                    { id: "lo-24", content: "Sai", is_correct: true },
                ],
            },
            {
                id: "scl-8", type: "single_choice", content: "TMS (Transportation Management System) giúp tối ưu điều gì?", points: 10,
                correct_answer: "Lập kế hoạch, thực thi và tối ưu hóa vận chuyển hàng hóa",
                options: [
                    { id: "lo-25", content: "Quản lý nhân sự kho hàng", is_correct: false },
                    { id: "lo-26", content: "Lập kế hoạch, thực thi và tối ưu hóa vận chuyển hàng hóa", is_correct: true },
                    { id: "lo-27", content: "Quản lý chất lượng sản phẩm", is_correct: false },
                    { id: "lo-28", content: "Theo dõi tài chính doanh nghiệp", is_correct: false },
                ],
            },
            {
                id: "scl-9", type: "single_choice", content: "Chỉ số OTD (On-Time Delivery) đo lường điều gì?", points: 10,
                correct_answer: "Tỷ lệ đơn hàng giao đúng hẹn so với tổng đơn hàng",
                options: [
                    { id: "lo-29", content: "Tổng số đơn hàng trong tháng", is_correct: false },
                    { id: "lo-30", content: "Tỷ lệ đơn hàng giao đúng hẹn so với tổng đơn hàng", is_correct: true },
                    { id: "lo-31", content: "Chi phí vận chuyển trung bình", is_correct: false },
                    { id: "lo-32", content: "Số lần xe xuất kho mỗi ngày", is_correct: false },
                ],
            },
            {
                id: "scl-10", type: "short_answer", content: "Giải thích ngắn gọn sự khác biệt giữa Reverse Logistics và Forward Logistics.", points: 15,
                correct_answer: "Forward Logistics là dòng hàng từ nhà sản xuất đến khách hàng, Reverse Logistics là dòng hàng ngược lại từ khách hàng về",
            },
            // --- Mindset & Kiến thức chung ---
            {
                id: "ms-l1", type: "single_choice", content: "Khi môi trường kinh doanh thay đổi nhanh, kỹ năng nào quan trọng nhất?", points: 10,
                correct_answer: "Khả năng thích ứng và học hỏi liên tục",
                options: [
                    { id: "ml-1", content: "Kinh nghiệm lâu năm trong ngành", is_correct: false },
                    { id: "ml-2", content: "Khả năng thích ứng và học hỏi liên tục", is_correct: true },
                    { id: "ml-3", content: "Tuân thủ quy trình có sẵn", is_correct: false },
                    { id: "ml-4", content: "Giữ nguyên cách làm đã thành công", is_correct: false },
                ],
            },
            {
                id: "ms-l2", type: "single_choice", content: "An toàn lao động tại nhà máy là trách nhiệm của ai?", points: 10,
                correct_answer: "Tất cả mọi người trong tổ chức",
                options: [
                    { id: "ml-5", content: "Chỉ phòng An toàn lao động", is_correct: false },
                    { id: "ml-6", content: "Chỉ quản lý sản xuất", is_correct: false },
                    { id: "ml-7", content: "Tất cả mọi người trong tổ chức", is_correct: true },
                    { id: "ml-8", content: "Chỉ công nhân trực tiếp sản xuất", is_correct: false },
                ],
            },
            {
                id: "ms-l3", type: "single_choice", content: "Phương pháp '5 Whys' được sử dụng để làm gì?", points: 10,
                correct_answer: "Tìm nguyên nhân gốc rễ của vấn đề bằng cách hỏi 'Tại sao' liên tục",
                options: [
                    { id: "ml-9", content: "Đánh giá hiệu suất nhân viên", is_correct: false },
                    { id: "ml-10", content: "Tìm nguyên nhân gốc rễ của vấn đề bằng cách hỏi 'Tại sao' liên tục", is_correct: true },
                    { id: "ml-11", content: "Lập kế hoạch dự án theo 5 giai đoạn", is_correct: false },
                    { id: "ml-12", content: "Phân loại sản phẩm lỗi", is_correct: false },
                ],
            },
            {
                id: "ms-l4", type: "true_false", content: "ERP (Enterprise Resource Planning) là hệ thống tích hợp quản lý toàn bộ nguồn lực doanh nghiệp.", points: 5,
                correct_answer: "true",
                options: [
                    { id: "ml-13", content: "Đúng", is_correct: true },
                    { id: "ml-14", content: "Sai", is_correct: false },
                ],
            },
            {
                id: "ms-l5", type: "short_answer", content: "Bạn hiểu thế nào về 'tư duy chủ động' (proactive mindset) trong công việc? Cho ví dụ ngắn.", points: 15,
                correct_answer: "chủ động tìm kiếm giải pháp, không chờ được giao việc, dự đoán vấn đề trước",
            },
        ],
    },
];

/* ==========================================
   Chấm điểm
   ========================================== */
function gradeAnswers(group: TestGroup, answers: AnswerMap) {
    let totalScore = 0;
    let totalPoints = 0;
    const details: { qid: string; question: string; type: string; answer_text: string; correct: boolean; points: number; max_points: number }[] = [];

    group.questions.forEach((q) => {
        totalPoints += q.points;
        const ans = answers[q.id];
        let correct = false;
        let answerText = "";

        // Build answer text
        if (Array.isArray(ans)) {
            answerText = ans.join(", ");
        } else if (ans) {
            answerText = String(ans);
        } else {
            answerText = "(Chưa trả lời)";
        }

        if (q.type === "short_answer") {
            const c = String(q.correct_answer).toLowerCase();
            const r = String(ans || "").toLowerCase();
            correct = r.length > 3 && (r.includes(c) || c.includes(r));
        } else if (q.type === "multiple_choice") {
            const correctOpts = q.options?.filter((o) => o.is_correct).map((o) => o.content).sort() || [];
            const responseArr = (Array.isArray(ans) ? ans : []).sort();
            correct = JSON.stringify(correctOpts) === JSON.stringify(responseArr);
        } else {
            const correctOpt = q.options?.find((o) => o.is_correct);
            correct = correctOpt?.content === ans;
        }

        if (correct) totalScore += q.points;
        details.push({ qid: q.id, question: q.content, type: q.type, answer_text: answerText, correct, points: correct ? q.points : 0, max_points: q.points });
    });

    return { totalScore, totalPoints, details };
}

/* ==========================================
   Component chính
   ========================================== */
export default function CandidateTestPage() {
    const [phase, setPhase] = useState<"entry" | "group" | "test">("entry");
    const [candidateName, setCandidateName] = useState("");
    const [candidateEmail, setCandidateEmail] = useState("");
    const [candidatePhone, setCandidatePhone] = useState("");
    const [candidateId, setCandidateId] = useState("");
    const [selectedGroup, setSelectedGroup] = useState<TestGroup | null>(null);
    const [answers, setAnswers] = useState<AnswerMap>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [totalTime, setTotalTime] = useState(0);
    const [saving, setSaving] = useState(false);
    const [showThankYou, setShowThankYou] = useState(false);

    // Timer
    useEffect(() => {
        if (phase !== "test" || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) { clearInterval(timer); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [phase, timeLeft]);

    // Auto-submit
    const handleSubmit = useCallback(async () => {
        if (!selectedGroup || saving) return;
        setSaving(true);

        const { totalScore, totalPoints, details } = gradeAnswers(selectedGroup, answers);
        const pct = totalPoints > 0 ? Math.round((totalScore / totalPoints) * 100) : 0;
        const passed = pct >= 70;

        // Collect all answers with question text for judges
        const allAnswers = selectedGroup.questions.map((q) => {
            const ans = answers[q.id];
            let answerText = "";
            if (Array.isArray(ans)) {
                answerText = ans.join(", ");
            } else if (ans) {
                answerText = String(ans);
            } else {
                answerText = "(Chưa trả lời)";
            }
            return { question: q.content, answer: answerText };
        });

        // Save to Supabase + Google Sheets (score is saved for judges, NOT shown to candidate)
        const resultPayload = {
            candidate_name: candidateName,
            candidate_email: candidateEmail,
            candidate_phone: candidatePhone,
            candidate_id: candidateId,
            test_group: selectedGroup.id,
            score: totalScore,
            total_points: totalPoints,
            percentage: pct,
            passed,
        };
        try {
            await Promise.all([
                supabase.from("test_results").insert({ ...resultPayload, answers: details }),
                sendToGoogleSheet({ ...resultPayload, all_answers: allAnswers }),
            ]);
        } catch (e) {
            console.error("Failed to save:", e);
        }

        setSaving(false);
        setShowThankYou(true);
    }, [selectedGroup, answers, candidateName, candidateEmail, candidatePhone, candidateId, saving]);

    useEffect(() => {
        if (phase === "test" && timeLeft === 0 && totalTime > 0) handleSubmit();
    }, [timeLeft, phase, handleSubmit, totalTime]);

    const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
    const timerState = timeLeft <= 30 ? "danger" : timeLeft <= 120 ? "warning" : "normal";
    const timerProgress = totalTime > 0 ? (timeLeft / totalTime) * 100 : 100;

    const handleSelectOption = (qId: string, qType: string, optContent: string) => {
        setAnswers((prev) => {
            if (qType === "multiple_choice") {
                const cur = (prev[qId] as string[]) || [];
                return { ...prev, [qId]: cur.includes(optContent) ? cur.filter((c) => c !== optContent) : [...cur, optContent] };
            }
            return { ...prev, [qId]: optContent };
        });
    };

    const isSelected = (qId: string, qType: string, optContent: string) => {
        const a = answers[qId];
        if (!a) return false;
        return qType === "multiple_choice" ? (a as string[]).includes(optContent) : a === optContent;
    };

    const questions = selectedGroup?.questions || [];
    const answeredCount = Object.keys(answers).filter((k) => {
        const a = answers[k];
        return Array.isArray(a) ? a.length > 0 : !!a;
    }).length;

    // ==================== ENTRY ====================
    if (phase === "entry") {
        const handleEntry = (e: FormEvent) => {
            e.preventDefault();
            if (candidateName && candidateEmail && candidateId) setPhase("group");
        };
        return (
            <div className={styles["test-page"]}>
                <Nav />
                <div className={styles["test-entry"]}>
                    <div className={`card ${styles["test-entry-card"]}`}>
                        <div className={styles["test-entry-header"]}>
                            <h1>W-Future Leader</h1>
                            <p>Production Trainee Season 2 — Bài test sàng lọc ứng viên</p>
                        </div>
                        <div className={styles["test-info-grid"]}>
                            <div className={styles["test-info-item"]}>
                                <div className={styles["test-info-value"]}>3 bộ đề</div>
                                <div className={styles["test-info-label"]}>Finance · SC Planning · SC Logistics</div>
                            </div>
                            <div className={styles["test-info-item"]}>
                                <div className={styles["test-info-value"]}>20–25 phút</div>
                                <div className={styles["test-info-label"]}>mỗi bộ đề</div>
                            </div>
                        </div>
                        <form onSubmit={handleEntry} style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
                            <div className="form-group">
                                <label className="form-label">Họ và tên *</label>
                                <input className="form-input" placeholder="Nhập họ tên đầy đủ" value={candidateName} onChange={(e) => setCandidateName(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email *</label>
                                <input type="email" className="form-input" placeholder="email@example.com" value={candidateEmail} onChange={(e) => setCandidateEmail(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Số điện thoại</label>
                                <input className="form-input" placeholder="0901234567" value={candidatePhone} onChange={(e) => setCandidatePhone(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Số báo danh *</label>
                                <input className="form-input" placeholder="Nhập số báo danh" value={candidateId} onChange={(e) => setCandidateId(e.target.value)} required />
                            </div>
                            <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%" }}>Tiếp tục chọn bộ đề →</button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // ==================== GROUP SELECT ====================
    if (phase === "group") {
        return (
            <div className={styles["test-page"]}>
                <Nav />
                <div className={styles["group-selection"]}>
                    <div className={styles["group-selection-header"]}>
                        <h2>Chọn bộ đề phù hợp</h2>
                        <p>Xin chào <strong>{candidateName}</strong>, hãy chọn bộ đề phù hợp với vị trí ứng tuyển</p>
                    </div>
                    <div className={styles["group-cards"]}>
                        {TEST_GROUPS.map((g) => (
                            <div key={g.id} className={`card ${styles["group-card"]} ${selectedGroup?.id === g.id ? styles["group-card-selected"] : ""}`} onClick={() => setSelectedGroup(g)}>
                                <div className={`${styles["group-card-icon"]} ${styles[g.iconClass]}`}>{g.icon}</div>
                                <h3>{g.title}</h3>
                                <p>{g.description}</p>
                                <div className={styles["group-card-meta"]}>
                                    <span>📝 {g.questions.length} câu</span>
                                    <span>⏱ {g.durationMinutes} phút</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className={styles["group-start-btn"]}>
                        <button className="btn btn-primary btn-lg" disabled={!selectedGroup} onClick={() => {
                            if (!selectedGroup) return;
                            setTimeLeft(selectedGroup.durationMinutes * 60);
                            setTotalTime(selectedGroup.durationMinutes * 60);
                            setPhase("test");
                        }} style={{ opacity: selectedGroup ? 1 : 0.5, minWidth: "240px" }}>
                            {selectedGroup ? `Bắt đầu bộ ${selectedGroup.title} →` : "Chọn một bộ đề để tiếp tục"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }




    // ==================== TEST ====================
    return (
        <div className={styles["test-page"]}>
            <nav className={styles["test-nav"]}>
                <div className="container">
                    <Link href="/" className={styles["test-logo"]}>
                        <img src="/wfl-logo.png" alt="W-Future Leader" style={{ height: 36, width: "auto" }} />
                    </Link>
                    <div className={styles["timer-container"]}>
                        <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-tertiary)" }}>Bộ: {selectedGroup?.title}</span>
                        <div className={`${styles["timer-box"]} ${timerState === "warning" ? styles["timer-box-warning"] : timerState === "danger" ? styles["timer-box-danger"] : ""}`}>
                            <span className={styles["timer-icon"]}>⏱</span>{formatTime(timeLeft)}
                        </div>
                    </div>
                </div>
            </nav>
            <div className={styles["test-content"]}>
                <div className={styles["test-progress"]}>
                    <div className={styles["test-progress-bar"]}>
                        <div className={styles["test-progress-fill"]} style={{ width: `${questions.length > 0 ? (answeredCount / questions.length) * 100 : 0}%` }}></div>
                    </div>
                    <div className={styles["test-progress-text"]}>
                        <span>Đã trả lời: {answeredCount}/{questions.length}</span>
                        <span>{selectedGroup?.title} • {questions.length} câu</span>
                    </div>
                </div>
                {questions.map((q, idx) => (
                    <div key={q.id} className={styles["test-question"]}>
                        <div className={`card ${styles["test-question-card"]}`}>
                            <div className={styles["test-question-header"]}>
                                <div className={styles["test-question-num"]}>{idx + 1}</div>
                                <span className={`badge ${q.type === "multiple_choice" ? "badge-accent" : q.type === "true_false" ? "badge-warning" : q.type === "short_answer" ? "badge-danger" : "badge-primary"}`}>
                                    {q.type === "single_choice" ? "Một đáp án" : q.type === "multiple_choice" ? "Nhiều đáp án" : q.type === "true_false" ? "Đúng/Sai" : "Tự luận"}
                                </span>

                            </div>
                            <div className={styles["test-question-text"]}>{q.content}</div>
                            {q.type !== "short_answer" && q.options ? (
                                <div className={styles["test-options"]}>
                                    {q.options.map((opt) => (
                                        <div key={opt.id} className={`${styles["test-option"]} ${isSelected(q.id, q.type, opt.content) ? styles["test-option-selected"] : ""}`} onClick={() => handleSelectOption(q.id, q.type, opt.content)}>
                                            <div className={q.type === "multiple_choice" ? styles["test-option-checkbox"] : styles["test-option-radio"]}></div>
                                            <span>{opt.content}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <textarea className={`form-input ${styles["test-short-answer"]}`} placeholder="Nhập câu trả lời của bạn..." value={(answers[q.id] as string) || ""} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} />
                            )}
                        </div>
                    </div>
                ))}
                <div className={styles["test-submit-area"]}>
                    <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>{answeredCount}/{questions.length} câu đã trả lời</span>
                    <button className="btn btn-primary btn-lg" disabled={saving} onClick={() => handleSubmit()}>{saving ? "Đang nộp..." : "Nộp bài →"}</button>
                </div>
            </div>

            {/* Floating Timer */}
            <div className={`${styles["floating-timer"]} ${timerState === "warning" ? styles["floating-timer-warning"] : timerState === "danger" ? styles["floating-timer-danger"] : ""}`}>
                <div className={styles["floating-timer-label"]}>Thời gian</div>
                <div className={`${styles["floating-timer-value"]} ${timerState === "warning" ? styles["floating-timer-value-warning"] : timerState === "danger" ? styles["floating-timer-value-danger"] : ""}`}>{formatTime(timeLeft)}</div>
                <div className={styles["floating-timer-progress"]}>
                    <div className={`${styles["floating-timer-progress-fill"]} ${timerState === "warning" ? styles["floating-timer-progress-fill-warning"] : timerState === "danger" ? styles["floating-timer-progress-fill-danger"] : styles["floating-timer-progress-fill-normal"]}`} style={{ width: `${timerProgress}%` }}></div>
                </div>
            </div>

            {/* Thank You Popup */}
            {showThankYou && (
                <div style={{
                    position: "fixed", inset: 0, zIndex: 9999,
                    background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "var(--space-xl)",
                    animation: "fadeIn 0.3s ease"
                }}>
                    <div className="card animate-fade-in-up" style={{
                        maxWidth: 480, width: "100%", padding: "var(--space-2xl) var(--space-2xl) var(--space-xl)",
                        textAlign: "center"
                    }}>
                        <img
                            src="/wfl-logo.png"
                            alt="W-Future Leader"
                            style={{ height: 48, margin: "0 auto var(--space-lg)" }}
                        />
                        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--font-size-2xl)", fontWeight: 800, marginBottom: "var(--space-xs)", color: "var(--color-primary)" }}>
                            Cảm ơn bạn!
                        </h2>
                        <div className="gold-bar" style={{ margin: "0 auto var(--space-lg)" }} />
                        <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-sm)", lineHeight: 1.8, marginBottom: "var(--space-xl)" }}>
                            Bài làm của bạn đã được ghi nhận thành công.<br />
                            Kết quả sẽ được <strong style={{ color: "var(--color-text-primary)" }}>ban giám khảo</strong> đánh giá<br />
                            và gửi lại qua email trong thời gian sớm nhất.
                        </p>
                        <div style={{
                            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)",
                            padding: "var(--space-lg)", background: "var(--color-bg-secondary)",
                            borderRadius: "var(--radius-md)", marginBottom: "var(--space-xl)"
                        }}>
                            <div>
                                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "var(--font-size-sm)" }}>{candidateName}</div>
                                <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-tertiary)" }}>Ứng viên</div>
                            </div>
                            <div>
                                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "var(--font-size-sm)" }}>{selectedGroup?.title}</div>
                                <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-tertiary)" }}>Bộ đề</div>
                            </div>
                        </div>
                        <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-tertiary)", marginBottom: "var(--space-lg)" }}>
                            W-Future Leader — Production Trainee Season 2
                        </p>
                        <Link href="/" className="btn btn-primary" style={{ width: "100%" }}>
                            Quay lại trang chủ
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

function Nav() {
    return (
        <nav className={styles["test-nav"]}>
            <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Link href="/" className={styles["test-logo"]}>
                    <img src="/wfl-logo.png" alt="W-Future Leader" style={{ height: 40, width: "auto" }} />
                </Link>
                <ThemeToggle />
            </div>
        </nav>
    );
}

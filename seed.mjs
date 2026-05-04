/**
 * Seed Script — 🧠 APTITUDE TEST – MANAGEMENT TRAINEE 2026
 *
 * Structure:
 *  - 12 common questions (Q1–Q12) → group_id = 'common'
 *  - 3 specific questions per track (Q13–Q15) → group_id = finance | sc-planning | sc-logistics
 *
 * Run: node seed.mjs
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fshfwrvgxvdiyqszrtbc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzaGZ3cnZneHZkaXlxc3pydGJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNjYxMjQsImV4cCI6MjA4OTY0MjEyNH0.yPJeDUH4lVUfnYwWfW2IibRJbtXqmbzOWEZvbsv9a-A';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================
// TEST GROUPS
// ============================================================
const TEST_GROUPS = [
    {
        id: 'common',
        title: 'Common Questions',
        description: 'Câu hỏi chung cho tất cả bộ đề (Q1–Q12)',
        icon: '🧠',
        duration_minutes: 30,
        is_active: false,   // hidden from group selection
        sort_order: 0,
    },
    {
        id: 'finance',
        title: 'Finance / BPM',
        description: 'Tài chính, quản lý ngân sách, dòng tiền, báo cáo tài chính',
        icon: '💰',
        duration_minutes: 30,
        is_active: true,
        sort_order: 1,
    },
    {
        id: 'sc-planning',
        title: 'Strategic Planning',
        description: 'Hoạch định chiến lược, phân tích thị trường, KPI & tăng trưởng bền vững',
        icon: '📊',
        duration_minutes: 30,
        is_active: true,
        sort_order: 2,
    },
    {
        id: 'sc-logistics',
        title: 'Logistics',
        description: 'Quản lý chuỗi cung ứng, kho vận, tối ưu vận chuyển & tồn kho',
        icon: '🚛',
        duration_minutes: 30,
        is_active: true,
        sort_order: 3,
    },
];

// ============================================================
// COMMON QUESTIONS (Q1 – Q12) — group_id = 'common'
// ============================================================
const COMMON_QUESTIONS = [
    // ── SECTION A: LOGICAL REASONING ──
    {
        group_id: 'common',
        type: 'single_choice',
        content: 'Q1. Pattern Recognition\nFind the missing number:\n2 – 6 – 7 – 21 – 23 – 69 – ?',
        points: 10,
        correct_answer: '71',
        image_url: null,
        sort_order: 1,
        options: [
            { id: 'q1a', content: '70', is_correct: false },
            { id: 'q1b', content: '71', is_correct: true },
            { id: 'q1c', content: '72', is_correct: false },
            { id: 'q1d', content: '75', is_correct: false },
        ],
    },
    {
        group_id: 'common',
        type: 'single_choice',
        content: 'Q2. Odd One Out\nWhich word does not belong?',
        points: 10,
        correct_answer: 'Profit',
        image_url: null,
        sort_order: 2,
        options: [
            { id: 'q2a', content: 'Warehouse', is_correct: false },
            { id: 'q2b', content: 'Inventory', is_correct: false },
            { id: 'q2c', content: 'Distribution', is_correct: false },
            { id: 'q2d', content: 'Profit', is_correct: true },
        ],
    },
    {
        group_id: 'common',
        type: 'single_choice',
        content: 'Q3. Sequence Logic\nAll suppliers are partners.\nSome partners are unreliable.\nWhich is TRUE?',
        points: 10,
        correct_answer: 'Some suppliers may be unreliable',
        image_url: null,
        sort_order: 3,
        options: [
            { id: 'q3a', content: 'All suppliers are unreliable', is_correct: false },
            { id: 'q3b', content: 'Some suppliers may be unreliable', is_correct: true },
            { id: 'q3c', content: 'No suppliers are unreliable', is_correct: false },
            { id: 'q3d', content: 'All unreliable are suppliers', is_correct: false },
        ],
    },
    {
        group_id: 'common',
        type: 'single_choice',
        content: 'Q4. Diagram-based Question (Flow logic)\nLook at the supply chain flow diagram:\nProcurement → Production → Warehouse → Customer\n\nWhere is inventory MOST likely to accumulate if demand suddenly drops?',
        points: 10,
        correct_answer: 'Warehouse',
        image_url: '/images/q4-flow-diagram.png',
        sort_order: 4,
        options: [
            { id: 'q4a', content: 'Procurement', is_correct: false },
            { id: 'q4b', content: 'Production', is_correct: false },
            { id: 'q4c', content: 'Warehouse', is_correct: true },
            { id: 'q4d', content: 'Customer', is_correct: false },
        ],
    },
    {
        group_id: 'common',
        type: 'single_choice',
        content: 'Q5. Coding Logic\nIf LOGISTICS = MPHJTUJDT (each letter shifts +1), what is FINANCE?',
        points: 10,
        correct_answer: 'GJOBODF',
        image_url: null,
        sort_order: 5,
        options: [
            { id: 'q5a', content: 'GJOBODF', is_correct: true },
            { id: 'q5b', content: 'GJOBODG', is_correct: false },
            { id: 'q5c', content: 'GJNBODF', is_correct: false },
            { id: 'q5d', content: 'GJOBPEF', is_correct: false },
        ],
    },
    {
        group_id: 'common',
        type: 'single_choice',
        content: 'Q6. Data Interpretation (Chart)\nLook at the regional sales chart.\n\nWhat percentage of total sales does the South region contribute?',
        points: 10,
        correct_answer: '30%',
        image_url: '/images/q6-sales-chart.png',
        sort_order: 6,
        options: [
            { id: 'q6a', content: '25%', is_correct: false },
            { id: 'q6b', content: '30%', is_correct: true },
            { id: 'q6c', content: '33%', is_correct: false },
            { id: 'q6d', content: '35%', is_correct: false },
        ],
    },

    // ── SECTION B: NUMERICAL REASONING ──
    {
        group_id: 'common',
        type: 'single_choice',
        content: 'Q7. Revenue & Profit Analysis\nRevenue increased from $200,000 to $260,000.\nProfit margin decreased from 25% to 20%.\n\nWhat happens to PROFIT?',
        points: 10,
        correct_answer: 'Increase',
        image_url: null,
        sort_order: 7,
        options: [
            { id: 'q7a', content: 'Increase', is_correct: true },
            { id: 'q7b', content: 'Decrease', is_correct: false },
            { id: 'q7c', content: 'No change', is_correct: false },
            { id: 'q7d', content: 'Cannot determine', is_correct: false },
        ],
    },
    {
        group_id: 'common',
        type: 'single_choice',
        content: 'Q8. Profit Margin Calculation\nCost = $80\nSelling Price = $100\n\nProfit margin = ?',
        points: 10,
        correct_answer: '20%',
        image_url: null,
        sort_order: 8,
        options: [
            { id: 'q8a', content: '20%', is_correct: true },
            { id: 'q8b', content: '25%', is_correct: false },
            { id: 'q8c', content: '30%', is_correct: false },
            { id: 'q8d', content: '15%', is_correct: false },
        ],
    },
    {
        group_id: 'common',
        type: 'single_choice',
        content: 'Q9. Ratio Problem\nA warehouse stores goods in ratio 2:3:5 (A:B:C).\nTotal = 100 units.\n\nHow many units of B?',
        points: 10,
        correct_answer: '30',
        image_url: null,
        sort_order: 9,
        options: [
            { id: 'q9a', content: '20', is_correct: false },
            { id: 'q9b', content: '30', is_correct: true },
            { id: 'q9c', content: '50', is_correct: false },
            { id: 'q9d', content: '40', is_correct: false },
        ],
    },
    {
        group_id: 'common',
        type: 'single_choice',
        content: 'Q10. Break-even + Scenario\nFixed cost = $1,000\nPrice = $10\nVariable cost = $5\n\nIf company wants profit = $500, required volume = ?',
        points: 10,
        correct_answer: '300',
        image_url: null,
        sort_order: 10,
        options: [
            { id: 'q10a', content: '200', is_correct: false },
            { id: 'q10b', content: '250', is_correct: false },
            { id: 'q10c', content: '300', is_correct: true },
            { id: 'q10d', content: '350', is_correct: false },
        ],
    },
    {
        group_id: 'common',
        type: 'single_choice',
        content: 'Q11. Time & Work\nTeam A completes a task in 10 days.\nTeam B completes the same task in 5 days.\n\nWorking together, how many days to complete?',
        points: 10,
        correct_answer: '3.3 days',
        image_url: null,
        sort_order: 11,
        options: [
            { id: 'q11a', content: '3.3 days', is_correct: true },
            { id: 'q11b', content: '4 days', is_correct: false },
            { id: 'q11c', content: '6 days', is_correct: false },
            { id: 'q11d', content: '7 days', is_correct: false },
        ],
    },
    {
        group_id: 'common',
        type: 'single_choice',
        content: 'Q12. Chart-based Cost Analysis\nLook at the cost breakdown pie chart.\n\nTotal cost = $1,000\nMaterials cost increases by 20%, while other costs remain unchanged.\n\nWhat is the NEW total cost?',
        points: 10,
        correct_answer: '$1,100',
        image_url: '/images/q12-cost-pie-chart.png',
        sort_order: 12,
        options: [
            { id: 'q12a', content: '$1,100', is_correct: true },
            { id: 'q12b', content: '$1,150', is_correct: false },
            { id: 'q12c', content: '$1,200', is_correct: false },
            { id: 'q12d', content: '$1,250', is_correct: false },
        ],
    },
];

// ============================================================
// SECTION C — FINANCE / BPM (Q13–Q15)
// ============================================================
const FINANCE_QUESTIONS = [
    {
        group_id: 'finance',
        type: 'single_choice',
        content: 'Q13. Financial Statement\nCompany reports profit but has cash shortage.\n\nWhich is MOST likely?',
        points: 10,
        correct_answer: 'High accounts receivable',
        image_url: null,
        sort_order: 13,
        options: [
            { id: 'f13a', content: 'High depreciation', is_correct: false },
            { id: 'f13b', content: 'High accounts receivable', is_correct: true },
            { id: 'f13c', content: 'Low revenue', is_correct: false },
            { id: 'f13d', content: 'High margin', is_correct: false },
        ],
    },
    {
        group_id: 'finance',
        type: 'single_choice',
        content: 'Q14. Budget Control\nCompany revenue ↑ 30% but profit ↓ 10%.\n\nWhat should you analyze FIRST?',
        points: 10,
        correct_answer: 'Cost structure',
        image_url: null,
        sort_order: 14,
        options: [
            { id: 'f14a', content: 'Marketing budget', is_correct: false },
            { id: 'f14b', content: 'Cost structure', is_correct: true },
            { id: 'f14c', content: 'Employee satisfaction', is_correct: false },
            { id: 'f14d', content: 'Office size', is_correct: false },
        ],
    },
    {
        group_id: 'finance',
        type: 'single_choice',
        content: 'Q15. Cash Flow Thinking\nA company reports high profits but has cash shortage.\n\nWhat is the MOST likely reason?',
        points: 10,
        correct_answer: 'High accounts receivable',
        image_url: null,
        sort_order: 15,
        options: [
            { id: 'f15a', content: 'High revenue', is_correct: false },
            { id: 'f15b', content: 'High accounts receivable', is_correct: true },
            { id: 'f15c', content: 'Low expenses', is_correct: false },
            { id: 'f15d', content: 'High inventory turnover', is_correct: false },
        ],
    },
];

// ============================================================
// SECTION C — STRATEGIC PLANNING (Q13–Q15)
// ============================================================
const PLANNING_QUESTIONS = [
    {
        group_id: 'sc-planning',
        type: 'single_choice',
        content: 'Q13. Market Entry Strategy\nA company enters a new market with high growth but strong competition.\n\nBest first step?',
        points: 10,
        correct_answer: 'Analyze competitors & positioning',
        image_url: null,
        sort_order: 13,
        options: [
            { id: 'p13a', content: 'Increase price', is_correct: false },
            { id: 'p13b', content: 'Analyze competitors & positioning', is_correct: true },
            { id: 'p13c', content: 'Hire more staff', is_correct: false },
            { id: 'p13d', content: 'Expand office', is_correct: false },
        ],
    },
    {
        group_id: 'sc-planning',
        type: 'single_choice',
        content: 'Q14. KPI Selection\nA company wants to measure sustainable growth.\n\nWhich KPI is MOST appropriate?',
        points: 10,
        correct_answer: 'Revenue growth rate',
        image_url: null,
        sort_order: 14,
        options: [
            { id: 'p14a', content: 'Revenue growth rate', is_correct: true },
            { id: 'p14b', content: 'Number of new hires', is_correct: false },
            { id: 'p14c', content: 'Market share growth', is_correct: false },
            { id: 'p14d', content: 'Number of meetings', is_correct: false },
        ],
    },
    {
        group_id: 'sc-planning',
        type: 'single_choice',
        content: 'Q15. Business Decision\nA company sees strong sales growth but declining profit margin.\n\nWhat should be analyzed FIRST?',
        points: 10,
        correct_answer: 'Cost structure',
        image_url: null,
        sort_order: 15,
        options: [
            { id: 'p15a', content: 'Employee satisfaction', is_correct: false },
            { id: 'p15b', content: 'Cost structure', is_correct: true },
            { id: 'p15c', content: 'Office expansion', is_correct: false },
            { id: 'p15d', content: 'Number of products', is_correct: false },
        ],
    },
];

// ============================================================
// SECTION C — LOGISTICS (Q13–Q15)
// ============================================================
const LOGISTICS_QUESTIONS = [
    {
        group_id: 'sc-logistics',
        type: 'single_choice',
        content: 'Q13. Delivery Optimization\nA company wants to reduce delivery lead time while keeping inventory and headcount unchanged.\n\nWhich action is MOST effective?',
        points: 10,
        correct_answer: 'Optimize delivery routes and network',
        image_url: null,
        sort_order: 13,
        options: [
            { id: 'l13a', content: 'Increase inventory at all warehouses', is_correct: false },
            { id: 'l13b', content: 'Optimize delivery routes and network', is_correct: true },
            { id: 'l13c', content: 'Hire more warehouse staff', is_correct: false },
            { id: 'l13d', content: 'Increase product price', is_correct: false },
        ],
    },
    {
        group_id: 'sc-logistics',
        type: 'single_choice',
        content: 'Q14. Inventory Management\nA company reduces inventory to cut costs.\nAfter 2 months, stockouts increase significantly.\n\nWhat is the BEST next step?',
        points: 10,
        correct_answer: 'Improve demand forecasting and replenishment planning',
        image_url: null,
        sort_order: 14,
        options: [
            { id: 'l14a', content: 'Continue reducing inventory', is_correct: false },
            { id: 'l14b', content: 'Increase prices to control demand', is_correct: false },
            { id: 'l14c', content: 'Improve demand forecasting and replenishment planning', is_correct: true },
            { id: 'l14d', content: 'Stop selling low-demand products', is_correct: false },
        ],
    },
    {
        group_id: 'sc-logistics',
        type: 'single_choice',
        content: 'Q15. Root Cause Analysis\nA company has:\n• High total inventory\n• Frequent stockouts at specific locations\n\nWhat is the MOST likely root cause?',
        points: 10,
        correct_answer: 'Poor inventory allocation across locations',
        image_url: null,
        sort_order: 15,
        options: [
            { id: 'l15a', content: 'Demand too high', is_correct: false },
            { id: 'l15b', content: 'Poor inventory allocation across locations', is_correct: true },
            { id: 'l15c', content: 'Too many suppliers', is_correct: false },
            { id: 'l15d', content: 'High storage cost', is_correct: false },
        ],
    },
];

// ============================================================
// SEED EXECUTION
// ============================================================
async function seed() {
    console.log('🧠 Seeding APTITUDE TEST – Management Trainee 2026...\n');

    // 1) Clear existing data (order matters for FK)
    console.log('🗑️  Clearing old data...');
    const { error: e1 } = await supabase.from('judge_scores').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (e1) console.warn('  judge_scores:', e1.message);
    const { error: e2 } = await supabase.from('test_results').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (e2) console.warn('  test_results:', e2.message);
    const { error: e3 } = await supabase.from('questions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (e3) console.warn('  questions:', e3.message);
    const { error: e4 } = await supabase.from('test_groups').delete().neq('id', '');
    if (e4) console.warn('  test_groups:', e4.message);

    // 2) Insert test groups
    console.log('📦  Inserting test groups...');
    const { error: gErr } = await supabase.from('test_groups').insert(TEST_GROUPS);
    if (gErr) { console.error('❌ test_groups error:', gErr); return; }
    console.log(`  ✅ ${TEST_GROUPS.length} groups inserted`);

    // 3) Insert questions
    const allQuestions = [
        ...COMMON_QUESTIONS,
        ...FINANCE_QUESTIONS,
        ...PLANNING_QUESTIONS,
        ...LOGISTICS_QUESTIONS,
    ];

    console.log('📝  Inserting questions...');
    const { error: qErr } = await supabase.from('questions').insert(allQuestions);
    if (qErr) { console.error('❌ questions error:', qErr); return; }
    console.log(`  ✅ ${allQuestions.length} questions inserted`);
    console.log(`     - ${COMMON_QUESTIONS.length} common (Q1–Q12)`);
    console.log(`     - ${FINANCE_QUESTIONS.length} Finance/BPM (Q13–Q15)`);
    console.log(`     - ${PLANNING_QUESTIONS.length} Strategic Planning (Q13–Q15)`);
    console.log(`     - ${LOGISTICS_QUESTIONS.length} Logistics (Q13–Q15)`);

    // 4) Verify
    const { data: groups } = await supabase.from('test_groups').select('id, title, is_active');
    const { data: questions } = await supabase.from('questions').select('id, group_id, sort_order');
    console.log('\n📊  Verification:');
    console.log(`  Groups: ${groups?.length || 0}`);
    console.log(`  Questions: ${questions?.length || 0}`);
    groups?.forEach(g => {
        const count = questions?.filter(q => q.group_id === g.id).length || 0;
        console.log(`    ${g.is_active ? '✅' : '⚙️'} ${g.title}: ${count} questions`);
    });

    console.log('\n🎉 Seed complete!');
}

seed().catch(console.error);

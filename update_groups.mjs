import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fshfwrvgxvdiyqszrtbc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzaGZ3cnZneHZkaXlxc3pydGJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNjYxMjQsImV4cCI6MjA4OTY0MjEyNH0.yPJeDUH4lVUfnYwWfW2IibRJbtXqmbzOWEZvbsv9a-A';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data: groups, error } = await supabase.from('test_groups').select('*');
  console.log("Current groups:", groups);

  if (groups) {
    for (const group of groups) {
      let newDescription = group.description;
      
      if (group.id === 'bpm') {
        newDescription = "Finance, budget management, cash flow, financial reporting";
      } else if (group.id === 'strategy') {
        newDescription = "Strategic planning, market analysis, KPIs & sustainable growth";
      } else if (group.id === 'logistics') {
        newDescription = "Supply chain management, warehousing, transport & inventory optimization";
      }

      if (newDescription !== group.description) {
        const { error: updateError } = await supabase
          .from('test_groups')
          .update({ description: newDescription })
          .eq('id', group.id);
        
        if (updateError) {
          console.error("Failed to update group", group.id, updateError);
        } else {
          console.log("Successfully updated", group.id);
        }
      }
    }
  }
}

run();

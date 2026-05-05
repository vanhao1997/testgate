import { createClient } from '@supabase/supabase-js';

const s = createClient(
  'https://fshfwrvgxvdiyqszrtbc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzaGZ3cnZneHZkaXlxc3pydGJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNjYxMjQsImV4cCI6MjA4OTY0MjEyNH0.yPJeDUH4lVUfnYwWfW2IibRJbtXqmbzOWEZvbsv9a-A'
);

// Find Q4 (sort_order = 4 or the 4th question)
const { data } = await s.from('questions').select('id, content, sort_order, image_url').order('sort_order');

console.log('Questions around Q4:');
data?.filter(q => q.sort_order >= 3 && q.sort_order <= 5).forEach(q => {
  console.log(`sort_order=${q.sort_order} | id=${q.id} | image=${q.image_url} | ${q.content.substring(0, 80)}`);
});

// Update Q4 image
const q4 = data?.find(q => q.sort_order === 4);
if (q4) {
  const { error } = await s.from('questions').update({ image_url: '/images/q4-flow-diagram.jpg' }).eq('id', q4.id);
  if (error) console.error('Update error:', error);
  else console.log(`\nUpdated Q4 (${q4.id}) image_url to /images/q4-flow-diagram.jpg`);
} else {
  console.log('Q4 not found by sort_order=4, listing all:');
  data?.forEach(q => console.log(`sort=${q.sort_order} | ${q.content.substring(0,50)}`));
}

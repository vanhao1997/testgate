import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dsvckdihyoyrtybctnys.supabase.co'; // Default from what we saw
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-key'; // I need the actual key from the file

async function run() {
  const { data, error } = await supabase.from('test_groups').select('*');
  console.log(data, error);
}

run();

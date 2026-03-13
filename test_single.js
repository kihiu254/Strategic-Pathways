import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, anonKey);

async function test() {
  const id = '9dcb5269-6044-4d15-8840-9f9ad1f9280d';
  console.log('Testing single():');
  const res = await supabase.from('profiles').select('*').eq('id', id).single();
  console.log('Error:', JSON.stringify(res.error, null, 2));
}

test();

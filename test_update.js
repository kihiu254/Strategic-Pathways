import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, anonKey);

async function test() {
  const id = '9dcb5269-6044-4d15-8840-9f9ad1f9280d';
  console.log('Testing single():');
  const res = await supabase.from('profiles').select('*').eq('id', id).single();
  console.log('single() HTTP status:', res.status, res.error?.code);

  const res2 = await supabase.from('profiles').update({ bio: 'test' }).eq('id', id);
  console.log('update() HTTP status:', res2.status, res2.error?.code);

  const res3 = await supabase.from('profiles').upsert({ id, bio: 'test' });
  console.log('upsert() HTTP status:', res3.status, res3.error?.code);
}

test();

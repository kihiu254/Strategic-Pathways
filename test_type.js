import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, anonKey);

async function test() {
  console.log('Testing missing column in update:');
  const res2 = await supabase.from('profiles').update({ fcm_token: 'yes' }).eq('id', '9dcb5269-6044-4d15-8840-9f9ad1f9280d');
  console.log('status:', res2.status, res2.error?.code, res2.error?.message);
}

test();

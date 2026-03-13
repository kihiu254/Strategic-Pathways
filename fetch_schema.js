import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

async function test() {
  const response = await fetch(`${supabaseUrl}/rest/v1/?apikey=${anonKey}`);
  const schema = await response.json();
  const profilesDefinition = schema.definitions.profiles;
  if (profilesDefinition) {
    fs.writeFileSync('schema.json', JSON.stringify(Object.keys(profilesDefinition.properties), null, 2));
  } else {
    console.log('Profiles definition not found');
  }
}

test();

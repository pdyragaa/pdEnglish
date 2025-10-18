// Test script to verify Supabase connection
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load environment variables from .env file
let envContent = '';
try {
  envContent = readFileSync('.env', 'utf8');
} catch (err) {
  console.error('❌ .env file not found');
  process.exit(1);
}

const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Make sure you have VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('🔄 Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('categories')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Successfully connected to Supabase!');
    
    // Test if tables exist
    console.log('🔄 Checking database tables...');
    
    const tables = ['categories', 'vocabulary', 'sentences', 'reviews'];
    
    for (const table of tables) {
      const { error: tableError } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (tableError) {
        console.error(`❌ Table '${table}' not found or accessible:`, tableError.message);
      } else {
        console.log(`✅ Table '${table}' is accessible`);
      }
    }
    
    return true;
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    return false;
  }
}

testConnection().then(success => {
  if (success) {
    console.log('\n🎉 Supabase setup is complete!');
    console.log('You can now run: npm run dev');
  } else {
    console.log('\n💡 Make sure you have:');
    console.log('1. Created a Supabase project');
    console.log('2. Set up your .env file with correct credentials');
    console.log('3. Run migrations: npx supabase db push');
  }
});

/**
 * Chạy ALTER TABLE trực tiếp qua Supabase Management API
 * node run_migration.mjs
 */
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.SUPABASE_URL.trim();
const key = process.env.SUPABASE_KEY.trim();

// Trích project ref từ URL: https://aabnidvlhorfydxtwsdp.supabase.co
const projectRef = url.replace('https://', '').replace('.supabase.co', '');

const sql = "ALTER TABLE documents ADD COLUMN IF NOT EXISTS mime_type TEXT DEFAULT 'text/markdown';";

console.log('Project ref:', projectRef);
console.log('SQL:', sql);

// Dùng Supabase anon key để gọi custom RPC nếu được cấu hình
// Nếu không, thử PostgreSQL REST
const resp = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
  method: 'POST',
  headers: {
    'apikey': key,
    'Authorization': 'Bearer ' + key,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  },
  body: JSON.stringify({ sql })
}).catch(e => null);

if (resp) {
  const text = await resp.text();
  console.log('RPC Status:', resp.status, text);
}

// Fallback: Dùng @supabase/supabase-js để INSERT một row thử
const { createClient } = await import('@supabase/supabase-js');
const sb = createClient(url, key);

// Thử đọc mime_type
const { data, error } = await sb.from('documents').select('mime_type').limit(1);
console.log('\n--- Kiểm tra cột mime_type ---');
if (error && error.code === '42703') {
  console.log('❌ Cột mime_type CHƯA TỒN TẠI trên Supabase.');
  console.log('\n📋 Hãy chạy câu SQL sau trong Supabase SQL Editor:');
  console.log('   https://supabase.com/dashboard/project/' + projectRef + '/sql/new');
  console.log('');
  console.log("   ALTER TABLE documents ADD COLUMN IF NOT EXISTS mime_type TEXT DEFAULT 'text/markdown';");
  console.log('');
} else if (!error) {
  console.log('✅ Cột mime_type ĐÃ TỒN TẠI. Migration không cần!');
} else {
  console.log('⚠️ Lỗi khác:', JSON.stringify(error));
}

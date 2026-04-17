/**
 * Chạy SQL migration trực tiếp qua Supabase Management API
 * node do_migration.mjs
 */
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.SUPABASE_URL.trim();
const key = process.env.SUPABASE_KEY.trim();
const projectRef = url.replace('https://', '').replace('.supabase.co', '');

// Thử dùng pg extension qua RPC nếu admin function tồn tại
const sql = `ALTER TABLE documents ADD COLUMN IF NOT EXISTS mime_type TEXT DEFAULT 'text/markdown';`;

// Cách 1: Gọi custom SQL function nếu có
const r1 = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
  method: 'POST',
  headers: { 'apikey': key, 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: sql })
});
console.log('Method 1 (exec_sql/query):', r1.status, await r1.text());

// Cách 2: Gọi với param sql
const r2 = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
  method: 'POST',
  headers: { 'apikey': key, 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
  body: JSON.stringify({ sql })
});
console.log('Method 2 (exec_sql/sql):', r2.status, await r2.text());

// Kiểm tra kết quả
const checkResp = await fetch(`${url}/rest/v1/documents?select=mime_type&limit=1`, {
  headers: { 'apikey': key, 'Authorization': 'Bearer ' + key }
});
if (checkResp.status === 200) {
  console.log('\n✅ THÀNH CÔNG! Cột mime_type đã tồn tại trên Supabase!');
} else {
  console.log('\n❌ CHƯA XONG. Hãy chạy thủ công trên Supabase Dashboard:');
  console.log(`   URL: https://supabase.com/dashboard/project/${projectRef}/sql/new`);
  console.log(`   SQL: ${sql}`);
}

import dotenv from 'dotenv';
dotenv.config();

const key = process.env.SUPABASE_KEY.trim();
const url = process.env.SUPABASE_URL.trim();
const projectRef = url.replace('https://', '').replace('.supabase.co', '');

const testResp = await fetch(`${url}/rest/v1/documents?select=mime_type&limit=1`, {
  headers: { 'apikey': key, 'Authorization': 'Bearer ' + key }
});

const testText = await testResp.text();
console.log('Status:', testResp.status);

if (testResp.status === 200) {
  console.log('\n✅ Cột mime_type ĐÃ TỒN TẠI trên Supabase. Không cần migration!');
} else {
  console.log('\n❌ Cột mime_type CHƯA CÓ. Hãy chạy SQL sau tại:');
  console.log('   https://supabase.com/dashboard/project/' + projectRef + '/sql/new\n');
  console.log("   ALTER TABLE documents ADD COLUMN IF NOT EXISTS mime_type TEXT DEFAULT 'text/markdown';");
  console.log('\n📌 Server đã có graceful fallback nên thư viện Markdown vẫn hoạt động.');
  console.log('   Chỉ cần migration để upload & xem Ảnh/PDF hoạt động đầy đủ.');
}

/**
 * Migration script: Thêm cột mime_type vào bảng documents (Supabase Postgres)
 * Chạy một lần: node migrate_mime_type.js
 */
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL.trim(), process.env.SUPABASE_KEY.trim());

async function migrate() {
  console.log('🔄 Đang kiểm tra cột mime_type trong bảng documents...');

  // Thử lấy dữ liệu để kiểm tra cột có tồn tại không
  const { error: checkError } = await supabase.from('documents').select('mime_type').limit(1);

  if (!checkError) {
    console.log('✅ Cột mime_type đã tồn tại. Không cần migration.');
    return;
  }

  if (checkError.code === '42703') {
    console.log('⚠️  Cột mime_type chưa có. Đang thêm...');

    // Supabase không hỗ trợ ALTER TABLE qua REST API, cần dùng Supabase SQL Editor
    // Hoặc dùng service_role key với rpc
    // In ra câu SQL để chạy thủ công
    console.log('\n📋 Hãy chạy câu SQL sau trong Supabase SQL Editor:\n');
    console.log("─────────────────────────────────────────────────────────────────");
    console.log("ALTER TABLE documents ADD COLUMN IF NOT EXISTS mime_type TEXT DEFAULT 'text/markdown';");
    console.log("─────────────────────────────────────────────────────────────────\n");
    console.log('👉 Truy cập: https://supabase.com > Project > SQL Editor');
    console.log('   Dán câu SQL trên và nhấn Run.\n');

    // Thử exec qua RPC nếu có function
    const { error: rpcError } = await supabase.rpc('exec_sql', {
      sql: "ALTER TABLE documents ADD COLUMN IF NOT EXISTS mime_type TEXT DEFAULT 'text/markdown';"
    });

    if (!rpcError) {
      console.log('✅ Migration thành công qua RPC!');
    } else {
      console.log('ℹ️  RPC không khả dụng (bình thường). Hãy chạy thủ công câu SQL trên.');
    }
  } else {
    console.error('❌ Lỗi không xác định:', checkError);
  }
}

migrate().catch(console.error);

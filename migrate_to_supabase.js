import Database from 'better-sqlite3';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Thiếu SUPABASE_URL hoặc SUPABASE_KEY trong file .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const dbPath = path.resolve(__dirname, 'hkpt.db');
let dbLocal;
try {
  dbLocal = new Database(dbPath, { fileMustExist: true });
} catch (err) {
  console.error(`❌ Không tìm thấy database cục bộ tại ${dbPath}. Bạn chưa tạo dữ liệu nội bộ nào?`, err.message);
  process.exit(1);
}

async function migrate() {
  console.log('🚀 BẮT ĐẦU ĐỒNG BỘ DỮ LIỆU TỪ MÁY TRẠM XUỐNG ĐÁM MÂY (SUPABASE)...');

  // 1. Chuyển Projects
  console.log('\\n📦 Đang chuyển Hồ sơ dự án...');
  const projects = dbLocal.prepare('SELECT * FROM projects').all();
  if (projects.length === 0) {
    console.log('  -> Không có dự án nào cần chuyển.');
  } else {
    for (const p of projects) {
        // Postgres JSONB cần kiểu object, SQLite lưu chuỗi string
        const payload = {
            ...p,
            details: typeof p.details === 'string' ? JSON.parse(p.details || '{}') : p.details,
            notes: typeof p.notes === 'string' ? JSON.parse(p.notes || '[]') : p.notes
        };
        const { error } = await supabase.from('projects').upsert([payload]);
        if (error) {
            console.error(`  ❌ Lỗi khi tải dự án ${p.id}:`, error.message);
        } else {
            console.log(`  ✅ Đã tải dự án: ${p.projectName || p.id}`);
        }
    }
  }

  // 2. Chuyển Documents
  console.log('\\n📂 Đang chuyển Thư viện tài liệu (Virtual Tree)...');
  const documents = dbLocal.prepare('SELECT * FROM documents').all();
  if (documents.length === 0) {
    console.log('  -> Không có tài liệu nào cần chuyển.');
  } else {
    // Để đẩy theo thứ tự không lỗi parent, ta đẩy folder trước, file sau
    const folders = documents.filter(d => d.type === 'folder');
    const files = documents.filter(d => d.type === 'file');

    for (const f of folders) {
        const { error } = await supabase.from('documents').upsert([f]);
        if (error) console.error(`  ❌ Lỗi thư mục ${f.path}:`, error.message);
    }
    console.log(`  ✅ Đã tạo cấu trúc ${folders.length} Thư mục.`);

    let fileCount = 0;
    for (const f of files) {
        const { error } = await supabase.from('documents').upsert([f]);
        if (error) {
            console.error(`  ❌ Lỗi file ${f.path}:`, error.message);
        } else {
            fileCount++;
        }
    }
    console.log(`  ✅ Đã tải thành công ${fileCount}/${files.length} Bài viết Markdown.`);
  }

  console.log('\\n🎉 HOÀN TẤT ĐỒNG BỘ! Toàn bộ não bộ local đã vươn lên đám mây Vercel!');
}

migrate().catch(console.error);

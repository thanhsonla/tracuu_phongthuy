import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import mammoth from 'mammoth';
import TurndownService from 'turndown';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { createRequire } from 'module';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Đoạn này lừa Vercel Bundler để nó không cố gói better-sqlite3 C++ native code
const customRequire = createRequire(import.meta.url);
const sqlModuleName = 'better-sqlite3';

// Load biến môi trường từ file .env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'hkpt_super_secret_jwt_key_2026';

// ===== Middleware =====
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ===== Môi trường CSDL =====
let dbLocal = null;
let supabase = null;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

let isCloud = !!(SUPABASE_URL && SUPABASE_KEY);

const docsDir = path.resolve(__dirname, 'src/data/docs');

if (isCloud) {
  console.log('☁️ KHỞI ĐỘNG CHẾ ĐỘ MÂY HÓA (CLOUD - SUPABASE POSTGRES)');
  try {
     supabase = createClient(SUPABASE_URL.trim(), SUPABASE_KEY.trim());
  } catch(e) {
     console.error("LỖI KHI KẾT NỐI SUPABASE. Kích hoạt mây hóa thất bại:", e);
     // Đè về local để không sập server
     supabase = null; 
     isCloud = false;
  }
} 

if (!supabase) {
  if (process.env.VERCEL) {
     console.error("LỖI CHÍNH TỬ: Đang ở trên Vercel nhưng KHÔNG có kết nối Supabase. Hệ thống sẽ tê liệt.");
  } else {
    console.log('💻 KHỞI ĐỘNG CHẾ ĐỘ CỤC BỘ (LOCAL - SQLITE)');
    
    // Dùng require động để tránh vỡ Serverless
    let Database;
    try {
       Database = customRequire(sqlModuleName);
    } catch(err) {
       console.error("Cảnh báo: Khởi động Local thất bại do thiếu better-sqlite3.", err);
    }

  if (Database) {
    const dbPath = path.resolve(__dirname, 'hkpt.db');
    dbLocal = new Database(dbPath);
    dbLocal.pragma('journal_mode = WAL');

    // Khởi tạo bảng users local
    dbLocal.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'USER',
      permissions TEXT DEFAULT '{"TRACKER":true,"CREATE":true,"LUBAN":true,"LIBRARY":true}',
      last_login TEXT DEFAULT NULL,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    )
    `);

    try {
      const uInfo = dbLocal.prepare("PRAGMA table_info(users)").all();
      if (uInfo.length > 0 && !uInfo.find(c => c.name === 'permissions')) {
        dbLocal.exec("ALTER TABLE users ADD COLUMN permissions TEXT DEFAULT '{\"TRACKER\":true,\"CREATE\":true,\"LUBAN\":true,\"LIBRARY\":true}'");
        console.log("Migrated SQLite: Added permissions to users");
      }
      if (uInfo.length > 0 && !uInfo.find(c => c.name === 'last_login')) {
        dbLocal.exec("ALTER TABLE users ADD COLUMN last_login TEXT DEFAULT NULL");
        console.log("Migrated SQLite: Added last_login to users");
      }
    } catch(e) { }

    // Khởi tạo bảng projects local
    dbLocal.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      projectName TEXT NOT NULL DEFAULT '',
      clientName TEXT NOT NULL DEFAULT '',
      address TEXT DEFAULT '',
      degree REAL DEFAULT 0,
      period INTEGER DEFAULT 9,
      yearBuilt INTEGER DEFAULT 2024,
      menhQuai TEXT DEFAULT '',
      birthYear INTEGER DEFAULT 1990,
      gender TEXT DEFAULT 'Nam',
      loanDau TEXT DEFAULT '',
      details TEXT DEFAULT '{}',
      notes TEXT DEFAULT '[]',
      owner_id TEXT DEFAULT NULL,
      createdAt TEXT DEFAULT (datetime('now','localtime')),
      updatedAt TEXT DEFAULT (datetime('now','localtime'))
    )
    `);

    try {
      const tableInfo = dbLocal.prepare("PRAGMA table_info(projects)").all();
      if (!tableInfo.find(c => c.name === 'owner_id')) {
        dbLocal.exec("ALTER TABLE projects ADD COLUMN owner_id TEXT DEFAULT NULL");
        console.log("Migrated SQLite: Added owner_id to projects");
      }
    } catch(e) { }

  // Khởi tạo bảng documents local
  dbLocal.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      path TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL,
      content TEXT,
      size INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT (datetime('now','localtime')),
      updatedAt TEXT DEFAULT (datetime('now','localtime'))
    )
  `);
    }
  }
}

// ======================================================================
// DATABASE ADAPTER (CẦU NỐI 2 MÔI TRƯỜNG)
// ======================================================================
const DB = {
  async getProjects() {
    if (isCloud) {
       const { data, error } = await supabase.from('projects').select('*').order('updatedAt', { ascending: false });
       if (error) throw error;
       // JSON fields in Postgres JSONB are already objects
       return data.map(r => ({
           ...r,
           details: typeof r.details === 'string' ? JSON.parse(r.details) : r.details,
           notes: typeof r.notes === 'string' ? JSON.parse(r.notes) : r.notes,
       }));
    } else {
       return dbLocal.prepare('SELECT * FROM projects ORDER BY updatedAt DESC').all().map(r => ({
         ...r,
         details: JSON.parse(r.details || '{}'),
         notes: JSON.parse(r.notes || '[]'),
       }));
    }
  },

  async insertProject(p, id) {
    const payload = {
      id,
      projectName: p.projectName || p.clientName || '',
      clientName: p.clientName || '',
      address: p.address || '',
      degree: p.degree || 0,
      period: p.period || 9,
      yearBuilt: p.yearBuilt || 2024,
      menhQuai: p.menhQuai || '',
      birthYear: p.birthYear || 1990,
      gender: p.gender || 'Nam',
      loanDau: p.loanDau || '',
      details: isCloud ? (p.details || {}) : JSON.stringify(p.details || {}),
      notes: isCloud ? (p.notes || []) : JSON.stringify(p.notes || []),
      owner_id: p.owner_id || null
    };
    
    if (isCloud) {
      const { error } = await supabase.from('projects').insert([payload]);
      if (error) throw error;
    } else {
      const stmt = dbLocal.prepare(`INSERT INTO projects (id, projectName, clientName, address, degree, period, yearBuilt, menhQuai, birthYear, gender, loanDau, details, notes, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      stmt.run(payload.id, payload.projectName, payload.clientName, payload.address, payload.degree, payload.period, payload.yearBuilt, payload.menhQuai, payload.birthYear, payload.gender, payload.loanDau, payload.details, payload.notes, payload.owner_id);
    }
  },

  async updateProject(p, id) {
    const payload = {
      projectName: p.projectName || p.clientName || '',
      clientName: p.clientName || '',
      address: p.address || '',
      degree: p.degree || 0,
      period: p.period || 9,
      yearBuilt: p.yearBuilt || 2024,
      menhQuai: p.menhQuai || '',
      birthYear: p.birthYear || 1990,
      gender: p.gender || 'Nam',
      loanDau: p.loanDau || '',
      details: isCloud ? (p.details || {}) : JSON.stringify(p.details || {}),
      notes: isCloud ? (p.notes || []) : JSON.stringify(p.notes || [])
    };
    if (p.owner_id !== undefined) payload.owner_id = p.owner_id;

    if (isCloud) {
      payload.updatedAt = new Date().toISOString();
      const { error } = await supabase.from('projects').update(payload).eq('id', id);
      if (error) throw error;
    } else {
      if (payload.owner_id !== undefined) {
          const stmt = dbLocal.prepare(`UPDATE projects SET projectName=?, clientName=?, address=?, degree=?, period=?, yearBuilt=?, menhQuai=?, birthYear=?, gender=?, loanDau=?, details=?, notes=?, owner_id=?, updatedAt=datetime('now','localtime') WHERE id=?`);
          stmt.run(payload.projectName, payload.clientName, payload.address, payload.degree, payload.period, payload.yearBuilt, payload.menhQuai, payload.birthYear, payload.gender, payload.loanDau, payload.details, payload.notes, payload.owner_id, id);
      } else {
          const stmt = dbLocal.prepare(`UPDATE projects SET projectName=?, clientName=?, address=?, degree=?, period=?, yearBuilt=?, menhQuai=?, birthYear=?, gender=?, loanDau=?, details=?, notes=?, updatedAt=datetime('now','localtime') WHERE id=?`);
          stmt.run(payload.projectName, payload.clientName, payload.address, payload.degree, payload.period, payload.yearBuilt, payload.menhQuai, payload.birthYear, payload.gender, payload.loanDau, payload.details, payload.notes, id);
      }
    }
  },

  async deleteProject(id) {
    if (isCloud) {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
    } else {
      dbLocal.prepare('DELETE FROM projects WHERE id=?').run(id);
    }
  },

  async getTreeNodes() {
    if (isCloud) {
      const { data, error } = await supabase.from('documents').select('path, type, size').order('path', { ascending: true });
      if (error) throw error;
      return data;
    } else {
      return dbLocal.prepare('SELECT path, type, size FROM documents ORDER BY path ASC').all();
    }
  },

  async getFileContent(dbPath) {
    if (isCloud) {
      const { data, error } = await supabase.from('documents').select('content').eq('path', dbPath).eq('type', 'file').single();
      if (error && error.code !== 'PGRST116') throw error; // ignore no rows
      return data ? data.content : null;
    } else {
      const row = dbLocal.prepare('SELECT content FROM documents WHERE path=? AND type=?').get(dbPath, 'file');
      return row ? row.content : null;
    }
  },

  async isDocumentExists(dbPath) {
    if (isCloud) {
      const { data, error } = await supabase.from('documents').select('path').eq('path', dbPath).single();
      return !!data;
    } else {
      return !!dbLocal.prepare('SELECT path FROM documents WHERE path=?').get(dbPath);
    }
  },

  async insertFolder(dbPath) {
    if (isCloud) {
      const { error } = await supabase.from('documents').upsert([{ id: dbPath, path: dbPath, type: 'folder' }]);
      if (error) throw error;
    } else {
      dbLocal.prepare('INSERT OR IGNORE INTO documents (id, path, type) VALUES (?, ?, ?)').run(dbPath, dbPath, 'folder');
    }
  },

  async upsertFileContent(dbPath, content, size) {
    const exists = await this.isDocumentExists(dbPath);
    if (isCloud) {
      const payload = { id: dbPath, path: dbPath, type: 'file', content, size, updatedAt: new Date().toISOString() };
      const { error } = await supabase.from('documents').upsert([payload]);
      if (error) throw error;
    } else {
      if (exists) {
        dbLocal.prepare('UPDATE documents SET content=?, size=?, updatedAt=datetime("now","localtime") WHERE path=?').run(content, size, dbPath);
      } else {
        dbLocal.prepare('INSERT INTO documents (id, path, type, content, size) VALUES (?, ?, ?, ?, ?)').run(dbPath, dbPath, 'file', content, size);
      }
    }
  },

  async deleteDocument(dbPath) {
    if (isCloud) {
      await supabase.from('documents').delete().eq('path', dbPath);
      await supabase.from('documents').delete().like('path', `${dbPath}/%`);
    } else {
      dbLocal.prepare('DELETE FROM documents WHERE path = ?').run(dbPath);
      dbLocal.prepare('DELETE FROM documents WHERE path LIKE ?').run(`${dbPath}/%`);
    }
  },

  async getUserByUsername(username) {
    if (isCloud) {
      const { data, error } = await supabase.from('users').select('*').eq('username', username).single();
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } else {
      return dbLocal.prepare('SELECT * FROM users WHERE username = ?').get(username) || null;
    }
  },

  async getUserById(id) {
    if (isCloud) {
      const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } else {
      return dbLocal.prepare('SELECT * FROM users WHERE id = ?').get(id) || null;
    }
  },

  async createUser(user) {
    const payload = {
      id: user.id || `user_${Date.now()}`,
      username: user.username,
      email: user.email || '',
      password_hash: user.password_hash,
      role: user.role || 'USER',
      permissions: user.permissions || '{"TRACKER":true,"CREATE":true,"LUBAN":true,"LIBRARY":true}',
      created_at: new Date().toISOString()
    };
    if (isCloud) {
       const { error } = await supabase.from('users').insert([payload]);
       if (error) throw error;
       return payload;
    } else {
       const stmt = dbLocal.prepare(`INSERT INTO users (id, username, email, password_hash, role, permissions) VALUES (?, ?, ?, ?, ?, ?)`);
       stmt.run(payload.id, payload.username, payload.email, payload.password_hash, payload.role, payload.permissions);
       return payload;
    }
  },

  async updateUserPermissions(id, permissions) {
    const permStr = JSON.stringify(permissions);
    if (isCloud) {
       await supabase.from('users').update({ permissions: permStr }).eq('id', id);
    } else {
       dbLocal.prepare('UPDATE users SET permissions=? WHERE id=?').run(permStr, id);
    }
  },

  async updatePassword(id, password_hash) {
    if (isCloud) {
       await supabase.from('users').update({ password_hash }).eq('id', id);
    } else {
       dbLocal.prepare('UPDATE users SET password_hash=? WHERE id=?').run(password_hash, id);
    }
  },

  async updateUserLogin(id) {
    const user = await this.getUserById(id);
    if (!user) return;
    let history = [];
    try {
      history = JSON.parse(user.last_login || '[]');
      if (!Array.isArray(history)) history = [user.last_login];
    } catch(e) {
      if (user.last_login) history = [user.last_login];
    }

    const now = new Date().toISOString();
    history.unshift(now);
    history = history.slice(0, 5); // Keep up to 5 recent logins
    const historyStr = JSON.stringify(history);

    if (isCloud) {
       await supabase.from('users').update({ last_login: historyStr }).eq('id', id);
    } else {
       dbLocal.prepare('UPDATE users SET last_login=? WHERE id=?').run(historyStr, id);
    }
  },

  async deleteUser(id) {
    if (isCloud) {
       await supabase.from('users').delete().eq('id', id);
    } else {
       dbLocal.prepare('DELETE FROM users WHERE id=?').run(id);
    }
  },

  async getAllUsers() {
    if (isCloud) {
       const { data } = await supabase.from('users').select('id, username, email, role, permissions, created_at, last_login').order('created_at', { ascending: false });
       if (data) return data.map(u => ({ ...u, permissions: typeof u.permissions==='string'?JSON.parse(u.permissions):u.permissions }));
       return [];
    } else {
       const rows = dbLocal.prepare('SELECT id, username, email, role, permissions, created_at, last_login FROM users ORDER BY created_at DESC').all();
       return rows.map(u => ({ ...u, permissions: JSON.parse(u.permissions || '{"TRACKER":true,"CREATE":true,"LUBAN":true,"LIBRARY":true}') }));
    }
  }
};

// ======================================================================
// SEED DEFAULT ADMIN & PERMISSIONS
// ======================================================================
setTimeout(async () => {
    try {
        const existingAdmin = await DB.getUserByUsername('vn24h.bnb');
        if (!existingAdmin) {
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash('Love11618', salt);
            await DB.createUser({
                username: 'vn24h.bnb',
                password_hash,
                role: 'ADMIN',
                permissions: JSON.stringify({ "TRACKER":true, "CREATE":true, "LUBAN":true, "LIBRARY":true })
            });
            console.log('🌟 Đã tự động tạo tài khoản: vn24h.bnb | Mật khẩu: Love11618');
        }
    } catch(e) { console.error('Seed Admin check error:', e.message); }
}, 2000); // Đợi 2s để Supabase DB connection ổn định nếu có

// ======================================================================
// ÁO GIÁP BẢO VỆ API (MIDDLEWARE)
// ======================================================================

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Không tìm thấy token phiên làm việc' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
    req.user = user;
    next();
  });
};

// ======================================================================
// API: AUTH (ĐĂNG KÝ / ĐĂNG NHẬP)
// ======================================================================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    // Kiểm tra đã tồn tại?
    const existing = await DB.getUserByUsername(username);
    if (existing) {
       return res.status(400).json({ error: 'Tên truy cập đã tồn tại' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Mặc định user đầu tiên hệ thống sẽ cho làm ADMIN nếu muốn (optional)
    const newUserRole = role === 'ADMIN' ? 'ADMIN' : 'USER';

    const newUser = await DB.createUser({
      username,
      email,
      password_hash,
      role: newUserRole
    });

    res.json({ success: true, message: 'Đăng ký thành công', user: { id: newUser.id, username, role: newUser.role }});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    let user = await DB.getUserByUsername(username);

    // Bơm tự động Admin dành riêng cho kiến trúc Vercel (Cloud)
    // Do Vercel ko chạy background timeout lúc start server
    if (!user && username === 'vn24h.bnb' && password === 'Love11618') {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash('Love11618', salt);
        user = await DB.createUser({
            username: 'vn24h.bnb',
            password_hash,
            role: 'ADMIN',
            permissions: JSON.stringify({ "TRACKER":true, "CREATE":true, "LUBAN":true, "LIBRARY":true })
        });
        console.log("🌟 Đã tự động Seed tài khoản Quản trị qua Login API");
    }

    if (!user) {
      return res.status(400).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, permissions: typeof user.permissions==='string'?JSON.parse(user.permissions):user.permissions },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Ghi nhận thời gian đăng nhập
    DB.updateUserLogin(user.id).catch(e => console.error("Lỗi cập nhật thời gian đăng nhập:", e));

    res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username, role: user.role, permissions: typeof user.permissions==='string'?JSON.parse(user.permissions):user.permissions }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await DB.getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    const perms = typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions;
    res.json({ user: { id: user.id, username: user.username, role: user.role, permissions: perms } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await DB.getUserById(req.user.id);
    if (!user) return res.status(400).json({ error: 'User không tồn tại' });
    
    const validPassword = await bcrypt.compare(oldPassword, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Mật khẩu cũ không chính xác' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);
    await DB.updatePassword(user.id, hash);
    res.json({ success: true, message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======================================================================
// API: ACCOUNT & RBAC
// ======================================================================

app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Truy cập bị từ chối' });
    const users = await DB.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id/permissions', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Truy cập bị từ chối' });
    const permissions = req.body.permissions;
    await DB.updateUserPermissions(req.params.id, permissions);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Chỉ Admin mới có quyền xóa người dùng' });
    const id = req.params.id;
    if (id === req.user.id) return res.status(400).json({ error: 'Không thể tự xóa bản thân' });
    await DB.deleteUser(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ======================================================================
// API: HỒ SƠ DỰ ÁN
// ======================================================================
app.get('/api/projects', authenticateToken, async (req, res) => {
  try {
    let projects = await DB.getProjects();
    if (req.user.role !== 'ADMIN') {
      projects = projects.filter(p => p.owner_id === req.user.id);
    }
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects', authenticateToken, async (req, res) => {
  try {
    const id = req.body.id || `proj_${Date.now()}`;
    const p = { ...req.body, owner_id: req.user.id };
    await DB.insertProject(p, id);
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const p = { ...req.body };
    if (req.user.role !== 'ADMIN') {
      const projects = await DB.getProjects();
      const existing = projects.find(x => x.id === req.params.id);
      if (!existing || existing.owner_id !== req.user.id) {
         return res.status(403).json({ error: 'Không có quyền cập nhật dự án này' });
      }
      p.owner_id = req.user.id;
    }
    await DB.updateProject(p, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      const projects = await DB.getProjects();
      const existing = projects.find(x => x.id === req.params.id);
      if (!existing || existing.owner_id !== req.user.id) {
         return res.status(403).json({ error: 'Không có quyền xoá dự án này' });
      }
    }
    await DB.deleteProject(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects/migrate', authenticateToken, async (req, res) => {
  try {
    const { projects } = req.body;
    let count = 0;
    for (const p of projects) {
       // Migrate gán cho Admin hoặc người up
       p.owner_id = req.user.id;
       await DB.insertProject(p, p.id || `migrated_${Date.now()}_${count}`);
       count++;
    }
    res.json({ success: true, migrated: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======================================================================
// API: THƯ VIỆN TÀI LIỆU
// ======================================================================

app.get('/api/docs/list', authenticateToken, async (req, res) => {
  try {
    const rows = await DB.getTreeNodes();
    const root = [];
    const map = {};
    for (const r of rows) map[r.path] = { ...r, name: r.path.split('/').pop(), children: [] };
    
    for (const r of rows) {
       const parts = r.path.split('/');
       const dir = parts.slice(0, -1).join('/');
       if (dir === '') root.push(map[r.path]);
       else {
           if (map[dir]) map[dir].children.push(map[r.path]);
           else root.push(map[r.path]);
       }
    }
    rows.forEach(r => { if (map[r.path].type === 'file') delete map[r.path].children; });
    res.json(root);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/docs/content', authenticateToken, async (req, res) => {
  try {
    if (!req.query.path) return res.status(400).send('Missing path');
    const content = await DB.getFileContent(req.query.path.replace(/\\/g, '/'));
    if (content !== null) res.type('text/plain').send(content);
    else res.status(404).send('File not found');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/docs/create-folder', authenticateToken, async (req, res) => {
  try {
    if (!req.user.permissions?.LIBRARY && req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Không có quyền thêm tài liệu' });
    const dbPath = req.body.folderPath.replace(/\\/g, '/');
    const exists = await DB.isDocumentExists(dbPath);
    if (!exists) {
      await DB.insertFolder(dbPath);
      const parts = dbPath.split('/');
      let cur = '';
      for (let i = 0; i < parts.length - 1; i++) {
         cur = cur ? `${cur}/${parts[i]}` : parts[i];
         await DB.insertFolder(cur);
      }
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Folder already exists' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/docs/save-text', authenticateToken, async (req, res) => {
  try {
    if (!req.user.permissions?.LIBRARY && req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Không có quyền thêm tài liệu' });
    const dbPath = req.body.filePath.replace(/\\/g, '/');
    const content = req.body.content;
    const size = Buffer.byteLength(content, 'utf8');
    
    await DB.upsertFileContent(dbPath, content, size);
    
    // Auto Create parent
    const parentDir = dbPath.split('/').slice(0, -1).join('/');
    if (parentDir) await DB.insertFolder(parentDir);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

import os from 'os';
const upload = multer({ dest: path.join(os.tmpdir(), 'uploads_temp') });
app.post('/api/docs/upload', authenticateToken, upload.array('files'), async (req, res) => {
  try {
    if (!req.user.permissions?.LIBRARY && req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Không có quyền thêm tài liệu' });
    let destFolder = req.body.folder || '';
    if(Array.isArray(destFolder)) destFolder = destFolder[0];
    destFolder = destFolder.replace(/\\/g, '/');
    
    const results = [];
    for (const file of (req.files || [])) {
      const originalName = file.originalname || 'upload.md';
      const baseName = path.parse(originalName).name;
      const ext = path.extname(originalName).toLowerCase();
      
      const destFileName = `${baseName}.md`;
      const dbPath = destFolder ? `${destFolder}/${destFileName}` : destFileName;

      let markdownContent = '';
      if (ext === '.docx' || ext === '.doc') {
        const buffer = fs.readFileSync(file.path);
        const result = await mammoth.convertToHtml({ buffer });
        const turndownService = new TurndownService({ headingStyle: 'atx' });
        markdownContent = turndownService.turndown(result.value);
      } else if (ext === '.md' || ext === '.txt') {
        markdownContent = fs.readFileSync(file.path, 'utf8');
      }

      await DB.upsertFileContent(dbPath, markdownContent, Buffer.byteLength(markdownContent, 'utf8'));
      if (destFolder) await DB.insertFolder(destFolder);
      
      results.push(destFileName);
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }
    res.json({ success: true, files: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/docs/delete', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Chỉ Admin mới có quyền xoá tài liệu thư viện' });
    await DB.deleteDocument(req.body.itemPath.replace(/\\/g, '/'));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======================================================================
// SERVERLESS EXPORT VÀ PRODUCTION
// ======================================================================
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api/')) res.sendFile(path.join(distPath, 'index.html'));
    else next();
  });
}

// Khởi chạy khi dùng môi trường cục bộ
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🚀 HKPT Backend đang chạy tại cổng ${PORT}`);
  });
}

// Export cho Vercel sử dụng làm API Handler
export default app;

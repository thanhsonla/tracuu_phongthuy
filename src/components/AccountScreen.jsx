import React, { useState, useEffect } from 'react';
import {
  User, Lock, Save, Database, Shield, Check, X, ShieldAlert,
  FileText, Settings, Compass, Ruler, Library, PlusCircle,
  Eye, EyeOff, MapPin, TrendingUp, Clock, Activity,
  FolderOpen, Award, BarChart2, ChevronRight, Star, Zap,
  Calendar, ArrowUpRight
} from 'lucide-react';

// ─── Horizon-inspired Stat Card ──────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, bgGradient, trend }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 shadow-sm border border-white/60"
      style={{ background: bgGradient || 'white' }}
    >
      {/* Decorative circle */}
      <div
        className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-20"
        style={{ background: color }}
      />
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color }}>
            {label}
          </p>
          <p className="text-3xl font-black text-slate-800 leading-none">{value}</p>
          {sub && <p className="text-xs text-slate-500 font-medium mt-1.5">{sub}</p>}
        </div>
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
          style={{ background: color + '22', color }}
        >
          <Icon size={22} />
        </div>
      </div>
      {trend !== undefined && (
        <div className="relative z-10 mt-3 flex items-center gap-1.5">
          <ArrowUpRight size={13} style={{ color }} />
          <span className="text-xs font-bold" style={{ color }}>{trend}</span>
        </div>
      )}
    </div>
  );
}

// ─── Mini Activity Row ────────────────────────────────────────────────────────
function ActivityRow({ project, onClick, index }) {
  const colors = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#0ea5e9'];
  const color = colors[index % colors.length];
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all group text-left"
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0"
        style={{ background: color + '1a', color }}
      >
        {(project.projectName || project.clientName || 'D')[0].toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-800 text-sm truncate group-hover:text-indigo-600 transition">
          {project.projectName || project.clientName}
        </p>
        <p className="text-[11px] text-slate-400 font-medium">
          Vận {project.period} · {new Date(project.updatedAt).toLocaleDateString('vi-VN')}
        </p>
      </div>
      <ChevronRight size={15} className="text-slate-300 group-hover:text-indigo-400 transition shrink-0" />
    </button>
  );
}

// ─── Dashboard View (Tab mặc định) ───────────────────────────────────────────
function DashboardView({ currentUser, projects, onOpenProject }) {
  const isAdmin = currentUser?.role === 'ADMIN';
  const [analyticsStats, setAnalyticsStats] = useState(null);

  useEffect(() => {
    if (isAdmin) {
      fetch('/api/analytics/stats', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('hkpt_token')}` }
      })
      .then(res => res.json())
      .then(data => {
        if (!data.error) setAnalyticsStats(data);
      })
      .catch(err => console.error(err));
    }
  }, [isAdmin]);

  const myProjects = projects.filter(p =>
    isAdmin ? p.owner_id === currentUser.id : true
  );

  // Tính toán thống kê
  const totalProjects = myProjects.length;
  const recentProjects = [...myProjects]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  // Vận phổ biến nhất
  const vanCount = myProjects.reduce((acc, p) => {
    acc[p.period] = (acc[p.period] || 0) + 1;
    return acc;
  }, {});
  const phoBienVan = Object.entries(vanCount).sort((a, b) => b[1] - a[1])[0];

  // Đăng nhập lần cuối
  let lastLogin = '—';
  try {
    const ll = currentUser?.last_login;
    if (ll) {
      const arr = JSON.parse(ll);
      lastLogin = Array.isArray(arr) && arr.length > 0
        ? new Date(arr[0]).toLocaleString('vi-VN')
        : new Date(ll).toLocaleString('vi-VN');
    }
  } catch {}

  const stats = [
    {
      icon: FolderOpen,
      label: 'Tổng Dự Án',
      value: totalProjects,
      sub: 'dự án đã lập',
      color: '#6366f1',
      bgGradient: 'linear-gradient(135deg, #eef2ff 0%, #ffffff 100%)',
      trend: totalProjects > 0 ? `${totalProjects} dự án` : null,
    },
    {
      icon: TrendingUp,
      label: 'Vận Phổ Biến',
      value: phoBienVan ? `Vận ${phoBienVan[0]}` : '—',
      sub: phoBienVan ? `${phoBienVan[1]} dự án sử dụng` : 'Chưa có dự án',
      color: '#10b981',
      bgGradient: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
    },
    {
      icon: Clock,
      label: 'Đăng Nhập Cuối',
      value: isAdmin ? '👑' : '✅',
      sub: lastLogin,
      color: '#f59e0b',
      bgGradient: 'linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)',
    },
    {
      icon: Award,
      label: 'Vai Trò',
      value: currentUser?.role === 'ADMIN' ? 'Admin' : 'Member',
      sub: isAdmin ? 'Toàn quyền hệ thống' : 'Thành viên',
      color: isAdmin ? '#e11d48' : '#8b5cf6',
      bgGradient: isAdmin
        ? 'linear-gradient(135deg, #fff1f2 0%, #ffffff 100%)'
        : 'linear-gradient(135deg, #f5f3ff 0%, #ffffff 100%)',
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Hero Profile Banner ── */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 md:p-8 text-white"
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4f46e5 100%)',
        }}
      >
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: '#818cf8', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full opacity-10" style={{ background: '#c7d2fe', transform: 'translateY(50%)' }} />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-5">
          {/* Avatar */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shrink-0"
            style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', border: '2px solid rgba(255,255,255,0.3)' }}
          >
            {currentUser?.username?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
              Xin chào, {currentUser?.username}! 👋
            </h2>
            <p className="text-indigo-200 text-sm font-medium mt-1">
              {isAdmin
                ? 'Bạn đang đăng nhập với toàn quyền quản trị hệ thống HKPT PRO.'
                : `Thành viên · ${totalProjects} dự án đã tạo · Huyền Không Phi Tinh`}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">
            <Zap size={16} className="text-amber-300" />
            <span className="font-bold text-sm">{currentUser?.role}</span>
          </div>
        </div>
      </div>

      {/* ── Stat Cards Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      {/* ── Recent Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Timeline dự án */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
            <h3 className="font-black text-slate-800 flex items-center gap-2">
              <Activity size={18} className="text-indigo-500" /> Dự Án Gần Đây
            </h3>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
              {recentProjects.length}/{totalProjects}
            </span>
          </div>
          <div className="p-3">
            {recentProjects.length === 0 ? (
              <div className="py-12 flex flex-col items-center text-slate-400">
                <FileText size={40} className="opacity-20 mb-3" />
                <p className="font-medium text-sm">Chưa có dự án nào</p>
              </div>
            ) : (
              <div className="space-y-1">
                {recentProjects.map((p, i) => (
                  <ActivityRow
                    key={p.id}
                    project={p}
                    index={i}
                    onClick={() => onOpenProject(p)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Info Panel */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Thống kê nhanh */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-5">
            <h3 className="font-black text-slate-700 text-sm flex items-center gap-2 mb-4">
              <BarChart2 size={16} className="text-emerald-500" /> Phân Bố Theo Vận
            </h3>
            {Object.keys(vanCount).length === 0 ? (
              <p className="text-slate-400 text-xs">Chưa có dữ liệu</p>
            ) : (
              <div className="space-y-2.5">
                {Object.entries(vanCount)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 4)
                  .map(([van, count]) => {
                    const pct = totalProjects > 0 ? Math.round((count / totalProjects) * 100) : 0;
                    const barColors = ['#6366f1', '#10b981', '#f59e0b', '#e11d48'];
                    const ci = Object.keys(vanCount).sort((a,b)=>vanCount[b]-vanCount[a]).indexOf(van);
                    const col = barColors[ci % barColors.length];
                    return (
                      <div key={van}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-slate-600">Vận {van}</span>
                          <span className="text-xs font-black" style={{ color: col }}>{count}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: col }}
                          />
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            )}
          </div>

          {/* Thống kê truy cập (Chỉ Admin) */}
          {isAdmin && analyticsStats && (
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-5 animate-slide-up">
              <h3 className="font-black text-slate-700 text-sm flex items-center gap-2 mb-4">
                <Activity size={16} className="text-indigo-500" /> Thống Kê Truy Cập
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Hôm nay', data: analyticsStats.today },
                  { label: '7 Ngày qua', data: analyticsStats.week },
                  { label: '30 Ngày qua', data: analyticsStats.month }
                ].map((stat, idx) => {
                  const total = stat.data.guest + stat.data.member;
                  const guestPct = total > 0 ? Math.round((stat.data.guest / total) * 100) : 0;
                  const memberPct = total > 0 ? 100 - guestPct : 0;
                  
                  return (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-bold text-slate-600">{stat.label}</span>
                        <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">Tổng: {total}</span>
                      </div>
                      <div className="flex h-3 rounded-full overflow-hidden bg-slate-100 gap-[1px]">
                         {memberPct > 0 && <div className="h-full bg-indigo-500 transition-all duration-700 relative group cursor-help" style={{ width: `${memberPct}%` }}>
                             <div className="absolute opacity-0 group-hover:opacity-100 -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg pointer-events-none whitespace-nowrap z-10 transition-opacity shadow-lg">Thành viên: {stat.data.member}</div>
                         </div>}
                         {guestPct > 0 && <div className="h-full bg-slate-300 transition-all duration-700 relative group cursor-help" style={{ width: `${guestPct}%` }}>
                             <div className="absolute opacity-0 group-hover:opacity-100 -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg pointer-events-none whitespace-nowrap z-10 transition-opacity shadow-lg">Khách: {stat.data.guest}</div>
                         </div>}
                      </div>
                      <div className="flex justify-between mt-1.5 px-1">
                         <span className="text-[9px] font-black text-indigo-500 tracking-wider uppercase">{memberPct}% TV</span>
                         <span className="text-[9px] font-black text-slate-400 tracking-wider uppercase">{guestPct}% Khách</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Role badge card */}
          <div
            className="rounded-3xl p-5 flex flex-col justify-between"
            style={{
              background: isAdmin
                ? 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #b91c1c 100%)'
                : 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 50%, #3b82f6 100%)',
              minHeight: '130px',
            }}
          >
            <div className="flex justify-between items-start">
              <Shield size={28} className="text-white/60" />
              <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">
                Hệ Thống
              </span>
            </div>
            <div>
              <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">
                Cấp Độ Truy Cập
              </p>
              <p className="text-white text-xl font-black">
                {isAdmin ? '🔑 Quản Trị Viên' : '🛡️ Thành Viên'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main AccountScreen ───────────────────────────────────────────────────────
export default function AccountScreen({ currentUser, projects, onOpenProject }) {
  const isAdmin = currentUser?.role === 'ADMIN';
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
    { id: 'info', label: 'Tài Khoản', icon: User },
    ...(isAdmin ? [{ id: 'map', label: 'Cấu Hình Bản Đồ', icon: MapPin }] : []),
    ...(isAdmin ? [{ id: 'rbac', label: 'Phân Quyền', icon: Shield }] : []),
  ];

  const tabColors = {
    dashboard: 'from-indigo-500 to-purple-600',
    info: 'from-slate-700 to-slate-900',
    map: 'from-emerald-500 to-teal-600',
    rbac: 'from-rose-500 to-red-600',
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Settings size={16} className="text-white" />
            </div>
            Quản Lý Tài Khoản
          </h2>
          <p className="text-slate-500 text-sm mt-1 ml-10">
            Xem tổng quan, quản lý hồ sơ và cài đặt hệ thống.
          </p>
        </div>
      </div>

      {/* Tabs - Horizon UI style pill tabs */}
      <div className="flex gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-fit overflow-x-auto">
        {tabs.map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              id={`account-tab-${t.id}`}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all whitespace-nowrap cursor-pointer
                ${isActive
                  ? `bg-gradient-to-r ${tabColors[t.id] || 'from-slate-700 to-slate-900'} text-white shadow-md`
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
            >
              <Icon size={15} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && (
        <DashboardView currentUser={currentUser} projects={projects} onOpenProject={onOpenProject} />
      )}
      {activeTab === 'info' && (
        <PersonalInfo currentUser={currentUser} projects={projects} onOpenProject={onOpenProject} />
      )}
      {activeTab === 'map' && isAdmin && <MapSettingsManager />}
      {activeTab === 'rbac' && isAdmin && <RBACManager currentUser={currentUser} />}
    </div>
  );
}

// ==========================================
// THÔNG TIN CÁ NHÂN & ĐỔI MẬT KHẨU
// ==========================================
function PersonalInfo({ currentUser, projects, onOpenProject }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConf, setShowConf] = useState(false);

  const myProjects = projects.filter(p =>
    currentUser.role === 'ADMIN' ? p.owner_id === currentUser.id : true
  );

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMsg({ type: 'error', text: 'Mật khẩu mới không khớp!' });
      return;
    }
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsg({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch(err) {
      setMsg({ type: 'error', text: err.message });
    }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Đổi mật khẩu */}
      <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-fit">
        {/* Profile header */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
          <div
            className="w-16 h-16 rounded-2xl font-black text-2xl flex items-center justify-center uppercase text-white shadow-md"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            }}
          >
            {currentUser.username[0]}
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800">{currentUser.username}</h3>
            <span
              className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-lg mt-1 inline-block text-white`}
              style={{
                background: currentUser.role === 'ADMIN'
                  ? 'linear-gradient(135deg, #e11d48, #9f1239)'
                  : 'linear-gradient(135deg, #6366f1, #4f46e5)',
              }}
            >
              {currentUser.role}
            </span>
          </div>
        </div>

        <h4 className="font-bold text-slate-700 flex items-center gap-2 mb-4">
          <Lock size={15} className="text-indigo-500" /> Đổi Mật Khẩu
        </h4>
        <form onSubmit={handleChangePassword} className="space-y-4">
          {msg.text && (
            <div className={`text-xs font-bold p-3 rounded-xl flex items-center gap-2 ${
              msg.type === 'error'
                ? 'bg-red-50 text-red-600 border border-red-100'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
            }`}>
              {msg.type === 'error' ? <X size={14}/> : <Check size={14}/>}
              {msg.text}
            </div>
          )}
          {[
            { label: 'MẬT KHẨU CŨ', val: oldPassword, set: setOldPassword, show: showOld, toggle: () => setShowOld(v => !v) },
            { label: 'MẬT KHẨU MỚI', val: newPassword, set: setNewPassword, show: showNew, toggle: () => setShowNew(v => !v) },
            { label: 'XÁC NHẬN MẬT KHẨU MỚI', val: confirmPassword, set: setConfirmPassword, show: showConf, toggle: () => setShowConf(v => !v) },
          ].map(f => (
            <div key={f.label}>
              <label className="text-[10px] font-black text-slate-400 tracking-widest">{f.label}</label>
              <div className="relative mt-1">
                <input
                  type={f.show ? 'text' : 'password'}
                  required
                  value={f.val}
                  onChange={e => f.set(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-medium focus:border-indigo-500 focus:bg-white outline-none pr-12 transition-colors text-sm"
                />
                <button type="button" onClick={f.toggle}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
                  {f.show ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="w-full text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 transition-all disabled:opacity-50 shadow-md hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
            <Save size={15} /> {loading ? 'Đang Lưu...' : 'Lưu Thay Đổi'}
          </button>
        </form>
      </div>

      {/* Danh sách dự án */}
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col h-[600px]">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center"
          style={{ background: 'linear-gradient(to right, #f8fafc, #ffffff)' }}>
          <h4 className="font-black text-slate-800 flex items-center gap-2">
            <Database size={18} className="text-emerald-500" /> Các Dự Án Của Bạn
          </h4>
          <span className="text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-lg">
            {myProjects.length} dự án
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/30">
          {myProjects.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <FileText size={48} className="opacity-20 mb-3" />
              <p className="font-medium">Bạn chưa tạo dự án nào</p>
            </div>
          )}
          {myProjects.map((p, i) => (
            <ActivityRow key={p.id} project={p} index={i} onClick={() => onOpenProject(p)} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// QUẢN LÝ PHÂN QUYỀN (ADMIN ONLY)
// ==========================================
function RBACManager({ currentUser }) {
  const [_users, _setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) _setUsers(await res.json());
    } catch(e) {}
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const componentsList = [
    { id: 'TRACKER', label: 'Tra Cứu Phi Tinh', icon: Compass, desc: 'Xem Hôm nay và Truy vấn Phi Tinh.' },
    { id: 'LUBAN', label: 'Thước Lỗ Ban', icon: Ruler, desc: 'Sử dụng Thước Lỗ Ban.' },
    { id: 'CREATE', label: 'Lập Dự Án', icon: PlusCircle, desc: 'Tạo dự án và phân tích Cửu cung.' },
    { id: 'LIBRARY', label: 'Thư Viện Môn Phái', icon: Library, desc: 'Truy cập kho tài liệu môn phái.' },
    { id: 'MAP_VIEW', label: 'Bản Đồ Dự Án', icon: MapPin, desc: 'Xem dự án trên bản đồ.' },
  ];

  const handleToggle = async (userId, compId, currentPerms) => {
    if (userId === currentUser.id && currentUser.role === 'ADMIN') return;
    const newPerms = { ...currentPerms, [compId]: !currentPerms[compId] };
    _setUsers(prev => prev.map(u => u.id === userId ? { ...u, permissions: newPerms } : u));
    try {
      await fetch(`/api/users/${userId}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: newPerms })
      });
    } catch(e) { fetchUsers(); }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Xóa vĩnh viễn người dùng này? Thao tác không thể hoàn tác!')) return;
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      _setUsers(prev => prev.filter(u => u.id !== userId));
      setSelectedUserId(null);
    } catch(e) { alert('Xóa thất bại: ' + e.message); }
  };

  const selectedUser = _users.find(u => u.id === selectedUserId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Danh sách user */}
      <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col h-[600px]">
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center"
          style={{ background: 'linear-gradient(to right, #f8fafc, #ffffff)' }}>
          <h4 className="font-black text-slate-800 flex items-center gap-2">
            <User size={16} className="text-slate-400" /> Danh Sách User
          </h4>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
            {_users.length}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading && <p className="p-4 text-center text-slate-400 font-bold text-sm">Đang tải...</p>}
          {_users.map(u => (
            <button key={u.id} onClick={() => setSelectedUserId(u.id)}
              className={`w-full p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-3 border text-left
                ${selectedUserId === u.id
                  ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                  : 'border-transparent hover:bg-slate-50'
                }`}>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shrink-0"
                style={{
                  background: u.role === 'ADMIN'
                    ? 'linear-gradient(135deg, #e11d48, #9f1239)'
                    : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                }}
              >
                {u.username[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-black truncate text-sm ${selectedUserId === u.id ? 'text-indigo-900' : 'text-slate-800'}`}>
                  {u.username}
                </p>
                <span className="text-[10px] text-slate-400 uppercase font-bold">{u.role}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Permission panel */}
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col h-[600px]">
        {!selectedUser ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <ShieldAlert size={64} className="opacity-20 mb-4 text-indigo-400" />
            <p className="font-bold text-lg text-slate-600">Phân Quyền Module</p>
            <p className="text-sm mt-1">Chọn tài khoản bên trái để cấu hình quyền.</p>
          </div>
        ) : (
          <>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4"
              style={{ background: 'linear-gradient(to right, #f8fafc, #ffffff)' }}>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white shrink-0"
                style={{
                  background: selectedUser.role === 'ADMIN'
                    ? 'linear-gradient(135deg, #e11d48, #9f1239)'
                    : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                }}
              >
                {selectedUser.username[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <h4 className="font-black text-xl text-slate-800">{selectedUser.username}</h4>
                <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md mt-0.5 inline-block">
                  {selectedUser.id}
                </span>
              </div>
              {selectedUser.last_login && (
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Login gần nhất</p>
                  <p className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-lg mt-0.5">
                    {(() => {
                      try {
                        const arr = JSON.parse(selectedUser.last_login);
                        return Array.isArray(arr) && arr.length > 0
                          ? new Date(arr[0]).toLocaleString('vi-VN')
                          : new Date(selectedUser.last_login).toLocaleString('vi-VN');
                      } catch(e) { return new Date(selectedUser.last_login).toLocaleString('vi-VN'); }
                    })()}
                  </p>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <h5 className="font-bold text-slate-400 text-xs uppercase tracking-widest mb-4">
                Cấu Hình Module Truy Cập
              </h5>

              {selectedUser.role === 'ADMIN' && (
                <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3 text-amber-700">
                  <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">
                    Tài khoản <b>ADMIN</b> bypass mọi lớp chặn, tắt/mở module không ảnh hưởng quyền nội bộ.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-6 border-b border-slate-100 mb-6">
                {componentsList.map(comp => {
                  const CIcon = comp.icon;
                  const isGranted = !!selectedUser.permissions[comp.id];
                  return (
                    <button key={comp.id}
                      onClick={() => handleToggle(selectedUser.id, comp.id, selectedUser.permissions)}
                      className={`p-4 rounded-2xl border-2 text-left cursor-pointer transition-all flex gap-3 items-start w-full
                        ${isGranted
                          ? 'bg-white border-indigo-400 shadow-sm'
                          : 'bg-slate-50 border-slate-200 opacity-60 hover:opacity-90 hover:border-slate-300'
                        }`}>
                      <div
                        className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center`}
                        style={{
                          background: isGranted ? '#6366f11a' : '#f1f5f9',
                          color: isGranted ? '#6366f1' : '#94a3b8',
                        }}
                      >
                        <CIcon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h6 className={`font-black text-sm ${isGranted ? 'text-indigo-900' : 'text-slate-600'}`}>
                            {comp.label}
                          </h6>
                          {isGranted
                            ? <Check size={16} className="text-indigo-500 shrink-0" />
                            : <X size={16} className="text-slate-300 shrink-0" />
                          }
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-relaxed">{comp.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {currentUser.id !== selectedUser.id && selectedUser.role !== 'ADMIN' && (
                <div>
                  <h5 className="font-black text-red-500 text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                    <ShieldAlert size={13} /> Vùng Nguy Hiểm
                  </h5>
                  <div className="bg-red-50 p-4 rounded-2xl border border-red-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-red-700 font-medium">
                      Xóa tài khoản sẽ gỡ bỏ toàn bộ quyền truy cập. Dự án sẽ trở thành vô chủ.
                    </p>
                    <button onClick={() => handleDeleteUser(selectedUser.id)}
                      className="shrink-0 bg-red-600 hover:bg-red-700 text-white font-black px-4 py-2.5 rounded-xl transition shadow-md text-sm">
                      Xóa Người Dùng
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ==========================================
// CẤU HÌNH BẢN ĐỒ (ADMIN ONLY)
// ==========================================
function MapSettingsManager() {
  const [apiKey, setApiKey] = React.useState(() => localStorage.getItem('hkpt_google_maps_key') || '');
  const [useGoogleMap, setUseGoogleMap] = React.useState(
    () => localStorage.getItem('hkpt_use_google_map') === 'true'
  );
  const [saved, setSaved] = React.useState(false);

  const handleSave = () => {
    localStorage.setItem('hkpt_google_maps_key', apiKey);
    localStorage.setItem('hkpt_use_google_map', useGoogleMap);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm max-w-3xl">
      <div className="flex items-center gap-4 mb-6 pb-5 border-b border-slate-100">
        <div className="rounded-2xl p-3" style={{ background: 'linear-gradient(135deg,#ecfdf5,#d1fae5)', color: '#059669' }}>
          <MapPin size={24} />
        </div>
        <div>
          <h4 className="font-black text-xl text-slate-800">Cấu Hình Dữ Liệu Bản Đồ</h4>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Chuyển đổi giữa OpenStreetMap (miễn phí) và Google Maps (VIP).
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <div
          className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all
            ${useGoogleMap ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
          onClick={() => setUseGoogleMap(!useGoogleMap)}
        >
          <div className="relative">
            <div className={`w-12 h-6 rounded-full transition-colors ${useGoogleMap ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${useGoogleMap ? 'translate-x-7' : 'translate-x-1'}`} />
          </div>
          <div>
            <p className="font-black text-slate-800">Sử Dụng Google Maps</p>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              Độ chính xác cao hơn. Yêu cầu API Key cá nhân.
            </p>
          </div>
        </div>

        {useGoogleMap && (
          <div className="animate-slide-up bg-white p-5 rounded-2xl border border-indigo-200 shadow-sm">
            <label className="text-[10px] font-black tracking-widest text-indigo-600 uppercase flex items-center gap-2 mb-2">
              <Lock size={12} /> Google API Key
            </label>
            <input type="text" value={apiKey} onChange={e => setApiKey(e.target.value)}
              placeholder="AIzaSyB2xx..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:border-indigo-500 focus:bg-white outline-none text-sm transition-colors" />
            <p className="text-[11px] font-bold text-slate-400 mt-3 flex items-start gap-1.5">
              <ShieldAlert size={13} className="text-amber-500 shrink-0 mt-0.5" />
              API Key lưu cục bộ (Local Storage), không gửi lên server.
            </p>
          </div>
        )}

        <div className="flex justify-end">
          <button onClick={handleSave}
            className="flex items-center gap-2 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all hover:shadow-lg"
            style={{ background: saved ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>
            {saved ? <Check size={16} /> : <Save size={16} />}
            {saved ? 'Đã Lưu!' : 'Lưu Cấu Hình'}
          </button>
        </div>
      </div>
    </div>
  );
}

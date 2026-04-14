import React, { useState, useEffect } from 'react';
import { User, Lock, Save, Database, Shield, Check, X, ShieldAlert, FileText, Settings, Compass, Ruler, Library, PlusCircle, Eye, EyeOff } from 'lucide-react';

export default function AccountScreen({ currentUser, projects, onOpenProject }) {
  const isAdmin = currentUser?.role === 'ADMIN';
  const [activeTab, setActiveTab] = useState('info');

  const tabs = [
    { id: 'info', label: 'Thông Tin Cá Nhân', icon: User },
    ...(isAdmin ? [{ id: 'rbac', label: 'Quản Lý Phân Quyền', icon: Shield }] : [])
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Settings className="text-indigo-600" /> Quản Lý Tài Khoản
          </h2>
          <p className="text-slate-500 text-sm mt-1">Quản lý định danh và cài đặt hệ thống.</p>
        </div>
      </div>

      <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm w-fit overflow-x-auto">
        {tabs.map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap cursor-pointer
                ${isActive
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}>
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'info' && <PersonalInfo currentUser={currentUser} projects={projects} onOpenProject={onOpenProject} />}
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

  const myProjects = projects.filter(p => currentUser.role === 'ADMIN' ? p.owner_id === currentUser.id : true);
  // Nếu là ADMIN, dự án trả về là tất cả dự án -> Lọc lấy owner_id === id. Nếu USER thì tự động chỉ có dự án của user đó.

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
       <div className="lg:col-span-1 border border-slate-200 bg-white rounded-3xl p-6 shadow-sm h-fit">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
             <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-2xl auto-center font-black text-2xl flex items-center justify-center uppercase">
               {currentUser.username[0]}
             </div>
             <div>
                <h3 className="text-xl font-black text-slate-800">{currentUser.username}</h3>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md mt-1 inline-block ${currentUser.role === 'ADMIN' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                  {currentUser.role}
                </span>
             </div>
          </div>

          <h4 className="font-bold text-slate-700 flex items-center gap-2 mb-4"><Lock size={16}/> Đổi Mật Khẩu</h4>
          <form onSubmit={handleChangePassword} className="space-y-4">
             {msg.text && (
               <div className={`text-xs font-bold p-3 rounded-xl ${msg.type === 'error' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                 {msg.text}
               </div>
             )}
             <div>
                <label className="text-xs font-bold text-slate-500">MẬT KHẨU CŨ</label>
                <div className="relative mt-1">
                  <input type={showOld ? "text" : "password"} required value={oldPassword} onChange={e=>setOldPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-medium focus:border-indigo-500 outline-none pr-12" />
                  <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showOld ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
             </div>
             <div>
                <label className="text-xs font-bold text-slate-500">MẬT KHẨU MỚI</label>
                <div className="relative mt-1">
                  <input type={showNew ? "text" : "password"} required minLength={6} value={newPassword} onChange={e=>setNewPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-medium focus:border-indigo-500 outline-none pr-12" />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showNew ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
             </div>
             <div>
                <label className="text-xs font-bold text-slate-500">XÁC NHẬN MẬT KHẨU MỚI</label>
                <div className="relative mt-1">
                  <input type={showConf ? "text" : "password"} required minLength={6} value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-medium focus:border-indigo-500 outline-none pr-12" />
                  <button type="button" onClick={() => setShowConf(!showConf)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showConf ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
             </div>
             <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 transition disabled:opacity-50">
                <Save size={16} /> LƯU THAY ĐỔI
             </button>
          </form>
       </div>

       {/* Dự án đã tạo */}
       <div className="lg:col-span-2 border border-slate-200 bg-white rounded-3xl overflow-hidden shadow-sm flex flex-col h-[600px]">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
             <h4 className="font-black text-slate-800 flex items-center gap-2"><Database size={18} className="text-emerald-500"/> Các Dự Án Của Bạn</h4>
             <span className="text-sm font-bold bg-white border border-slate-200 px-3 py-1 rounded-lg text-slate-600">{myProjects.length} dự án</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
             {myProjects.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                   <FileText size={48} className="opacity-20 mb-3" />
                   <p>Bạn chưa tạo dự án nào</p>
                </div>
             )}
             {myProjects.map(p => (
                <div key={p.id} onClick={() => onOpenProject(p)} className="bg-white border border-slate-200 p-4 rounded-2xl hover:border-emerald-400 hover:shadow-md cursor-pointer transition flex justify-between items-center group">
                   <div>
                      <h5 className="font-black text-slate-800 group-hover:text-emerald-600 transition">{p.projectName || p.clientName}</h5>
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md mt-1 inline-block">Mã: {p.id.split('_')[1] || p.id}</span>
                   </div>
                   <div className="text-right">
                      <p className="text-sm font-bold text-slate-600">{p.period} Vận</p>
                      <p className="text-xs text-slate-400">{new Date(p.updatedAt).toLocaleDateString('vi-VN')}</p>
                   </div>
                </div>
             ))}
          </div>
       </div>

    </div>
  )
}

// ==========================================
// QUẢN LÝ PHÂN QUYỀN (ADMIN ONLY)
// ==========================================
function RBACManager({ currentUser }) {
  const [users, setUsers] = null ? [] : useState([]); // trick to init
  const [_users, _setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        _setUsers(data);
      }
    } catch(e) {}
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const componentsList = [
    { id: 'TRACKER', label: 'Tra Cứu Phi Tinh', icon: Compass, desc: 'Cho phép xem Hôm nay và Truy vấn Phi Tinh.' },
    { id: 'LUBAN', label: 'Thước Lỗ Ban', icon: Ruler, desc: 'Cho phép sử dụng Thước Lỗ Ban.' },
    { id: 'CREATE', label: 'Lập Dự Án', icon: PlusCircle, desc: 'Cho phép tạo Dự án mới và Phân tích Cửu cung.' },
    { id: 'LIBRARY', label: 'Thư Viện Môn Phái', icon: Library, desc: 'Cho phép truy cập kho tài liệu môn phái.' }
  ];

  const handleToggle = async (userId, compId, currentPerms) => {
     // Không cho tự tắt quyền chính mình để tránh kẹt
     if (userId === currentUser.id && currentUser.role === 'ADMIN') return;
     
     const newPerms = { ...currentPerms, [compId]: !currentPerms[compId] };
     
     // Optimistic update UI
     _setUsers(prev => prev.map(u => u.id === userId ? { ...u, permissions: newPerms} : u));

     try {
       await fetch(`/api/users/${userId}/permissions`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ permissions: newPerms })
       });
     } catch(e) {
       console.error("Lỗi cập nhật permission", e);
       fetchUsers(); // rollback if error
     }
  };

  const handleDeleteUser = async (userId) => {
     if (!window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn người dùng này? Thao tác không thể hoàn tác!')) return;
     try {
       const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
       const data = await res.json();
       if (!res.ok) throw new Error(data.error);
       
       _setUsers(prev => prev.filter(u => u.id !== userId));
       setSelectedUserId(null);
     } catch (e) {
       alert('Xóa thất bại: ' + e.message);
     }
  };

  const selectedUser = _users.find(u => u.id === selectedUserId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
       
       <div className="lg:col-span-1 border border-slate-200 bg-white rounded-3xl overflow-hidden shadow-sm flex flex-col h-[600px]">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
             <h4 className="font-black text-slate-800 flex items-center gap-2"><User size={18} className="text-slate-500"/> Danh Sách User</h4>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-slate-50/30">
            {loading ? <p className="p-4 text-center text-slate-400 font-bold text-sm">Đang tải...</p> : null}
            {_users.map(u => (
              <div key={u.id} onClick={() => setSelectedUserId(u.id)}
                className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-3 border ${selectedUserId === u.id ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'border-transparent hover:bg-slate-100'}`}>
                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${u.role === 'ADMIN' ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-600'}`}>
                    {u.username[0].toUpperCase()}
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className={`font-black truncate ${selectedUserId===u.id ? 'text-indigo-900':'text-slate-800'}`}>{u.username}</p>
                    <div className="flex gap-2 items-center mt-0.5">
                       <span className="text-[10px] text-slate-400 uppercase font-bold">{u.role}</span>
                       {u.last_login && <span className="text-[9px] text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100" title="Đăng nhập lần cuối">
                         {(() => {
                            try {
                               const arr = JSON.parse(u.last_login);
                               return Array.isArray(arr) && arr.length > 0 ? new Date(arr[0]).toLocaleDateString('vi-VN') : new Date(u.last_login).toLocaleDateString('vi-VN');
                            } catch(e) { return new Date(u.last_login).toLocaleDateString('vi-VN'); }
                         })()}
                       </span>}
                    </div>
                 </div>
              </div>
            ))}
          </div>
       </div>

       <div className="lg:col-span-2 border border-slate-200 bg-white rounded-3xl overflow-hidden shadow-sm flex flex-col h-[600px]">
          {!selectedUser ? (
             <div className="h-full flex flex-col items-center justify-center text-slate-400">
                 <ShieldAlert size={64} className="opacity-20 mb-4 text-indigo-500" />
                 <p className="font-bold text-lg text-slate-600">Phân Quyền Module</p>
                 <p className="text-sm">Chọn một tài khoản bên trái để cấu hình quyền truy cập.</p>
             </div>
          ) : (
             <>
               <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black ${selectedUser.role === 'ADMIN' ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-700'}`}>
                     {selectedUser.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-xl text-slate-800">{selectedUser.username}</h4>
                    <span className="text-xs font-mono text-slate-400 bg-slate-200 px-2 rounded mt-0.5 inline-block">{selectedUser.id}</span>
                  </div>
                  {selectedUser.last_login && (
                      <div className="text-right group relative">
                         <p className="text-[10px] font-bold text-slate-400 uppercase cursor-help">HĐ gần nhất (Hover)</p>
                         <p className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-lg mt-0.5 cursor-help">
                            {(() => {
                               try {
                                 const arr = JSON.parse(selectedUser.last_login);
                                 return Array.isArray(arr) && arr.length > 0 ? new Date(arr[0]).toLocaleString('vi-VN') : new Date(selectedUser.last_login).toLocaleString('vi-VN');
                               } catch(e) { return new Date(selectedUser.last_login).toLocaleString('vi-VN'); }
                            })()}
                         </p>
                         
                         {/* Lịch sử 5 lần  */}
                         <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 shadow-xl rounded-xl p-3 z-50 hidden group-hover:block pointer-events-none text-left">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 border-b border-slate-100 pb-1">5 lần đăng nhập gần nhất</p>
                            <ul className="text-xs font-medium text-slate-600 space-y-1">
                               {(() => {
                                  try {
                                    const arr = JSON.parse(selectedUser.last_login);
                                    if (Array.isArray(arr) && arr.length > 0) {
                                       return arr.map((dt, i) => <li key={i} className="flex justify-between border-b border-slate-50 border-dotted last:border-0 pb-1 last:pb-0"><span className="text-slate-400">Lần {i+1}</span> <span className="font-bold text-indigo-600">{new Date(dt).toLocaleString('vi-VN')}</span></li>);
                                    }
                                  } catch(e) {}
                                  return <li>{new Date(selectedUser.last_login).toLocaleString('vi-VN')}</li>;
                               })()}
                            </ul>
                         </div>
                      </div>
                  )}
               </div>
               
               <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                  <h5 className="font-bold text-slate-500 text-sm uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Cấu Hình Hiển Thị & Sử Dụng</h5>
                  
                  {selectedUser.role === 'ADMIN' && (
                     <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3 text-amber-700">
                        <ShieldAlert size={20} className="shrink-0 mt-0.5" />
                        <p className="text-sm font-medium">Tài khoản này là <b>ADMIN</b>. Việc tắt/mở module không có tác dụng khóa quyền nội bộ, vì Admin luôn bypass qua mọi lớp chặn của hệ thống. Khuyến cáo không tắt quyền của chính mình để tránh lỗi UI.</p>
                     </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-200 pb-6 mb-6">
                    {componentsList.map(comp => {
                       const CIcon = comp.icon;
                       const isGranted = !!selectedUser.permissions[comp.id];
                       return (
                         <div key={comp.id} onClick={() => handleToggle(selectedUser.id, comp.id, selectedUser.permissions)}
                           className={`p-4 rounded-2xl border-2 cursor-pointer transition select-none flex gap-4 ${isGranted ? 'bg-white border-indigo-500 shadow-md' : 'bg-slate-50 border-slate-200 opacity-60 hover:opacity-100'}`}>
                           <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${isGranted ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-400'}`}>
                              <CIcon size={20} />
                           </div>
                           <div className="flex-1">
                              <div className="flex justify-between items-start mb-1">
                                 <h6 className={`font-black ${isGranted ? 'text-indigo-900' : 'text-slate-600'}`}>{comp.label}</h6>
                                 {isGranted ? <Check size={18} className="text-indigo-500"/> : <X size={18} className="text-slate-400" />}
                              </div>
                              <p className="text-xs text-slate-500 font-medium leading-relaxed">{comp.desc}</p>
                           </div>
                         </div>
                       )
                    })}
                  </div>

                  {currentUser.id !== selectedUser.id && selectedUser.role !== 'ADMIN' && (
                     <div className="mt-4">
                        <h5 className="font-black text-red-600 text-sm uppercase tracking-wider mb-2 flex items-center gap-2">Vùng Nguy Hiểm</h5>
                        <div className="bg-red-50 p-4 rounded-2xl border border-red-200 flex flex-col md:flex-row justify-between items-center gap-4">
                           <p className="text-sm text-red-800 font-medium">Xóa tài khoản này sẽ gỡ bỏ hoàn toàn quyền truy cập của họ. Dự án của họ vẫn được lưu lại nhưng bị vô chủ.</p>
                           <button onClick={() => handleDeleteUser(selectedUser.id)} className="shrink-0 bg-red-600 hover:bg-red-700 text-white font-black px-4 py-2.5 rounded-xl transition-all shadow-md">
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
  )
}

import React, { useState, useEffect } from 'react';
import { Compass, Clock, PlusCircle, Library as LibraryIcon, Ruler, LogOut, User as UserIcon, MapPin, Eye as EyeIcon, Sun, Moon } from 'lucide-react';
import TimeStarTracker from './components/TimeStarTracker';
import CreateProject from './components/CreateProject';
import ProjectResult from './components/ProjectResult';
import Library from './components/Library';
import LuBanRuler from './components/LuBanRuler';
import AuthScreen from './components/AuthScreen';
import AccountScreen from './components/AccountScreen';
import ProjectMapView from './components/ProjectMapView';
import GuestWizard from './components/GuestWizard';
import { ErrorBoundary } from './components/ErrorBoundary';
import MobileBottomNav from './components/MobileBottomNav';

export default function App() {
  const [currentView, setCurrentView] = useState('TRACKER');
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  
  // Auth State
  const [currentUser, setCurrentUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isSharedMode, setIsSharedMode] = useState(false);

  // Dark Mode
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('hkpt_dark_mode') === 'true');
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('hkpt_dark_mode', darkMode);
  }, [darkMode]);
  
  // Header Clock State
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchProjects = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch(e) {
      console.error('Error fetching projects:', e);
    }
  };

  useEffect(() => {
    // Listen for auth expiration
    const handleAuthExpired = () => setCurrentUser(null);
    window.addEventListener('auth-expired', handleAuthExpired);

    const initAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const shareId = urlParams.get('share');
      if (shareId) {
        setIsSharedMode(true);
        try {
          const res = await fetch('/api/projects/share/' + shareId);
          if (res.ok) {
            const projectData = await res.json();
            if (projectData.error) {
               alert(projectData.error);
            } else {
               setCurrentProject(projectData);
               setCurrentView('RESULT');
            }
          } else {
            alert('Lỗi truy xuất dự án chia sẻ');
          }
        } catch(e) {
          console.error(e);
        }
        setIsCheckingAuth(false);
        return;
      }

      const storedToken = localStorage.getItem('hkpt_token');
      if (!storedToken) {
        setIsCheckingAuth(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
           const data = await res.json();
           setCurrentUser(data.user);
        } else {
           localStorage.removeItem('hkpt_token');
        }
      } catch (e) {
        console.error(e);
      }
      setIsCheckingAuth(false);
    };
    initAuth();

    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const saved = localStorage.getItem('hkpt_projects');
    if (saved) {
      try {
        const pData = JSON.parse(saved);
        if (pData.length > 0) {
          fetch('/api/projects/migrate', {
             method: 'POST',
             headers: {'Content-Type': 'application/json'},
             body: JSON.stringify({ projects: pData })
          })
          .then(res => res.json())
          .then(data => {
             if (data.success) {
                console.log('Migrated data out of localStorage to DB:', data.migrated);
             }
             fetchProjects();
             localStorage.removeItem('hkpt_projects'); // Dọn dẹp!
          })
          .catch(() => fetchProjects());
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchProjects();
  }, [currentUser]);

  const navItemsRaw = [
    { id: 'TRACKER', label: 'Tra Cứu Phi Tinh', icon: Clock, color: 'text-amber-500' },
    { id: 'CREATE', label: 'Lập Dự Án', icon: PlusCircle, color: 'text-indigo-500' },
    { id: 'LUBAN', label: 'Thước Lỗ Ban', icon: Ruler, color: 'text-red-500' },
    { id: 'LIBRARY', label: 'Thư Viện', icon: LibraryIcon, color: 'text-emerald-500' },
    { id: 'MAP_VIEW', label: 'Bản Đồ', icon: MapPin, color: 'text-violet-500' },
  ];

  let navItems = [];
  if (currentUser) {
     if (currentUser.role === 'ADMIN') navItems = navItemsRaw;
     else navItems = navItemsRaw.filter(item => currentUser.permissions?.[item.id]);
  } else {
     // Guest: Mặc định được xem TRACKER và LUBAN
     navItems = navItemsRaw.filter(item => ['TRACKER', 'LUBAN'].includes(item.id));
  }

  if (isCheckingAuth) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white"><span className="animate-pulse">Loading...</span></div>;
  }

  const handleLogout = () => {
    localStorage.removeItem('hkpt_token');
    setCurrentUser(null);
  };

  return (
    <div
      className="min-h-screen font-sans pb-10 transition-colors duration-300"
      style={{ background: darkMode ? '#0f0e1a' : '#f8fafc', color: darkMode ? '#e2e8f0' : '#1e293b' }}
    >
      {/* GLOBAL HEADER */}
      <header
        className="sticky top-0 z-40"
        style={{
          background: darkMode ? 'rgba(15,14,26,0.92)' : 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: darkMode ? '1px solid rgba(99,102,241,0.15)' : '1px solid #e2e8f0',
          boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.4)' : '0 1px 8px rgba(0,0,0,0.06)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-row justify-between items-center md:flex-row md:justify-between md:items-center py-3 gap-4">
            
            <div className="flex items-center gap-2 text-indigo-900 cursor-pointer" onClick={() => setCurrentView('TRACKER')}>
               <Compass className="text-red-600" size={32} />
               <div>
                  <h1 className="font-display text-xl font-bold tracking-tight leading-none bg-gradient-to-r from-red-600 to-indigo-600 bg-clip-text text-transparent">HKPT PRO</h1>
                  <p className="text-[10px] font-semibold tracking-[0.2em] text-slate-400 uppercase mt-1">Huyền Không Phi Tinh</p>
               </div>
            </div>

            {/* MOBILE ONLY: compact user chip + dark toggle in header */}
            {!isSharedMode && (
              <div className="flex md:hidden items-center gap-1.5">
                {/* Dark mode toggle - mobile */}
                <button
                  id="mobile-darkmode-toggle"
                  onClick={() => setDarkMode(d => !d)}
                  className="p-2 rounded-xl transition-all"
                  style={{
                    background: darkMode ? 'rgba(99,102,241,0.15)' : 'rgba(100,116,139,0.08)',
                    color: darkMode ? '#818cf8' : '#64748b',
                  }}
                  title={darkMode ? 'Chế độ sáng' : 'Chế độ tối'}
                >
                  {darkMode ? <Sun size={17} /> : <Moon size={17} />}
                </button>

                {currentUser ? (
                  <>
                    <button
                      id="mobile-header-account-btn"
                      onClick={() => setCurrentView('ACCOUNT')}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all"
                      style={{
                        background: darkMode ? 'rgba(99,102,241,0.15)' : '#eef2ff',
                        borderColor: darkMode ? 'rgba(99,102,241,0.3)' : '#c7d2fe',
                        color: darkMode ? '#818cf8' : '#4338ca',
                      }}
                    >
                      <UserIcon size={13} />
                      <span className="max-w-[70px] truncate">{currentUser.username}</span>
                    </button>
                    <button
                      id="mobile-header-logout-btn"
                      onClick={handleLogout}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      title="Đăng xuất"
                    >
                      <LogOut size={16} />
                    </button>
                  </>
                ) : (
                  <button
                    id="mobile-header-login-btn"
                    onClick={() => setCurrentView('LOGIN')}
                    className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs font-bold"
                  >
                    <UserIcon size={13} /> Đăng Nhập
                  </button>
                )}
              </div>
            )}

            {/* TOP NAVIGATION TABS */}
            {!isSharedMode ? (
            <div className="hidden md:flex flex-row items-center gap-3 w-full md:w-auto">
               <nav
                 className="flex gap-1 p-1 rounded-2xl overflow-x-auto"
                 style={{ background: darkMode ? 'rgba(30,27,75,0.6)' : '#f1f5f9' }}
               >
                 {navItems.map(nav => {
                   const Icon = nav.icon;
                   const isActive = currentView === nav.id;
                   return (
                     <button key={nav.id} onClick={() => {
                       if (nav.id === 'CREATE') setCurrentProject(null);
                       setCurrentView(nav.id);
                     }}
                       className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap cursor-pointer
                         ${isActive
                           ? darkMode ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40' : 'bg-white shadow-md text-slate-800'
                           : darkMode ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                         }`}>
                       <Icon size={16} className={isActive ? (darkMode ? 'text-white' : nav.color) : ''} />
                       {nav.label}
                     </button>
                   )
                 })}
               </nav>

               {/* Dark mode toggle - desktop */}
               <button
                 id="desktop-darkmode-toggle"
                 onClick={() => setDarkMode(d => !d)}
                 className="p-2.5 rounded-xl transition-all border"
                 style={{
                   background: darkMode ? 'rgba(99,102,241,0.15)' : '#f8fafc',
                   borderColor: darkMode ? 'rgba(99,102,241,0.3)' : '#e2e8f0',
                   color: darkMode ? '#818cf8' : '#64748b',
                 }}
                 title={darkMode ? 'Chế độ sáng' : 'Chế độ tối'}
               >
                 {darkMode ? <Sun size={18} /> : <Moon size={18} />}
               </button>

               {/* USER INFO & LOGOUT */}
               {currentUser ? (
                 <div
                   className="flex items-center gap-3 rounded-xl px-4 py-2 border ml-auto md:ml-0"
                   style={{
                     background: darkMode ? 'rgba(30,27,75,0.5)' : '#f1f5f9',
                     borderColor: darkMode ? 'rgba(99,102,241,0.2)' : '#e2e8f0',
                   }}
                 >
                    <div onClick={() => setCurrentView('ACCOUNT')} className="flex flex-col text-right cursor-pointer px-2 rounded transition" title="Mở cài đặt tài khoản">
                      <span
                        className="text-sm font-bold flex items-center gap-1 justify-end"
                        style={{ color: darkMode ? '#e2e8f0' : '#1e293b' }}
                      >
                        {currentUser.username} <UserIcon size={13}/>
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">{currentUser.role}</span>
                    </div>
                    <div className="w-px h-6 mx-1" style={{ background: darkMode ? 'rgba(255,255,255,0.1)' : '#cbd5e1' }}></div>
                    <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors" title="Đăng xuất">
                      <LogOut size={18} />
                    </button>
                 </div>
               ) : (
                 <button onClick={() => setCurrentView('LOGIN')}
                   className="ml-auto md:ml-0 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition"
                   style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}
                 >
                    <UserIcon size={15} /> Đăng Nhập
                 </button>
               )}
            </div>
            ) : (
               <div className="flex bg-indigo-50 border border-indigo-200 text-indigo-800 px-4 py-2 rounded-xl font-bold gap-2 text-sm">
                  <EyeIcon className="text-indigo-600" size={18} /> Chế độ xem khách
               </div>
            )}

          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="p-4 md:p-8 pb-24 md:pb-8" style={{ minHeight: 'calc(100vh - 64px)' }}>
         <div className="max-w-6xl mx-auto animate-slide-up">
           
           {currentView === 'LOGIN' && !currentUser && (
              <AuthScreen 
                onClose={() => setCurrentView('TRACKER')}
                onLogin={(data) => {
                  localStorage.setItem('hkpt_token', data.token);
                  setCurrentUser(data.user);
                  setCurrentView('TRACKER'); // Đưa về bảng làm việc sau khi login
                }}
              />
           )}
           
           {(currentView === 'TRACKER' || (!currentUser && !['TRACKER', 'LUBAN', 'LOGIN', 'GUEST_WIZARD'].includes(currentView)) || (!currentUser && currentView === 'RESULT' && !isSharedMode)) && (
             <>
               {!currentUser && !isSharedMode && (
                  <div className="bg-gradient-to-r from-indigo-900 to-slate-800 rounded-3xl p-6 md:p-10 shadow-lg text-white mb-8 text-center relative overflow-hidden border border-slate-700">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                     <div className="relative z-10">
                        <h2 className="text-2xl md:text-4xl font-black mb-3 text-amber-400 drop-shadow-md">Khảo Sát Hướng Cát Hung Nhà Ở</h2>
                        <p className="text-slate-300 mb-8 max-w-2xl mx-auto font-medium text-sm md:text-base">Trải nghiệm tính năng lập sơ đồ không gian, đo từ trường bằng La Bàn Vệ Tinh trực tiếp trên điện thoại để nhận diện cơ bản các hướng tốt xấu theo Bát Trạch.</p>
                        <button onClick={() => setCurrentView('GUEST_WIZARD')} className="bg-gradient-to-r from-rose-500 to-orange-500 text-white font-black px-6 md:px-8 py-3 md:py-4 rounded-xl shadow-xl hover:from-rose-600 hover:to-orange-600 hover:scale-105 transition-all text-base md:text-lg ring-4 ring-rose-500/30">
                           Bắt Đầu Khảo Sát Nhanh (Miễn Phí)
                        </button>
                     </div>
                  </div>
               )}
               <TimeStarTracker />
             </>
           )}
           
           {currentView === 'CREATE' && (
             <CreateProject 
               setView={setCurrentView} 
               projects={projects} 
               setProjects={setProjects} 
               setCurrentProject={setCurrentProject}
               currentProject={currentProject}
             />
           )}
           
           {currentView === 'LIBRARY' && (
             <Library 
               projects={projects}
               setProjects={setProjects}
               setCurrentProject={setCurrentProject}
               setMainView={setCurrentView}
               currentUser={currentUser}
             />
           )}

           {currentView === 'ACCOUNT' && (
             <AccountScreen
               currentUser={currentUser}
               projects={projects}
               onOpenProject={(p) => {
                 setCurrentProject(p);
                 setCurrentView('RESULT');
               }}
             />
           )}

           {currentView === 'RESULT' && currentProject && (
             <ProjectResult 
               project={currentProject} 
               setView={setCurrentView} 
               projects={projects}
               setProjects={setProjects}
               setCurrentProject={setCurrentProject}
               currentUser={currentUser}
               isSharedMode={isSharedMode}
             />
           )}
           
           {currentView === 'LUBAN' && <LuBanRuler />}

            {currentView === 'MAP_VIEW' && (
              <ProjectMapView
                projects={projects}
                onOpenProject={(p) => {
                  setCurrentProject(p);
                  setCurrentView('RESULT');
                }}
              />
            )}

         </div>
      </main>

      <footer
        className="text-center mt-10 pt-8 pb-6"
        style={{ borderTop: darkMode ? '1px solid rgba(99,102,241,0.15)' : '1px solid #e2e8f0' }}
      >
        <p className="font-bold tracking-wide" style={{ color: darkMode ? '#64748b' : '#94a3b8' }}>Tạo bởi Nguyễn Trung Thành</p>
        <p className="font-medium text-sm mt-1" style={{ color: darkMode ? '#475569' : '#94a3b8' }}>
          Nhu cầu tư vấn phong thủy tại{' '}
          <a href="https://phongthuyhongphuc.com/" target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
            phongthuyhongphuc.com
          </a>
        </p>
      </footer>

      {/* GUEST WIZARD - Rendered OUTSIDE main to avoid transform containing block issue */}
      {/* CSS transform on ancestor (animate-slide-up) breaks position:fixed in children */}
      {currentView === 'GUEST_WIZARD' && (
        <ErrorBoundary>
          <GuestWizard 
            onGoToLogin={(guestProject) => {
                sessionStorage.setItem('hkpt_guest_project', JSON.stringify(guestProject));
                setCurrentView('LOGIN');
            }}
            onCancel={() => setCurrentView('TRACKER')}
          />
        </ErrorBoundary>
      )}

      {/* MOBILE BOTTOM NAVIGATION - chỉ hiển thị trên điện thoại */}
      <MobileBottomNav
        currentView={currentView}
        setCurrentView={(view, action) => {
          if (view === 'CREATE' && action === 'reset') setCurrentProject(null);
          setCurrentView(view);
        }}
        currentUser={currentUser}
        isSharedMode={isSharedMode}
      />
    </div>
  );
}

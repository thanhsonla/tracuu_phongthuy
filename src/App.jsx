import React, { useState, useEffect } from 'react';
import { Compass, Clock, PlusCircle, Library as LibraryIcon, Ruler, LogOut, User as UserIcon, MapPin, Eye as EyeIcon } from 'lucide-react';
import TimeStarTracker from './components/TimeStarTracker';
import CreateProject from './components/CreateProject';
import ProjectResult from './components/ProjectResult';
import Library from './components/Library';
import LuBanRuler from './components/LuBanRuler';
import AuthScreen from './components/AuthScreen';
import AccountScreen from './components/AccountScreen';
import ProjectMapView from './components/ProjectMapView';
import GuestWizard from './components/GuestWizard';

export default function App() {
  const [currentView, setCurrentView] = useState('TRACKER');
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  
  // Auth State
  const [currentUser, setCurrentUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isSharedMode, setIsSharedMode] = useState(false);
  
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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-10">
      {/* GLOBAL HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center py-3 gap-4">
            
            <div className="flex items-center gap-2 text-indigo-900 cursor-pointer" onClick={() => setCurrentView('TRACKER')}>
               <Compass className="text-red-600" size={32} />
               <div>
                  <h1 className="font-display text-xl font-bold tracking-tight leading-none bg-gradient-to-r from-red-600 to-indigo-600 bg-clip-text text-transparent">HKPT PRO</h1>
                  <p className="text-[10px] font-semibold tracking-[0.2em] text-slate-400 uppercase mt-1">Huyền Không Phi Tinh</p>
               </div>
            </div>

            {/* TOP NAVIGATION TABS */}
            {!isSharedMode ? (
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
               <nav className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-full md:w-auto overflow-x-auto">
                 {navItems.map(nav => {
                   const Icon = nav.icon;
                   const isActive = currentView === nav.id;
                   return (
                     <button key={nav.id} onClick={() => {
                       if (nav.id === 'CREATE') setCurrentProject(null);
                       setCurrentView(nav.id);
                     }}
                       className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap cursor-pointer
                         ${isActive ? 'bg-white shadow-md text-slate-800' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}
                       `}>
                       <Icon size={18} className={isActive ? nav.color : ''} />
                       {nav.label}
                     </button>
                   )
                 })}
               </nav>

               {/* USER INFO & LOGOUT */}
               {currentUser ? (
                 <div className="flex items-center gap-3 bg-slate-100 rounded-xl px-4 py-2 border border-slate-200 ml-auto md:ml-0">
                    <div onClick={() => setCurrentView('ACCOUNT')} className="flex flex-col text-right cursor-pointer hover:bg-slate-200 px-2 rounded transition" title="Mở cài đặt tài khoản">
                      <span className="text-sm font-bold text-slate-800 flex items-center gap-1 justify-end">{currentUser.username} <UserIcon size={14}/></span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">{currentUser.role}</span>
                    </div>
                    <div className="w-px h-6 bg-slate-300 mx-1"></div>
                    <button onClick={handleLogout} className="text-slate-500 hover:text-red-600 transition-colors" title="Đăng xuất">
                      <LogOut size={20} />
                    </button>
                 </div>
               ) : (
                 <button onClick={() => setCurrentView('LOGIN')} className="ml-auto md:ml-0 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition">
                    <UserIcon size={16} /> Đăng Nhập
                 </button>
               )}

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
      <main className="p-4 md:p-8">
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

           {currentView === 'GUEST_WIZARD' && (
              <GuestWizard 
                 onGoToLogin={(guestProject) => {
                     sessionStorage.setItem('hkpt_guest_project', JSON.stringify(guestProject));
                     setCurrentView('LOGIN');
                 }}
                 onCancel={() => setCurrentView('TRACKER')}
              />
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

      <footer className="text-center mt-10 pt-10 pb-6 border-t border-slate-200">
        <p className="text-slate-500 font-bold tracking-wide">Tạo bởi Nguyễn Trung Thành</p>
        <p className="text-slate-500 font-medium text-sm mt-1">Nhu cầu tư vấn phong thủy tại <a href="https://phongthuyhongphuc.com/" target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800 font-bold">https://phongthuyhongphuc.com/</a></p>
      </footer>
    </div>
  );
}

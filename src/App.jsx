import React, { useState, useEffect } from 'react';
import { Compass, Clock, PlusCircle, Library as LibraryIcon, Ruler } from 'lucide-react';
import TimeStarTracker from './components/TimeStarTracker';
import CreateProject from './components/CreateProject';
import ProjectResult from './components/ProjectResult';
import Library from './components/Library';
import LuBanRuler from './components/LuBanRuler';

export default function App() {
  // Navigation states: 'TRACKER', 'CREATE', 'LIBRARY', 'RESULT'
  const [currentView, setCurrentView] = useState('TRACKER');
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  
  // Header Clock State
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchProjects = async () => {
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
  }, []);

  const navItems = [
    { id: 'TRACKER', label: 'Tra Cứu Phi Tinh', icon: Clock, color: 'text-amber-500' },
    { id: 'CREATE', label: 'Lập Dự Án', icon: PlusCircle, color: 'text-indigo-500' },
    { id: 'LUBAN', label: 'Thước Lỗ Ban', icon: Ruler, color: 'text-red-500' },
    { id: 'LIBRARY', label: 'Thư Viện', icon: LibraryIcon, color: 'text-emerald-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-10">
      {/* GLOBAL HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center py-3 gap-4">
            
            <div className="flex items-center gap-2 text-indigo-900 cursor-pointer" onClick={() => setCurrentView('TRACKER')}>
               <Compass className="text-red-600" size={32} />
               <div>
                  <h1 className="text-xl font-black tracking-tight leading-none bg-gradient-to-r from-red-600 to-indigo-600 bg-clip-text text-transparent">HKPT PRO</h1>
                  <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mt-1">Xuan Kong App</p>
               </div>
            </div>

            {/* TOP NAVIGATION TABS */}
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

               {/* DIGITAL CLOCK IN HEADER */}
               <div className="text-xl md:text-2xl font-digital text-amber-500 bg-slate-900 px-4 py-2 rounded-xl border-2 border-slate-700 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] flex items-center justify-center tracking-widest shrink-0">
                 <span className="drop-shadow-[0_0_5px_rgba(245,158,11,0.6)]">
                   {String(now.getHours()).padStart(2, '0')}:{String(now.getMinutes()).padStart(2, '0')}
                 </span>
                 <span className="text-rose-500 ml-1 drop-shadow-[0_0_5px_rgba(244,63,94,0.6)]">
                   :{String(now.getSeconds()).padStart(2, '0')}
                 </span>
               </div>
            </div>

          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="p-4 md:p-8">
         <div className="max-w-6xl mx-auto animate-slide-up">
           
           {currentView === 'TRACKER' && <TimeStarTracker />}
           
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
             />
           )}

           {currentView === 'RESULT' && currentProject && (
             <ProjectResult 
               project={currentProject} 
               setView={setCurrentView} 
               projects={projects}
               setProjects={setProjects}
               setCurrentProject={setCurrentProject}
             />
           )}
           
           {currentView === 'LUBAN' && <LuBanRuler />}

         </div>
      </main>

      <footer className="text-center mt-10 pt-10 pb-6 opacity-70 border-t border-slate-200">
        <p className="text-slate-400 font-bold tracking-wide">Developed by Nguyễn Trung Thành (Integrated by AI)</p>
      </footer>
    </div>
  );
}

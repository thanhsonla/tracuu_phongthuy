import React, { useState, useMemo, useRef, useCallback } from 'react';
import { ArrowLeft, User, MapPin, FileText, Mountain, Compass, Navigation, Map, AlertTriangle, Info, CheckCircle, Star, Sparkles, X, Clock, Calendar, Plus, Activity, Save, Edit, Download, Loader, TrendingUp } from 'lucide-react';
import { analyzeLine, findMountainForStar, flyStar } from '../services/GridGeneratorService';
import { analyzeFormations, generateRemedies } from '../services/StarAnalysisService';
import { MOUNTAINS, REPLACEMENT_STARS, VIEW_PERMUTATIONS, LABELS, trigramToGridIndex, getCombinationDesc, getLocalYMD } from '../data/constants';
import { getStarColor, getElementBgColor, getTimeStars } from '../utils/helpers';
import DynamicCompass from './DynamicCompass';
import FloorPlanOverlay from './FloorPlanOverlay';
import TimeStarTracker from './TimeStarTracker';
import BatTrachCompass from './BatTrachCompass';
import AnnualForecast from './AnnualForecast';
import { generatePdfReport } from '../services/pdfReportService';
import { BAT_TRACH_STARS, GUA_DIRECTIONS, getBatTrachStar } from '../data/batTrach';
import { analyzeSatKhi } from '../data/satKhi';

const getStarTheme = (star, level) => {
    const colors = {
       1: { main: '#3B82F6', // Thủy (Blue)
            success: { bg: '#EFF6FF', border: '#93C5FD', text: '#1D4ED8', textDesc: '#334155', adviceBg: '#DBEAFE' },
            info:    { bg: '#F8FAFC', border: '#CBD5E1', text: '#3B82F6', textDesc: '#475569', adviceBg: '#F1F5F9' },
            warning: { bg: '#334155', border: '#3B82F6', text: '#93C5FD', textDesc: '#CBD5E1', adviceBg: '#1E293B' },
            danger:  { bg: '#0F172A', border: '#1E3A8A', text: '#60A5FA', textDesc: '#94A3B8', adviceBg: '#020617' } },
       2: { main: '#D97706', // Thổ (Brown/Amber)
            success: { bg: '#FFFBEB', border: '#FCD34D', text: '#B45309', textDesc: '#334155', adviceBg: '#FEF3C7' },
            info:    { bg: '#F8FAFC', border: '#CBD5E1', text: '#D97706', textDesc: '#475569', adviceBg: '#F1F5F9' },
            warning: { bg: '#334155', border: '#D97706', text: '#FDE68A', textDesc: '#CBD5E1', adviceBg: '#1E293B' },
            danger:  { bg: '#171717', border: '#78350F', text: '#FBBF24', textDesc: '#A3A3A3', adviceBg: '#0A0A0A' } },
       3: { main: '#10B981', // Mộc (Muted Green)
            success: { bg: '#ECFDF5', border: '#6EE7B7', text: '#047857', textDesc: '#334155', adviceBg: '#D1FAE5' },
            info:    { bg: '#F8FAFC', border: '#CBD5E1', text: '#10B981', textDesc: '#475569', adviceBg: '#F1F5F9' },
            warning: { bg: '#334155', border: '#10B981', text: '#6EE7B7', textDesc: '#CBD5E1', adviceBg: '#1E293B' },
            danger:  { bg: '#022C22', border: '#064E3B', text: '#34D399', textDesc: '#A3A3A3', adviceBg: '#020617' } },
       4: { main: '#10B981', // Mộc (Green)
            success: { bg: '#ECFDF5', border: '#6EE7B7', text: '#047857', textDesc: '#334155', adviceBg: '#D1FAE5' },
            info:    { bg: '#F8FAFC', border: '#CBD5E1', text: '#059669', textDesc: '#475569', adviceBg: '#E2E8F0' },
            warning: { bg: '#334155', border: '#10B981', text: '#6EE7B7', textDesc: '#CBD5E1', adviceBg: '#1E293B' },
            danger:  { bg: '#022C22', border: '#064E3B', text: '#34D399', textDesc: '#A3A3A3', adviceBg: '#020617' } },
       5: { main: '#EAB308', // Thổ (Yellow)
            success: { bg: '#FEFCE8', border: '#FDE047', text: '#A16207', textDesc: '#334155', adviceBg: '#FEF9C3' },
            info:    { bg: '#F8FAFC', border: '#CBD5E1', text: '#CA8A04', textDesc: '#475569', adviceBg: '#F1F5F9' },
            warning: { bg: '#334155', border: '#EAB308', text: '#FEF08A', textDesc: '#CBD5E1', adviceBg: '#1E293B' },
            danger:  { bg: '#1A0D00', border: '#713F12', text: '#FDE047', textDesc: '#D4D4D8', adviceBg: '#000000' } },
       6: { main: '#64748B', // Kim (Slate)
            success: { bg: '#F8FAFC', border: '#CBD5E1', text: '#334155', textDesc: '#334155', adviceBg: '#F1F5F9' },
            info:    { bg: '#F8FAFC', border: '#E2E8F0', text: '#475569', textDesc: '#475569', adviceBg: '#F1F5F9' },
            warning: { bg: '#334155', border: '#64748B', text: '#CBD5E1', textDesc: '#CBD5E1', adviceBg: '#1E293B' },
            danger:  { bg: '#0F172A', border: '#334155', text: '#94A3B8', textDesc: '#94A3B8', adviceBg: '#020617' } },
       7: { main: '#64748B', // Kim (Slate)
            success: { bg: '#F8FAFC', border: '#CBD5E1', text: '#334155', textDesc: '#334155', adviceBg: '#F1F5F9' },
            info:    { bg: '#F8FAFC', border: '#E2E8F0', text: '#475569', textDesc: '#475569', adviceBg: '#F1F5F9' },
            warning: { bg: '#334155', border: '#64748B', text: '#CBD5E1', textDesc: '#CBD5E1', adviceBg: '#1E293B' },
            danger:  { bg: '#0F172A', border: '#334155', text: '#94A3B8', textDesc: '#94A3B8', adviceBg: '#020617' } },
       8: { main: '#D97706', // Thổ (Brown)
            success: { bg: '#FFFBEB', border: '#FCD34D', text: '#B45309', textDesc: '#334155', adviceBg: '#FEF3C7' },
            info:    { bg: '#F8FAFC', border: '#CBD5E1', text: '#D97706', textDesc: '#475569', adviceBg: '#F1F5F9' },
            warning: { bg: '#334155', border: '#D97706', text: '#FDE68A', textDesc: '#CBD5E1', adviceBg: '#1E293B' },
            danger:  { bg: '#171717', border: '#78350F', text: '#FBBF24', textDesc: '#A3A3A3', adviceBg: '#0A0A0A' } },
       9: { main: '#EF4444', // Hỏa (Red)
            success: { bg: '#FEF2F2', border: '#FCA5A5', text: '#B91C1C', textDesc: '#334155', adviceBg: '#FEE2E2' },
            info:    { bg: '#F8FAFC', border: '#CBD5E1', text: '#EF4444', textDesc: '#475569', adviceBg: '#F1F5F9' },
            warning: { bg: '#311010', border: '#EF4444', text: '#FCA5A5', textDesc: '#CBD5E1', adviceBg: '#210B0B' },
            danger:  { bg: '#1A0000', border: '#7F1D1D', text: '#F87171', textDesc: '#A3A3A3', adviceBg: '#000000' } },
    };
    return colors[star]?.[level] || colors[1].info;
}

const ProjectResult = ({ project, setView, projects, setProjects, setCurrentProject }) => {
  const [viewMode, setViewMode] = useState('FACING_UP');
  const [activeTab, setActiveTab] = useState('TINH_BAN');
  const [remedyTab, setRemedyTab] = useState('SITTING');
  const [enableQueThe, setEnableQueThe] = useState(true);
  const [selectedCell, setSelectedCell] = useState(null);
  const [annualYear, setAnnualYear] = useState(new Date().getFullYear());
  const [newNote, setNewNote] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  
  const [customAnalysis, setCustomAnalysis] = useState(project.analysis || {});
  const [batTrachAnalysis, setBatTrachAnalysis] = useState(project.batTrachAnalysis || {});
  const [editingBatTrach, setEditingBatTrach] = useState(null);

  const dongTayTuMenh = useMemo(() => {
     if (!project.menhQuai) return '';
     const mq = project.menhQuai.split(' ')[0];
     if (['Khảm', 'Ly', 'Chấn', 'Tốn'].includes(mq)) return 'Đông Tứ Mệnh';
     if (['Càn', 'Khôn', 'Cấn', 'Đoài'].includes(mq)) return 'Tây Tứ Mệnh';
     return '';
  }, [project.menhQuai]);

  // Refs for PDF capture
  const compassRef = useRef(null);
  const gridRef = useRef(null);

  const handleSaveAnalysis = async () => {
    if (!projects) return;
    const updatedProject = {
      ...project,
      analysis: customAnalysis
    };
    try {
      await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(updatedProject)
      });
      setCurrentProject(updatedProject);
      const updatedProjects = projects.map(p => p.id === project.id ? updatedProject : p);
      setProjects(updatedProjects);
      alert('Đã lưu phân tích 9 cung thành công!');
    } catch (err) {
      console.error(err);
      alert('Lỗi lưu phân tích');
    }
  };

  const handleSaveBatTrach = async () => {
    if (!projects || !editingBatTrach) return;
    const updatedBtAnalysis = { ...batTrachAnalysis, [editingBatTrach.gua.name]: editingBatTrach.text };
    setBatTrachAnalysis(updatedBtAnalysis);
    
    const updatedProject = {
      ...project,
      batTrachAnalysis: updatedBtAnalysis
    };
    try {
      await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(updatedProject)
      });
      setCurrentProject(updatedProject);
      const updatedProjects = projects.map(p => p.id === project.id ? updatedProject : p);
      setProjects(updatedProjects);
      setEditingBatTrach(null);
    } catch (err) {
      console.error(err);
      alert('Lỗi lưu Bát Trạch');
    }
  };

  const handleSaveNote = async () => {
    if (!newNote.trim() || !projects) return;
    const updatedProject = {
      ...project,
      notes: [...(project.notes || []), { date: getLocalYMD(), text: newNote.trim() }]
    };
    
    try {
      await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(updatedProject)
      });
      setCurrentProject(updatedProject);
      const updatedProjects = projects.map(p => p.id === project.id ? updatedProject : p);
      setProjects(updatedProjects);
      setNewNote('');
    } catch (err) {
      console.error(err);
      alert('Lỗi lưu ghi chú');
    }
  };

  const chartData = useMemo(() => {
    const facingDegree = project.degree;
    const sittingDegree = (facingDegree + 180) % 360;
    const facingLine = analyzeLine(facingDegree);

    const baseGrid = flyStar(project.period, true);
    
    // Find sitting mountain
    const normSitting = (sittingDegree + 360) % 360;
    const mSittingIdx = Math.floor(((normSitting + 7.5) % 360) / 15);
    const sittingMountain = MOUNTAINS[mSittingIdx];

    const actualSittingGridIndex = trigramToGridIndex[sittingMountain.trigram];
    const facingGridIndex = trigramToGridIndex[facingLine.mountain.trigram];

    const sittingBaseStar = baseGrid[actualSittingGridIndex];
    const facingBaseStar = baseGrid[facingGridIndex];

    const actualUseQueThe = facingLine.needQueThe && enableQueThe;

    const determineFlight = (starBase, refMountain, applyReplacement) => {
      let calcStar = starBase;
      let targetMountain = starBase === 5 ? refMountain : findMountainForStar(starBase, refMountain.type);
      let isForward = targetMountain ? targetMountain.yinYang === '+' : true;
      let replaced = false;

      if (applyReplacement && targetMountain) {
        const replaceWith = REPLACEMENT_STARS[targetMountain.name];
        if (replaceWith) {
          calcStar = replaceWith;
          replaced = true;
          if (replaceWith !== 5) {
             const newMountain = findMountainForStar(replaceWith, refMountain.type);
             if(newMountain) isForward = newMountain.yinYang === '+';
          }
        }
      }
      return { calcStar, isForward, replaced, targetMountain };
    };

    const sittingLogic = determineFlight(sittingBaseStar, sittingMountain, actualUseQueThe);
    const facingLogic = determineFlight(facingBaseStar, facingLine.mountain, actualUseQueThe);

    const sittingGrid = flyStar(sittingLogic.calcStar, sittingLogic.isForward);
    const facingGrid = flyStar(facingLogic.calcStar, facingLogic.isForward);

    const dStr = `${annualYear}-06-01`;
    const stars = getTimeStars(dStr);
    const annualStar = stars.annual || 1;
    const annualGrid = flyStar(annualStar, true);

    const finalGrid = baseGrid.map((baseStar, index) => ({
      base: baseStar, sitting: sittingGrid[index], facing: facingGrid[index], annual: annualGrid[index]
    }));

    const formations = analyzeFormations(finalGrid, project.period, facingGridIndex, actualSittingGridIndex);
    const remedies = generateRemedies(finalGrid, project.period);
    let permutationMap = viewMode === 'FACING_UP' ? VIEW_PERMUTATIONS[facingLine.mountain.trigram] : VIEW_PERMUTATIONS[1];

    if (!permutationMap) {
      permutationMap = VIEW_PERMUTATIONS[1]; // Fallback
    }

    return {
      facingLine, sittingMountain, finalGrid, sittingLogic, facingLogic,
      permutationMap, sittingGridIndex: actualSittingGridIndex, facingGridIndex, formations, remedies
    };
  }, [project, viewMode, enableQueThe, annualYear]);

  const handleExportPdf = useCallback(async () => {
    setIsExporting(true);
    const prevTab = activeTab;
    if (activeTab !== 'TINH_BAN') setActiveTab('TINH_BAN');
    
    // Wait for render
    await new Promise(r => setTimeout(r, 600));
    
    try {
      await generatePdfReport({
        project,
        chartData,
        customAnalysis,
        refs: { compassRef, gridRef }
      });
    } catch (err) {
      console.error('PDF export error:', err);
      alert('Có lỗi khi xuất PDF. Vui lòng thử lại.');
    } finally {
      if (prevTab !== 'TINH_BAN') setActiveTab(prevTab);
      setIsExporting(false);
    }
  }, [project, chartData, customAnalysis, activeTab]);

  return (
    <>
     <div className="animate-slide-up space-y-6">
        {/* HEADER DỰ ÁN */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
           <div className="flex justify-between items-start mb-6">
              <div>
                 <div className="flex gap-3 mb-4 flex-wrap">
                     <button onClick={() => setView('LIBRARY')} className="flex items-center gap-1.5 text-slate-500 hover:text-emerald-600 font-bold transition-colors cursor-pointer">
                        <ArrowLeft size={18} /> Thư Viện
                     </button>
                     <button onClick={() => setView('CREATE')} className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 font-bold transition-colors cursor-pointer border-l-2 border-slate-200 pl-3">
                        <Edit size={16} /> Sửa Thông Tin
                     </button>
                     <button onClick={handleExportPdf} disabled={isExporting} className="flex items-center gap-1.5 text-white bg-gradient-to-r from-red-600 to-indigo-600 hover:from-red-700 hover:to-indigo-700 font-bold transition-all cursor-pointer px-4 py-2 rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-wait text-sm">
                        {isExporting ? <><Loader size={16} className="animate-spin" /> Đang xuất...</> : <><Download size={16} /> Xuất Báo Cáo PDF</>}
                     </button>
                 </div>
                 <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3" title={project.clientName}>
                    <User className="text-indigo-600"/> Dự án: {project.projectName || project.clientName}
                 </h2>
                 <p className="text-slate-500 font-medium flex items-center gap-1 mt-2 mb-1">
                    Gia chủ: <span className="font-bold text-slate-700">{project.clientName}</span>, Sinh năm: <span className="font-bold">{new Date(project.dob).getFullYear()} ({project.gender})</span>
                 </p>
                 <p className="text-slate-500 font-medium flex items-center gap-1"><MapPin size={16}/> {project.address || 'Chưa cập nhật địa chỉ'}</p>
              </div>
              
              <div className="hidden md:flex flex-col items-end gap-2">
                 <div className="flex gap-2">
                    <div className="bg-indigo-50 border border-indigo-100 px-3 py-2 rounded-xl text-indigo-800 font-bold text-sm">
                       Mệnh Quái (Cung Phi): <span className="text-indigo-600 text-base ml-1">{project.menhQuai}</span>
                    </div>
                 </div>
                 <div className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl font-bold">
                    Năm XD: {project.buildYear} (Vận {project.period})
                 </div>
              </div>
           </div>
           
           {(project.designReq || project.loanDau) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100">
                 {project.designReq && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                       <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mb-1"><FileText size={14}/> Yêu cầu thiết kế:</span>
                       <p className="text-slate-700 font-medium text-sm">{project.designReq}</p>
                    </div>
                 )}
                 {project.loanDau && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                       <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mb-1"><Mountain size={14}/> Hình thế Loan Đầu:</span>
                       <p className="text-slate-700 font-medium text-sm">{project.loanDau}</p>
                    </div>
                 )}
              </div>
           )}
        </div>

        {/* --- KHU VỰC PHÂN TÍCH --- */}
        {/* --- DÀN NGANG: TRỤC TỌA HƯỚNG --- */}
        {(chartData.facingLine.msg || chartData.facingLine.needQueThe) && (
        <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-200">
           {/* THOÁI QUÁI QUẺ THẾ HOẶC THÔNG BÁO VONG KHÔNG/KIÊM HƯỚNG */}
           <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className={`text-sm font-bold text-center md:text-left ${chartData.facingLine.isVoid ? 'text-red-500' : chartData.facingLine.isKeim ? 'text-orange-600' : 'text-emerald-600'}`}>
                {chartData.facingLine.msg}
              </p>
              
              {chartData.facingLine.needQueThe && (
                <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 shadow-inner gap-2 shrink-0">
                  <button onClick={() => setEnableQueThe(false)} className={`px-6 py-2 text-sm font-black rounded-lg transition-all cursor-pointer ${!enableQueThe ? 'bg-orange-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}>Quẻ Thường</button>
                  <button onClick={() => setEnableQueThe(true)} className={`px-6 py-2 text-sm font-black rounded-lg transition-all cursor-pointer ${enableQueThe ? 'bg-orange-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}>Quẻ Thế</button>
                </div>
              )}
           </div>
        </div>
        )}

        {/* VIEW TABS */}
        <div className="flex gap-1 bg-slate-200/50 p-1.5 rounded-2xl w-full md:w-fit mt-4 mx-auto md:mx-0 shadow-inner overflow-x-auto">
           <button onClick={() => setActiveTab('TINH_BAN')} className={`px-4 md:px-6 py-2.5 rounded-xl font-black text-sm transition-all focus:outline-none flex whitespace-nowrap items-center gap-2 ${activeTab==='TINH_BAN' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}>
              <Compass size={18} /> La Bàn
           </button>
           <button onClick={() => setActiveTab('MAT_BANG')} className={`px-4 md:px-6 py-2.5 rounded-xl font-black text-sm transition-all focus:outline-none flex whitespace-nowrap items-center gap-2 ${activeTab==='MAT_BANG' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}>
              <Map size={18} /> Vẽ
           </button>
           <button onClick={() => setActiveTab('BAT_TRACH')} className={`px-4 md:px-6 py-2.5 rounded-xl font-black text-sm transition-all focus:outline-none flex whitespace-nowrap items-center gap-2 ${activeTab==='BAT_TRACH' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}>
              <Compass size={18} /> Bát Trạch
           </button>
           <button onClick={() => setActiveTab('PHAN_TICH')} className={`px-4 md:px-6 py-2.5 rounded-xl font-black text-sm transition-all focus:outline-none flex whitespace-nowrap items-center gap-2 ${activeTab==='PHAN_TICH' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}>
              <Activity size={18} /> Cửu Cung
           </button>
           <button onClick={() => setActiveTab('CHON_NGAY')} className={`px-4 md:px-6 py-2.5 rounded-xl font-black text-sm transition-all focus:outline-none flex whitespace-nowrap items-center gap-2 ${activeTab==='CHON_NGAY' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}>
              <Calendar size={18} /> Tuyển Ngày
           </button>
           <button onClick={() => setActiveTab('DU_BAO')} className={`px-4 md:px-6 py-2.5 rounded-xl font-black text-sm transition-all focus:outline-none flex whitespace-nowrap items-center gap-2 ${activeTab==='DU_BAO' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}>
               <TrendingUp size={18} /> Dự Báo
            </button>
            <button onClick={() => setActiveTab('CRM')} className={`px-4 md:px-6 py-2.5 rounded-xl font-black text-sm transition-all focus:outline-none flex whitespace-nowrap items-center gap-2 ${activeTab==='CRM' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}>
              <FileText size={18} /> Nhật Ký
           </button>
        </div>

        {/* --- KHU VỰC PHÂN TÍCH: TÙY CHỌN THEO TAB --- */}
        {activeTab === 'TINH_BAN' && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            
            {/* CỘT TRÁI: LA KINH */}
            <div className="flex flex-col gap-4 w-full">
               {/* HEADER TỌA HƯỚNG */}
               <div className="bg-slate-800 text-white p-3 md:p-4 rounded-2xl flex flex-col md:flex-row justify-center items-center min-h-[64px] shadow-sm border border-slate-700 shadow-slate-900/10 text-center gap-1 md:gap-3">
                  <h3 className="text-sm md:text-base lg:text-lg font-black uppercase tracking-widest flex items-center gap-2">
                      <Compass size={20} className="text-amber-400 shrink-0" /> 
                      <span className="text-amber-400 drop-shadow-md">Tọa {chartData.sittingMountain.name} Hướng {chartData.facingLine.mountain.name} ({project.degree}°)</span>
                  </h3>
                  <span className="text-slate-500 hidden md:inline">|</span>
                  <span className="text-sm md:text-base font-bold text-white opacity-90 bg-white/10 px-3 py-1 rounded-lg">
                      {chartData.facingLine.type}
                  </span>
               </div>
               
               {/* BOX CHỨA LA KINH */}
               <div ref={compassRef} className="bg-white p-4 md:p-8 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-center relative flex-1 min-h-[400px]">
                  <div className="origin-center flex justify-center items-center w-full h-full">
                     <DynamicCompass degree={project.degree} onChange={() => {}} readOnly={true} />
                  </div>
               </div>
            </div>

            {/* CỘT PHẢI: TINH BÀN */}
            <div className="flex flex-col gap-4">
              {/* HEADER TINH BÀN */}
              <div className="bg-slate-800 text-white p-4 rounded-2xl flex flex-col md:flex-row justify-between items-center h-auto md:h-16 gap-3 shadow-sm border border-slate-700 shadow-slate-900/10">
                <div className="flex flex-col md:flex-row items-center gap-3">
                   <h2 className="text-base md:text-lg font-black uppercase tracking-widest flex items-center gap-2 text-center md:text-left"><div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.8)]"></div> Tinh Bàn Vận {project.period}</h2>
                   <div className="flex items-center gap-2 bg-slate-700/50 px-2 py-1 rounded pl-3 border border-slate-600">
                      <span className="text-[10px] md:text-xs uppercase font-bold text-slate-300">Sao Năm</span>
                      <input type="number" min="1900" max="2100" value={annualYear} onChange={e => setAnnualYear(Number(e.target.value))} className="w-16 bg-slate-800 text-amber-400 font-black border border-slate-600 rounded px-1 py-0.5 text-center outline-none" />
                   </div>
                </div>
                <div className="flex bg-slate-700/60 p-1 rounded-xl gap-1 border border-slate-600 shadow-inner">
                  <button onClick={() => setViewMode('NORTH_UP')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${viewMode === 'NORTH_UP' ? 'bg-indigo-500 shadow-md text-white' : 'text-slate-300 hover:text-white hover:bg-slate-600'}`}><Map size={14} /> Bắc Lên</button>
                  <button onClick={() => setViewMode('FACING_UP')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${viewMode === 'FACING_UP' ? 'bg-indigo-500 shadow-md text-white' : 'text-slate-300 hover:text-white hover:bg-slate-600'}`}><Navigation size={14} /> Hướng Lên</button>
                </div>
              </div>
              
              {/* HỘP TINH BÀN (CHỈ HIỂN THỊ MAP, VỪA VẶN) */}
              <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-center flex-1">
                <div ref={gridRef} className="grid grid-cols-3 gap-1.5 md:gap-2 w-full max-w-[280px] md:max-w-[320px]">
                  {chartData.permutationMap.map((originalIndex) => {
                    const data = chartData.finalGrid[originalIndex];
                    const labelInfo = LABELS[originalIndex];
                    const isFacing = originalIndex === chartData.facingGridIndex;
                    const isSitting = originalIndex === chartData.sittingGridIndex;
                    const isAxis = isFacing || isSitting || originalIndex === 4;
                    
                    let containerClasses = "relative flex flex-col p-2 rounded-xl transition-all border-2 cursor-pointer hover:scale-[1.03] hover:z-30 hover:shadow-xl aspect-square justify-center ";
                    if (isAxis) containerClasses += "bg-amber-50/80 border-amber-300 shadow-[inset_0_0_15px_rgba(251,191,36,0.15)] ";
                    else containerClasses += "bg-white border-slate-200 hover:border-indigo-300 ";

                    if (isFacing) containerClasses += "ring-2 ring-red-400 ring-offset-1 z-10 ";
                    if (isSitting) containerClasses += "ring-2 ring-slate-500 ring-offset-1 z-10 ";

                    return (
                      <div key={originalIndex} className={containerClasses} onClick={() => setSelectedCell({ originalIndex, data, labelInfo, isFacing, isSitting })}>
                        {!isAxis && <div className={`absolute inset-0 rounded-xl opacity-10 ${getElementBgColor(data.base)}`}></div>}

                        {/* LABEL */}
                        <div className="absolute top-1.5 left-0 w-full flex justify-center px-1">
                          <span className={`text-[10px] md:text-xs font-black uppercase tracking-tight text-center ${labelInfo.color} drop-shadow-sm opacity-100`}>
                            {labelInfo.dir} <span className="hidden sm:inline font-bold text-[9px] opacity-80">({labelInfo.tri})</span>
                          </span>
                        </div>
                        
                        {/* LƯU NIÊN (ANNUAL STAR) */}
                        <div className={`absolute -top-1.5 -right-1.5 w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[10px] md:text-xs font-black shadow-[0_0_10px_rgba(0,0,0,0.15)] z-20 bg-white border border-slate-200 ${getStarColor(data.annual)} ring-2 ring-white/60`} title={`Sao Lưu Niên năm ${annualYear}`}>
                           {data.annual}
                        </div>
                        
                        {isFacing && <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase shadow-sm border border-red-400 z-20">Hướng</div>}
                        {isSitting && <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase shadow-sm border border-slate-600 z-20">Tọa</div>}
                        
                        <div className="flex justify-between w-full px-1.5 mt-4 relative z-10">
                          <span className={`text-xl md:text-2xl font-black ${getStarColor(data.sitting)}`}>{data.sitting}</span>
                          <span className={`text-xl md:text-2xl font-black ${getStarColor(data.facing)}`}>{data.facing}</span>
                        </div>
                        
                        <div className="flex flex-col items-center justify-center mt-1 pb-1 relative z-10">
                          <span className={`text-2xl md:text-3xl font-black opacity-20 ${getStarColor(data.base)}`}>{data.base}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
             {/* CÁCH CỤC TOÀN BÀN */}
            {chartData.formations && chartData.formations.length > 0 && (
               <div className="lg:col-span-2 mt-4 space-y-4">
                  <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2 mb-6 pb-2 border-b-2 border-slate-200/50">
                     <Sparkles className="text-amber-500" /> Cách Cục Toàn Bàn
                  </h3>
                  <div className={`grid grid-cols-1 ${chartData.formations.length > 1 ? 'lg:grid-cols-2' : ''} gap-6`}>
                     {chartData.formations.map((f, i) => (
                        <div key={i} className={`p-6 rounded-3xl border-2 shadow-sm ${f.type === 'good' ? 'bg-emerald-50 border-emerald-200' : f.type === 'bad' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                           <div className="flex flex-col gap-3 h-full">
                              <div className="flex items-center gap-2 mb-2">
                                <Star className={`shrink-0 ${f.type === 'good' ? 'text-emerald-500' : f.type === 'bad' ? 'text-red-500' : 'text-blue-500'}`} fill="currentColor" />
                                <h4 className={`text-xl font-black ${f.type === 'good' ? 'text-emerald-800' : f.type === 'bad' ? 'text-red-800' : 'text-blue-800'}`}>{f.name}</h4>
                              </div>
                              <p className="font-bold text-slate-700 text-sm md:text-base leading-relaxed mb-1">{f.desc}</p>
                              <div className="bg-white/70 p-5 rounded-2xl border border-white shadow-sm mt-auto space-y-3">
                                 <div className="flex items-center gap-2 font-black text-slate-800 text-sm uppercase border-b border-white/50 pb-2">
                                    <Mountain size={16} className="text-amber-700"/> Yêu cầu về Loan Đầu và bố trí nội thất:
                                 </div>
                                 <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-line">{f.loanDau}</p>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}
          </div>
        )}

        {/* --- PHÂN TÍCH SÁT KHÍ --- */}
        {activeTab === 'TINH_BAN' && project.loanDau && (() => {
           const detectedSatKhi = analyzeSatKhi(project.loanDau);
           if (detectedSatKhi.length === 0) return null;
           
           const severityColors = {
             critical: { bg: 'bg-red-50', border: 'border-red-300', badge: 'bg-red-600 text-white', header: 'text-red-800', icon: 'text-red-500' },
             high:     { bg: 'bg-orange-50', border: 'border-orange-300', badge: 'bg-orange-500 text-white', header: 'text-orange-800', icon: 'text-orange-500' },
             medium:   { bg: 'bg-amber-50', border: 'border-amber-300', badge: 'bg-amber-500 text-white', header: 'text-amber-800', icon: 'text-amber-500' },
             low:      { bg: 'bg-blue-50', border: 'border-blue-300', badge: 'bg-blue-500 text-white', header: 'text-blue-800', icon: 'text-blue-500' },
           };
           const severityLabel = { critical: 'Nghiêm trọng', high: 'Cao', medium: 'Trung bình', low: 'Nhẹ' };
           
           return (
             <div className="lg:col-span-2 mt-6 space-y-4 animate-slide-up">
                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2 mb-4 pb-2 border-b-2 border-red-200/50">
                   <AlertTriangle className="text-red-500" /> Phân Tích Hình Thế Sát Khí ({detectedSatKhi.length} loại phát hiện)
                </h3>
                <p className="text-sm text-slate-500 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium">
                   <Info size={14} className="inline mr-1 text-indigo-500"/> Dựa trên mô tả Loan Đầu đã nhập: <span className="text-slate-700 italic">"{project.loanDau}"</span>
                </p>
                <div className={`grid grid-cols-1 ${detectedSatKhi.length > 1 ? 'lg:grid-cols-2' : ''} gap-5`}>
                   {detectedSatKhi.map((sat, idx) => {
                      const sc = severityColors[sat.severity];
                      return (
                        <div key={sat.id} className={`${sc.bg} ${sc.border} border-2 rounded-3xl p-5 shadow-sm flex flex-col transition-all hover:shadow-md`}>
                           <div className="flex items-start gap-3 mb-3">
                              <span className="text-3xl">{sat.icon}</span>
                              <div className="flex-1">
                                 <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className={`text-lg font-black ${sc.header}`}>{sat.name}</h4>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${sc.badge}`}>{severityLabel[sat.severity]}</span>
                                 </div>
                              </div>
                           </div>
                           <p className="text-sm text-slate-700 leading-relaxed font-medium mb-4">{sat.desc}</p>
                           
                           <div className="bg-white/80 p-4 rounded-2xl border border-white shadow-sm mt-auto space-y-3">
                              <div className="flex items-center gap-2 font-black text-slate-800 text-xs uppercase border-b border-slate-200/50 pb-2">
                                 <CheckCircle size={14} className="text-emerald-500"/> Phương pháp hóa giải:
                              </div>
                              {sat.hoaGiai.map((hg, j) => (
                                 <div key={j} className="flex gap-2">
                                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase whitespace-nowrap h-fit mt-0.5">{hg.phap}</span>
                                    <p className="text-sm text-slate-700 leading-relaxed font-medium">{hg.detail}</p>
                                 </div>
                              ))}
                           </div>
                        </div>
                      );
                   })}
                </div>
             </div>
           );
        })()}

        {/* --- KHU VỰC PHÂN TÍCH: ÁP BẢN VẼ --- */}
        {activeTab === 'MAT_BANG' && (
           <div className="mt-6 animate-slide-up">
              <FloorPlanOverlay 
                project={project} 
                chartData={chartData}
                onSaveOverlay={async (overlayState) => {
                   const updatedDetails = { ...(project.details || {}), planOverlayState: overlayState };
                   const updatedProject = { ...project, details: updatedDetails };
                   try {
                     await fetch(`/api/projects/${project.id}`, {
                       method: 'PUT',
                       headers: { 'Content-Type': 'application/json' },
                       body: JSON.stringify(updatedProject)
                     });
                     setCurrentProject(updatedProject);
                     const updatedProjects = projects.map(p => p.id === project.id ? updatedProject : p);
                     setProjects(updatedProjects);
                     alert('Đã lưu dữ liệu bản vẽ La Kinh và điểm định tâm vào hồ sơ dự án!');
                   } catch (err) {
                     console.error('Lỗi lưu overlay:', err);
                     alert('Có lỗi khi lưu dữ liệu bản vẽ.');
                   }
                }}
              />
           </div>
        )}

        {/* --- KHU VỰC PHÂN TÍCH: BÁT TRẠCH --- */}
        {activeTab === 'BAT_TRACH' && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 animate-fade-in">
              {/* Cột trái: La Kinh Bát Trạch */}
              <div className="flex flex-col gap-4 w-full">
                 <div className="bg-slate-800 text-white p-3 md:p-4 rounded-2xl flex flex-col md:flex-row justify-center items-center min-h-[64px] shadow-sm border border-slate-700 shadow-slate-900/10 text-center gap-1 md:gap-3">
                    <h3 className="text-sm md:text-base lg:text-lg font-black uppercase tracking-widest flex items-center gap-2">
                       <Compass size={20} className="text-orange-400 shrink-0" /> 
                       <span className="text-orange-400 drop-shadow-md">La Kinh Bát Trạch (Hướng {project.degree}°)</span>
                    </h3>
                 </div>
                 <div className="bg-slate-100 p-4 md:p-8 rounded-3xl shadow-inner border border-slate-300 flex items-center justify-center relative flex-1 min-h-[400px]">
                    <BatTrachCompass degree={project.degree} menhQuai={project.menhQuai} />
                 </div>
              </div>

              {/* Cột phải: Phân Tích */}
              <div className="flex flex-col gap-4 w-full">
                 <div className="bg-slate-800 text-white p-4 rounded-2xl flex flex-col md:flex-row justify-between items-center shadow-sm border border-slate-700 min-h-[64px]">
                    <h2 className="text-base md:text-lg font-black uppercase tracking-widest flex items-center gap-2 text-center md:text-left"><Sparkles className="text-amber-400" size={18}/> {dongTayTuMenh}</h2>
                    <div className="bg-indigo-500/20 px-4 py-1.5 rounded-xl border border-indigo-400/30">
                       <span className="font-black text-indigo-300 text-sm md:text-base">{project.menhQuai}</span>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 flex-1 content-start">
                     {(() => {
                        const goodOrder = ['Sinh Khí', 'Diên Niên', 'Thiên Y', 'Phục Vị'];
                        const badOrder = ['Tuyệt Mệnh', 'Ngũ Quỷ', 'Lục Sát', 'Họa Hại'];
                        
                        const mappedBatTrach = GUA_DIRECTIONS.map(gua => {
                          const starName = getBatTrachStar(project.menhQuai, gua.name);
                          return { gua, starName, starInfo: BAT_TRACH_STARS[starName] };
                        }).filter(d => d.starInfo);
                        
                        const goodStars = mappedBatTrach.filter(d => d.starInfo.type === 'Cát').sort((a,b) => goodOrder.indexOf(a.starName) - goodOrder.indexOf(b.starName));
                        const badStars = mappedBatTrach.filter(d => d.starInfo.type === 'Hung').sort((a,b) => badOrder.indexOf(a.starName) - badOrder.indexOf(b.starName));

                        return (
                           <>
                              {/* CỘT CÁT TINH */}
                              <div className="flex flex-col gap-3">
                                 {goodStars.map(({gua, starName, starInfo}) => {
                                    const currentValue = batTrachAnalysis[gua.name] !== undefined ? batTrachAnalysis[gua.name] : starInfo.desc;
                                    return (
                                    <div key={gua.name} 
                                       onClick={() => setEditingBatTrach({ gua, starName, starInfo, text: currentValue })}
                                       className="cursor-pointer bg-white p-4 pb-5 rounded-2xl border-2 shadow-sm flex flex-col transition-all hover:scale-[1.02] border-emerald-100 hover:border-emerald-300">
                                       <div className="flex justify-between items-center mb-3">
                                          <span className="font-black text-slate-600 text-sm md:text-base flex items-center gap-1.5"><Navigation size={14}/> {gua.name} ({gua.dir})</span>
                                          <span className={`px-2.5 py-1 rounded text-xs md:text-sm font-black border uppercase shadow-sm ${starInfo.colors.bg} ${starInfo.colors.text} ${starInfo.colors.border}`}>
                                             {starName}
                                          </span>
                                       </div>
                                       <div className="text-sm text-slate-700 leading-relaxed font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex-1 max-h-[100px] overflow-y-auto whitespace-pre-wrap scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">{currentValue}</div>
                                    </div>
                                 )})}
                              </div>
                              
                              {/* CỘT HUNG TINH */}
                              <div className="flex flex-col gap-3">
                                 {badStars.map(({gua, starName, starInfo}) => {
                                    const currentValue = batTrachAnalysis[gua.name] !== undefined ? batTrachAnalysis[gua.name] : starInfo.desc;
                                    return (
                                    <div key={gua.name} 
                                       onClick={() => setEditingBatTrach({ gua, starName, starInfo, text: currentValue })}
                                       className="cursor-pointer bg-white p-4 pb-5 rounded-2xl border-2 shadow-sm flex flex-col transition-all hover:scale-[1.02] border-red-100 hover:border-red-300">
                                       <div className="flex justify-between items-center mb-3">
                                          <span className="font-black text-slate-600 text-sm md:text-base flex items-center gap-1.5"><Navigation size={14}/> {gua.name} ({gua.dir})</span>
                                          <span className={`px-2.5 py-1 rounded text-xs md:text-sm font-black border uppercase shadow-sm ${starInfo.colors.bg} ${starInfo.colors.text} ${starInfo.colors.border}`}>
                                             {starName}
                                          </span>
                                       </div>
                                       <div className="text-sm text-slate-700 leading-relaxed font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex-1 max-h-[100px] overflow-y-auto whitespace-pre-wrap scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">{currentValue}</div>
                                    </div>
                                 )})}
                              </div>
                           </>
                        );
                     })()}
                  </div>
              </div>
           </div>
        )}

        {/* --- KHU VỰC PHÂN TÍCH: CHỌN NGÀY (TIME STAR TRACKER) --- */}
        {activeTab === 'CHON_NGAY' && (
           <div className="mt-6 animate-fade-in">
              <TimeStarTracker projectContext={project} />
           </div>
        )}

        {/* --- KHU VỰC PHÂN TÍCH: DỰ BÁO LƯU NIÊN --- */}
         {activeTab === 'DU_BAO' && (
            <div className="mt-6 animate-fade-in">
               <AnnualForecast project={project} chartData={chartData} />
            </div>
         )}

         {/* --- KHU VỰC PHÂN TÍCH: TÙY CHỌN THEO TAB --- */}
        {activeTab === 'CRM' && (
           <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mt-6 animate-fade-in space-y-8">
              <div className="flex justify-between items-center mb-4 border-b pb-4">
                 <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                    <Calendar className="text-amber-500" /> Hồ Sơ Tư Vấn & Nhật Ký
                 </h3>
              </div>

              {/* Box Thêm Ghi Chú */}
              <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200 shadow-inner">
                 <label className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-2 flex items-center gap-2"><Plus size={16}/> Thêm Ghi Chú Mới</label>
                 <textarea 
                    value={newNote} onChange={e => setNewNote(e.target.value)}
                    rows="3"
                    className="w-full px-4 py-3 rounded-xl border border-amber-300 focus:border-amber-500 outline-none font-medium bg-white text-sm resize-none shadow-sm placeholder-slate-400" 
                    placeholder="Nhập nội dung tư vấn, lịch sử khảo sát thực địa, hay lời khuyên năm mới cho thay đổi lưu niên..."></textarea>
                 <div className="flex justify-end mt-3">
                    <button onClick={handleSaveNote} disabled={!newNote.trim() || !projects} className="bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black px-6 py-2.5 rounded-xl shadow-md transition-colors flex items-center gap-2">
                       Lưu Ghi Chú
                    </button>
                    {!projects && <span className="text-[10px] text-red-500 ml-2 mt-2">Dự án này không có trong DB.</span>}
                 </div>
              </div>

              {/* Timeline Ghi chú */}
              <div className="space-y-4">
                 <h4 className="font-black text-lg text-slate-700 mb-4 pb-2">Lịch Sử Ghi Chú</h4>
                 {(!Array.isArray(project.notes) || project.notes.length === 0) ? (
                    <div className="text-center py-10 text-slate-400 font-medium italic border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                       Chưa có ghi chú nào. Hãy thêm ghi chú đầu tiên ở hộp trên.
                    </div>
                 ) : (
                    <div className="relative border-l-2 border-indigo-200 ml-3 md:ml-4 space-y-6 pb-4">
                       {[...project.notes].reverse().map((note, idx) => (
                          <div key={idx} className="relative pl-6 md:pl-8">
                             <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-indigo-500 border-4 border-white shadow-sm"></div>
                             <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex items-center gap-2 text-indigo-600 mb-2 font-bold text-xs uppercase tracking-wider">
                                   <Clock size={14} /> 
                                   {new Date(note.date).toLocaleString('vi-VN')}
                                </div>
                                <p className="text-slate-700 text-sm md:text-base whitespace-pre-wrap">{note.text}</p>
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
              </div>
           </div>
        )}

        {/* --- KHU VỰC PHÂN TÍCH: 9 CUNG --- */}
        {activeTab === 'PHAN_TICH' && (
           <div className="bg-slate-50/50 p-4 md:p-8 rounded-3xl shadow-sm border border-slate-200 mt-6 animate-fade-in relative">
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b border-slate-200 pb-4 gap-4">
                 <h3 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
                    <Activity className="text-blue-500" /> Phân Tích & Luận Cát Hung 9 Cung
                 </h3>
                 <button onClick={handleSaveAnalysis} className="bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 w-full md:w-auto">
                    <Save size={18}/> Lưu Phân Tích
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                 {chartData.permutationMap.map((originalIndex) => {
                    const data = chartData.finalGrid[originalIndex];
                    const labelInfo = LABELS[originalIndex];
                    
                    const defaultText = getCombinationDesc(data.sitting, data.facing, project.period);
                    const currentValue = customAnalysis[originalIndex] !== undefined ? customAnalysis[originalIndex] : defaultText;

                    return (
                       <div key={originalIndex} className={`${getElementBgColor(labelInfo.base)} rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-blue-400 transition-all`}>
                          <div className="bg-black/5 p-3 border-b border-slate-200/60 flex justify-between items-center">
                             <div className="flex items-center gap-2">
                                <div className="leading-tight">
                                   <h4 className="font-black text-slate-800 text-sm flex items-center gap-1.5 flex-wrap">
                                      {originalIndex === 4 ? 'Trung Cung' : `Hướng ${labelInfo.dir} - Cung ${labelInfo.tri}`}
                                      <span className="text-[12px] font-black text-slate-500 tracking-wider">
                                         (<span className="text-indigo-700">{data.sitting}</span>-<span className="text-emerald-700">{data.facing}</span>)
                                      </span>
                                   </h4>
                                </div>
                             </div>
                          </div>
                          <textarea 
                             className="w-full flex-1 p-4 text-sm font-medium text-slate-800 bg-transparent outline-none resize-none min-h-[160px] leading-relaxed transition-colors placeholder-slate-500 focus:bg-white/40"
                             value={currentValue}
                             onChange={(e) => setCustomAnalysis({...customAnalysis, [originalIndex]: e.target.value})}
                             placeholder="Nhập ghi chú và luận đoán thực địa cho cung này..."
                          />
                       </div>
                    );
                 })}
              </div>
           </div>
        )}
    </div>

    {/* --- POPUP CHỈNH SỬA BÁT TRẠCH --- */}
    {editingBatTrach && (
       <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditingBatTrach(null)}></div>
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
             <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-5 text-white flex justify-between items-center">
                <div>
                   <h3 className="text-xl font-black flex items-center gap-2">
                      Sửa Luận Giải Bát Trạch
                   </h3>
                   <p className="text-slate-300 text-sm font-medium mt-1">
                      Cung {editingBatTrach.gua.name} ({editingBatTrach.gua.dir}) - Sao {editingBatTrach.starName}
                   </p>
                </div>
                <button onClick={() => setEditingBatTrach(null)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors cursor-pointer"><X size={20}/></button>
             </div>
             <div className="p-6 flex-1 flex flex-col">
                <label className="text-xs font-bold text-slate-500 uppercase mb-2">Nội dung luận giải phong thủy Bát Trạch:</label>
                <textarea 
                   className="w-full flex-1 p-4 text-sm font-medium text-slate-800 bg-slate-50 border border-slate-200 outline-none resize-none min-h-[200px] leading-relaxed transition-colors focus:border-indigo-500 rounded-xl"
                   value={editingBatTrach.text}
                   onChange={(e) => setEditingBatTrach({...editingBatTrach, text: e.target.value})}
                   placeholder="Nhập diễn giải chi tiết cho Bát Trạch tại đây..."
                />
                <button onClick={handleSaveBatTrach} className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 w-full">
                   <Save size={18}/> Lưu Nội Dung
                </button>
             </div>
          </div>
       </div>
    )}

    {/* --- POPUP LUẬN GIẢI CHI TIẾT TỪNG Ô --- */}
    {selectedCell && (
       <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedCell(null)}></div>
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-slide-up">
             <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-5 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black flex items-center gap-2">
                     Cung {selectedCell.labelInfo.dir} ({selectedCell.labelInfo.tri} - {selectedCell.labelInfo.ele})
                  </h3>
                  <p className="text-slate-300 text-sm font-medium mt-1">
                     {selectedCell.isFacing ? 'Hướng Cửa Môn' : selectedCell.isSitting ? 'Tọa Lưng Nhà' : 'Phương Vị Phụ'}
                  </p>
                </div>
                <button onClick={() => setSelectedCell(null)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors cursor-pointer"><X size={20}/></button>
             </div>

             <div className="p-6 space-y-6">
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
                   <div className="text-center">
                      <div className="text-xs font-bold text-slate-500 uppercase">Sơn (Nhân đinh)</div>
                      <div className={`text-4xl font-black mt-1 ${getStarColor(selectedCell.data.sitting)}`}>{selectedCell.data.sitting}</div>
                   </div>
                   <div className="text-center">
                      <div className="text-xs font-bold text-slate-500 uppercase">Vận (Nền)</div>
                      <div className={`text-4xl font-black mt-1 ${getStarColor(selectedCell.data.base)}`}>{selectedCell.data.base}</div>
                   </div>
                   <div className="text-center">
                      <div className="text-xs font-bold text-slate-500 uppercase">Hướng (Tài lộc)</div>
                      <div className={`text-4xl font-black mt-1 ${getStarColor(selectedCell.data.facing)}`}>{selectedCell.data.facing}</div>
                   </div>
                </div>

                <div className="space-y-3">
                   <h4 className="font-black text-lg text-slate-800 flex items-center gap-2"><Sparkles className="text-amber-500" size={18}/> Phân Tích Cát Hung</h4>
                   <p className="text-slate-700 leading-relaxed font-medium p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 shadow-inner">
                      {getCombinationDesc(selectedCell.data.sitting, selectedCell.data.facing, project.period)}
                   </p>
                </div>
             </div>
          </div>
       </div>
     )}

     {/* EXPORT LOADING OVERLAY */}
     {isExporting && (
       <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 backdrop-blur-md">
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 animate-slide-up">
             <div className="relative">
               <div className="w-16 h-16 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin"></div>
               <Download size={20} className="absolute inset-0 m-auto text-indigo-600" />
             </div>
             <h3 className="text-xl font-black text-slate-800">Đang Xuất Báo Cáo PDF...</h3>
             <p className="text-slate-500 text-sm font-medium text-center max-w-xs">Phần mềm đang chụp La Kinh, Tinh Bàn và xếp vào file PDF. Vui lòng đợi trong giây lát.</p>
          </div>
       </div>
     )}
   </>
  );
};

export default ProjectResult;

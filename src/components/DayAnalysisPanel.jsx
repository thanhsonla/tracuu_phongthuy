import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

const DayAnalysisPanel = ({ data }) => {
  const { hiepKy: hk, truc, chiRelations: relations } = data;
  if (!hk) return null;

  return (
    <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-200 shadow-inner h-full flex flex-col min-w-[280px]">
      {/* 12 Trực */}
      {truc && (
        <div className="bg-white rounded-xl p-2.5 border border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start gap-2.5">
             <div className="bg-indigo-600 text-white w-9 h-9 rounded-lg flex items-center justify-center font-black text-base shrink-0 shadow-md">
                {truc.name}
             </div>
             <div>
                <p className="text-[11px] font-black text-indigo-800 uppercase tracking-widest mb-0.5">Trực {truc.name}</p>
                <p className="text-slate-600 text-[10px] leading-relaxed line-clamp-2" title={truc.desc}>{truc.desc}</p>
             </div>
          </div>
        </div>
      )}

      {/* Sao Cát / Hung */}
      <div className="grid grid-cols-1 gap-2">
        {hk.cat?.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span className="text-[11px] font-black text-emerald-700 uppercase tracking-wider">Sao Cát</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {hk.cat.map((s, i) => (
                 <span key={i} className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">{s}</span>
              ))}
            </div>
          </div>
        )}
        
        {hk.hung?.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <AlertTriangle size={14} className="text-red-500" />
              <span className="text-[11px] font-black text-red-700 uppercase tracking-wider">Sao Hung</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {hk.hung.map((s, i) => (
                 <span key={i} className="bg-red-50 border border-red-200 text-red-700 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Việc Nên / Kỵ */}
      <div className="space-y-2 mt-auto pt-2 border-t border-slate-200">
         <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <CheckCircle size={14} className="text-blue-600" />
              <span className="text-[11px] font-black text-blue-800 uppercase tracking-wider">Nên Làm</span>
            </div>
            <div className="flex flex-wrap gap-1">
               {hk.nen?.length > 0 ? hk.nen.map((act, i) => (
                 <span key={i} className="bg-blue-50 text-blue-700 text-[10px] font-medium px-2 py-0.5 rounded whitespace-nowrap">{act}</span>
               )) : <span className="text-[10px] text-slate-400 italic">Không có thông tin</span>}
            </div>
         </div>

         <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <XCircle size={14} className="text-orange-600" />
              <span className="text-[11px] font-black text-orange-800 uppercase tracking-wider">Cần Kiêng</span>
            </div>
            <div className="flex flex-wrap gap-1">
               {hk.kieng?.length > 0 ? hk.kieng.map((act, i) => (
                 <span key={i} className="bg-orange-50 text-orange-700 text-[10px] font-medium px-2 py-0.5 rounded whitespace-nowrap">{act}</span>
               )) : <span className="text-[10px] text-slate-400 italic">Không có thông tin</span>}
            </div>
         </div>
      </div>
      
      {/* Xung Khắc Hình Hại */}
      {relations && (
        <div className="mt-1 pt-2 border-t border-slate-200">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Quan hệ Địa Chi</p>
           <div className="flex flex-wrap gap-1 text-[9px]">
             <span className="bg-emerald-50 text-emerald-700 px-1 py-1 flex-1 min-w-[45px] text-center rounded border border-emerald-100"><b className="block mb-0.5">Hợp</b> {relations.hop.split(':')[1]?.trim() || '-'}</span>
             <span className="bg-red-50 text-red-700 px-1 py-1 flex-1 min-w-[45px] text-center rounded border border-red-100"><b className="block mb-0.5">Xung</b> {relations.xung.split('với ')[1]?.trim() || '-'}</span>
             <span className="bg-orange-50 text-orange-700 px-1 py-1 flex-1 min-w-[45px] text-center rounded border border-orange-100"><b className="block mb-0.5">Khắc</b> {relations.khac ? 'Có khắc' : '-'}</span>
             <span className="bg-pink-50 text-pink-700 px-1 py-1 flex-1 min-w-[45px] text-center rounded border border-pink-100"><b className="block mb-0.5">Hình</b> {relations.hinh || '-'}</span>
             <span className="bg-indigo-50 text-indigo-700 px-1 py-1 flex-1 min-w-[45px] text-center rounded border border-indigo-100"><b className="block mb-0.5">Hại</b> {relations.hai?.split('với ')[1]?.trim() || '-'}</span>
           </div>
        </div>
      )}
    </div>
  );
};

export default DayAnalysisPanel;

import React, { useState, useMemo, useEffect } from 'react';
import { Clock, Search, CalendarDays, ChevronDown, ChevronUp, Star, UserCheck } from 'lucide-react';
import { getTimeStars, getStarColor, getHourlyStars, THOI_THAN, getCanChiElements, evaluateDungThan } from '../utils/helpers';
import { flyStar } from '../services/GridGeneratorService';
import { getMaiHoaGua } from '../data/maiHoa';
import { VIEW_PERMUTATIONS, LABELS, STAR_PROPERTIES, formatDateDMY } from '../data/constants';
import { Solar, Lunar } from 'lunar-javascript';
import DayAnalysisPanel from './DayAnalysisPanel';

const SOLAR_HOLIDAYS = ['01/01', '30/04', '01/05', '02/09'];
const LUNAR_HOLIDAYS = ['01/01', '02/01', '03/01', '04/01', '10/03'];

// --- Lưới phi tinh nhỏ (Hiển thị dọc/vuông cho thẻ) ---
const MiniGrid = ({ centerStar, title, subtitle, canChi }) => {
  const grid = flyStar(centerStar, true);
  const permutationMap = VIEW_PERMUTATIONS[1];

  return (
    <div className="bg-white/10 backdrop-blur-md p-4 md:p-6 rounded-3xl border border-white/20 shadow-xl flex flex-col items-center w-full max-w-sm mx-auto h-full">
      <h3 className="text-xl font-black text-amber-300 drop-shadow-md mb-1">{title}</h3>
      {subtitle && <p className="text-sm font-bold text-slate-300 mb-2">{subtitle}</p>}
      {canChi && (
        <div className="flex gap-2 flex-wrap justify-center mb-3">
          {canChi.map((item, i) => (
            <span key={i} className="text-xs bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-amber-200 font-bold text-center">{item}</span>
          ))}
        </div>
      )}
      {STAR_PROPERTIES[centerStar] && (
        <div className="w-full bg-white/5 rounded-xl p-3 mb-4 border border-white/10">
          <p className="text-xs text-amber-200 font-bold text-center">{STAR_PROPERTIES[centerStar].name} ({STAR_PROPERTIES[centerStar].han}) - {STAR_PROPERTIES[centerStar].element}</p>
          <p className="text-[11px] text-slate-400 text-center mt-1 leading-relaxed hidden sm:block">{STAR_PROPERTIES[centerStar].desc}</p>
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-1 md:gap-2 w-full aspect-square mt-auto">
        {permutationMap.map((originalIndex) => {
          const star = grid[originalIndex];
          const labelInfo = LABELS[originalIndex];
          return (
            <div key={originalIndex} className={`relative flex flex-col items-center justify-center p-2 rounded-xl border ${originalIndex === 4 ? 'bg-amber-500/20 border-amber-400/50' : 'bg-slate-800/40 border-slate-600/50'}`}>
               <span className="text-[9px] md:text-[11px] font-bold uppercase tracking-widest text-slate-400 absolute top-1 left-0 w-full text-center">
                  {labelInfo.dir}
               </span>
               <span className={`text-3xl md:text-5xl font-black md:mt-3 ${getStarColor(star)}`}>
                  {star}
               </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Cảnh báo Hung Tinh theo Năm ---
const BAD_STARS_INFO = {
   5: { title: "Ngũ Hoàng", desc: "Ngũ Hoàng là hung tinh mạnh nhất, chủ bệnh tật, tai họa, biến cố. Không nên động thổ, sửa chữa tại {dir} trong năm {year}; Hóa giải bằng kim loại nặng: la bàn đồng, chuông đồng, quả cầu kim loại.", border: "border-red-500/50", bg: "bg-red-500/10", text: "text-red-400" },
   2: { title: "Nhị Hắc", desc: "Nhị Hắc là hung tinh bệnh phù, chủ đau ốm, suy nhược, đặc biệt ảnh hưởng phụ nữ lớn tuổi. Năm {year}, sao này nhập {dir}. Gia chủ cần đặt hồ lô đồng, chuông gió kim loại hoặc quả cầu đồng để hóa giải.", border: "border-orange-500/50", bg: "bg-orange-500/10", text: "text-orange-400" },
   3: { title: "Tam Bích", desc: "Tam Bích là sao thị phi, dễ gây cãi vã, kiện tụng, bất hòa. Nếu phòng khách hay phòng làm việc nằm ở {dir} thì dễ nảy sinh mâu thuẫn. Nên tránh dùng màu xanh lá, đặt đèn đỏ hoặc vật phẩm màu đỏ để tiết chế Mộc khí.", border: "border-green-500/50", bg: "bg-green-500/10", text: "text-green-400" },
   7: { title: "Thất Xích", desc: "Thất Xích chủ hao tài, trộm cắp, dễ mất mát tiền bạc. Không nên đặt két sắt, đồ quý giá tại {dir} trong năm {year}. Hóa giải bằng nước (bình gốm chứa nước, chậu nước nhỏ) hoặc vật phẩm màu xanh dương, đen.", border: "border-rose-400/50", bg: "bg-rose-400/10", text: "text-rose-400" }
};

const AnnualWarnings = ({ centerStar, year }) => {
  const grid = flyStar(centerStar, true);
  
  const warnings = [5, 2, 3, 7].map(badStar => {
     const idx = grid.findIndex(s => s === badStar);
     if (idx === -1) return null;
     const labelInfo = LABELS[idx];
     let dirName = labelInfo.dir;
     if (dirName.toLowerCase() === 'trung') {
       dirName = 'Trung Cung';
     } else {
       dirName = `phương ${dirName} (Cung ${labelInfo.tri})`;
     }
     
     const info = BAD_STARS_INFO[badStar];
     const textDesc = info.desc.replace(/\{dir\}/g, dirName).replace(/\{year\}/g, year);

     return (
       <div key={badStar} className={`p-2.5 rounded-lg border ${info.border} ${info.bg} mb-2 shadow-sm`}>
          <h4 className={`font-black uppercase mb-1 text-[11px] flex items-center leading-tight ${info.text}`}>
            Sao {badStar} - {info.title} tại {dirName}
          </h4>
          <p className="text-slate-300 text-[10px] sm:text-xs leading-relaxed">{textDesc}</p>
       </div>
     )
  }).filter(Boolean);

  return (
    <div className="mt-4 flex flex-col w-full text-left">
       <h3 className="text-amber-500 font-black mb-2 uppercase text-xs tracking-widest flex items-center gap-1.5 border-b border-white/10 pb-1.5">
         <span className="text-red-500 text-sm">⚠️</span> Cảnh Báo Năm {year}
       </h3>
       {warnings}
    </div>
  )
};

// --- Thuật toán màu sắc theo độ sáng của vòng lặp 12 giờ ---
const getHourStyles = (startH, fsMonth) => {
  let sunrise = 6; let sunset = 18;
  if (fsMonth >= 4 && fsMonth <= 6) { sunrise = 4.5; sunset = 19.5; } // Hạ (ban ngày mở rộng để sát góc Mão/Dậu)
  else if (fsMonth >= 10 || fsMonth <= 12) { sunrise = 7; sunset = 17; } // Đông

  const actualMid = startH === 23 ? 0 : startH + 1;
  let l = 15; // default night Lightness (%)
  
  if (actualMid > sunrise && actualMid < sunset) {
    const dayLength = sunset - sunset; // Wait...
    const dayLen = sunset - sunrise;
    const distanceFromNoon = Math.abs(actualMid - 12);
    const maxDist = dayLen / 2;
    // Dùng hình cos để có độ sáng dồi dào, đều đặn hơn từ sáng đến chiều
    const factor = Math.cos((distanceFromNoon / maxDist) * (Math.PI / 2));
    l = 30 + factor * 60; // 30% to 90%
  } else if (actualMid === sunrise || actualMid === sunset) {
    l = 30; // Twilight
  }

  const textColor = l > 60 ? '#1e293b' : '#f8fafc';
  const subColor = l > 60 ? '#475569' : '#94a3b8';
  return { bg: `hsl(210, 60%, ${l}%)`, text: textColor, subText: subColor, isLight: l > 60 };
};

// --- Dải hiển thị Phi Tinh 12 giờ nằm ngang ---
const HourlyRowBar = ({ dateStr, selectedStartH, fsMonth, yearGZ, lunarMonth, lunarDay, projectContext }) => {
  const hourlyData = getHourlyStars(dateStr);
  const dungThan = projectContext?.dungThan;
  
  // Xác định ngày hiện tại và giờ hiện tại
  const isTodayDate = new Date().toISOString().split('T')[0] === dateStr;
  const nowH = new Date().getHours();

  return (
    <div className="w-full mt-4 overflow-x-auto pb-2 custom-scrollbar">
      <div className="flex w-max min-w-[100%] rounded-xl overflow-hidden shadow-inner bg-slate-900 border border-slate-700/50">
        {hourlyData.map((h, i) => {
          const isActive = selectedStartH !== undefined && selectedStartH === h.startH;
          // Kiểm tra xem đây có phải là giờ hiện hành (thực tế) hay không
          const isNow = isTodayDate && ((h.startH === 23 && (nowH === 23 || nowH === 0)) || (nowH >= h.startH && nowH < h.endH));
          const styling = getHourStyles(h.startH, fsMonth);
          const gua = (yearGZ && lunarMonth) ? getMaiHoaGua(yearGZ, lunarMonth, lunarDay, h.name) : null;

          const hourElements = getCanChiElements(h.hourGZ);
          const dungThanGan = evaluateDungThan(hourElements.can, dungThan);
          const dungThanZhi = evaluateDungThan(hourElements.chi, dungThan);
          
          const isGoldenHour = dungThan && dungThan !== 'Chưa xác định' && ((dungThanGan.status === 'best' || dungThanZhi.status === 'best') && dungThanGan.status !== 'bad' && dungThanZhi.status !== 'bad');
          const isBadHour = dungThan && dungThan !== 'Chưa xác định' && (dungThanGan.status === 'bad' || dungThanZhi.status === 'bad');

          let borderClasses = "border-r border-black/10 ";
          if (isGoldenHour) {
             borderClasses += "ring-offset-2 ring-2 ring-emerald-500 z-10 ";
          } else if (h.isHoangDao) {
             borderClasses += "ring-offset-[1px] ring-1 ring-amber-400/50 z-10 ";
          }
          
          let classes = `flex-1 min-w-[70px] flex flex-col items-center justify-between py-2 transition-transform cursor-pointer relative ${borderClasses} `;
          if (isActive) {
             classes += "scale-105 shadow-xl font-bold z-20 ";
          } else if (isNow) {
             classes += "ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-900 shadow-[0_0_15px_rgba(251,191,36,0.6)] animate-[pulse_2s_ease-in-out_infinite] font-black scale-[1.03] z-20 ";
          } else {
             classes += "hover:brightness-110 ";
          }
          
          if (isBadHour) {
             classes += "opacity-50 grayscale contrast-125 ";
          }

          return (
            <div key={i} style={{ backgroundColor: styling.bg, color: styling.text }} className={classes} title={h.tianShen ? `${h.tianShen} (${h.isHoangDao ? 'Hoàng Đạo' : 'Hắc Đạo'})` : ''}>
              {isGoldenHour && (
                 <div className="absolute top-0 right-0 w-full h-full bg-emerald-400/10 rounded-lg pointer-events-none animate-pulse"></div>
              )}
              {h.isHoangDao && !isGoldenHour && (
                 <div className="absolute top-0 right-0 w-2 h-2 md:w-3 md:h-3 bg-gradient-to-br from-amber-300 to-amber-500 rounded-bl-lg shadow-sm" title="Giờ Hoàng Đạo"></div>
              )}
              {isGoldenHour && (
                 <div className="absolute top-0 right-0 w-3 h-3 md:w-4 md:h-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-bl-lg shadow-md flex items-center justify-center text-[8px] text-white" title="Khung Giờ Vàng (Hợp Mệnh Quái Gia Chủ)"><Star size={8} fill="currentColor" /></div>
              )}
              <div className="text-center mb-1 relative z-10">
                <span className="block text-[10px] md:text-[11px] font-black uppercase tracking-wider">{h.hourGZ}</span>
                <span className="block text-[8px] md:text-[10px]" style={{ color: styling.subText }}>
                   {h.startH}-{h.endH}h
                </span>
              </div>
              
              <div className="flex flex-col items-center flex-1 w-full gap-1.5 justify-start px-0.5">
                 {/* 2. Sao Hoàng/Hắc Đạo */}
                 <span className={`text-[7.5px] md:text-[8.5px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap ${h.isHoangDao ? 'bg-amber-500 text-slate-900 shadow-sm' : 'bg-slate-700/30 text-slate-300'}`}>
                   {h.tianShen}
                 </span>

                 {/* 3. Quẻ Dịch */}
                 {gua && (
                   <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-sm border border-black/20" style={{ backgroundColor: styling.isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)' }}>
                     {gua.shortName}
                   </span>
                 )}
                 
                 <div className="flex-1"></div>
                 
                 {/* 4. Cửu Tinh */}
                 <span className={`text-[11px] md:text-[13px] uppercase font-black tracking-tight text-center leading-tight ${getStarColor(h.centerStar)} drop-shadow-sm pb-0.5`}>
                   {STAR_PROPERTIES[h.centerStar]?.name}
                 </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Format thời gian ---
const formatTietKhiTime = (timeStr) => {
  if (!timeStr) return '';
  const parts = timeStr.split(' ');
  if (parts.length < 2) return timeStr;
  const dp = parts[0].split('-');
  if (dp.length < 3) return timeStr;
  return `${dp[2]}/${dp[1]}/${dp[0]} ${parts[1].substring(0, 5)}`;
};

// --- Tái sử dụng Tracker Result Card ---
const TrackerResultCard = ({ dateObj, data, searchTargetStar, searchDirection, projectContext }) => {
  const hk = data.hiepKy;
  const relations = data.chiRelations;
  const grid = flyStar(data.daily, true);
  
  const dungThan = projectContext?.dungThan;
  const hasDungThan = dungThan && dungThan !== 'Chưa xác định';
  
  const dayElements = getCanChiElements(data.dayGZ);
  const dungThanGan = hasDungThan ? evaluateDungThan(dayElements.can, dungThan) : { status: 'none' };
  const dungThanZhi = hasDungThan ? evaluateDungThan(dayElements.chi, dungThan) : { status: 'none' };

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden text-slate-800">
      {/* Top Block: Thông tin & Grid */}
      <div className="flex flex-col lg:flex-row">
        
        {/* Cột trái: Lịch & Hiệp Kỷ */}
        <div className="flex-1 p-3 md:p-5 border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col xl:flex-row gap-4">
          {/* Lịch block to */}
          <div className="flex flex-col items-center justify-start min-w-[130px]">
             <div className="text-center rounded-2xl border border-slate-100 shadow-sm w-full bg-slate-50 overflow-hidden">
               <div className="bg-red-600 text-white font-black text-[10px] py-1.5 uppercase tracking-widest leading-none">Tháng {dateObj.getMonth()+1}</div>
               <div className="py-3">
                 <span className="text-4xl font-black text-slate-800 block leading-none">{dateObj.getDate()}</span>
                 <span className="text-[10px] font-bold text-slate-500 mt-1 block">Năm {dateObj.getFullYear()}</span>
               </div>
             </div>
             <div className="text-center mt-2 bg-slate-100 rounded-lg py-2 px-3 w-full">
               <p className="font-bold text-[10px] text-slate-500 mb-0.5">Năm {data.yearGZ}</p>
               <p className="font-bold text-[10px] text-slate-500 mb-0.5">Tháng {data.monthGZ}</p>
               <p className="font-bold text-[11px] text-indigo-700">Ngày {data.dayGZ}</p>
             </div>
             
             {/* TRỰC / THIÊN THẦN (HOÀNG/HẮC ĐẠO) */}
             {data.dayTianShen && (
               <div className={`mt-2 w-full text-center py-1.5 px-2 rounded-lg font-black text-[10px] md:text-xs uppercase shadow-sm border ${data.dayTianShen.type === 'Hoàng Đạo' ? 'bg-amber-100 text-amber-700 border-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.3)]' : 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                  {data.dayTianShen.name} <br/>
                  <span className={`text-[8.5px] mt-0.5 block ${data.dayTianShen.type === 'Hoàng Đạo' ? 'text-amber-600' : 'text-slate-400'}`}>({data.dayTianShen.type})</span>
               </div>
             )}
          </div>

          {/* Data Hiệp Kỷ & Mối quan hệ */}
          <div className="flex-1 flex flex-col min-w-[280px]">
            {hasDungThan && (
              <div className="mb-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                 <div className="absolute right-0 top-0 w-16 h-16 bg-emerald-400/10 rounded-bl-full flex items-start justify-end p-3"><UserCheck className="text-emerald-500" size={24}/></div>
                 <h4 className="font-black text-emerald-800 uppercase tracking-widest text-xs flex items-center gap-1.5 mb-2">Đánh Giá Ngũ Hành Của Ngày So Với Mệnh Chủ</h4>
                 <div className="flex gap-4">
                    <div className="flex-1 space-y-1">
                       <p className="text-xs font-bold text-slate-500 uppercase">Thiên Can ({data.dayGZ.split(' ')[0]}) - {dayElements.can}</p>
                       <p className={`font-black text-sm md:text-base ${(dungThanGan.status === 'bad') ? 'text-red-500' : (dungThanGan.status === 'best') ? 'text-emerald-600' : 'text-slate-600'}`}>
                          {dungThanGan.label} {dungThanGan.ext}
                       </p>
                    </div>
                    <div className="flex-1 space-y-1">
                       <p className="text-xs font-bold text-slate-500 uppercase">Địa Chi ({data.dayGZ.split(' ')[1]}) - {dayElements.chi}</p>
                       <p className={`font-black text-sm md:text-base ${(dungThanZhi.status === 'bad') ? 'text-red-500' : (dungThanZhi.status === 'best') ? 'text-emerald-600' : 'text-slate-600'}`}>
                          {dungThanZhi.label} {dungThanZhi.ext}
                       </p>
                    </div>
                 </div>
              </div>
            )}
            <DayAnalysisPanel data={data} />
          </div>
        </div>

        {/* Cột phải: MiniGrid */}
        <div className="w-full lg:w-80 lg:min-w-[320px] p-4 bg-slate-50 flex flex-col items-center justify-center">
           <div className="text-center w-full mb-5 relative group cursor-pointer transition-transform hover:scale-105">
             <div className="absolute inset-x-0 -inset-y-2 bg-gradient-to-r from-amber-200/0 via-amber-400/30 to-amber-200/0 blur-md rounded-full opacity-60 animate-[pulse_2s_ease-in-out_infinite]"></div>
             <div className="relative bg-white/90 backdrop-blur-sm border border-amber-300 py-3 md:py-4 px-4 rounded-3xl shadow-md inline-block min-w-[240px]">
               <p className="text-xl md:text-2xl font-black text-amber-600 drop-shadow-sm uppercase tracking-widest flex items-center justify-center gap-1.5 leading-none">
                   <span className="text-2xl animate-bounce">🌿</span> TIẾT {data.termName}
               </p>
               <p className="text-xs md:text-sm font-bold text-slate-500 mt-2 flex flex-col gap-0.5">
                   <span>Từ {formatTietKhiTime(data.termTime)}</span>
                   <span>đến {formatTietKhiTime(data.nextTermTime)}</span>
               </p>
             </div>
           </div>
           
           <div className="w-full max-w-[280px]">
              <div className="grid grid-cols-3 w-full border border-slate-200">
                  {VIEW_PERMUTATIONS[1].map((originalIndex) => {
                     const star = grid[originalIndex];
                     const label = LABELS[originalIndex];
                     const isTarget = searchDirection !== undefined && searchTargetStar !== undefined && originalIndex === searchDirection && star === searchTargetStar;
                     return (
                       <div key={originalIndex} className={`flex flex-col items-center justify-center py-2 px-1 border border-slate-100 ${isTarget ? 'bg-amber-100 shadow-inner' : 'bg-white'}`}>
                          <span className="text-[9px] font-bold text-slate-500 mb-0.5">{label.dir}</span>
                           <span className={`text-2xl font-black ${getStarColor(star)}`}>{star}</span>
                           <span className="text-[8px] uppercase font-bold text-slate-400 mt-0.5 hidden xs:block">{STAR_PROPERTIES[star]?.name?.split(' ')[0]}</span>
                       </div>
                     );
                  })}
              </div>
           </div>
        </div>

      </div>

      {/* Bottom row: Phi tinh 12 giờ */}
      <div className="border-t border-slate-100 bg-white p-3 md:p-4">
         <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Canh Giờ</p>
         <HourlyRowBar 
           dateStr={dateObj.toISOString().split('T')[0]} 
           fsMonth={data.fsMonth} 
           yearGZ={data.yearGZ} 
           lunarMonth={data.lunarMonth} 
           lunarDay={data.lunarDay} 
           projectContext={projectContext}
         />
      </div>
    </div>
  );
};

// --- Bảng chọn ngày (MiniCalendar) ---
const MiniCalendar = ({ selectedDateStr, onSelect }) => {
  const selectedDate = new Date(selectedDateStr);
  const [viewDate, setViewDate] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  const [useLunar, setUseLunar] = useState(false);

  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay(); // 0 is Sun
  const padDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; 

  const days = [];
  for (let i = 0; i < padDays; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-slate-900 border border-slate-700/50 p-4 rounded-2xl w-full mx-auto select-none shadow-inner">
      <div className="flex justify-between items-start mb-4">
         <button onClick={prevMonth} className="text-slate-400 hover:text-white px-2 mt-1 cursor-pointer">&lt;</button>
         
         <div className="flex flex-col items-center">
            <span className="font-bold text-amber-500 uppercase tracking-wider text-sm mb-2">
              Tháng {viewDate.getMonth() + 1} - {viewDate.getFullYear()}
            </span>
            <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700 cursor-pointer">
               <button onClick={() => setUseLunar(false)} className={`text-[10px] px-3 py-1 rounded-md font-bold transition-colors ${!useLunar ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>Dương Lịch</button>
               <button onClick={() => setUseLunar(true)} className={`text-[10px] px-3 py-1 rounded-md font-bold transition-colors ${useLunar ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>Âm Lịch</button>
            </div>
         </div>
         
         <button onClick={nextMonth} className="text-slate-400 hover:text-white px-2 mt-1 cursor-pointer">&gt;</button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
         {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d, i) => <div key={d} className={`text-[10px] sm:text-xs font-bold ${i >= 5 && !useLunar ? 'text-red-400' : 'text-slate-500'}`}>{d}</div>)}
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center">
         {days.map((d, i) => {
           if (!d) return <div key={i} className="py-2" />;
           const currentCellDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), d, 12, 0, 0);
           const currentCellStr = currentCellDate.toISOString().split('T')[0];
           const isSelected = selectedDateStr === currentCellStr;
           const isToday = todayStr === currentCellStr;
           
           const solar = Solar.fromDate(currentCellDate);
           const lunar = Lunar.fromSolar(solar);
           
           const textDisplay = useLunar ? lunar.getDay() : d;
           const solarHolStr = `${String(d).padStart(2,'0')}/${String(viewDate.getMonth()+1).padStart(2,'0')}`;
           const lunarHolStr = `${String(lunar.getDay()).padStart(2,'0')}/${String(lunar.getMonth()).padStart(2,'0')}`;
           
           const isWeekend = currentCellDate.getDay() === 0 || currentCellDate.getDay() === 6;
           const isSolarHol = SOLAR_HOLIDAYS.includes(solarHolStr);
           const isLunarHol = LUNAR_HOLIDAYS.includes(lunarHolStr);
           const isRam = lunar.getDay() === 15;
           const isMung1 = lunar.getDay() === 1;

           let blockStyle = "py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg cursor-pointer transition-all border font-bold relative flex flex-col items-center justify-center ";
           
           if (isSelected) {
             blockStyle += "bg-amber-500 border-amber-400 text-slate-900 shadow-md scale-105 z-10 ";
           } else {
             if (useLunar) {
               if (isRam || isMung1) {
                 blockStyle += "bg-indigo-900/50 border-indigo-700/50 text-indigo-300 ";
               } else {
                 blockStyle += "bg-transparent border-transparent text-slate-300 hover:bg-slate-800 hover:border-slate-700 ";
               }
             } else {
               if (isSolarHol || isLunarHol || isWeekend) {
                 blockStyle += "bg-red-900/30 border-red-800/50 text-red-300 hover:bg-red-800/50 ";
               } else {
                 blockStyle += "bg-transparent border-transparent text-slate-300 hover:bg-slate-800 hover:border-slate-700 ";
               }
             }
           }

           return (
             <div key={i} onClick={() => onSelect(currentCellStr)} className={blockStyle}>
               <span className="relative z-10">{textDisplay}</span>
               {isToday && !isSelected && <div className="absolute inset-0 rounded-lg border-2 border-slate-500 pointer-events-none"></div>}
             </div>
           );
         })}
      </div>
    </div>
  );
};

// --- Bảng Widget Real-time Hôm nay ---
const TodayWidget = ({ projectContext }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const data = useMemo(() => {
    const checkDate = new Date(now);
    checkDate.setHours(12, 0, 0, 0); 
    return getTimeStars(checkDate);
  }, [now.toISOString().split('T')[0]]);

  return (
    <div className="animate-fade-in animate-slide-in-right w-full mb-4">
       <TrackerResultCard dateObj={now} data={data} projectContext={projectContext} />
    </div>
  );
};


const TimeStarTracker = ({ projectContext }) => {
  const [activeTab, setActiveTab] = useState('today');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [useJieQiMonth, setUseJieQiMonth] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().split('T')[0]);
  
  const hasDungThan = projectContext?.dungThan && projectContext?.dungThan !== 'Chưa xác định';

  // Tab Giờ
  const currentHourIdx = THOI_THAN.findIndex(h => {
    const hr = new Date().getHours();
    if (h.startH === 23) return hr >= 23 || hr < 1;
    return hr >= h.startH && hr < h.endH;
  });
  const [selectedHourIdx, setSelectedHourIdx] = useState(currentHourIdx !== -1 ? currentHourIdx : 0);

  // Search
  const [searchTargetStar, setSearchTargetStar] = useState(9);
  const [searchDirection, setSearchDirection] = useState(0);
  const [searchLimit, setSearchLimit] = useState(30);

  // Sinh danh sách 12 khối Tháng
  const monthBlocks = useMemo(() => {
    const blocks = [];
    const validYear = parseInt(selectedYear) || new Date().getFullYear();
    for (let m = 1; m <= 12; m++) {
      let targetDate;
      let titleLabel = "";
      if (useJieQiMonth) {
         targetDate = new Date(validYear, m, 15);
         titleLabel = `Tháng ${m} Tiết Khí`;
      } else {
         targetDate = new Date(validYear, m - 1, 15);
         titleLabel = `Tháng ${m} Dương`;
      }

      const mData = getTimeStars(targetDate);
      blocks.push({
        mIndex: m,
        title: titleLabel,
        monthGZ: mData.monthGZ,
        star: mData.monthly,
        term: mData.termName,
        dateObjForSelection: targetDate
      });
    }
    return blocks;
  }, [selectedYear, useJieQiMonth]);

  const derivedStars = useMemo(() => {
    // Để đảm bảo năm phong thủy đúng, lấy ngày 15/07 (giữa năm) vì 15/01 chưa qua Lập Xuân
    const dateForYear  = new Date(selectedYear, 6, 15);
    
    // Tìm khối Block đang được chọn để lấy mốc ngày chính xác
    const selectedBlock = monthBlocks.find(b => b.mIndex === selectedMonth);
    const dateForMonth = selectedBlock ? selectedBlock.dateObjForSelection : new Date(selectedYear, selectedMonth - 1, 15);
    
    const dateForDay   = new Date(selectedDateStr);
    return {
      annual:  getTimeStars(dateForYear),
      monthly: getTimeStars(dateForMonth),
      daily:   getTimeStars(dateForDay),
    };
  }, [selectedYear, selectedMonth, selectedDateStr, monthBlocks]);

  // Year Can Chi Display Helper
  const displayYearGanZhi = useMemo(() => {
     try {
       const yLunar = Lunar.fromSolar(Solar.fromDate(new Date(parseInt(selectedYear) || 2026, 6, 15)));
       return yLunar.getYearInGanZhiExact(); // Trả về dạng Can Chi tiếng Trung, hàm tự map hoặc để nguyên
     } catch(e) { return ''; }
  }, [selectedYear]);

  const searchResults = useMemo(() => {
    if (activeTab !== 'search') return [];
    const results = [];
    const startDate = new Date();
    startDate.setHours(12, 0, 0, 0);
    const targetStarNum = parseInt(searchTargetStar);
    const targetDirIdx  = parseInt(searchDirection);

    for (let i = 0; i < searchLimit; i++) {
      const checkDate = new Date(startDate);
      checkDate.setDate(checkDate.getDate() + i);
      try {
        const checkData = getTimeStars(checkDate);
        if (!checkData || checkData.daily == null) continue;
        const grid = flyStar(checkData.daily, true);
        if (grid[targetDirIdx] === targetStarNum) {
          results.push({ date: new Date(checkDate), data: checkData }); // Giữ object truyền vào Date
        }
      } catch(e) { continue; }
    }
    return results;
  }, [activeTab, searchTargetStar, searchDirection, searchLimit]);

  const tabs = [
    { id: 'today',  label: '🔥 Hôm Nay', color: 'bg-red-600' },
    { id: 'year',   label: 'Năm',     color: 'bg-indigo-600' },
    { id: 'month',  label: 'Tháng',   color: 'bg-indigo-600' },
    { id: 'day',    label: 'Ngày',    color: 'bg-indigo-600' },
    { id: 'hour',   label: 'Giờ',     color: 'bg-indigo-600' },
    { id: 'search', label: '🔍 Truy Vấn', color: 'bg-amber-600' },
  ];

  return (
    <div className={`bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl md:p-8 shadow-2xl border ${hasDungThan ? 'p-1 mt-6 border-emerald-500/50 shadow-emerald-900/40' : 'p-4 border-slate-700'}`}>
      
      {/* Banner Dụng Thần (chỉ hiện khi có project) */}
      {projectContext && (
        <div className={`mb-6 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between shadow-sm outline outline-1 -outline-offset-1 ${hasDungThan ? 'bg-gradient-to-r from-emerald-900/60 to-slate-800 text-emerald-100 outline-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)] mx-2 mt-2 md:mx-0 md:mt-0' : 'bg-slate-800 text-slate-300 outline-slate-600'}`}>
           <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-inner ${hasDungThan ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                 <UserCheck size={20} />
              </div>
              <div>
                 <h3 className="font-black tracking-widest uppercase text-xs md:text-sm">Hồ sơ trạch cát: {projectContext.clientName}</h3>
                 <p className="text-[11px] md:text-xs opacity-80 font-medium mt-0.5">Bảng ngày giờ tính toán riêng cho Dự Án Mệnh Chủ</p>
              </div>
           </div>
           <div className="mt-4 md:mt-0 bg-black/40 px-5 py-2.5 rounded-xl border border-white/10 text-center drop-shadow">
              <span className="block text-[10px] uppercase font-bold opacity-70 tracking-widest mb-1">Hợp Mệnh Quái</span>
              <span className={`text-base md:text-lg font-black uppercase ${hasDungThan ? 'text-emerald-400' : 'text-slate-400'}`}>{projectContext.dungThan}</span>
           </div>
        </div>
      )}

      {/* Header + Tabs */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 md:mb-8 gap-4 border-b border-white/10 pb-4 px-4 md:px-0">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2"><Clock className="text-amber-400"/> Tra Cứu Nhật Cát</h2>
          <p className="text-slate-400 font-medium mt-1 text-sm">Chuẩn quỹ đạo theo Tiết Khí</p>
        </div>
        <div className="flex flex-wrap bg-slate-800 p-1.5 rounded-2xl border border-slate-700 shadow-inner w-full xl:w-auto gap-1 text-xs md:text-sm">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex-1 xl:flex-none px-3 md:px-5 py-2 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === t.id ? `${t.color} text-white shadow-lg` : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 md:px-0">
         {activeTab === 'today' && <TodayWidget projectContext={projectContext} />}
      </div>

      {/* Tùy chọn Tra cứu cơ bản (Năm/Tháng/Ngày/Giờ) */}
      {(activeTab === 'year' || activeTab === 'month' || activeTab === 'day' || activeTab === 'hour') && (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8 items-start">
          {/* CỘT TRÁI: Nhập liệu */}
          <div className="space-y-5">
            
            {activeTab === 'year' && (
              <div className="bg-white/5 p-6 rounded-3xl border border-white/10 animate-slide-in-right space-y-4">
                <label className="text-amber-400 font-bold uppercase tracking-widest text-sm block">Năm Tra Cứu</label>
                <div className="relative">
                   <input type="number" value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value) || 2025)}
                     className="w-full bg-slate-800 text-white font-black text-3xl px-6 py-5 rounded-2xl border-2 border-slate-600 focus:border-indigo-500 outline-none text-center" />
                   <div className="absolute top-2 right-4 text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded">
                      {derivedStars.annual.yearGZ || displayYearGanZhi}
                   </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {[-1, 0, 1].map(offset => {
                     const y = (parseInt(selectedYear) || 2025) + offset;
                     return <button key={y} onClick={() => setSelectedYear(y)}
                       className={`py-3 rounded-xl font-bold transition-colors cursor-pointer ${y === parseInt(selectedYear) ? 'bg-amber-500 text-slate-900 shadow-md scale-105' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{y}</button>;
                  })}
                </div>
                
                {/* Hiển thị Cảnh báo dưới tab năm tra cứu */}
                {derivedStars.annual.annual && <AnnualWarnings centerStar={derivedStars.annual.annual} year={selectedYear} />}
              </div>
            )}

            {activeTab === 'month' && (
              <div className="animate-fade-in animate-slide-in-right">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
                  <label className="text-[10px] md:text-xs text-amber-400 font-bold uppercase tracking-widest block ml-1">Chọn tháng trong năm</label>
                  
                  <div className="flex items-center gap-4">
                     {/* Toggle Dương Lịch / Lịch Tiết Khí cho Tháng */}
                     <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700 cursor-pointer">
                        <button onClick={() => setUseJieQiMonth(false)} className={`text-[10px] px-3 py-1 rounded-md font-bold transition-colors ${!useJieQiMonth ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>Dương Lịch</button>
                        <button onClick={() => setUseJieQiMonth(true)} className={`text-[10px] px-3 py-1 rounded-md font-bold transition-colors ${useJieQiMonth ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>Lịch Tiết Khí</button>
                     </div>

                     <div className="flex items-center gap-2">
                       <button onClick={() => setSelectedYear(y => parseInt(y)-1)} className="text-slate-400 hover:text-white px-2 cursor-pointer font-bold bg-slate-800 rounded p-1">&lt;</button>
                       <span className="text-white font-black tracking-wider w-16 text-center">{selectedYear}</span>
                       <button onClick={() => setSelectedYear(y => parseInt(y)+1)} className="text-slate-400 hover:text-white px-2 cursor-pointer font-bold bg-slate-800 rounded p-1">&gt;</button>
                     </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {monthBlocks.map(b => (
                    <div key={b.mIndex} onClick={() => setSelectedMonth(b.mIndex)}
                      className={`p-3 rounded-2xl cursor-pointer transition-all border flex flex-col justify-between min-h-[90px] ${b.mIndex === selectedMonth ? 'bg-indigo-600/30 border-indigo-500 ring-2 ring-indigo-500/50 shadow-lg scale-105' : 'bg-slate-800/60 border-slate-700 hover:bg-slate-700 hover:border-slate-500'}`}>
                       <div className="flex justify-between items-start">
                         <span className={`text-sm font-black ${b.mIndex === selectedMonth ? 'text-indigo-300' : 'text-slate-300'}`}>{b.title}</span>
                         <span className="text-[9px] uppercase font-bold text-slate-400 bg-black/30 px-1.5 py-0.5 rounded tracking-tighter" title="Tiết Khí Quyết Định Cửu Tinh">{b.term}</span>
                       </div>
                       <div className="text-center flex-1 flex items-center justify-center pt-2">
                          <span className={`text-xs font-bold ${b.mIndex === selectedMonth ? 'text-amber-400' : 'text-slate-400'}`}>{b.monthGZ}</span>
                       </div>
                       <div className="flex justify-between items-center border-t border-white/10 pt-2 mt-2">
                          <span className="text-[9px] text-slate-500 font-bold">Sao T.Cung</span>
                          <span className={`text-lg font-black ${getStarColor(b.star)}`}>{b.star}</span>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(activeTab === 'day' || activeTab === 'hour') && (
              <div className="animate-fade-in flex-1 flex flex-col">
                <label className="text-[10px] text-amber-400 font-bold uppercase tracking-widest mb-2 block ml-1">Chọn Ngày</label>
                <MiniCalendar selectedDateStr={selectedDateStr} onSelect={setSelectedDateStr} />

                {activeTab === 'hour' && (
                   <div className="mt-6 animate-slide-up">
                      <label className="text-[10px] text-amber-400 font-bold uppercase tracking-widest mb-2 block ml-1">Chọn Khung Giờ</label>
                      <div className="grid grid-cols-4 gap-2">
                        {['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'].map((h, idx) => {
                           const startH = (idx * 2 - 1 + 24) % 24;
                           const endH = (startH + 2) % 24;
                           const isActive = selectedHourIdx === idx;
                           const styling = getHourStyles(startH, derivedStars.daily.fsMonth);
                           
                           return (
                             <button 
                               key={idx} onClick={() => setSelectedHourIdx(idx)}
                               style={{ backgroundColor: styling.bg, color: styling.text, opacity: isActive ? 1 : 0.8 }}
                               className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center transition-all ${isActive ? 'ring-2 ring-amber-400 scale-105 shadow-xl font-black' : 'hover:opacity-100 hover:scale-105 border border-slate-700'}`}
                             >
                                <span className="text-sm">{h}</span>
                                <span className="text-[8px] opacity-70 tracking-tighter">{startH}-{endH}h</span>
                             </button>
                           )
                        })}
                      </div>
                   </div>
                )}

                {/* Info Text */}
                <div className="flex flex-col gap-2 mt-4 text-center sm:text-left text-sm">
                   <div className="bg-slate-800/80 rounded-xl py-3 px-4 border border-slate-600 text-slate-300 font-medium">
                       Năm {derivedStars.daily.yearGZ}, Tháng {derivedStars.daily.monthGZ}, Ngày {derivedStars.daily.dayGZ}
                   </div>
                   <div className="bg-indigo-900/40 rounded-xl py-3 px-4 border border-indigo-700 max-w-full overflow-hidden text-amber-400 font-bold">
                       Tiết {derivedStars.daily.termName} (Từ {formatTietKhiTime(derivedStars.daily.termTime)} đến {formatTietKhiTime(derivedStars.daily.nextTermTime)})
                   </div>
                </div>
              </div>
            )}
          </div>

          {/* CỘT PHẢI: Hiển thị MiniGrid theo Tab */}
          <div className="flex flex-col items-center w-full">
            {activeTab === 'year' && derivedStars.annual.annual && (
              <div className="animate-slide-up animate-slide-in-right w-full">
                <MiniGrid centerStar={derivedStars.annual.annual} title="Tinh Bàn Năm" subtitle={`Năm ${selectedYear} (${derivedStars.annual.yearGZ})`} canChi={[derivedStars.annual.yearGZ].filter(Boolean)} />
              </div>
            )}
            {activeTab === 'month' && derivedStars.monthly.monthly && (
              <div className="animate-slide-up w-full"><MiniGrid centerStar={derivedStars.monthly.monthly} title="Tinh Bàn Tháng" subtitle={`Tháng PT ${derivedStars.monthly.fsMonth} - Năm ${derivedStars.monthly.yearGZ}`} canChi={[derivedStars.monthly.yearGZ, derivedStars.monthly.monthGZ].filter(Boolean)} /></div>
            )}
            {activeTab === 'day' && derivedStars.daily.daily && (
              <div className="animate-slide-up w-full h-full flex flex-col">
                <MiniGrid centerStar={derivedStars.daily.daily} title="Tinh Bàn Lưu Nhật" subtitle={formatDateDMY(selectedDateStr)} canChi={[derivedStars.daily.yearGZ, derivedStars.daily.monthGZ, derivedStars.daily.dayGZ].filter(Boolean)} />
              </div>
            )}
            {activeTab === 'hour' && derivedStars.daily.daily && (
              <div className="animate-slide-up w-full h-full flex flex-col">
                 {(() => {
                    const hourlyDataList = getHourlyStars(selectedDateStr);
                    const selectedHourData = hourlyDataList[selectedHourIdx];
                    return (
                       <MiniGrid centerStar={selectedHourData.centerStar} title={`Tinh Bàn Giờ ${selectedHourData.name}`} subtitle={formatDateDMY(selectedDateStr)} canChi={[`Ngày ${derivedStars.daily.dayGZ}`, `Giờ ${selectedHourData.name}`]} />
                    );
                 })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Màn hình Truy Vấn Mới (Kiểu ngaylanh.com) */}
      {activeTab === 'search' && (
        <div className="animate-slide-up flex flex-col gap-6 w-full">
          
          {/* TRUY VẤN - FILTER BAR */}
          <div className="bg-white/5 p-4 md:p-6 rounded-3xl border border-white/10 flex flex-col xl:flex-row gap-4 items-center">
            
            <div className="w-full xl:min-w-[320px] flex gap-2">
              <div className="flex-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block">Tìm sao</label>
                <select value={searchTargetStar} onChange={e => setSearchTargetStar(Number(e.target.value))} className="w-full bg-slate-800 text-white font-bold p-3 rounded-xl border border-slate-600 outline-none">
                  {[1,2,3,4,5,6,7,8,9].map(s => <option key={s} value={s}>Sao {s} - {STAR_PROPERTIES[s]?.name}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block">Tại Phương</label>
                <select value={searchDirection} onChange={e => setSearchDirection(Number(e.target.value))} className="w-full bg-slate-800 text-white font-bold p-3 rounded-xl border border-slate-600 outline-none">
                  {LABELS.map((lb, idx) => <option key={idx} value={idx}>{lb.dir} ({lb.tri || 'Trung'})</option>)}
                </select>
              </div>
            </div>

            <div className="w-full xl:w-auto">
              <label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block">Phạm vi quét</label>
              <select value={searchLimit} onChange={e => setSearchLimit(Number(e.target.value))} className="w-full bg-slate-800 text-white font-bold p-3 rounded-xl border border-slate-600 outline-none">
                <option value={30}>30 ngày</option><option value={90}>3 tháng</option><option value={365}>1 năm</option>
              </select>
            </div>
            
          </div>

          {/* TRUY VẤN - RESULTS */}
          <div className="bg-slate-800/80 rounded-3xl border border-slate-700 p-4 md:p-6 shadow-md max-h-[800px] overflow-y-auto custom-scrollbar">
            <h3 className="text-white font-black mb-6 text-xl bg-slate-800 sticky -top-6 py-4 z-10 mx-[-16px] px-4 md:mx-[-24px] md:px-6 rounded-t-3xl border-b border-white/5 bg-opacity-95 backdrop-blur">
              <span className="text-amber-500">{searchResults.length}</span> Ngày thỏa mãn điều kiện
            </h3>
            
            {searchResults.length === 0 ? (
               <div className="py-12 text-center text-slate-500 italic">Không tìm thấy ngày phù hợp. Thử mở rộng phạm vi tịnh tiến.</div>
            ) : (
               <div className="space-y-8">
                 {searchResults.map((res, idx) => (
                    <TrackerResultCard 
                      key={idx} 
                      dateObj={res.date} 
                      data={res.data} 
                      searchTargetStar={searchTargetStar}
                      searchDirection={searchDirection}
                      projectContext={projectContext}
                    />
                 ))}
               </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default TimeStarTracker;

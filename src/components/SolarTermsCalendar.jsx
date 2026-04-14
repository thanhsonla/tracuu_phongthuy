import React, { useState, useMemo } from 'react';
import { Sun, ChevronLeft, ChevronRight, Leaf, Snowflake, Flame, CloudRain } from 'lucide-react';
import { Solar, Lunar } from 'lunar-javascript';

// 24 tiết khí với thông tin chi tiết
const JIEQI_DATA = {
  '小寒': { vn: 'Tiểu Hàn', meaning: 'Rét nhẹ', season: 'winter', order: 1 },
  '大寒': { vn: 'Đại Hàn', meaning: 'Rét đậm', season: 'winter', order: 2 },
  '立春': { vn: 'Lập Xuân', meaning: 'Bắt đầu mùa Xuân', season: 'spring', order: 3 },
  '雨水': { vn: 'Vũ Thủy', meaning: 'Nước mưa', season: 'spring', order: 4 },
  '惊蛰': { vn: 'Kinh Trập', meaning: 'Côn trùng thức giấc', season: 'spring', order: 5 },
  '春分': { vn: 'Xuân Phân', meaning: 'Giữa mùa Xuân', season: 'spring', order: 6 },
  '清明': { vn: 'Thanh Minh', meaning: 'Trời trong sáng', season: 'spring', order: 7 },
  '谷雨': { vn: 'Cốc Vũ', meaning: 'Mưa nuôi lúa', season: 'spring', order: 8 },
  '立夏': { vn: 'Lập Hạ', meaning: 'Bắt đầu mùa Hè', season: 'summer', order: 9 },
  '小满': { vn: 'Tiểu Mãn', meaning: 'Lúa bắt đầu trổ', season: 'summer', order: 10 },
  '芒种': { vn: 'Mang Chủng', meaning: 'Lúa chín', season: 'summer', order: 11 },
  '夏至': { vn: 'Hạ Chí', meaning: 'Giữa mùa Hè', season: 'summer', order: 12 },
  '小暑': { vn: 'Tiểu Thử', meaning: 'Nóng nhẹ', season: 'summer', order: 13 },
  '大暑': { vn: 'Đại Thử', meaning: 'Nóng nhất', season: 'summer', order: 14 },
  '立秋': { vn: 'Lập Thu', meaning: 'Bắt đầu mùa Thu', season: 'autumn', order: 15 },
  '处暑': { vn: 'Xử Thử', meaning: 'Hết nóng', season: 'autumn', order: 16 },
  '白露': { vn: 'Bạch Lộ', meaning: 'Sương trắng', season: 'autumn', order: 17 },
  '秋分': { vn: 'Thu Phân', meaning: 'Giữa mùa Thu', season: 'autumn', order: 18 },
  '寒露': { vn: 'Hàn Lộ', meaning: 'Sương lạnh', season: 'autumn', order: 19 },
  '霜降': { vn: 'Sương Giáng', meaning: 'Sương mù xuống', season: 'autumn', order: 20 },
  '立冬': { vn: 'Lập Đông', meaning: 'Bắt đầu mùa Đông', season: 'winter', order: 21 },
  '小雪': { vn: 'Tiểu Tuyết', meaning: 'Tuyết nhẹ', season: 'winter', order: 22 },
  '大雪': { vn: 'Đại Tuyết', meaning: 'Tuyết lớn', season: 'winter', order: 23 },
  '冬至': { vn: 'Đông Chí', meaning: 'Giữa mùa Đông', season: 'winter', order: 24 },
};

// Tiết (tiết lệnh) - đánh dấu tháng phong thủy mới
const JIE_TERMS = ['立春', '惊蛰', '清明', '立夏', '芒种', '小暑', '立秋', '白露', '寒露', '立冬', '大雪', '小寒'];

const SEASON_CONFIG = {
  spring: {
    label: 'Mùa Xuân',
    icon: Leaf,
    gradient: 'from-emerald-600/20 to-green-500/10',
    border: 'border-emerald-500/40',
    text: 'text-emerald-400',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    glow: 'shadow-emerald-500/10',
    emoji: '🌱',
  },
  summer: {
    label: 'Mùa Hạ',
    icon: Flame,
    gradient: 'from-red-600/20 to-orange-500/10',
    border: 'border-red-500/40',
    text: 'text-red-400',
    badge: 'bg-red-500/20 text-red-300 border-red-500/30',
    glow: 'shadow-red-500/10',
    emoji: '☀️',
  },
  autumn: {
    label: 'Mùa Thu',
    icon: CloudRain,
    gradient: 'from-amber-600/20 to-yellow-500/10',
    border: 'border-amber-500/40',
    text: 'text-amber-400',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    glow: 'shadow-amber-500/10',
    emoji: '🍂',
  },
  winter: {
    label: 'Mùa Đông',
    icon: Snowflake,
    gradient: 'from-blue-600/20 to-cyan-500/10',
    border: 'border-blue-500/40',
    text: 'text-blue-400',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    glow: 'shadow-blue-500/10',
    emoji: '❄️',
  },
};

const SEASON_ORDER = ['spring', 'summer', 'autumn', 'winter'];

/**
 * Tính tất cả 24 tiết khí trong một năm bằng lunar-javascript
 * Sử dụng phương pháp duyệt qua từng tháng âm lịch
 */
function getSolarTermsForYear(year) {
  const terms = [];
  const seen = new Set();

  // Duyệt từng ngày đầu mỗi tháng dương lịch, lấy prevJieQi và nextJieQi
  // Cách chính xác: duyệt 24 lần từ đầu năm
  for (let month = 1; month <= 12; month++) {
    // Kiểm tra 2 thời điểm trong mỗi tháng (ngày 1 và ngày 16) để bắt cả 2 tiết khí
    for (const day of [1, 16]) {
      try {
        const solar = Solar.fromYmd(year, month, day);
        const lunar = Lunar.fromSolar(solar);
        
        // Lấy tiết khí trước và sau
        const prevJQ = lunar.getPrevJieQi(true);
        const nextJQ = lunar.getNextJieQi(true);
        
        for (const jq of [prevJQ, nextJQ]) {
          if (!jq) continue;
          const name = jq.getName();
          const jqSolar = jq.getSolar();
          const jqYear = jqSolar.getYear();
          
          // Chỉ lấy tiết khí thuộc năm được chọn
          if (jqYear !== year) continue;
          
          const key = `${name}-${jqSolar.toYmdHms()}`;
          if (seen.has(key)) continue;
          seen.add(key);

          const data = JIEQI_DATA[name];
          if (!data) continue;

          // Điều chỉnh múi giờ: Lunar JS mặc định GMT+8, trừ 1 giờ thành GMT+7 (VN)
          const dateStr = jqSolar.toYmdHms();
          const d = new Date(dateStr.replace(' ', 'T'));
          d.setHours(d.getHours() - 1);

          const pad = n => String(n).padStart(2, '0');
          const vnDate = `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
          const vnTime = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
          const dayOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'][d.getDay()];

          terms.push({
            nameCN: name,
            nameVN: data.vn,
            meaning: data.meaning,
            season: data.season,
            order: data.order,
            date: vnDate,
            time: vnTime,
            dayOfWeek,
            dateObj: d,
            isJie: JIE_TERMS.includes(name), // Là tiết lệnh (mốc phong thủy)
          });
        }
      } catch (e) {
        continue;
      }
    }
  }

  // Sắp xếp theo thời gian
  terms.sort((a, b) => a.dateObj - b.dateObj);
  return terms;
}

// --- Check nếu tiết khí đang hoạt động (hiện tại nằm trong khoảng) ---
function getCurrentTermIndex(terms) {
  const now = new Date();
  for (let i = terms.length - 1; i >= 0; i--) {
    if (now >= terms[i].dateObj) return i;
  }
  return -1;
}

export default function SolarTermsCalendar() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [view, setView] = useState('grid'); // 'grid' | 'list'

  const terms = useMemo(() => getSolarTermsForYear(selectedYear), [selectedYear]);
  const currentTermIdx = useMemo(() => {
    if (selectedYear !== currentYear) return -1;
    return getCurrentTermIndex(terms);
  }, [terms, selectedYear, currentYear]);

  // Nhóm theo mùa
  const termsBySeason = useMemo(() => {
    const groups = {};
    for (const s of SEASON_ORDER) groups[s] = [];
    terms.forEach(t => {
      if (groups[t.season]) groups[t.season].push(t);
    });
    return groups;
  }, [terms]);

  const yearOptions = [];
  for (let y = currentYear - 50; y <= currentYear + 50; y++) yearOptions.push(y);

  return (
    <div>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
            <Sun className="text-amber-400" /> Lịch Tiết Khí
          </h2>
          <p className="text-slate-400 font-medium mt-1 text-sm">24 tiết khí trong năm — Nhị Thập Tứ Tiết Khí</p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
            <button onClick={() => setView('grid')}
              className={`text-[10px] px-3 py-1.5 rounded-md font-bold transition-colors cursor-pointer ${view === 'grid' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>
              Lưới
            </button>
            <button onClick={() => setView('list')}
              className={`text-[10px] px-3 py-1.5 rounded-md font-bold transition-colors cursor-pointer ${view === 'list' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>
              Danh Sách
            </button>
          </div>

          {/* Year selector */}
          <div className="flex items-center bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <button onClick={() => setSelectedYear(y => y - 1)}
              className="px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer">
              <ChevronLeft size={18} />
            </button>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(parseInt(e.target.value))}
              className="bg-transparent text-white font-black text-lg px-2 py-2 outline-none text-center appearance-none cursor-pointer min-w-[80px]"
            >
              {yearOptions.map(y => (
                <option key={y} value={y} className="bg-slate-800">{y}</option>
              ))}
            </select>
            <button onClick={() => setSelectedYear(y => y + 1)}
              className="px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Quick year buttons */}
          <div className="flex gap-1">
            {[-1, 0, 1].map(offset => {
              const y = currentYear + offset;
              return (
                <button key={y} onClick={() => setSelectedYear(y)}
                  className={`px-3 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    y === selectedYear 
                      ? 'bg-amber-500 text-slate-900 shadow-md' 
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
                  }`}>
                  {y}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-6">
        {SEASON_ORDER.map(s => {
          const cfg = SEASON_CONFIG[s];
          return (
            <div key={s} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${cfg.badge} text-xs font-bold`}>
              <span>{cfg.emoji}</span> {cfg.label}
            </div>
          );
        })}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/20 text-indigo-300 text-xs font-bold">
          ⚡ Tiết Lệnh (Mốc tháng phong thủy)
        </div>
      </div>

      {/* Grid View */}
      {view === 'grid' && (
        <div className="space-y-6 animate-slide-up">
          {SEASON_ORDER.map(season => {
            const cfg = SEASON_CONFIG[season];
            const seasonTerms = termsBySeason[season];
            if (!seasonTerms || seasonTerms.length === 0) return null;
            const Icon = cfg.icon;

            return (
              <div key={season} className={`bg-gradient-to-r ${cfg.gradient} rounded-2xl border ${cfg.border} p-4 md:p-5 shadow-lg ${cfg.glow}`}>
                {/* Season Header */}
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${cfg.badge} border`}>
                    <Icon size={16} />
                  </div>
                  <h3 className={`font-black uppercase tracking-widest text-sm ${cfg.text}`}>
                    {cfg.emoji} {cfg.label}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {seasonTerms.map((term, idx) => {
                    const globalIdx = terms.findIndex(t => t.nameVN === term.nameVN && t.date === term.date);
                    const isCurrent = globalIdx === currentTermIdx;
                    const isPast = globalIdx < currentTermIdx && selectedYear === currentYear;

                    return (
                      <div key={idx}
                        className={`relative group rounded-xl p-3.5 border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl
                          ${isCurrent 
                            ? `bg-amber-500/20 border-amber-400/60 shadow-[0_0_20px_rgba(251,191,36,0.3)] ring-2 ring-amber-400/50` 
                            : isPast
                              ? 'bg-slate-800/60 border-slate-700/50 opacity-60'
                              : 'bg-slate-800/80 border-slate-700/50 hover:border-slate-500'
                          }`}
                      >
                        {isCurrent && (
                          <div className="absolute -top-2 -right-2 bg-amber-500 text-slate-900 text-[9px] font-black px-2 py-0.5 rounded-full shadow-md animate-bounce uppercase tracking-widest">
                            Hiện tại
                          </div>
                        )}

                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className={`font-black text-base md:text-lg leading-tight ${isCurrent ? 'text-amber-300' : 'text-white'}`}>
                              {term.nameVN}
                            </h4>
                            <p className="text-[10px] text-slate-500 font-bold mt-0.5">{term.nameCN}</p>
                          </div>
                          {term.isJie && (
                            <span className="text-[8px] bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 px-1.5 py-0.5 rounded font-black uppercase tracking-wider flex items-center gap-0.5 whitespace-nowrap">
                              ⚡ Tiết Lệnh
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-400 font-medium mb-3 italic">"{term.meaning}"</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className={`text-sm font-black ${isCurrent ? 'text-amber-400' : 'text-slate-300'}`}>
                              📅 {term.date}
                            </div>
                            <div className={`text-xs font-bold ${isCurrent ? 'text-amber-500/80' : 'text-slate-500'}`}>
                              ⏰ {term.time}
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium">{term.dayOfWeek}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="animate-slide-up">
          <div className="bg-slate-800/60 rounded-2xl border border-slate-700/50 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-[40px_1fr_1fr_120px_80px_90px] md:grid-cols-[50px_1.2fr_1fr_140px_90px_100px] items-center bg-slate-900/80 border-b border-slate-700 px-3 md:px-4 py-3 text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500">
              <span>#</span>
              <span>Tiết Khí</span>
              <span>Ý Nghĩa</span>
              <span>Ngày</span>
              <span>Giờ</span>
              <span>Thứ</span>
            </div>

            {/* Rows */}
            {terms.map((term, idx) => {
              const isCurrent = idx === currentTermIdx;
              const isPast = idx < currentTermIdx && selectedYear === currentYear;
              const seasonCfg = SEASON_CONFIG[term.season];

              return (
                <div key={idx}
                  className={`grid grid-cols-[40px_1fr_1fr_120px_80px_90px] md:grid-cols-[50px_1.2fr_1fr_140px_90px_100px] items-center px-3 md:px-4 py-3 border-b border-slate-800/50 transition-all
                    ${isCurrent 
                      ? 'bg-amber-500/15 shadow-[inset_0_0_30px_rgba(251,191,36,0.1)]' 
                      : isPast 
                        ? 'opacity-50' 
                        : 'hover:bg-slate-800/40'
                    }`}
                >
                  <span className={`text-xs font-black ${isCurrent ? 'text-amber-400' : 'text-slate-600'}`}>{idx + 1}</span>
                  
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${seasonCfg.text}`}>{seasonCfg.emoji}</span>
                    <div>
                      <span className={`font-black text-sm ${isCurrent ? 'text-amber-300' : 'text-white'}`}>{term.nameVN}</span>
                      {term.isJie && <span className="ml-1.5 text-[8px] bg-indigo-500/30 text-indigo-300 px-1 py-0.5 rounded font-bold">⚡</span>}
                    </div>
                  </div>
                  
                  <span className="text-xs text-slate-400 font-medium italic truncate">{term.meaning}</span>
                  
                  <span className={`text-xs font-bold ${isCurrent ? 'text-amber-400' : 'text-slate-300'}`}>{term.date}</span>
                  
                  <span className={`text-xs font-bold ${isCurrent ? 'text-amber-500' : 'text-slate-400'}`}>{term.time}</span>
                  
                  <span className="text-[10px] text-slate-500 font-medium">{term.dayOfWeek}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="mt-6 bg-slate-800/60 rounded-2xl border border-slate-700/50 p-4 md:p-5">
        <h3 className="text-amber-400 font-black uppercase tracking-widest text-xs mb-3 flex items-center gap-1.5">
          📖 Giải Thích Về Tiết Khí
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400 leading-relaxed">
          <div>
            <p className="mb-2">
              <strong className="text-slate-300">Tiết Khí (節氣)</strong> là hệ thống 24 mốc thời gian trong năm, chia theo quỹ đạo Mặt Trời trên Hoàng Đạo (mỗi tiết cách nhau 15°). Đây là nền tảng lịch pháp cổ truyền phương Đông.
            </p>
            <p>
              <strong className="text-indigo-300">⚡ Tiết Lệnh</strong> — 12 tiết chính (Lập Xuân, Kinh Trập, Thanh Minh...) đánh dấu mốc chuyển tháng phong thủy, dùng trong Huyền Không Phi Tinh, Bát Tự...
            </p>
          </div>
          <div>
            <p className="mb-2">
              <strong className="text-slate-300">Trung Khí (中氣)</strong> — 12 tiết phụ (Vũ Thủy, Xuân Phân, Cốc Vũ...) đánh dấu giữa tháng phong thủy. Cả Tiết và Trung hợp thành 24 tiết khí.
            </p>
            <p>
              <strong className="text-amber-300">Ứng dụng</strong> — Trong phong thủy Huyền Không, tiết khí quyết định sao Cửu Tinh nhập trung cung từng tháng, là cơ sở tính toán vượng suy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

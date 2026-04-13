import React, { useState, useMemo } from 'react';
import { TrendingUp, ChevronLeft, ChevronRight, AlertTriangle, Shield, ShieldAlert, ShieldCheck, Calendar, Zap, Info } from 'lucide-react';
import { flyStar } from '../services/GridGeneratorService';
import { getTimeStars, getStarColor } from '../utils/helpers';
import { VIEW_PERMUTATIONS, LABELS, STAR_PROPERTIES } from '../data/constants';
import { Solar, Lunar } from 'lunar-javascript';

// =====================================================
// HẰNG SỐ & HELPERS
// =====================================================

// Ngũ hành của sao
const ELEMENT_MAP = { 1:'Thủy', 2:'Thổ', 3:'Mộc', 4:'Mộc', 5:'Thổ', 6:'Kim', 7:'Kim', 8:'Thổ', 9:'Hỏa' };
const SINH = { 'Thủy':'Mộc', 'Mộc':'Hỏa', 'Hỏa':'Thổ', 'Thổ':'Kim', 'Kim':'Thủy' };
const KHAC = { 'Thủy':'Hỏa', 'Hỏa':'Kim', 'Kim':'Mộc', 'Mộc':'Thổ', 'Thổ':'Thủy' };

const HUNG_STARS = [5, 2, 3, 7];
const CAT_STARS  = [8, 9, 1, 6, 4];

const starHex = (s) => ({
  1:'#2563EB', 2:'#92400E', 3:'#059669', 4:'#059669',
  5:'#B45309', 6:'#64748B', 7:'#64748B', 8:'#92400E', 9:'#DC2626'
}[s] || '#333');

// 12 tháng Tiết Khí mapping
const TIET_KHI_MONTHS = [
  { fsMonth: 1,  name: 'Lập Xuân → Kinh Trập', shortName: 'Lập Xuân' },
  { fsMonth: 2,  name: 'Kinh Trập → Thanh Minh', shortName: 'Kinh Trập' },
  { fsMonth: 3,  name: 'Thanh Minh → Lập Hạ', shortName: 'Thanh Minh' },
  { fsMonth: 4,  name: 'Lập Hạ → Mang Chủng', shortName: 'Lập Hạ' },
  { fsMonth: 5,  name: 'Mang Chủng → Tiểu Thử', shortName: 'Mang Chủng' },
  { fsMonth: 6,  name: 'Tiểu Thử → Lập Thu', shortName: 'Tiểu Thử' },
  { fsMonth: 7,  name: 'Lập Thu → Bạch Lộ', shortName: 'Lập Thu' },
  { fsMonth: 8,  name: 'Bạch Lộ → Hàn Lộ', shortName: 'Bạch Lộ' },
  { fsMonth: 9,  name: 'Hàn Lộ → Lập Đông', shortName: 'Hàn Lộ' },
  { fsMonth: 10, name: 'Lập Đông → Đại Tuyết', shortName: 'Lập Đông' },
  { fsMonth: 11, name: 'Đại Tuyết → Tiểu Hàn', shortName: 'Đại Tuyết' },
  { fsMonth: 12, name: 'Tiểu Hàn → Lập Xuân', shortName: 'Tiểu Hàn' },
];

// Thông tin cảnh báo hung tinh
const HUNG_STAR_INFO = {
  5: {
    title: 'Ngũ Hoàng Liêm Trinh',
    short: 'Ngũ Hoàng',
    desc: 'Hung tinh mạnh nhất, chủ bệnh tật, tai họa, biến cố lớn. Tuyệt đối không động thổ, sửa chữa.',
    remedy: 'Hóa giải: Đặt chuông đồng, la bàn đồng, quả cầu kim loại nặng.',
    severity: 'critical',
    colors: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', badge: 'bg-red-600', icon: 'text-red-500' }
  },
  2: {
    title: 'Nhị Hắc Cự Môn',
    short: 'Nhị Hắc',
    desc: 'Sao bệnh phù, chủ ốm đau, suy nhược, phụ nữ và người già dễ bị ảnh hưởng.',
    remedy: 'Hóa giải: Hồ lô đồng, chuông gió kim loại, vật phẩm Kim khí.',
    severity: 'high',
    colors: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700', badge: 'bg-orange-500', icon: 'text-orange-500' }
  },
  3: {
    title: 'Tam Bích Lộc Tồn',
    short: 'Tam Bích',
    desc: 'Sao thị phi, gây cãi vã, kiện tụng, bất hòa. Ảnh hưởng tinh thần, mối quan hệ.',
    remedy: 'Hóa giải: Đèn đỏ, nến đỏ, vật phẩm Hỏa màu đỏ/hồng chế Mộc khí.',
    severity: 'medium',
    colors: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700', badge: 'bg-green-600', icon: 'text-green-500' }
  },
  7: {
    title: 'Thất Xích Phá Quân',
    short: 'Thất Xích',
    desc: 'Sao hao tài, dễ mất mát tiền bạc, trộm cắp. Không nên đặt két sắt, đồ quý giá.',
    remedy: 'Hóa giải: Nước (bình gốm chứa nước, bể cá nhỏ), vật phẩm Thủy màu xanh/đen.',
    severity: 'medium',
    colors: { bg: 'bg-rose-50', border: 'border-rose-300', text: 'text-rose-700', badge: 'bg-rose-500', icon: 'text-rose-500' }
  }
};

// Đánh giá tương tác ngũ hành giữa sao lưu niên và sao gốc
const evaluateInteraction = (annualStar, baseStar) => {
  const eAnnual = ELEMENT_MAP[annualStar];
  const eBase = ELEMENT_MAP[baseStar];
  if (!eAnnual || !eBase) return { type: 'neutral', label: '' };
  
  if (eAnnual === eBase) return { type: 'neutral', label: 'Tỷ Hòa' };
  if (SINH[eAnnual] === eBase) return { type: 'good', label: 'Sinh Nhập' };
  if (SINH[eBase] === eAnnual) return { type: 'drain', label: 'Sinh Xuất' };
  if (KHAC[eAnnual] === eBase) return { type: 'bad', label: 'Khắc Nhập' };
  if (KHAC[eBase] === eAnnual) return { type: 'clash', label: 'Bị Khắc' };
  return { type: 'neutral', label: '' };
};

// =====================================================
// COMPONENT CHÍNH
// =====================================================
const AnnualForecast = ({ project, chartData }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedFsMonth, setSelectedFsMonth] = useState(1);

  // Can Chi năm
  const yearInfo = useMemo(() => {
    try {
      const d = new Date(selectedYear, 6, 15);
      const solar = Solar.fromDate(d);
      const lunar = Lunar.fromSolar(solar);
      const yearGZ = lunar.getYearInGanZhiExact();
      // Dịch sang Việt
      const GAN_VN = {'甲':'Giáp','乙':'Ất','丙':'Bính','丁':'Đinh','戊':'Mậu','己':'Kỷ','庚':'Canh','辛':'Tân','壬':'Nhâm','癸':'Quý'};
      const ZHI_VN = {'子':'Tý','丑':'Sửu','寅':'Dần','卯':'Mão','辰':'Thìn','巳':'Tỵ','午':'Ngọ','未':'Mùi','申':'Thân','酉':'Dậu','戌':'Tuất','亥':'Hợi'};
      const vnGZ = (GAN_VN[yearGZ[0]] || yearGZ[0]) + ' ' + (ZHI_VN[yearGZ[1]] || yearGZ[1]);
      return { gz: vnGZ, raw: yearGZ };
    } catch { return { gz: '', raw: '' }; }
  }, [selectedYear]);

  // Phi tinh Năm & 12 Tháng
  const yearData = useMemo(() => {
    const dYear = new Date(selectedYear, 6, 15); // giữa năm
    const tsYear = getTimeStars(dYear);
    const annualCenterStar = tsYear.annual || 1;
    const annualGrid = flyStar(annualCenterStar, true);

    // 12 tháng tiết khí
    const months = TIET_KHI_MONTHS.map((tk) => {
      // Tạo ngày giữa tháng tiết khí gần đúng
      // fsMonth 1 ≈ tháng 2 DL, fsMonth 2 ≈ tháng 3, ...
      const dlMonth = (tk.fsMonth + 1) % 12; // Approx dương lịch month (0-indexed)
      const testDate = new Date(selectedYear, dlMonth, 15);
      const ts = getTimeStars(testDate);
      const monthlyCenterStar = ts.monthly || 1;
      const monthlyGrid = flyStar(monthlyCenterStar, true);

      return {
        ...tk,
        centerStar: monthlyCenterStar,
        grid: monthlyGrid,
        monthGZ: ts.monthGZ || '',
        termName: ts.termName || tk.shortName,
      };
    });

    return { annualCenterStar, annualGrid, months };
  }, [selectedYear]);

  // Tháng đang chọn
  const currentMonth = yearData.months.find(m => m.fsMonth === selectedFsMonth) || yearData.months[0];

  // Lưới 9 cung kết hợp (Tinh Bàn gốc + Năm + Tháng)
  const combinedGrid = useMemo(() => {
    return chartData.permutationMap.map((originalIndex, displayIndex) => {
      const base = chartData.finalGrid[originalIndex];
      const annualStar = yearData.annualGrid[originalIndex];
      const monthlyStar = currentMonth.grid[originalIndex];
      const labelInfo = LABELS[originalIndex];
      const isFacing = originalIndex === chartData.facingGridIndex;
      const isSitting = originalIndex === chartData.sittingGridIndex;
      const isCenter = originalIndex === 4;

      // Đánh giá cát/hung tổng hợp
      const annualIsHung = HUNG_STARS.includes(annualStar);
      const monthlyIsHung = HUNG_STARS.includes(monthlyStar);
      const interactionFacing = evaluateInteraction(annualStar, base.facing);
      const interactionSitting = evaluateInteraction(annualStar, base.sitting);

      let cellDanger = 'safe'; // safe, caution, danger
      if (annualStar === 5 || (annualIsHung && (isFacing || isSitting))) cellDanger = 'danger';
      else if (annualIsHung || monthlyIsHung) cellDanger = 'caution';

      return {
        originalIndex, displayIndex, base, annualStar, monthlyStar,
        labelInfo, isFacing, isSitting, isCenter,
        interactionFacing, interactionSitting, cellDanger,
      };
    });
  }, [chartData, yearData, currentMonth, selectedFsMonth]);

  // Cảnh báo sát khí
  const warnings = useMemo(() => {
    const allWarnings = [];
    const facingIdx = chartData.facingGridIndex;
    const sittingIdx = chartData.sittingGridIndex;
    
    const facingLabel = LABELS[facingIdx];
    const sittingLabel = LABELS[sittingIdx];

    // Cảnh báo Năm
    HUNG_STARS.forEach(hs => {
      const pos = yearData.annualGrid.findIndex(s => s === hs);
      if (pos === -1) return;
      const label = LABELS[pos];
      const info = HUNG_STAR_INFO[hs];
      let severity = info.severity;
      let positionLabel = `Phương ${label.dir} (Cung ${label.tri || 'Trung'})`;

      if (pos === facingIdx) {
        severity = 'critical';
        positionLabel = `🚪 CỬA CHÍNH — ${positionLabel}`;
      } else if (pos === sittingIdx) {
        severity = hs === 5 ? 'critical' : 'high';
        positionLabel = `🏠 TỌA — ${positionLabel}`;
      }

      allWarnings.push({
        type: 'annual', star: hs, position: pos, positionLabel,
        severity, info, year: selectedYear,
        timeLabel: `Cả năm ${selectedYear}`,
      });
    });

    // Cảnh báo Tháng đang chọn
    HUNG_STARS.forEach(hs => {
      const pos = currentMonth.grid.findIndex(s => s === hs);
      if (pos === -1) return;
      const label = LABELS[pos];
      const info = HUNG_STAR_INFO[hs];
      let severity = info.severity;
      let positionLabel = `Phương ${label.dir} (Cung ${label.tri || 'Trung'})`;

      if (pos === facingIdx) {
        severity = 'critical'; 
        positionLabel = `🚪 CỬA CHÍNH — ${positionLabel}`;
      } else if (pos === sittingIdx) {
        severity = hs === 5 ? 'critical' : 'high';
        positionLabel = `🏠 TỌA — ${positionLabel}`;
      }

      allWarnings.push({
        type: 'monthly', star: hs, position: pos, positionLabel,
        severity, info, month: selectedFsMonth, year: selectedYear,
        timeLabel: `Tháng TK ${selectedFsMonth} — ${currentMonth.shortName}`,
      });
    });

    // Sort: critical → high → medium
    const order = { critical: 0, high: 1, medium: 2 };
    allWarnings.sort((a, b) => (order[a.severity] ?? 3) - (order[b.severity] ?? 3));
    return allWarnings;
  }, [yearData, currentMonth, chartData, selectedYear, selectedFsMonth]);

  // Timeline - đánh dấu tháng nguy hiểm cho cửa chính
  const monthTimeline = useMemo(() => {
    return yearData.months.map(m => {
      const facingIdx = chartData.facingGridIndex;
      const sittingIdx = chartData.sittingGridIndex;
      const starAtFacing = m.grid[facingIdx];
      const starAtSitting = m.grid[sittingIdx];
      
      const hasCritical = starAtFacing === 5 || starAtSitting === 5;
      const hasHigh = !hasCritical && (HUNG_STARS.includes(starAtFacing) || HUNG_STARS.includes(starAtSitting));
      const hasMedium = !hasCritical && !hasHigh && m.grid.some(s => HUNG_STARS.includes(s));

      let status = 'safe';
      if (hasCritical) status = 'critical';
      else if (hasHigh) status = 'high';
      else if (hasMedium) status = 'medium';

      return { ...m, status, starAtFacing, starAtSitting };
    });
  }, [yearData, chartData]);

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* ═══════════ HEADER & YEAR SELECTOR ═══════════ */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 p-6 md:p-8 rounded-3xl border border-slate-700 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
              <TrendingUp className="text-amber-400" size={28} />
              Dự Báo Lưu Niên
            </h2>
            <p className="text-slate-400 font-medium mt-1 text-sm">Phi tinh Năm & Tháng chồng lớp lên Tinh Bàn gốc · Cảnh báo Sát Khí tự động</p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedYear(y => y - 1)} className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors cursor-pointer">
              <ChevronLeft size={20} />
            </button>
            <div className="text-center min-w-[140px]">
              <div className="text-3xl font-black text-amber-400 tracking-wider">{selectedYear}</div>
              <div className="text-xs font-bold text-slate-400 mt-1">{yearInfo.gz}</div>
            </div>
            <button onClick={() => setSelectedYear(y => y + 1)} className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors cursor-pointer">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Quick year jump */}
        <div className="flex justify-center md:justify-end gap-2 mt-4">
          {[selectedYear - 1, new Date().getFullYear(), selectedYear + 1].map(y => (
            <button key={y} onClick={() => setSelectedYear(y)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                y === selectedYear ? 'bg-amber-500 text-slate-900 shadow' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}>
              {y === new Date().getFullYear() ? `${y} (Nay)` : y}
            </button>
          ))}
        </div>

        {/* Sao Trung Cung Năm */}
        <div className="flex justify-center mt-5">
          <div className="bg-black/30 border border-white/10 rounded-2xl px-6 py-3 flex items-center gap-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sao Trung Cung Năm</span>
            <span className={`text-3xl font-black ${getStarColor(yearData.annualCenterStar)}`}>{yearData.annualCenterStar}</span>
            <span className="text-sm font-bold text-slate-300">{STAR_PROPERTIES[yearData.annualCenterStar]?.name}</span>
          </div>
        </div>
      </div>

      {/* ═══════════ TIMELINE 12 THÁNG ═══════════ */}
      <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 mb-4">
          <Calendar className="text-indigo-500" size={20} />
          Timeline 12 Tháng Tiết Khí — Năm {selectedYear}
        </h3>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 md:gap-3">
          {monthTimeline.map((m) => {
            const isSelected = m.fsMonth === selectedFsMonth;
            const statusColors = {
              safe:     { ring: 'ring-emerald-400', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
              medium:   { ring: 'ring-amber-400', bg: 'bg-amber-50', dot: 'bg-amber-500' },
              high:     { ring: 'ring-orange-400', bg: 'bg-orange-50', dot: 'bg-orange-500' },
              critical: { ring: 'ring-red-500', bg: 'bg-red-50', dot: 'bg-red-500' },
            };
            const sc = statusColors[m.status];

            return (
              <button key={m.fsMonth} onClick={() => setSelectedFsMonth(m.fsMonth)}
                className={`relative p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                  isSelected 
                    ? `${sc.bg} border-indigo-500 ring-2 ${sc.ring} shadow-lg scale-105` 
                    : `bg-white border-slate-200 hover:border-slate-400 hover:shadow-sm`
                }`}>
                
                {/* Status dot */}
                <div className={`absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full ${sc.dot} ${m.status === 'critical' ? 'animate-pulse' : ''}`} />

                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TK {m.fsMonth}</span>
                <span className={`text-2xl font-black ${getStarColor(m.centerStar)}`}>{m.centerStar}</span>
                <span className="text-[9px] font-bold text-slate-500 text-center leading-tight">{m.shortName}</span>
                {m.monthGZ && <span className="text-[8px] font-medium text-slate-400">{m.monthGZ}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════ LƯỚI 9 CUNG CHỒNG LỚP + CẢNH BÁO ═══════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        
        {/* CỘT TRÁI: Lưới 9 Cung */}
        <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Zap className="text-amber-500" size={20} />
              Cửu Cung Chồng Lớp — Tháng TK {selectedFsMonth}
              <span className="text-sm font-bold text-indigo-500 ml-1">({currentMonth.shortName})</span>
            </h3>
            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-400/60 border border-amber-500"></span> Năm</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-sky-400/60 border border-sky-500"></span> Tháng</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 md:gap-2 max-w-lg mx-auto">
            {combinedGrid.map((cell) => {
              const { base, annualStar, monthlyStar, labelInfo, isFacing, isSitting, isCenter, cellDanger } = cell;
              
              const dangerBg = {
                safe: 'bg-slate-50',
                caution: 'bg-amber-50/60',
                danger: 'bg-red-50/70',
              }[cellDanger];

              return (
                <div key={cell.displayIndex}
                  className={`relative ${dangerBg} rounded-xl border-2 p-2.5 md:p-3 min-h-[110px] md:min-h-[130px] flex flex-col transition-all ${
                    isFacing ? 'border-red-400 ring-2 ring-red-200' :
                    isSitting ? 'border-indigo-400 ring-2 ring-indigo-200' :
                    cellDanger === 'danger' ? 'border-red-300' :
                    cellDanger === 'caution' ? 'border-amber-300' :
                    'border-slate-200'
                  }`}>
                  
                  {/* Header: Direction + GUA */}
                  <div className="flex justify-between items-start text-[9px] md:text-[10px] mb-1">
                    <span className="font-black text-slate-500 uppercase tracking-wider">{labelInfo.dir}</span>
                    <span className="font-bold text-slate-400">({labelInfo.tri || '中'})</span>
                  </div>
                  
                  {/* Facing/Sitting indicator */}
                  {isFacing && <span className="absolute top-0.5 left-1/2 -translate-x-1/2 text-[7px] font-black bg-red-500 text-white px-1.5 py-0.5 rounded-b">HƯỚNG</span>}
                  {isSitting && <span className="absolute top-0.5 left-1/2 -translate-x-1/2 text-[7px] font-black bg-indigo-500 text-white px-1.5 py-0.5 rounded-b">TỌA</span>}

                  {/* Tinh Bàn gốc: Sơn | Vận | Hướng */}
                  <div className="flex justify-between items-center mt-1">
                    {!isCenter ? (
                      <>
                        <span className="text-lg md:text-xl font-black" style={{color: starHex(base.sitting)}}>{base.sitting}</span>
                        <span className="text-2xl md:text-3xl font-black opacity-15" style={{color: starHex(base.base)}}>{base.base}</span>
                        <span className="text-lg md:text-xl font-black" style={{color: starHex(base.facing)}}>{base.facing}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-lg font-black" style={{color: starHex(base.sitting)}}>{base.sitting}</span>
                        <span className="text-2xl font-black opacity-60" style={{color: starHex(base.base)}}>{base.base}</span>
                        <span className="text-lg font-black" style={{color: starHex(base.facing)}}>{base.facing}</span>
                      </>
                    )}
                  </div>

                  {/* Badges: Năm + Tháng */}
                  <div className="flex justify-between items-end mt-auto pt-1.5 gap-1">
                    {/* Badge Năm */}
                    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg border text-[10px] font-black ${
                      HUNG_STARS.includes(annualStar)
                        ? 'bg-red-100 border-red-300 text-red-700'
                        : 'bg-amber-50 border-amber-300 text-amber-700'
                    }`}>
                      <span className="text-[8px] opacity-70">N</span>
                      <span className="text-sm" style={{color: starHex(annualStar)}}>{annualStar}</span>
                    </div>

                    {/* Badge Tháng */}
                    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg border text-[10px] font-black ${
                      HUNG_STARS.includes(monthlyStar)
                        ? 'bg-red-100 border-red-300 text-red-700'
                        : 'bg-sky-50 border-sky-300 text-sky-700'
                    }`}>
                      <span className="text-[8px] opacity-70">T</span>
                      <span className="text-sm" style={{color: starHex(monthlyStar)}}>{monthlyStar}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mini Legend */}
          <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] font-bold text-slate-400">
            <span>Sơn(trái) · Vận(giữa) · Hướng(phải)</span>
            <span>N = Lưu Niên · T = Lưu Nguyệt</span>
          </div>
        </div>

        {/* CỘT PHẢI: Cảnh Báo */}
        <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <AlertTriangle className="text-red-500" size={20} />
            Cảnh Báo Sát Khí
            <span className="ml-auto text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{warnings.length}</span>
          </h3>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
            {warnings.length === 0 ? (
              <div className="text-center py-12">
                <ShieldCheck className="text-emerald-400 mx-auto mb-3" size={48} />
                <p className="text-emerald-600 font-black text-lg">An Toàn</p>
                <p className="text-slate-400 text-sm mt-1">Không có hung tinh nhập cung quan trọng trong kỳ này.</p>
              </div>
            ) : (
              warnings.map((w, idx) => {
                const SeverityIcon = w.severity === 'critical' ? ShieldAlert : w.severity === 'high' ? Shield : AlertTriangle;
                const severityBadge = {
                  critical: { bg: 'bg-red-600', text: '🔴 NGUY HIỂM' },
                  high:     { bg: 'bg-orange-500', text: '🟠 CAO' },
                  medium:   { bg: 'bg-amber-500', text: '🟡 THƯỜNG' },
                };
                const sb = severityBadge[w.severity] || severityBadge.medium;

                return (
                  <div key={idx} className={`${w.info.colors.bg} border-2 ${w.info.colors.border} rounded-2xl p-3.5 transition-all hover:shadow-md`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <SeverityIcon className={w.info.colors.icon} size={18} />
                        <span className={`font-black text-sm ${w.info.colors.text}`}>
                          Sao {w.star} — {w.info.short}
                        </span>
                      </div>
                      <span className={`${sb.bg} text-white text-[9px] font-black px-2 py-0.5 rounded-full whitespace-nowrap`}>
                        {sb.text}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-600 mb-1">{w.positionLabel}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{w.info.desc}</p>
                    
                    <div className="mt-2 bg-white/60 p-2 rounded-lg border border-slate-200">
                      <p className="text-[11px] font-bold text-indigo-700"><Info size={12} className="inline mr-1" />{w.info.remedy}</p>
                    </div>

                    <div className="mt-2 flex justify-between items-center">
                      <span className={`text-[9px] font-black uppercase tracking-wider ${w.type === 'annual' ? 'text-amber-600' : 'text-sky-600'}`}>
                        {w.type === 'annual' ? '📅 LƯU NIÊN' : '📅 LƯU NGUYỆT'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">{w.timeLabel}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ═══════════ TỔNG QUAN NHANH ═══════════ */}
      <div className="bg-gradient-to-r from-indigo-50 to-sky-50 p-5 md:p-6 rounded-3xl border border-indigo-200 shadow-sm">
        <h3 className="text-base font-black text-slate-700 mb-3 flex items-center gap-2">
          <Info className="text-indigo-500" size={18} />
          Tổng Quan Tháng TK {selectedFsMonth} ({currentMonth.shortName})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Sao Trung Cung Tháng</div>
            <div className={`text-3xl font-black ${getStarColor(currentMonth.centerStar)}`}>{currentMonth.centerStar}</div>
            <div className="text-xs font-bold text-slate-600 mt-0.5">{STAR_PROPERTIES[currentMonth.centerStar]?.name}</div>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Can Chi Tháng</div>
            <div className="text-lg font-black text-indigo-700 mt-1">{currentMonth.monthGZ}</div>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Sao tại Cửa Chính</div>
            <div className="flex justify-center gap-3 mt-1">
              <div>
                <span className="text-[8px] text-amber-600 font-bold block">Năm</span>
                <span className={`text-2xl font-black ${getStarColor(yearData.annualGrid[chartData.facingGridIndex])}`}>{yearData.annualGrid[chartData.facingGridIndex]}</span>
              </div>
              <div>
                <span className="text-[8px] text-sky-600 font-bold block">Tháng</span>
                <span className={`text-2xl font-black ${getStarColor(currentMonth.grid[chartData.facingGridIndex])}`}>{currentMonth.grid[chartData.facingGridIndex]}</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Cảnh báo kỳ này</div>
            <div className={`text-3xl font-black mt-1 ${warnings.length > 0 ? (warnings.some(w => w.severity === 'critical') ? 'text-red-500' : 'text-amber-500') : 'text-emerald-500'}`}>
              {warnings.length}
            </div>
            <div className="text-[10px] font-bold text-slate-400">{warnings.length === 0 ? 'An toàn!' : 'Cần lưu ý'}</div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AnnualForecast;

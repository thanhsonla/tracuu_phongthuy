import React, { useState, useMemo } from 'react';
import { Ruler, ArrowRight, ArrowLeft } from 'lucide-react';

const LUBAN_52_2 = {
  name: 'Thước 52.2cm (Thông Thủy)',
  desc: 'Đo lọt lòng các khối rỗng, các loại cửa, khoảng lọt lòng thông thủy.',
  length: 522, // in mm
  mainSegments: [
    { name: 'Quý Nhân', isGood: true, subs: ['Quyền Lộc', 'Trung Tín', 'Tác Quan', 'Phát Đạt'] },
    { name: 'Hiểm Họa', isGood: false, subs: ['Tán Ngôn', 'Thoái Tán', 'Siểm Nịnh', 'Ôn Tật'] },
    { name: 'Thiên Tai', isGood: false, subs: ['Hoàn Trận', 'Thất Tài', 'Quan Tai', 'Tổn Phúc'] },
    { name: 'Thiên Tài', isGood: true, subs: ['Thi Thơ', 'Văn Học', 'Thanh Quý', 'Tác Lộc'] },
    { name: 'Phúc Lộc', isGood: true, subs: ['Tử Tôn', 'Phú Quý', 'Tấn Bửu', 'Thập Phân'] },
    { name: 'Cô Độc', isGood: false, subs: ['Bạc Vong', 'Tán Thoái', 'Bất Lộc', 'Tửu Thủy'] },
    { name: 'Thiên Tặc', isGood: false, subs: ['Phòng Bệnh', 'Chiêu Ôn', 'Ôn Tai', 'Hình Án'] },
    { name: 'Tể Tướng', isGood: true, subs: ['Đại Tài', 'Thi Thơ', 'Nghênh Hỷ', 'Phú Quý'] }
  ]
};

const LUBAN_42_9 = {
  name: 'Thước 42.9cm (Dương Trạch)',
  desc: 'Đo móng, bệ, bậc bếp, bậc thang, đồ nội thất bàn ghế, giường tủ.',
  length: 429, // in mm
  mainSegments: [
    { name: 'Tài', isGood: true, subs: ['Tài Đức', 'Bảo Khố', 'Lục Hợp', 'Nghênh Phúc'] },
    { name: 'Bệnh', isGood: false, subs: ['Thoái Tài', 'Công Sự', 'Lao Chấp', 'Cô Quả'] },
    { name: 'Ly', isGood: false, subs: ['Trưởng Hố', 'Kiếp Tài', 'Quan Quỷ', 'Thất Thoát'] },
    { name: 'Nghĩa', isGood: true, subs: ['Thêm Đinh', 'Ích Lợi', 'Quý Tử', 'Đại Cát'] },
    { name: 'Quan', isGood: true, subs: ['Thuận Khoa', 'Hoành Tài', 'Tiến Ích', 'Phú Quý'] },
    { name: 'Kiếp', isGood: false, subs: ['Tử Biệt', 'Thoái Khẩu', 'Ly Hương', 'Tài Thất'] },
    { name: 'Hại', isGood: false, subs: ['Tai Chí', 'Tử Tuyệt', 'Lâm Bệnh', 'Khẩu Thiệt'] },
    { name: 'Bản', isGood: true, subs: ['Tài Chí', 'Đăng Khoa', 'Tiến Bảo', 'Hưng Vượng'] }
  ]
};

const LUBAN_38_8 = {
  name: 'Thước 38.8cm (Âm Phần)',
  desc: 'Đo kích thước đồ thờ cúng, bàn thờ, bài vị, tiểu quách, mồ mả.',
  length: 388, // in mm
  mainSegments: [
    { name: 'Đinh', isGood: true, subs: ['Phúc Tinh', 'Cập Đệ', 'Tài Vượng', 'Đăng Khoa'] },
    { name: 'Hại', isGood: false, subs: ['Khẩu Thiệt', 'Lâm Bệnh', 'Tử Tuyệt', 'Họa Chí'] },
    { name: 'Vượng', isGood: true, subs: ['Thiên Đức', 'Hỷ Sự', 'Tiến Bảo', 'Thêm Phúc'] },
    { name: 'Khổ', isGood: false, subs: ['Thất Thoát', 'Quan Quỷ', 'Kiếp Tài', 'Vô Tự'] },
    { name: 'Nghĩa', isGood: true, subs: ['Đại Cát', 'Tài Vượng', 'Ích Lợi', 'Thiên Khố'] },
    { name: 'Quan', isGood: true, subs: ['Phú Quý', 'Tiến Bảo', 'Hoạch Tài', 'Thuận Khoa'] },
    { name: 'Tử', isGood: false, subs: ['Ly Hương', 'Tử Biệt', 'Thoái Đinh', 'Thất Tài'] },
    { name: 'Hưng', isGood: true, subs: ['Đăng Khoa', 'Quý Tử', 'Thêm Đinh', 'Hưng Vượng'] },
    { name: 'Thất', isGood: false, subs: ['Cô Quả', 'Lao Chấp', 'Công Sự', 'Thoái Tài'] },
    { name: 'Tài', isGood: true, subs: ['Nghênh Phúc', 'Lục Hợp', 'Tiến Bảo', 'Tài Đức'] }
  ]
};

const LUBAN_46_0 = {
  name: 'Thước 46.08cm (Khối Xây Đặc)',
  desc: 'Đo bệ bếp, bậc thềm, trụ cột, đồ nội thất (theo chuẩn Minh - Thanh).',
  length: 460.8, // in mm
  mainSegments: [
    { name: 'Tài', isGood: true, subs: ['Tài Đức', 'Bảo Khố', 'Lục Hợp', 'Nghênh Phúc'] },
    { name: 'Bệnh', isGood: false, subs: ['Thoái Tài', 'Công Sự', 'Lao Chấp', 'Cô Quả'] },
    { name: 'Ly', isGood: false, subs: ['Trưởng Hố', 'Kiếp Tài', 'Quan Quỷ', 'Thất Thoát'] },
    { name: 'Nghĩa', isGood: true, subs: ['Thêm Đinh', 'Ích Lợi', 'Quý Tử', 'Đại Cát'] },
    { name: 'Quan', isGood: true, subs: ['Thuận Khoa', 'Hoành Tài', 'Tiến Ích', 'Phú Quý'] },
    { name: 'Kiếp', isGood: false, subs: ['Tử Biệt', 'Thoái Khẩu', 'Ly Hương', 'Tài Thất'] },
    { name: 'Hại', isGood: false, subs: ['Tai Chí', 'Tử Tuyệt', 'Lâm Bệnh', 'Khẩu Thiệt'] },
    { name: 'Bản', isGood: true, subs: ['Tài Chí', 'Đăng Khoa', 'Tiến Bảo', 'Hưng Vượng'] }
  ]
};

const RULERS = [LUBAN_52_2, LUBAN_46_0, LUBAN_42_9, LUBAN_38_8];

const MEASUREMENT_TARGETS = [
  { id: 'door', label: 'Cửa đi / Cửa sổ / Cổng', rulerTarget: 522 },
  { id: 'solid', label: 'Bệ bếp / Bậc thềm / Khối xây đặc', rulerTarget: 460.8 },
  { id: 'stair', label: 'Bậc thang / Bếp / Khối xây', rulerTarget: 429 },
  { id: 'furniture', label: 'Tủ / Bàn ghế', rulerTarget: 429 },
  { id: 'altar', label: 'Bàn thờ / Tủ thờ', rulerTarget: 388 },
  { id: 'grave', label: 'Mộ phần', rulerTarget: 388 },
];

const QUICK_PRESETS = {
  522: [810, 1080, 1260, 1460, 1530, 1760, 2120],
  460.8: [460, 690, 810, 920, 1150, 1380, 1840],
  429: [460, 610, 680, 810, 880, 1080, 1330],
  388: [610, 690, 810, 890, 1070, 1270, 1530]
};
const DEFAULT_PRESETS = [810, 1080, 1270, 1340, 1750, 2120];

export default function LuBanRuler() {
  const [unit, setUnit] = useState('mm'); // 'cm' or 'mm'
  const [inputValue, setInputValue] = useState(810); // default in mm
  const [activeTarget, setActiveTarget] = useState(null);
  const [activeRuler, setActiveRuler] = useState(null);
  const inputRef = React.useRef(null);

  const handleTargetClick = (t) => {
    if (activeTarget === t.id) {
      setActiveTarget(null);
      setActiveRuler(null);
    } else {
      setActiveTarget(t.id);
      setActiveRuler(t.rulerTarget);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleRulerClick = (rLength) => {
    if (activeRuler === rLength) {
      setActiveRuler(null);
      setActiveTarget(null);
    } else {
      setActiveRuler(rLength);
      const target = MEASUREMENT_TARGETS.find(t => t.rulerTarget === rLength);
      setActiveTarget(target ? target.id : null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Handle unit switch
  const handleUnitToggle = (selectedUnit) => {
    if (selectedUnit === unit) return;
    if (selectedUnit === 'cm') {
      setInputValue((prev) => prev / 10);
    } else {
      setInputValue((prev) => prev * 10);
    }
    setUnit(selectedUnit);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      setInputValue('');
      return;
    }
    let parsed = parseFloat(val);
    if (!isNaN(parsed)) {
      setInputValue(parsed);
    }
  };

  // Convert current input to mm for internal calculation
  const measureInMm = typeof inputValue === 'number' ? (unit === 'cm' ? inputValue * 10 : inputValue) : 0;

  // Analysis result for each ruler
  const analyze = (ruler, measureMm) => {
    const rLength = ruler.length;
    const segmentsCount = ruler.mainSegments.length;
    const subsCount = 4;
    
    const cycleVal = measureMm >= 0 ? Math.floor(measureMm / rLength) : 0;
    const startOfCycleMm = cycleVal * rLength;
    
    // Remainder relative to the ruler's cycle
    const remainder = measureMm % rLength;
    
    const segmentWidth = rLength / segmentsCount;
    const subWidth = segmentWidth / subsCount;

    // Determine the main segment index (0 to segmentsCount - 1)
    const mainIdx = Math.floor(remainder / segmentWidth);
    
    // Determine the exact sub segment index within that main segment (0 to 3)
    const subIdx = Math.floor((remainder % segmentWidth) / subWidth);

    const percentInCycle = (remainder / rLength) * 100;

    return {
      rulerName: ruler.name,
      desc: ruler.desc,
      mainSegment: ruler.mainSegments[mainIdx],
      subSegment: ruler.mainSegments[mainIdx].subs[subIdx],
      percentInCycle, // Used to draw the indicator line
      segmentWidth,
      rLength,
      segments: ruler.mainSegments,
      startOfCycleMm
    };
  };

  const results = RULERS.map(ruler => analyze(ruler, measureInMm));

  const currentPresets = activeRuler ? QUICK_PRESETS[activeRuler] : DEFAULT_PRESETS;

  return (
    <div className="bg-white rounded-3xl p-6 md:p-10 shadow-2xl border border-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-3">
            <Ruler className="text-amber-500" size={32}/> Thước Lỗ Ban
          </h2>
          <p className="text-slate-500 font-medium mt-1">Chuẩn kích thước nội thất và xây dựng</p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 shadow-inner">
          <button onClick={() => handleUnitToggle('mm')} className={`px-5 py-2 rounded-lg font-bold transition-all ${unit === 'mm' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>mm</button>
          <button onClick={() => handleUnitToggle('cm')} className={`px-5 py-2 rounded-lg font-bold transition-all ${unit === 'cm' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>cm</button>
        </div>
      </div>

      {/* Object Type Selector */}
      <div className="mb-6">
         <label className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-3 block">1. Lựa chọn đối tượng cần đo:</label>
         <div className="flex flex-wrap gap-2">
            {MEASUREMENT_TARGETS.map(t => (
               <button 
                 key={t.id} 
                 onClick={() => handleTargetClick(t)}
                 className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${activeTarget === t.id ? 'bg-indigo-600 text-white border-indigo-700 shadow-md scale-105' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'}`}
               >
                 {t.label}
               </button>
            ))}
         </div>
      </div>

      {/* Input Section */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8 mb-8 shadow-sm flex flex-col md:flex-row items-center justify-center gap-6">
         <div className="flex flex-col items-center flex-1 w-full relative">
            <label className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-3">2. Nhập Kích Thước ({unit})</label>
            <div className="relative w-full max-w-sm">
               <input 
                 ref={inputRef}
                 type="number" 
                 value={inputValue === '' ? '' : inputValue} 
                 onChange={handleInputChange}
                 className="w-full bg-white text-slate-800 font-black text-4xl md:text-5xl px-6 py-6 rounded-2xl border-2 border-amber-400 focus:border-amber-500 outline-none text-center shadow-inner transition-all focus:ring-4 focus:ring-amber-400/20" 
               />
               <span className="absolute top-1/2 -translate-y-1/2 right-6 text-slate-300 font-bold text-xl">{unit}</span>
            </div>

            {/* Quick Presets */}
            <div className="flex gap-2 mt-5">
               {currentPresets.map(v => (
                 <button key={v} onClick={() => setInputValue(unit === 'cm' ? v/10 : v)} className="text-xs bg-slate-200 hover:bg-amber-100 hover:text-amber-700 text-slate-500 font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm">
                   {unit === 'cm' ? v/10 : v}
                 </button>
               ))}
            </div>
         </div>
      </div>

      {/* Results Display */}
      <div className="space-y-8">
        {results.map((res, i) => {
          const isFocused = activeRuler ? (res.rLength === activeRuler) : true;
          const focusClasses = activeRuler ? (isFocused ? 'ring-4 ring-indigo-400/50 scale-[1.02] shadow-xl z-10 transition-all cursor-default' : 'opacity-40 grayscale-[50%] scale-[0.98] transition-all cursor-pointer hover:opacity-70') : 'transition-all cursor-pointer hover:scale-[1.01] hover:shadow-lg';

          return (
          <div key={i} onClick={() => handleRulerClick(res.rLength)} className={`p-5 md:p-6 rounded-2xl border relative ${res.mainSegment.isGood ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50 border-slate-200'} ${focusClasses}`}>
            {isFocused && activeRuler && <div className="absolute -top-3 -right-3 bg-indigo-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md z-20">Đang Chọn</div>}
            
            <div className="flex justify-between items-start mb-4 pointer-events-none">
              <div>
                <h3 className="font-black text-lg text-slate-800 mb-1">{res.rulerName}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase">{res.desc}</p>
              </div>
              
              <div className="text-right">
                 <div className={`inline-flex flex-col items-end px-4 py-2 rounded-xl shadow-sm border ${res.mainSegment.isGood ? 'bg-amber-500 border-amber-600 text-white' : 'bg-slate-700 border-slate-800 text-white'}`}>
                    <span className="text-2xl font-black">{res.mainSegment.name}</span>
                    <span className="text-xs font-bold tracking-widest opacity-90">{res.mainSegment.isGood ? 'Cát (Tốt)' : 'Hung (Xấu)'}</span>
                 </div>
              </div>
            </div>

            {/* Visual Ruler Bar */}
            <div className="relative w-full h-14 md:h-16 rounded-xl overflow-hidden flex border border-slate-300/60 shadow-inner bg-slate-100">
               {res.segments.map((seg, idx) => {
                 const isLast = idx === res.segments.length - 1;
                 const isColorChange = !isLast && (seg.isGood !== res.segments[idx + 1].isGood);
                 const boundaryMm = res.startOfCycleMm + res.segmentWidth * (idx + 1);
                 const boundaryVal = unit === 'cm' ? (boundaryMm / 10).toFixed(1) : Math.round(boundaryMm);

                 return (
                 <div key={idx} style={{ width: `${100 / res.segments.length}%` }} className={`h-full flex flex-col justify-center items-center border-r border-slate-200/50 relative ${seg.isGood ? 'bg-amber-400/20' : 'bg-slate-300/30'}`}>
                    <span className={`text-[10px] md:text-sm font-black absolute top-1 ${seg.isGood ? 'text-amber-600' : 'text-slate-500'}`}>{seg.name}</span>
                    <div className="flex w-full absolute bottom-0 h-1/2">
                       {seg.subs.map((sub, sIdx) => {
                          const isSpecialSub = seg.isGood ? true : false;
                          return (
                            <div key={sIdx} className={`flex-1 h-full flex items-center justify-center border-t border-r border-slate-200/50 last:border-r-0 ${isSpecialSub ? 'text-amber-700/80' : 'text-slate-400'}`}>
                              <span style={{ writingMode: 'vertical-rl' }} className="text-[7px] md:text-[8px] font-bold tracking-tighter truncate max-h-full py-0.5">{sub}</span>
                            </div>
                          )
                       })}
                    </div>
                    {/* Boundary Marker at Good-Bad transitions */}
                    {isColorChange && (
                       <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 pointer-events-none flex items-center justify-center">
                          <div className="bg-slate-800 text-white text-[7px] md:text-[8px] font-bold font-mono px-1 py-0.5 rounded shadow-xl rotate-90 whitespace-nowrap tracking-widest border border-slate-700/50">
                            {boundaryVal}
                          </div>
                       </div>
                    )}
                 </div>
                 );
               })}

               {/* Indicator line */}
               <div className="absolute top-0 bottom-0 w-0.5 bg-red-600 z-10 transition-all duration-300 shadow-[0_0_8px_rgba(220,38,38,0.8)]" style={{ left: `${res.percentInCycle}%` }}>
                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-red-600 rounded-sm"></div>
               </div>
            </div>

            {/* Current Sub-Segment Text */}
            <div className="mt-4 flex items-center justify-between text-sm">
               <div className="flex items-center gap-2">
                 <span className="text-slate-500 font-bold">Cung chi tiết:</span>
                 <span className={`px-3 py-1 rounded-md font-black shadow-sm ${res.mainSegment.isGood ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-slate-200 text-slate-600 border border-slate-300'}`}>
                   {res.subSegment}
                 </span>
               </div>
               
               {!res.mainSegment.isGood && (
                 <div className="text-xs text-red-500 font-bold bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 flex items-center gap-1.5">
                    Số đo đang vào cung Xấu. Hãy điều chỉnh!
                 </div>
               )}
            </div>

          </div>
          );
        })}
      </div>

    </div>
  );
}

import React, { useMemo } from 'react';
import { MOUNTAINS } from '../data/constants';

const DynamicCompass = ({ degree, onChange, readOnly = false }) => {
  // normalize degree
  const normDegree = (degree + 360) % 360;

  // Render SVG elements
  const renderDegrees = useMemo(() => {
    const ticks = [];
    for (let i = 0; i < 360; i += 2) {
      const isMajor = i % 10 === 0;
      ticks.push(
        <g key={`tick-${i}`} transform={`rotate(${i})`}>
          <line x1="0" y1="-148" x2="0" y2={isMajor ? "-140" : "-144"} stroke="#222" strokeWidth={isMajor ? "1" : "0.5"} />
          {isMajor && (
            <text x="0" y="-132" fontSize="5" fontWeight="bold" textAnchor="middle" fill="#222">
              {i}
            </text>
          )}
        </g>
      );
    }
    return ticks;
  }, []);

  const renderMountains = useMemo(() => {
    return MOUNTAINS.map((m, i) => {
      const startAngle = (i * 15 - 7.5) * Math.PI / 180;
      const endAngle = (i * 15 + 7.5) * Math.PI / 180;
      const rInner = 80;
      const rOuter = 130;
      
      const x1 = rOuter * Math.sin(startAngle);
      const y1 = -rOuter * Math.cos(startAngle);
      const x2 = rOuter * Math.sin(endAngle);
      const y2 = -rOuter * Math.cos(endAngle);
      const x3 = rInner * Math.sin(endAngle);
      const y3 = -rInner * Math.cos(endAngle);
      const x4 = rInner * Math.sin(startAngle);
      const y4 = -rInner * Math.cos(startAngle);

      const path = `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 0 0 ${x4} ${y4} Z`;
      
      const isRed = m.yinYang === '+'; 
      // Đỏ nhạt hơn và vàng nhạt hơn
      const fillColor = isRed ? '#E57373' : '#F9E79F';
      // Màu chữ nếu background đỏ sẽ là trắng thẫm, background vàng sẽ là đen
      const textColor = isRed ? '#FFFFFF' : '#333333';

      return (
        <g key={`m-${i}`}>
          <path d={path} fill={fillColor} stroke="#BA4A00" strokeWidth="0.5" />
          <text 
            transform={`rotate(${m.degree}) translate(0, -100)`} 
            fontSize="10" 
            fontWeight="bold" 
            fill={textColor} 
            textAnchor="middle"
          >
            {m.name}
          </text>
        </g>
      );
    });
  }, []);

  const renderTrigrams = useMemo(() => {
     const trigrams = [
       { deg: 0, name: 'KHẢM', dir: 'BẮC', color: '#154360' },
       { deg: 45, name: 'CẤN', dir: 'ĐÔNG BẮC', color: '#17202A' },
       { deg: 90, name: 'CHẤN', dir: 'ĐÔNG', color: '#154360' },
       { deg: 135, name: 'TỐN', dir: 'ĐÔNG NAM', color: '#17202A' },
       { deg: 180, name: 'LY', dir: 'NAM', color: '#154360' },
       { deg: 225, name: 'KHÔN', dir: 'TÂY NAM', color: '#17202A' },
       { deg: 270, name: 'ĐOÀI', dir: 'TÂY', color: '#154360' },
       { deg: 315, name: 'CÀN', dir: 'TÂY BẮC', color: '#17202A' },
     ];

     return trigrams.map((t, i) => {
      const startAngle = (t.deg - 22.5) * Math.PI / 180;
      const endAngle = (t.deg + 22.5) * Math.PI / 180;
      const rInner = 45;
      const rOuter = 80;
      
      const x1 = rOuter * Math.sin(startAngle);
      const y1 = -rOuter * Math.cos(startAngle);
      const x2 = rOuter * Math.sin(endAngle);
      const y2 = -rOuter * Math.cos(endAngle);
      const x3 = rInner * Math.sin(endAngle);
      const y3 = -rInner * Math.cos(endAngle);
      const x4 = rInner * Math.sin(startAngle);
      const y4 = -rInner * Math.cos(startAngle);

      const path = `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 0 0 ${x4} ${y4} Z`;

      return (
        <g key={`tri-${i}`}>
          {/* Nền trong cùng tông nhạt hơn cho quẻ */}
          <path d={path} fill="#FCF3CF" stroke="#BA4A00" strokeWidth="0.5" />
          <text 
            transform={`rotate(${t.deg}) translate(0, -66)`} 
            fontSize="10" 
            fontWeight="bold" 
            fill="#17202A" 
            textAnchor="middle"
          >
            {t.name}
          </text>
          <text 
            transform={`rotate(${t.deg}) translate(0, -52)`} 
            fontSize="6" 
            fill={t.color}
            fontWeight="bold" 
            textAnchor="middle"
          >
            {t.dir}
          </text>
        </g>
      );
     });
  }, []);

  const renderMainDivisionLines = useMemo(() => {
    const lines = [];
    for (let i = 0; i < 8; i++) {
      const angle = (22.5 + i * 45) * Math.PI / 180;
      const x1 = 45 * Math.sin(angle);
      const y1 = -45 * Math.cos(angle);
      const x2 = 130 * Math.sin(angle);
      const y2 = -130 * Math.cos(angle);
      lines.push(<line key={`div-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#BA4A00" strokeWidth="1.5" />);
    }
    return lines;
  }, []);

  return (
    <div className="flex flex-col items-center">
      {/* Vành đỏ bọc ngoài La Kinh - Giảm độ chói của khung */}
      <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-[360px] lg:h-[360px] rounded-full shadow-[0_0_20px_rgba(0,0,0,0.15)] flex items-center justify-center bg-[#D98880] p-2 overflow-visible border-4 border-[#C0392B]">
        
        {/* Đĩa La Kinh SVG xoay */}
        <svg 
          viewBox="-150 -150 300 300" 
          width="100%" 
          height="100%"
          className="w-full h-full" 
        >
          
          <defs>
             {/* Hiệu ứng bóng phản chiếu nhẹ */}
             <radialGradient id="gloss" cx="30%" cy="30%" r="70%" fx="30%" fy="30%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.1" />
             </radialGradient>
          </defs>

          {/* Group xoay La Kinh nguyên khối */}
          <g transform={`rotate(${-normDegree})`} className="transition-transform duration-1000 ease-out" style={{ transformOrigin: '0 0' }}>
            {/* Nền vàng nhạt */}
            <circle cx="0" cy="0" r="150" fill="#FDEBD0" />
            
            {/* Các vòng chi tiết */}
            {renderMountains}
            {renderTrigrams}
            {renderMainDivisionLines}
            
            <circle cx="0" cy="0" r="130" fill="none" stroke="#B9770E" strokeWidth="0.5" />
            {renderDegrees}

            {/* Ô tròn trung tâm (Thiên Trì) */}
            <circle cx="0" cy="0" r="45" fill="#FFFFFF" stroke="#C0392B" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="35" fill="#FFFFFF" stroke="#333333" strokeWidth="0.5" />
          </g>

          {/* Lớp phủ bóng trong suốt toàn mâm (Cố định, không xoay) */}
          <circle cx="0" cy="0" r="150" fill="url(#gloss)" pointerEvents="none" />
        </svg>

        {/* Lớp Overlay tĩnh: Chữ thập đỏ & Kim Chỉ Nam */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
           {/* Chữ thập đỏ chia cung */}
           <div className="w-[1.5px] h-full bg-[#C0392B] absolute z-10 left-1/2 -translate-x-1/2 shadow-sm opacity-90"></div>
           <div className="h-[1.5px] w-full bg-[#C0392B] absolute z-10 top-1/2 -translate-y-1/2 shadow-sm opacity-90"></div>
           
           {/* Kim chỉ nam nội khu */}
           <div className="w-16 h-16 rounded-full flex items-center justify-center z-20">
             <div className="w-2 h-2 rounded-full bg-red-600 absolute shadow-sm"></div>
             
             {/* Hình dáng mũi kim La Kinh */}
             <svg viewBox="-50 -50 100 100" className="w-[80px] h-[80px]">
               {/* Mũi nhọn hướng Nam (phía Bắc theo la kinh là đuôi có tròn) */}
               <polygon points="-2,0 2,0 0,-30" fill="#333333" />
               <line x1="0" y1="0" x2="0" y2="30" stroke="#333333" strokeWidth="1.5" />
               {/* Hai mắt đỏ ở đuôi kim */}
               <circle cx="-3" cy="25" r="2" fill="#E74C3C" stroke="#333" strokeWidth="0.5" />
               <circle cx="3" cy="25" r="2" fill="#E74C3C" stroke="#333" strokeWidth="0.5" />
               <line x1="-3" y1="25" x2="3" y2="25" stroke="#333" strokeWidth="1" />
             </svg>
           </div>
        </div>
      </div>

      {(!readOnly && onChange) && (
        <div className="mt-8 relative w-full px-4 max-w-sm">
          <input 
            type="range" 
            min="0" 
            max="360" 
            step="0.1" 
            value={normDegree}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#C0392B]"
          />
          <div className="flex justify-between mt-4 text-xs font-bold text-slate-500 uppercase">
            <button type="button" onClick={() => onChange((normDegree - 1 + 360) % 360)} className="bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors shadow-sm">-1° (Trái)</button>
            <span className="bg-red-50 text-red-700 px-3 py-1.5 rounded-lg border border-red-100">{normDegree.toFixed(1)}°</span>
            <button type="button" onClick={() => onChange((normDegree + 1) % 360)} className="bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors shadow-sm">+1° (Phải)</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicCompass;

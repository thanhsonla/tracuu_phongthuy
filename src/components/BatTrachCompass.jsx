import React from 'react';
import { getBatTrachStar, BAT_TRACH_STARS, TRIGRAM_SYMBOLS } from '../data/batTrach';

const TRUONG_SINH_NAMES = ['Trường Sinh', 'Mộc Dục', 'Quan Đới', 'Lâm Quan', 'Đế Vượng', 'Suy', 'Bệnh', 'Tử', 'Mộ', 'Tuyệt', 'Thai', 'Dưỡng'];

const getTruongSinhPhases = (menhQuai) => {
  if (!menhQuai) return null;
  const rules = {
    'Khảm': { start: 8, dir: 1 },  
    'Khôn': { start: 8, dir: -1 }, 
    'Cấn':  { start: 8, dir: 1 },  
    'Chấn': { start: 11, dir: 1 }, 
    'Tốn':  { start: 11, dir: -1 },
    'Ly':   { start: 2, dir: -1 }, 
    'Đoài': { start: 5, dir: -1 }, 
    'Càn':  { start: 5, dir: 1 }   
  };
  const qMap = ['Càn', 'Khảm', 'Cấn', 'Chấn', 'Tốn', 'Ly', 'Khôn', 'Đoài'];
  const quaiName = qMap.find(q => menhQuai.includes(q)) || (typeof menhQuai === 'string' ? menhQuai.split(' ')[0] : 'Khảm');
  const rule = rules[quaiName];
  if (!rule) return null;

  const result = new Array(12);
  let idx = rule.start;
  for (let i = 0; i < 12; i++) {
    result[idx] = TRUONG_SINH_NAMES[i];
    idx += rule.dir;
    if (idx > 11) idx = 0;
    if (idx < 0) idx = 11;
  }
  return result;
};

const polarToCartesian = (cx, cy, r, angleInDegrees) => {
  const angleInRadians = (angleInDegrees) * Math.PI / 180.0;
  return {
    x: cx + (r * Math.sin(angleInRadians)),
    y: cy - (r * Math.cos(angleInRadians))
  };
};

const describeArc = (cx, cy, innerRadius, outerRadius, startAngle, endAngle) => {
  const startOuter = polarToCartesian(cx, cy, outerRadius, startAngle);
  const endOuter = polarToCartesian(cx, cy, outerRadius, endAngle);
  const startInner = polarToCartesian(cx, cy, innerRadius, startAngle);
  const endInner = polarToCartesian(cx, cy, innerRadius, endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", startOuter.x, startOuter.y,
    "A", outerRadius, outerRadius, 0, largeArcFlag, 1, endOuter.x, endOuter.y,
    "L", endInner.x, endInner.y,
    "A", innerRadius, innerRadius, 0, largeArcFlag, 0, startInner.x, startInner.y,
    "Z"
  ].join(" ");
};

const GEO_MAP = {
  'Khảm': 'Bắc', 'Cấn': 'Đông Bắc', 'Chấn': 'Đông', 'Tốn': 'Đông Nam',
  'Ly': 'Nam', 'Khôn': 'Tây Nam', 'Đoài': 'Tây', 'Càn': 'Tây Bắc'
};

const MTN_24 = [
  { name: 'Nhâm', ang: 345 }, { name: 'Tý', ang: 0 }, { name: 'Quý', ang: 15 },
  { name: 'Sửu', ang: 30 }, { name: 'Cấn', ang: 45 }, { name: 'Dần', ang: 60 },
  { name: 'Giáp', ang: 75 }, { name: 'Mão', ang: 90 }, { name: 'Ất', ang: 105 },
  { name: 'Thìn', ang: 120 }, { name: 'Tốn', ang: 135 }, { name: 'Tỵ', ang: 150 },
  { name: 'Bính', ang: 165 }, { name: 'Ngọ', ang: 180 }, { name: 'Đinh', ang: 195 },
  { name: 'Mùi', ang: 210 }, { name: 'Khôn', ang: 225 }, { name: 'Thân', ang: 240 },
  { name: 'Canh', ang: 255 }, { name: 'Dậu', ang: 270 }, { name: 'Tân', ang: 285 },
  { name: 'Tuất', ang: 300 }, { name: 'Càn', ang: 315 }, { name: 'Hợi', ang: 330 }
];

const GUA_8 = [
  { name: 'Khảm', ang: 0 }, { name: 'Cấn', ang: 45 }, { name: 'Chấn', ang: 90 },
  { name: 'Tốn', ang: 135 }, { name: 'Ly', ang: 180 }, { name: 'Khôn', ang: 225 },
  { name: 'Đoài', ang: 270 }, { name: 'Càn', ang: 315 }
];

const BatTrachCompass = ({ degree = 0, menhQuai = '', bgOpacity = 1 }) => {
  const facingRot = degree;
  const tsPhases = getTruongSinhPhases(menhQuai);
  
  const mqName = menhQuai ? menhQuai.split(' ')[0] : '';
  const mqSymbol = TRIGRAM_SYMBOLS[mqName] || '☯';

  const getBT = (tri) => {
    if (!tri || !menhQuai) return null;
    const name = getBatTrachStar(menhQuai, tri);
    if (!name) return null;
    return { name, info: BAT_TRACH_STARS[name] };
  };

  const W = 720, H = 720;
  const cx = W / 2, cy = H / 2;
  
  const R_CENTER = 70;
  const R_GUA_HAOS = 120; // Vòng Bát quái
  const R_TS = 180;       // 12 Trường sinh (MỚI: Đảo vào trong)
  const R_24M = 240;      // 24 Sơn (MỚI: Đảo ra ngoài)
  const R_BT = 310;       // Bát Trạch (Tên & màu Cát Hung)
  const R_COORD = 345;    // Vạch Tọa Độ (Ngoài cùng)

  const drawRadialText = (text, ang, r, fontSize, fill, fontWeight="normal") => {
    const pt = polarToCartesian(cx, cy, r, ang);
    return (
      <text x={pt.x} y={pt.y} fontSize={fontSize} fontWeight={fontWeight} fill={fill}
            textAnchor="middle" dominantBaseline="central"
            transform={`rotate(${ang}, ${pt.x}, ${pt.y})`}>
        {text}
      </text>
    );
  };

  const drawTrigram = (guaName, centerAng) => {
    const yaos = {
      'Khảm': [0, 1, 0], 'Cấn':  [0, 0, 1], 'Chấn': [1, 0, 0], 'Tốn':  [0, 1, 1],
      'Ly':   [1, 0, 1], 'Khôn': [0, 0, 0], 'Đoài': [1, 1, 0], 'Càn':  [1, 1, 1]
    }[guaName];
    if (!yaos) return null;

    return yaos.map((y, idx) => {
      const R = R_CENTER + 12 + idx * 12;
      const wA = 12; 
      const tIn = R - 3.5;
      const tOut = R + 3.5;

      if (y === 1) {
        return <path key={idx} d={describeArc(cx, cy, tIn, tOut, centerAng - wA, centerAng + wA)} fill="#1e293b" />;
      } else {
        return (
          <g key={idx}>
            <path d={describeArc(cx, cy, tIn, tOut, centerAng - wA, centerAng - 3.5)} fill="#1e293b" />
            <path d={describeArc(cx, cy, tIn, tOut, centerAng + 3.5, centerAng + wA)} fill="#1e293b" />
          </g>
        );
      }
    });
  };

  return (
    <div className="relative w-full max-w-[600px] aspect-square select-none mx-auto">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="w-full h-full drop-shadow-xl" style={{overflow:'visible'}} xmlns="http://www.w3.org/2000/svg">
        
        <g>
          {/* LA KINH CỐ ĐỊNH BẮC (TÝ) Ở TRUYỀN HƯỚNG TRÊN (0 ĐỘ). XOAY OFFSET -facingRot */}
          <g transform={`rotate(${-facingRot}, ${cx}, ${cy})`}>

            {/* ====== 0. VÒNG TỌA ĐỘ NGOÀI CÙNG ====== */}
            <g>
              <circle cx={cx} cy={cy} r={R_COORD} fill={`rgba(255,255,255,${0.92 * bgOpacity})`} stroke="#111" strokeWidth="2" />
              <circle cx={cx} cy={cy} r={R_BT} fill="none" stroke="#666" strokeWidth="1" />
              {Array.from({length: 72}).map((_, i) => {
                const ang = i * 5;
                const isMajor = ang % 10 === 0;
                const isText = ang % 15 === 0;
                const isSuper = ang % 90 === 0;
                
                const ptInner = polarToCartesian(cx, cy, R_BT, ang);
                const ptTick = polarToCartesian(cx, cy, R_BT + (isSuper ? 12 : (isMajor ? 8 : 4)), ang);
                
                return (
                  <g key={`coord-${i}`}>
                     <line x1={ptInner.x} y1={ptInner.y} x2={ptTick.x} y2={ptTick.y} stroke="#333" strokeWidth={isSuper ? 1.5 : 0.8} />
                     {isText && drawRadialText(ang >= 360 ? ang-360 : ang, ang, R_BT + 20, "10", isSuper ? "#b91c1c" : "#111", isSuper ? "900" : "700")}
                  </g>
                );
              })}
            </g>

            {/* ====== 1. VÒNG BÁT TRẠCH (NGOÀI CHỮ, NỀN TỎA LẶN VÀO TRUNG TÂM) ====== */}
            {GUA_8.map((gua, i) => {
              const bt = getBT(gua.name);
              const startAng = gua.ang - 22.5;
              const endAng = gua.ang + 22.5;
              let fillBg = `rgba(255,255,255,0)`;
              let fillText = '#333';
              if (bt) {
                 // bgOpacity chỉ ảnh hưởng nền vòng Trường Sinh (theo yêu cầu mới, bỏ nền vòng Bát trạch)
                 fillBg = 'transparent';
                 fillText = bt.info.type === 'Cát' ? '#b91c1c' : '#1e40af';
              }
              const ptBT = polarToCartesian(cx, cy, (R_24M + R_BT)/2, gua.ang);
              return (
                <g key={`bt-${i}`}>
                   {/* Nền kéo dài từ R_CENTER ra R_BT để tỏa trọn vẹn Cung */}
                  <path d={describeArc(cx, cy, R_CENTER, R_BT, startAng, endAng)} fill={fillBg} stroke="#666" strokeWidth="0.8" />
                  
                  {/* Đường phân giới bát quái (Kéo dài từ R_CENTER ra R_BT) */}
                  <line x1={polarToCartesian(cx, cy, R_CENTER, startAng).x} y1={polarToCartesian(cx, cy, R_CENTER, startAng).y} 
                        x2={polarToCartesian(cx, cy, R_BT, startAng).x} y2={polarToCartesian(cx, cy, R_BT, startAng).y} stroke="#1e293b" strokeWidth="3" />
                  
                  {bt && (
                    <text x={ptBT.x} y={ptBT.y} fontSize="14" fontWeight="900" fill={fillText}
                          textAnchor="middle" dominantBaseline="central"
                          transform={`rotate(${gua.ang}, ${ptBT.x}, ${ptBT.y})`}>
                      <tspan x={ptBT.x} dy="-8">{bt.name.toUpperCase()}</tspan>
                      <tspan x={ptBT.x} dy="16">{GEO_MAP[gua.name].toUpperCase()}</tspan>
                    </text>
                  )}
                </g>
              );
            })}

            {/* Các vòng khác đã được gỡ bỏ theo yêu cầu: 12 Trường Sinh, 24 Sơn, Hào Quái */}

          </g>
          
          {/* ====== 5. TRUNG CUNG (CỐ ĐỊNH, KHÔNG XOAY, HIỂN THỊ MỆNH QUÁI) ====== */}
          <g>
            <circle cx={cx} cy={cy} r={R_CENTER} fill={`rgba(255,255,255,${bgOpacity})`} stroke="#94a3b8" strokeWidth="3" />
            
            {/* Hiển thị Ký hiệu Bát Quái và Tên */}
            <text x={cx} y={cy - 10} fontSize="52" fontWeight="900" fill="#1e293b" textAnchor="middle" dominantBaseline="central">
               {mqSymbol}
            </text>
            <text x={cx} y={cy + 30} fontSize="14" fontWeight="800" fill="#dc2626" textAnchor="middle" uppercase="true" tracking="widest">
               {mqName.toUpperCase()}
            </text>

            <circle cx={cx} cy={cy} r={R_CENTER + 4} fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="3 3"/>
          </g>

          {/* ====== 6. TRỤC TỌA HƯỚNG CỐ ĐỊNH TỪ DƯỚI LÊN ĐỈNH ====== */}
          <g>
            <line x1={cx} y1={cy + R_COORD + 10} x2={cx} y2={cy - R_COORD - 20} stroke="#dc2626" strokeWidth="3" strokeDasharray="6 4" opacity="0.9" />
            <polygon points={`${cx},${cy - R_COORD - 25} ${cx - 8},${cy - R_COORD - 10} ${cx + 8},${cy - R_COORD - 10}`} fill="#dc2626" />
            <text x={cx + 12} y={cy - R_COORD - 10} fontSize="16" fontWeight="900" fill="#dc2626" textAnchor="start">HƯỚNG</text>
            <text x={cx + 12} y={cy + R_COORD + 15} fontSize="16" fontWeight="900" fill="#dc2626" textAnchor="start">TỌA</text>
          </g>
        </g>
      </svg>
    </div>
  );
};

export default BatTrachCompass;

import React, { useState, useRef } from 'react';
import { Upload, Move, Trash2, Download } from 'lucide-react';
import { toPng } from 'html-to-image';
import { getBatTrachStar, BAT_TRACH_STARS } from '../data/batTrach';

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


const FloorPlanOverlay = ({ project, chartData, onSaveOverlay }) => {
  const st = project.details?.planOverlayState || project.planOverlayState || {};
  const [image, setImage] = useState(st.image || null);
  const [scale, setScale] = useState(st.scale || 1);
  const [rotation, setRotation] = useState(st.rotation || 0); // Chỉ Xoay bản vẽ theo [0, 90, 180, 270]
  const [compassRotation, setCompassRotation] = useState(st.compassRotation || 0); // Góc Xoay chủ động La Kinh
  const [posX, setPosX] = useState(st.posX || 0);
  const [posY, setPosY] = useState(st.posY || 0);
  const [overlayOpacity, setOverlayOpacity] = useState(st.overlayOpacity !== undefined ? st.overlayOpacity : 1);
  const [viewMode, setViewMode] = useState('full'); // 'full' | 'simple'
  const [imgContrast, setImgContrast] = useState(1.0); // 1.0 = bình thường, tối đa 2.5
  const [imgSharpen, setImgSharpen] = useState(0); // 0 = off, mô phỏng sharpen bằng unsharp
  const exportRef = useRef(null);

  // === CENTROID POLYGON FEATURE ===
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [polyPoints, setPolyPoints] = useState(st.polyPoints || []);
  const [computedCentroid, setComputedCentroid] = useState(st.computedCentroid || null);

  const calculateCentroid = () => {
    if (polyPoints.length < 3) {
      alert("Cần ít nhất 3 chấm điểm ở các mép tường để tạọ thành một hình đa giác!");
      return;
    }
    let area = 0, cx = 0, cy = 0;
    for (let i = 0; i < polyPoints.length; i++) {
        let p1 = polyPoints[i], p2 = polyPoints[(i+1)%polyPoints.length];
        let cross = p1.x * p2.y - p2.x * p1.y;
        area += cross;
        cx += (p1.x + p2.x) * cross;
        cy += (p1.y + p2.y) * cross;
    }
    area /= 2;
    if (area === 0) {
      alert("Đa giác chưa hợp lệ (Bị đè xếp hoặc diện tích = 0)");
      return;
    }
    cx = Math.abs(cx / (6 * area));
    cy = Math.abs(cy / (6 * area));

    const imgEl = document.getElementById("floor-plan-image");
    if (!imgEl) return;
    const imgW = imgEl.clientWidth;
    const imgH = imgEl.clientHeight;
    
    const dx = cx - imgW/2;
    const dy = cy - imgH/2;
    
    setComputedCentroid({cx, cy, dx, dy, imgW, imgH});
    setIsDrawingMode(false);
    
    // Auto-snap
    snapCentroid(dx, dy, scale, rotation);
  };

  const snapCentroid = (dx, dy, currentScale, currentRotation) => {
    const rad = currentRotation * Math.PI / 180;
    const newX = - currentScale * (dx * Math.cos(rad) - dy * Math.sin(rad));
    const newY = - currentScale * (dx * Math.sin(rad) + dy * Math.cos(rad));
    setPosX(newX);
    setPosY(newY);
  };
  // === END CENTROID POLYGON FEATURE ===

  const facingRot = project.degree || 0;
  const tsPhases = getTruongSinhPhases(project.menhQuai);

  const saveImage = async () => {
    if (!exportRef.current) return;
    try {
      const dataURL = await toPng(exportRef.current, { cacheBust: true, backgroundColor: '#0f172a' });
      const a = document.createElement('a');
      a.href = dataURL;
      a.download = `HuyenKhong_Radial_Van${project.period}.png`;
      a.click();
    } catch(err) {
      console.error(err);
      alert("Có lỗi khi lưu ảnh. Vui lòng thử lại.");
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const resetStates = () => {
      setScale(1); setRotation(0); setPosX(0); setPosY(0);
      setPolyPoints([]); setComputedCentroid(null); setIsDrawingMode(false);
      setCompassRotation(0);
    };

    if (file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          if (!window.pdfjsLib) {
             const script = document.createElement('script');
             script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
             document.head.appendChild(script);
             await new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = () => reject(new Error("Lỗi tải thư viện PDF.js từ máy chủ CDN."));
             });
             window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          }
          const pdfjsLib = window.pdfjsLib;

          const typedarray = new Uint8Array(event.target.result);
          const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
          const page = await pdf.getPage(1);
          
          const viewport = page.getViewport({ scale: 2.0 }); // Độ nét gấp đôi
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          const renderContext = { canvasContext: ctx, viewport: viewport };
          await page.render(renderContext).promise;

          setImage(canvas.toDataURL('image/png'));
          resetStates();
        } catch(err) {
          console.error(err);
          alert("Lỗi khi đọc file PDF: " + err.message);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
        resetStates();
      };
      reader.readAsDataURL(file);
    }
  };

  const starHex = (s) => ({
    1:'#2563EB', 2:'#92400E', 3:'#059669', 4:'#059669',
    5:'#B45309', 6:'#475569', 7:'#475569', 8:'#92400E', 9:'#DC2626'
  }[s] || '#333');

  const getBT = (tri) => {
    if (!tri || !project.menhQuai) return null;
    const name = getBatTrachStar(project.menhQuai, tri);
    if (!name) return null;
    return { name, info: BAT_TRACH_STARS[name] };
  };

  const GRID_INDEX = {
    0: 7,   // Khảm
    45: 6,  // Cấn
    90: 3,  // Chấn
    135: 0, // Tốn
    180: 1, // Ly
    225: 2, // Khôn
    270: 5, // Đoài
    315: 8  // Càn
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

  // Khi chế độ đơn giản: các vòng nền trong suốt, viền rõ hơn
  const isSimple = viewMode === 'simple';
  const ringFill = (alpha = 0.95) => isSimple ? 'rgba(255,255,255,0)' : `rgba(255,255,255,${alpha * overlayOpacity})`;
  const ringStroke = isSimple ? '#444' : '#ccc';
  const ringStrokeW = isSimple ? 1.2 : 0.5;
  const dividerStroke = isSimple ? '#222' : '#999';
  const dividerStrokeW = isSimple ? 1.5 : 0.8;

  const renderSVG = () => {
    const W = 720, H = 720;
    const cx = W / 2, cy = H / 2;
    
    // TÁI CẤU TRÚC VỊ TRÍ RADIUS CÁC VÒNG TỪ TRONG RA NGOÀI
    const R_CENTER = 60;
    const R_GUA_HAOS = 100; // Vòng Bát quái (Gạch hào)
    const R_STAR = 175;     // Lớp Phi tinh
    const R_24M = 220;      // 24 Sơn
    const R_TS = 260;       // 12 Trường sinh
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

    // Hàm vẽ 3 Hào của Tiên Thiên Bát Quái
    const drawTrigram = (guaName, centerAng) => {
      const yaos = {
        'Khảm': [0, 1, 0], 'Cấn':  [0, 0, 1], 'Chấn': [1, 0, 0], 'Tốn':  [0, 1, 1],
        'Ly':   [1, 0, 1], 'Khôn': [0, 0, 0], 'Đoài': [1, 1, 0], 'Càn':  [1, 1, 1]
      }[guaName];
      if (!yaos) return null;

      // Sát lại nhau hơn
      return yaos.map((y, idx) => {
        const R = R_CENTER + 8 + idx * 8;
        const wA = 10; // half-width ngàm góc (20 độ dài)
        const tIn = R - 2.5;
        const tOut = R + 2.5;

        if (y === 1) {
          return <path key={idx} d={describeArc(cx, cy, tIn, tOut, centerAng - wA, centerAng + wA)} fill="#1e293b" />;
        } else {
          return (
            <g key={idx}>
              <path d={describeArc(cx, cy, tIn, tOut, centerAng - wA, centerAng - 2.5)} fill="#1e293b" />
              <path d={describeArc(cx, cy, tIn, tOut, centerAng + 2.5, centerAng + wA)} fill="#1e293b" />
            </g>
          );
        }
      });
    };

    return (
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="w-full h-full" style={{overflow:'visible'}} xmlns="http://www.w3.org/2000/svg">
        
        <g>
          {/* LA KINH CỐ ĐỊNH BẮC (TÝ) Ở TRUYỀN HƯỚNG TRÊN (0 ĐỘ). XOAY OFFSET -facingRot + compassRotation bù trừ */}
          <g transform={`rotate(${-facingRot + compassRotation}, ${cx}, ${cy})`}>

            {/* ====== 0. VÒNG TỌA ĐỘ NGOÀI CÙNG ====== */}
            <g>
              <circle cx={cx} cy={cy} r={R_COORD} fill={isSimple ? 'rgba(255,255,255,0)' : `rgba(255,255,255,${0.92 * overlayOpacity})`} stroke="#111" strokeWidth={isSimple ? 2.5 : 2} />
              <circle cx={cx} cy={cy} r={R_BT} fill="none" stroke={ringStroke} strokeWidth={isSimple ? 1.5 : 1} />
            {Array.from({length: 72}).map((_, i) => {
              const ang = i * 5;
              const isMajor = ang % 10 === 0;
              const isText = ang % 15 === 0;
              const isSuper = ang % 90 === 0;
              
              const ptInner = polarToCartesian(cx, cy, R_BT, ang);
              const ptTick = polarToCartesian(cx, cy, R_BT + (isSuper ? 14 : (isMajor ? 9 : 5)), ang);
              
              return (
                <g key={`coord-${i}`}>
                   <line x1={ptInner.x} y1={ptInner.y} x2={ptTick.x} y2={ptTick.y} stroke="#333" strokeWidth={isSuper ? 2 : (isMajor ? 1.2 : 0.8)} />
                   {isText && drawRadialText(ang >= 360 ? ang-360 : ang, ang, R_BT + 22, "10", isSuper ? "#b91c1c" : "#111", isSuper ? "900" : "700")}
                </g>
              );
            })}
          </g>

          {/* ====== 1. VÒNG BÁT TRẠCH (NGOÀI CÙNG) ====== */}
          {GUA_8.map((gua, i) => {
            const bt = getBT(gua.name);
            const startAng = gua.ang - 22.5;
            const endAng = gua.ang + 22.5;
            let fillBg = isSimple ? 'rgba(255,255,255,0)' : `rgba(255,255,255,${0.6 * overlayOpacity})`;
            let fillText = '#333';
            if (bt && !isSimple) {
               fillBg = bt.info.type === 'Cát' ? `rgba(255,255,120,${0.8 * overlayOpacity})` : `rgba(180,255,180,${0.8 * overlayOpacity})`;
               fillText = bt.info.type === 'Cát' ? '#b91c1c' : '#1e40af';
            }
            const ptBT = polarToCartesian(cx, cy, (R_TS + R_BT)/2, gua.ang);
            return (
              <g key={`bt-${i}`}>
                <path d={describeArc(cx, cy, R_TS, R_BT, startAng, endAng)} fill={fillBg} stroke={isSimple ? '#333' : '#666'} strokeWidth={isSimple ? 1.5 : 0.8} />
                
                {/* ĐƯỜNG CHIA 8 HƯỚNG (NẾT ĐẬM NHẤT) */}
                <line x1={polarToCartesian(cx, cy, R_CENTER, startAng).x} y1={polarToCartesian(cx, cy, R_CENTER, startAng).y} 
                      x2={polarToCartesian(cx, cy, isSimple ? R_COORD : R_BT, startAng).x} y2={polarToCartesian(cx, cy, isSimple ? R_COORD : R_BT, startAng).y} 
                      stroke={isSimple ? "#000" : "#444"} strokeWidth={isSimple ? "3" : "2"} />
                
                {bt && (
                  <text x={ptBT.x} y={ptBT.y} fontSize={isSimple ? "15" : "14"} fontWeight="900" fill={isSimple ? '#000' : fillText}
                        textAnchor="middle" dominantBaseline="central"
                        transform={`rotate(${gua.ang}, ${ptBT.x}, ${ptBT.y})`}>
                    <tspan x={ptBT.x} dy="-8">{bt.name.toUpperCase()}</tspan>
                    <tspan x={ptBT.x} dy="16">{GEO_MAP[gua.name].toUpperCase()}</tspan>
                  </text>
                )}
              </g>
            );
          })}

          {/* ====== 2. VÒNG 12 TRƯỜNG SINH (ẩn ở chế độ đơn giản) ====== */}
          {!isSimple && tsPhases && tsPhases.map((phase, i) => {
            const startAng = -22.5 + i*30;
            const endAng = 7.5 + i*30;
            const midAng = -7.5 + i*30;
            const ptBorderBase = polarToCartesian(cx, cy, R_24M, startAng);
            const ptBorderEnd = polarToCartesian(cx, cy, R_TS, startAng);
            
            return (
              <g key={`ts-${i}`}>
                <path d={describeArc(cx, cy, R_24M, R_TS, startAng, endAng)} fill={ringFill(0.95)} stroke={ringStroke} strokeWidth={ringStrokeW}/>
                <line x1={ptBorderBase.x} y1={ptBorderBase.y} x2={ptBorderEnd.x} y2={ptBorderEnd.y} stroke="#aaa" strokeWidth="0.8" />
                {drawRadialText(phase, midAng, (R_24M + R_TS)/2, "11", "#92400E", "800")}
              </g>
            );
          })}

          {/* ====== 3. VÒNG 24 SƠN ====== */}
          {MTN_24.map((m, i) => {
            const startAng = m.ang - 7.5;
            const endAng = m.ang + 7.5;
            const ptStart = polarToCartesian(cx, cy, R_STAR, startAng);
            // Ở chế độ đơn giản: Đường chia 24 sơn kéo dài ra ngoài vòng Tọa độ
            // Chế độ đầy đủ: chỉ kéo ra tới R_24M
            const ptEnd24 = isSimple ? polarToCartesian(cx, cy, R_COORD, startAng) : polarToCartesian(cx, cy, R_24M, startAng);
            
            // Nếu startAng trùng với đường ranh 8 bát quái (startAng - 22.5 == k*45) thì ko cần vẽ vì đã có kẻ đậm bên Bát Quái
            const is8DirBoundary = Math.abs((startAng - 22.5) % 45) < 0.1 || Math.abs((startAng + 22.5) % 45) < 0.1;

            return (
              <g key={`mtn-${i}`}>
                <path d={describeArc(cx, cy, R_STAR, R_24M, startAng, endAng)} fill={ringFill(0.95)} stroke={ringStroke} strokeWidth={ringStrokeW} />
                
                {/* Đường chia 24 hướng (Đậm vừa) */}
                {!is8DirBoundary && (
                  <line x1={ptStart.x} y1={ptStart.y} x2={ptEnd24.x} y2={ptEnd24.y}
                        stroke={isSimple ? "#222" : "#666"}
                        strokeWidth={isSimple ? "2" : "1.5"}
                        strokeDasharray={isSimple ? '0' : '4 2'} />
                )}
                
                {drawRadialText(m.name, m.ang, (R_STAR + R_24M)/2, isSimple ? '15' : '13',
                  isSimple ? '#000' : '#222', '900')}
              </g>
            );
          })}

          {/* ====== 4. VÒNG PHI TINH ====== */}
          {GUA_8.map((gua, i) => {
            const startAng = gua.ang - 22.5;
            const endAng = gua.ang + 22.5;
            const cellData = chartData.finalGrid[GRID_INDEX[gua.ang]];
            if (!cellData) return null;

            const ptBase = polarToCartesian(cx, cy, R_STAR - 20, gua.ang);
            const ptSitting = polarToCartesian(cx, cy, R_STAR - 52, gua.ang - 12);
            const ptFacing  = polarToCartesian(cx, cy, R_STAR - 52, gua.ang + 12);

            return (
              <g key={`star-${i}`}>
                <path d={describeArc(cx, cy, R_GUA_HAOS, R_STAR, startAng, endAng)} fill={ringFill(0.95)} stroke={ringStroke} strokeWidth={ringStrokeW}/>
                
                <text x={ptBase.x} y={ptBase.y} fontSize="28" fontWeight="900" fill={starHex(cellData.base)} opacity={isSimple ? 0.12 : 0.25} textAnchor="middle" dominantBaseline="central" transform={`rotate(${facingRot}, ${ptBase.x}, ${ptBase.y})`}>{cellData.base}</text>
                <text x={ptSitting.x} y={ptSitting.y} fontSize="24" fontWeight="900" fill={starHex(cellData.sitting)} textAnchor="middle" dominantBaseline="central" transform={`rotate(${facingRot}, ${ptSitting.x}, ${ptSitting.y})`}>{cellData.sitting}</text>
                <text x={ptFacing.x} y={ptFacing.y} fontSize="24" fontWeight="900" fill={starHex(cellData.facing)} textAnchor="middle" dominantBaseline="central" transform={`rotate(${facingRot}, ${ptFacing.x}, ${ptFacing.y})`}>{cellData.facing}</text>
              </g>
            );
          })}

          {/* ====== 5. VÒNG HÀO QUÁI TIÊN THIÊN (ẩn ở chế độ đơn giản) ====== */}
          {!isSimple && GUA_8.map((gua, i) => {
            const startAng = gua.ang - 22.5;
            const endAng = gua.ang + 22.5;
            return (
               <g key={`hao-${i}`}>
                 <path d={describeArc(cx, cy, R_CENTER, R_GUA_HAOS, startAng, endAng)} fill={`rgba(240,248,255,${0.95 * overlayOpacity})`} stroke="#ccc" strokeWidth="0.5" />
                 {drawTrigram(gua.name, gua.ang)}
               </g>
            );
          })}

          {/* ====== 5b. CHẾ ĐỘ ĐƠN GIẢN: Đường chia 8 cung từ tâm ra ngoài, tên hướng rõ ====== */}
          {isSimple && GUA_8.map((gua, i) => {
            const startAng = gua.ang - 22.5;
            const endAng = gua.ang + 22.5;
            const ptLabel = polarToCartesian(cx, cy, R_CENTER + 24, gua.ang);
            return (
              <g key={`simple-gua-${i}`}>
                <path d={describeArc(cx, cy, R_CENTER, R_GUA_HAOS, startAng, endAng)} fill='rgba(255,255,255,0)' stroke='#444' strokeWidth="1.2" />
                <text x={ptLabel.x} y={ptLabel.y} fontSize="11" fontWeight="900" fill="#1e293b"
                      textAnchor="middle" dominantBaseline="central"
                      transform={`rotate(${gua.ang}, ${ptLabel.x}, ${ptLabel.y})`}>
                  {gua.name}
                </text>
              </g>
            );
          })}

        </g>
        
          {/* ====== TRUNG CUNG VÀ TRỤC TỌA HƯỚNG CỐ ĐỊNH ====== */}
          {/* LA KINH CỐ ĐỊNH, MŨI TÊN CHỈ CHUẨN LÊN TRÊN */}
          <g>
            <circle cx={cx} cy={cy} r={R_CENTER} fill={isSimple ? 'rgba(255,255,255,0)' : `rgba(255,255,255,${0.98 * overlayOpacity})`} stroke="#444" strokeWidth="2" />
            
            {/* ĐIỂM ĐỎ TRUNG TÂM LA KINH */}
          <circle cx={cx} cy={cy} r="6" fill="#dc2626" />
          <circle cx={cx} cy={cy} r="2" fill="#fff" />
          <line x1={cx-15} y1={cy} x2={cx+15} y2={cy} stroke="#dc2626" strokeWidth="1" />
          <line x1={cx} y1={cy-15} x2={cx} y2={cy+15} stroke="#dc2626" strokeWidth="1" />

          {(() => {
             const cData = chartData.finalGrid[4];
             if (!cData) return null;
             
             const ptBase = {x: cx, y: cy - 14};
             const ptSitting = {x: cx - 18, y: cy + 12};
             const ptFacing = {x: cx + 18, y: cy + 12};

             return (
               <g>
                 <text x={ptBase.x} y={ptBase.y} fontSize="28" fontWeight="900" fill={starHex(cData.base)} opacity="0.3" textAnchor="middle" dominantBaseline="central">{cData.base}</text>
                 <text x={ptSitting.x} y={ptSitting.y} fontSize="24" fontWeight="900" fill={starHex(cData.sitting)} textAnchor="middle" dominantBaseline="central">{cData.sitting}</text>
                 <text x={ptFacing.x} y={ptFacing.y} fontSize="24" fontWeight="900" fill={starHex(cData.facing)} textAnchor="middle" dominantBaseline="central">{cData.facing}</text>
                 
                 <line x1={cx-4} y1={cy} x2={cx+4} y2={cy} stroke="#dc2626" strokeWidth="1.5" />
                 <line x1={cx} y1={cy-4} x2={cx} y2={cy+4} stroke="#dc2626" strokeWidth="1.5" />
               </g>
             )
          })()}

          {/* TRỤC TỌA HƯỚNG TỪ DƯỚI LÊN ĐỈNH */}
          <line x1={cx} y1={cy + R_COORD + 10} x2={cx} y2={cy - R_COORD - 20} stroke="#dc2626" strokeWidth={isSimple ? 3.5 : 2.5} strokeDasharray={isSimple ? '0' : '5 3'} opacity="0.9" />
            <polygon points={`${cx},${cy - R_COORD - 28} ${cx - 10},${cy - R_COORD - 10} ${cx + 10},${cy - R_COORD - 10}`} fill="#dc2626" />
            <text x={cx} y={cy - R_COORD - 46} fontSize={isSimple ? '16' : '14'} fontWeight="900" fill="#dc2626" textAnchor="middle">HƯỚNG</text>
            <text x={cx} y={cy + R_COORD + 34} fontSize={isSimple ? '16' : '14'} fontWeight="900" fill="#dc2626" textAnchor="middle">TỌA</text>
          </g>
        </g>
      </svg>
    );
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-200">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 border-b pb-4">
        <div>
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Move className="text-indigo-500" /> Trải La Kinh (Radial Overlay)
          </h3>
          <p className="text-sm text-slate-500 font-medium mt-1">Lưới la bàn chuẩn Phong Thủy, Xoay chuẩn Tọa Hướng <b>{facingRot}°</b></p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {!image ? (
            <label className="cursor-pointer bg-indigo-50 text-indigo-700 px-4 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 hover:bg-indigo-100 transition-colors">
              <Upload size={18} />
              Tải Bản Vẽ Mặt Bằng (Ảnh / PDF)
              <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleUpload} />
            </label>
          ) : (
            <>
              <button onClick={() => setImage(null)} className="px-4 py-2.5 rounded-xl font-black text-sm text-rose-600 bg-rose-50 hover:bg-rose-100 flex items-center gap-2 transition-colors">
                <Trash2 size={18} /> Xóa ảnh
              </button>
              <button onClick={() => onSaveOverlay && onSaveOverlay({ image, scale, rotation, compassRotation, posX, posY, overlayOpacity, polyPoints, computedCentroid })} className="px-4 py-2.5 rounded-xl font-black text-sm text-emerald-700 bg-emerald-50 hover:bg-emerald-100 flex items-center gap-2 transition-colors border border-emerald-200">
                Lưu Khớp Nối
              </button>
              <button onClick={saveImage} className="px-4 py-2.5 rounded-xl font-black text-sm text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2 transition-colors shadow-md">
                <Download size={18} /> Lưu PDF/Ảnh
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
        <div className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
             <h4 className="font-black text-slate-700 text-sm mb-4 uppercase tracking-wider">Căn Chỉnh Bản Vẽ</h4>
             <div className="space-y-6">
                <div>
                   <label className="text-xs font-bold text-slate-500 mb-2 flex justify-between">
                     <span>Thu / Phóng (Kích thước)</span>
                     <span className="text-indigo-600">{scale.toFixed(2)}x</span>
                   </label>
                   <input type="range" min="0.2" max="3" step="0.05" value={scale} onChange={e => setScale(parseFloat(e.target.value))} className="w-full accent-indigo-600" disabled={!image} />
                </div>
                
                {/* 4 Nút Xoay Ảnh để khớp với phương của La Kinh */}
                <div>
                   <label className="text-xs font-bold text-slate-500 mb-2 flex justify-between">
                     <span>Xoay ảnh bản vẽ</span>
                     <span className="text-indigo-600">{rotation}°</span>
                   </label>
                   <div className="flex gap-2">
                     {[0, 90, 180, 270].map(deg => (
                        <button key={deg} disabled={!image} onClick={() => setRotation(deg)} 
                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50
                                ${rotation === deg ? 'bg-indigo-600 text-white shadow' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
                          {deg}°
                        </button>
                     ))}
                   </div>
                   <p className="text-[10px] text-slate-500 mt-2 font-medium">Bản vẽ thường chỉ cần lật mốc Vuông góc để hợp với phương La Kinh (Nên xoay Mặt Tiền về phía Đỉnh màn hình).</p>
                </div>

                {/* DỊCH CHUYỂN NGANG DỌC BẢN VẼ */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-slate-500 mb-2 flex justify-between">
                      <span>Dịch Ngang (X)</span>
                    </label>
                    <input type="range" min="-800" max="800" step="10" value={posX} onChange={e => setPosX(Number(e.target.value))} className="w-full accent-indigo-600" disabled={!image} />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-slate-500 mb-2 flex justify-between">
                      <span>Dịch Dọc (Y)</span>
                    </label>
                    <input type="range" min="-800" max="800" step="10" value={posY} onChange={e => setPosY(Number(e.target.value))} className="w-full accent-indigo-600" disabled={!image} />
                  </div>
                </div>

                {/* TOOL: CẮM TRỌNG TÂM BẰNG ĐA GIÁC */}
                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                  <h4 className="font-black text-slate-700 text-xs mb-3 flex items-center gap-2">
                    CÔNG CỤ TÌM TRỌNG TÂM NHÀ
                  </h4>
                  {isDrawingMode ? (
                     <div className="space-y-3">
                       <p className="text-xs text-indigo-700 font-medium">Bấm chấm lần lượt vào các góc mép ngoài của ngôi nhà (từ góc này nối góc kia) để khoanh vùng diện tích. ({polyPoints.length} điểm)</p>
                       <div className="flex gap-2">
                          <button onClick={calculateCentroid} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2 rounded-lg shadow-sm">Tính Tâm & Căn La Kinh</button>
                          <button onClick={() => setPolyPoints(polyPoints.slice(0, -1))} className="px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold py-2 rounded-lg">Lùi</button>
                          <button onClick={() => { setIsDrawingMode(false); setPolyPoints([]); }} className="px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold py-2 rounded-lg">Hủy</button>
                       </div>
                     </div>
                  ) : (
                     <div className="space-y-3">
                       <button onClick={() => { setIsDrawingMode(true); setPolyPoints([]); setComputedCentroid(null); }} className="w-full bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 text-xs font-black py-2.5 rounded-xl transition-colors flex justify-center items-center shadow-sm">
                         [+] Vẽ bao quanh nhà & Định Tâm Tự Động
                       </button>
                       {computedCentroid && (
                         <div className="flex gap-2">
                           <button onClick={() => snapCentroid(computedCentroid.dx, computedCentroid.dy, scale, rotation)} className="flex-1 bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200 text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1">
                             Gắn Tâm Lại Vào La Kinh
                           </button>
                           <button onClick={() => setComputedCentroid(null)} className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 text-xs font-bold">Xóa Góc</button>
                         </div>
                       )}
                     </div>
                  )}
                </div>

                {/* ──── CHẾ ĐỘ XEM LA KINH ──── */}
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wider">Chế độ xem La Kinh</label>
                  <div className="flex gap-2">
                    <button onClick={() => setViewMode('full')}
                      className={`flex-1 py-2 rounded-xl text-xs font-black transition-all border ${
                        viewMode === 'full' ? 'bg-indigo-600 text-white border-indigo-600 shadow' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                      }`}>
                      🗄 Đầy Đủ
                    </button>
                    <button onClick={() => setViewMode('simple')}
                      className={`flex-1 py-2 rounded-xl text-xs font-black transition-all border ${
                        viewMode === 'simple' ? 'bg-slate-700 text-white border-slate-700 shadow' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                      }`}>
                      ☯ Đơn Giản
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                    {viewMode === 'simple' ? 'Nền trong suốt, ẩn hào Bát Quái và Trường Sinh — làm rõ đường Sơn / Hướng.' : 'Hiển thị đầy đủ Bát Trạch, Trường Sinh và hào Bát Quái.'}
                  </p>
                </div>

                {/* ──── ĐỘ TRONG SUỐT LA KINH ──── */}
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-2 flex justify-between">
                    <span>Độ trong suốt Lưới La Kinh</span>
                    <span className="text-indigo-600">{Math.round(overlayOpacity * 100)}%</span>
                  </label>
                  <input type="range" min="0.05" max="1" step="0.05" value={overlayOpacity} onChange={e => setOverlayOpacity(parseFloat(e.target.value))} className="w-full accent-indigo-600" />
                </div>

                {/* ──── TĂNG SẮC NÉT ẢNH BẢN VẼ ──── */}
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-2 flex justify-between">
                    <span>Tăng Nét Bản Vẽ Công Trình</span>
                    <span className="text-indigo-600">{imgContrast.toFixed(1)}x</span>
                  </label>
                  <input type="range" min="1" max="2.5" step="0.1" value={imgContrast}
                    onChange={e => setImgContrast(parseFloat(e.target.value))}
                    className="w-full accent-slate-700" disabled={!image} />
                  <p className="text-[10px] text-slate-400 mt-1">Tăng độ tương phản làm đậm nét đường vẽ kiến trúc.</p>
                </div>

                <div>
                   <label className="text-xs font-bold text-slate-500 mb-2 flex justify-between">
                     <span>Xoay Lệch Bù Trừ La Kinh</span>
                     <span className="text-indigo-600">{compassRotation}°</span>
                   </label>
                   <input type="range" min="-180" max="180" step="1" value={compassRotation} onChange={e => setCompassRotation(Number(e.target.value))} className="w-full accent-indigo-600" disabled={!image} />
                   <p className="text-[10px] text-slate-500 mt-2 font-medium">Xoay bánh xe la bàn để bù trừ sai số từ thiên hoặc muốn ép nhích hệ thống góc phân kim.</p>
                </div>
             </div>
          </div>

          <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 flex items-start gap-3">
             <Move className="text-indigo-500 mt-0.5 shrink-0" size={18} />
             <div className="text-sm text-indigo-900 leading-relaxed font-medium">
               <strong>Hướng dẫn:</strong> Upload mặt bằng, kéo thả cho phần Mũi Tên Đỏ chỉ đúng vào cửa sổ/hướng nhà. La Kinh sẽ tự động khớp độ lệch ({facingRot}°) với vòng Tọa Độ!
             </div>
          </div>
        </div>

        {/* Khung hiển thị Overlay */}
        <div className="bg-slate-100 rounded-3xl overflow-hidden border border-slate-300 relative min-h-[500px] md:min-h-[750px] flex items-center justify-center shadow-inner"
             ref={exportRef}
        >
          {image ? (
            <div 
              className={`absolute ${isDrawingMode ? 'cursor-crosshair' : 'cursor-move'}`}
              style={{
                transform: `translate(${posX}px, ${posY}px) rotate(${rotation}deg) scale(${scale})`,
                transition: 'transform 0.05s linear',
                transformOrigin: 'center center'
              }}
              onMouseDown={(e) => {
                if (isDrawingMode) {
                  // Lấy tọa độ click trên mặt phẳng chưa áp rotation/scale của div
                  const x = e.nativeEvent.offsetX;
                  const y = e.nativeEvent.offsetY;
                  if (x !== undefined && y !== undefined) {
                     setPolyPoints([...polyPoints, {x, y}]);
                  }
                  return;
                }
                const startX = e.clientX - posX;
                const startY = e.clientY - posY;
                const handleMouseMove = (moveEvent) => {
                  setPosX(moveEvent.clientX - startX);
                  setPosY(moveEvent.clientY - startY);
                };
                const handleMouseUp = () => {
                  window.removeEventListener('mousemove', handleMouseMove);
                  window.removeEventListener('mouseup', handleMouseUp);
                };
                window.addEventListener('mousemove', handleMouseMove);
                window.addEventListener('mouseup', handleMouseUp);
              }}
            >
              <img id="floor-plan-image" src={image} alt="Mặt bằng" className="max-w-[800px] pointer-events-none"
                style={{
                  opacity: 0.9,
                  filter: `contrast(${imgContrast}) ${imgContrast > 1.2 ? 'brightness(1.05) saturate(0.8)' : ''}`,
                  imageRendering: 'crisp-edges'
                }} />
              
              {/* Lớp SVG hiển thị đường vẽ Tâm đa giác trên mặt bằng gốc */}
              <svg className="absolute inset-0 pointer-events-none" style={{width: '100%', height: '100%', overflow:'visible'}}>
                 {polyPoints.length > 0 && (
                   <polygon points={polyPoints.map(p => `${p.x},${p.y}`).join(' ')} fill="rgba(99, 102, 241, 0.25)" stroke="#4f46e5" strokeWidth="3" strokeDasharray={isDrawingMode ? "5" : "0"} strokeLinejoin="round" />
                 )}
                 {polyPoints.map((p, i) => (
                   <circle key={i} cx={p.x} cy={p.y} r="5" fill="#ef4444" stroke="#fff" strokeWidth="1.5" />
                 ))}
                 {computedCentroid && (
                   <g>
                     <circle cx={computedCentroid.cx} cy={computedCentroid.cy} r="6" fill="#10b981" stroke="#fff" strokeWidth="2" />
                     <circle cx={computedCentroid.cx} cy={computedCentroid.cy} r="16" fill="rgba(16, 185, 129, 0.4)" className="animate-pulse" />
                     <text x={computedCentroid.cx} y={computedCentroid.cy - 12} fontSize="12" fill="#047857" fontWeight="bold" textAnchor="middle">Tâm Nhà</text>
                   </g>
                 )}
              </svg>
            </div>
          ) : (
            <div className="absolute text-slate-400 font-bold text-sm">Chưa có ảnh mặt bằng</div>
          )}

          {/* SVG Lưới tia đè lên trên */}
          <div className="absolute inset-0 max-w-full max-h-full py-8 pointer-events-none flex items-center justify-center z-10 transition-all">
             {renderSVG()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloorPlanOverlay;

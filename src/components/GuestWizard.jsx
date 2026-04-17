import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowRight, ArrowLeft, MapPin, Compass, User,
  Map as MapIcon, X, Upload, ZoomIn, ZoomOut,
  Eye, EyeOff, RotateCcw, Check, AlertCircle,
  Smartphone, Keyboard, Pencil, Image as ImageIcon,
  Target, Undo2, Trash2, Download, Share2, FileText
} from 'lucide-react';
import BatTrachCompass from './BatTrachCompass';
import DynamicCompass from './DynamicCompass';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

// Import data from batTrach
import { BAT_TRACH_STARS, GUA_DIRECTIONS, BAT_TRACH_MATRIX, getBatTrachStar } from '../data/batTrach';

// ──────────── PDF → Image (pdfjs-dist v3) ────────────
const renderPdfToImage = async (file) => {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf  = await pdfjsLib.getDocument({ data }).promise;
  const page = await pdf.getPage(1);
  const vp   = page.getViewport({ scale: 2.5 });
  const cvs  = document.createElement('canvas');
  cvs.width  = vp.width;
  cvs.height = vp.height;
  await page.render({ canvasContext: cvs.getContext('2d'), viewport: vp }).promise;
  return cvs.toDataURL('image/png');
};

// ──────────── Centroid of a polygon ────────────
const calcCentroid = (pts) => {
  if (pts.length < 3) return null;
  let area = 0, cx = 0, cy = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    const cross = pts[i].x * pts[j].y - pts[j].x * pts[i].y;
    area += cross;
    cx += (pts[i].x + pts[j].x) * cross;
    cy += (pts[i].y + pts[j].y) * cross;
  }
  area /= 2;
  if (Math.abs(area) < 1e-6) return null;
  cx /= (6 * area);
  cy /= (6 * area);
  return { x: cx, y: cy };
};

// ══════════════════════════════════════════════════════════════
// STEP 3: FLOOR PLAN + LA KINH OVERLAY
// ══════════════════════════════════════════════════════════════
const SmartMiniFloorPlan = ({ degree, menhQuai, onComplete, initialData }) => {
  const [tab, setTab]             = useState('SHAPE');
  const [shapeParams, setShape]   = useState(initialData?.shapeParams || { width: 5, length: 15 });
  const [image, setImage]         = useState(initialData?.image || null);
  const [fileName, setFileName]   = useState('');
  const [loadingFile, setLoading] = useState(false);

  // La Kinh controls
  const [lkScale, setLkScale]     = useState(initialData?.lkScale || 80);
  const [lkOpacity, setLkOpacity] = useState(initialData?.lkOpacity || 85);
  const [showLk, setShowLk]       = useState(initialData?.showLk ?? true);

  // Drawing state
  const [drawPoints, setDrawPoints]         = useState(initialData?.drawPoints || []);
  const [isPolygonClosed, setPolygonClosed]  = useState(initialData?.isPolygonClosed || false);
  const [centroid, setCentroid]              = useState(initialData?.centroid || null);

  // New Image Controls
  const [imgTransform, setImgTransform]      = useState(initialData?.imgTransform || { rot: 0, highContrast: false });

  // Container measurement
  const canvasRef = useRef(null);
  const [dims, setDims] = useState({ w: 600, h: 500 });
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const obs = new ResizeObserver(entries => {
      const r = entries[0]?.contentRect;
      if (r) setDims({ w: r.width, h: r.height });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    if (file.type === 'application/pdf') {
      setLoading(true);
      try { setImage(await renderPdfToImage(file)); }
      catch (err) { console.error(err); alert('Lỗi PDF – vui lòng dùng ảnh PNG/JPG.'); }
      finally { setLoading(false); }
    } else {
      const reader = new FileReader();
      reader.onload = (ev) => setImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCanvasClick = (e) => {
    if (tab !== 'DRAW' || isPolygonClosed) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (drawPoints.length > 2) {
      const f = drawPoints[0];
      if (Math.hypot(x - f.x, y - f.y) < 20) { closePolygon(); return; }
    }
    setDrawPoints(prev => [...prev, { x, y }]);
  };

  const closePolygon = () => {
    setPolygonClosed(true);
    setCentroid(calcCentroid(drawPoints));
  };
  const undoPoint = () => {
    if (isPolygonClosed) { setPolygonClosed(false); setCentroid(null); }
    setDrawPoints(prev => prev.slice(0, -1));
  };
  const clearDraw = () => {
    setDrawPoints([]); setPolygonClosed(false); setCentroid(null);
  };

  const aspect  = shapeParams.width / shapeParams.length;
  const maxPW   = dims.w * 0.8;
  const maxPH   = dims.h * 0.8;
  const planW   = maxPW / aspect <= maxPH ? maxPW : maxPH * aspect;
  const planH   = maxPW / aspect <= maxPH ? maxPW / aspect : maxPH;
  const lkPx = Math.min(dims.w, dims.h) * (lkScale / 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xl overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center shrink-0">
          <MapIcon className="text-emerald-600" size={18} />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-black text-slate-800 leading-tight">Sơ Đồ Bản Vẽ & La Kinh</h3>
          <p className="text-[11px] text-slate-400 font-semibold truncate">Căn chỉnh và đo vẽ để chuẩn bị phân tích</p>
        </div>
      </div>

      <div className="p-4 md:p-5 space-y-4 flex-1 overflow-y-auto">
        <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
          {[
            { id: 'SHAPE', icon: Pencil, label: 'Kích Thước' },
            { id: 'IMAGE', icon: ImageIcon, label: 'Tải Bản Vẽ' },
            { id: 'DRAW',  icon: Target,    label: 'Vẽ Bao Quanh' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-2 text-[11px] md:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5
                ${tab === t.id ? 'bg-white shadow-md text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
              <t.icon size={13} /> {t.label}
            </button>
          ))}
        </div>

        {tab === 'SHAPE' && (
          <div className="flex items-end gap-2 justify-center">
            <div className="w-28">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block text-center">Ngang (m)</label>
              <input type="number" min="1" max="200" step="0.5" value={shapeParams.width}
                onChange={e => setShape({ ...shapeParams, width: Math.max(1, Number(e.target.value)) })}
                className="w-full mt-1 px-2 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 text-center focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none bg-white" />
            </div>
            <span className="text-slate-300 font-bold text-lg pb-2">×</span>
            <div className="w-28">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block text-center">Sâu (m)</label>
              <input type="number" min="1" max="200" step="0.5" value={shapeParams.length}
                onChange={e => setShape({ ...shapeParams, length: Math.max(1, Number(e.target.value)) })}
                className="w-full mt-1 px-2 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 text-center focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none bg-white" />
            </div>
          </div>
        )}

        {tab === 'IMAGE' && (
          <div className="space-y-3">
            <label className="cursor-pointer border-2 border-dashed border-slate-300 bg-white p-4 rounded-xl flex items-center gap-4 hover:bg-indigo-50 hover:border-indigo-300 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center shrink-0">
                {loadingFile ? <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /> : <Upload className="text-slate-400 group-hover:text-indigo-500" size={18} />}
              </div>
              <div className="min-w-0">
                <span className="font-bold text-sm text-slate-600 group-hover:text-indigo-600 block truncate">
                  {loadingFile ? 'Đang xử lý...' : fileName || 'Chọn File Bản Vẽ'}
                </span>
                <span className="text-[10px] text-slate-400">Hỗ trợ PNG, JPG, PDF</span>
              </div>
              <input type="file" accept="image/*,.pdf,application/pdf" className="hidden" onChange={handleFile} />
            </label>
            {image && (
              <div className="flex gap-2">
                <button onClick={() => setImgTransform(p => ({ ...p, rot: (p.rot + 90) % 360 }))}
                  className="flex-1 py-1.5 bg-slate-100 rounded-xl text-xs font-bold text-slate-700 flex justify-center items-center gap-1.5 hover:bg-slate-200">
                  <RotateCcw size={14}/> Xoay 90°
                </button>
                <button onClick={() => setImgTransform(p => ({ ...p, highContrast: !p.highContrast }))}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex justify-center items-center gap-1.5 transition-colors 
                    ${imgTransform.highContrast ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                  <Eye size={14}/> Làm rõ nét
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'DRAW' && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-indigo-700 flex items-center gap-2">
            <Target size={14} className="shrink-0" />
            {!isPolygonClosed
              ? drawPoints.length === 0 ? 'Bấm trên canvas để đánh dấu các đỉnh nhà' : drawPoints.length < 3 ? `Đã đặt ${drawPoints.length} đỉnh — cần ≥ 3 đỉnh` : `${drawPoints.length} đỉnh — bấm gần điểm đầu hoặc "Đóng đa giác"`
              : `✅ ${drawPoints.length} đỉnh — Trung tâm đã xác định`}
          </div>
        )}

        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Điều Khiển La Kinh</span>
            <div className="flex gap-1.5">
              <button onClick={() => setShowLk(!showLk)}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 border transition-all
                  ${showLk ? 'bg-indigo-50 border-indigo-300 text-indigo-600' : 'bg-slate-200 border-slate-300 text-slate-400'}`}>
                {showLk ? <><Eye size={12}/> Hiện</> : <><EyeOff size={12}/> Ẩn</>}
              </button>
              <button onClick={() => { setLkScale(80); setLkOpacity(85); setShowLk(true); }}
                className="px-2 py-1 rounded-lg border border-slate-300 text-slate-400 hover:text-slate-600 transition" title="Reset">
                <RotateCcw size={12} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ZoomOut size={12} className="text-slate-400 shrink-0" />
            <input type="range" min="30" max="150" step="5" value={lkScale} onChange={e => setLkScale(Number(e.target.value))}
              className="flex-1 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600" />
            <ZoomIn size={12} className="text-slate-400 shrink-0" />
            <span className="text-[10px] font-bold text-slate-400 w-9 text-right">{lkScale}%</span>
          </div>
          <div className="flex items-center gap-2">
            <EyeOff size={12} className="text-slate-400 shrink-0" />
            <input type="range" min="10" max="100" step="5" value={lkOpacity} onChange={e => setLkOpacity(Number(e.target.value))}
              className="flex-1 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600" />
            <Eye size={12} className="text-slate-400 shrink-0" />
            <span className="text-[10px] font-bold text-slate-400 w-9 text-right">{lkOpacity}%</span>
          </div>
        </div>

        <div ref={canvasRef} onClick={tab === 'DRAW' ? handleCanvasClick : undefined}
          className="relative bg-slate-100 rounded-xl w-full border border-slate-200 overflow-hidden flex items-center justify-center"
          style={{ height: '50vh', minHeight: '350px', cursor: tab === 'DRAW' && !isPolygonClosed ? 'crosshair' : 'default' }}>
          
          {tab === 'SHAPE' && (
            <div style={{ width: `${planW}px`, height: `${planH}px` }}
              className="bg-white border-[5px] border-slate-900 shadow-2xl relative flex flex-col items-center justify-between transition-all duration-500 rounded-sm">
              <span className="text-[9px] font-bold text-slate-400 mt-1.5 select-none">{shapeParams.width}m × {shapeParams.length}m</span>
              <div className="absolute inset-[6px] border-2 border-slate-500/30 pointer-events-none rounded-sm" />
              <span className="text-[10px] font-black text-white bg-red-600 px-3 py-0.5 rounded-full absolute -bottom-3 z-20 shadow-md whitespace-nowrap tracking-wide">
                HƯỚNG NHÀ {degree}°
              </span>
            </div>
          )}

          {(tab === 'IMAGE' || tab === 'DRAW') && image && (
            <img src={image} alt="Bản vẽ" className="absolute object-contain transition-all duration-300 pointer-events-none"
              style={{ maxWidth: '80%', maxHeight: '80%', opacity: 0.8,
                       transform: `rotate(${imgTransform.rot}deg)`,
                       filter: imgTransform.highContrast ? 'grayscale(100%) contrast(200%)' : 'none' }} />
          )}
          {tab === 'IMAGE' && !image && (
            <div className="text-center text-slate-400 select-none">
              <MapIcon size={40} className="mx-auto mb-2 opacity-20" />
              <p className="text-sm font-bold">Chưa có bản vẽ</p>
            </div>
          )}

          {tab === 'DRAW' && (
            <>
              {!image && <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.5 }} />}
              <svg className="absolute inset-0 w-full h-full z-[5]" style={{ pointerEvents: isPolygonClosed ? 'none' : 'auto' }}>
                {drawPoints.length > 2 && <polygon points={drawPoints.map(p => `${p.x},${p.y}`).join(' ')} fill={isPolygonClosed ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.06)'} stroke="#6366f1" strokeWidth="2.5" strokeDasharray={isPolygonClosed ? '0' : '6 3'} strokeLinejoin="round" />}
                {drawPoints.length === 2 && <polyline points={drawPoints.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#6366f1" strokeWidth="2" strokeDasharray="6 3" />}
                {!isPolygonClosed && drawPoints.length > 1 && <line x1={drawPoints[drawPoints.length - 1].x} y1={drawPoints[drawPoints.length - 1].y} x2={drawPoints[0].x} y2={drawPoints[0].y} stroke="#818cf8" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />}
                {drawPoints.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={i === 0 ? 8 : 5} fill={i === 0 ? '#6366f1' : '#818cf8'} stroke="white" strokeWidth="2" />)}
                {centroid && <g>
                  <circle cx={centroid.x} cy={centroid.y} r={7} fill="#ef4444" stroke="white" strokeWidth="2.5" />
                  <line x1={centroid.x - 14} y1={centroid.y} x2={centroid.x + 14} y2={centroid.y} stroke="#ef4444" strokeWidth="2" />
                  <line x1={centroid.x} y1={centroid.y - 14} x2={centroid.x} y2={centroid.y + 14} stroke="#ef4444" strokeWidth="2" />
                </g>}
              </svg>
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-20">
                <div className="flex gap-1.5">
                  <button onClick={(e) => { e.stopPropagation(); undoPoint(); }} disabled={!drawPoints.length} className="bg-white/90 backdrop-blur shadow-sm border border-slate-200 text-slate-600 disabled:text-slate-300 px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 hover:bg-white transition disabled:cursor-not-allowed"><Undo2 size={12} /> Bỏ điểm</button>
                  <button onClick={(e) => { e.stopPropagation(); clearDraw(); }} disabled={!drawPoints.length} className="bg-white/90 backdrop-blur shadow-sm border border-slate-200 text-red-500 disabled:text-slate-300 px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 hover:bg-white transition disabled:cursor-not-allowed"><Trash2 size={12} /> Xóa</button>
                </div>
                {drawPoints.length > 2 && !isPolygonClosed && <button onClick={(e) => { e.stopPropagation(); closePolygon(); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-md transition"><Check size={12} /> Đóng đa giác</button>}
              </div>
            </>
          )}

          {showLk && (
            <div className="absolute pointer-events-none transition-all duration-300 drop-shadow-xl"
              style={{
                width: `${lkPx}px`, height: `${lkPx}px`, zIndex: 10,
                ...(centroid && tab === 'DRAW' ? { left: `${centroid.x - lkPx / 2}px`, top: `${centroid.y - lkPx / 2}px` } : { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' })
              }}>
              <BatTrachCompass degree={degree} menhQuai={menhQuai} bgOpacity={lkOpacity / 100} />
            </div>
          )}
        </div>

        <button onClick={() => onComplete({ shapeParams, image, lkScale, lkOpacity, showLk, drawPoints, isPolygonClosed, centroid, imgTransform })}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-5 py-3.5 rounded-xl shadow-lg w-full transition-all hover:scale-[1.02] flex items-center justify-center gap-2">
          Kết Quả Phân Tích <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// STEP 4: ANALYSIS SUMMARY (SPLIT VIEW)
// ══════════════════════════════════════════════════════════════
const BasicAnalysisSummary = ({ data, onBack, onGoToLogin }) => {
  const resultRef = useRef(null);
  const planRef = useRef(null);

  const getMenhType = (mq) => {
    const q = mq.split(' ')[0];
    if (['Khảm', 'Ly', 'Chấn', 'Tốn'].includes(q)) return 'Đông Tứ Mệnh';
    return 'Tây Tứ Mệnh';
  };

  const getTuoiHan = (birthYear) => {
    const currentYear = 2026;
    const age = currentYear - birthYear + 1; // Tuổi Mụ
    
    // Kim Lâu
    const klMod = age % 9;
    const hasKimLau = [1, 3, 6, 8].includes(klMod);
    
    // Hoang Ốc
    const tens = Math.floor(age / 10);
    const units = age % 10;
    const hoVal = (tens + units - 1) % 6;
    const hoMap = {0: 'Nhất Cát', 1: 'Nhì Nghi', 2: 'Tam Địa Sát', 3: 'Tứ Tấn Tài', 4: 'Ngũ Thọ Tử', 5: 'Lục Hoang Ốc'};
    const hasHoangOc = [2, 4, 5].includes(hoVal);

    // Thái Tuế (mặc định 2026 Bính Ngọ)
    const animalIdx = (birthYear - 4) % 12; // 0=Tý ... 6=Ngọ
    const thaiTueAnimals = [0, 1, 3, 6, 9]; // Tý, Sửu, Mão, Ngọ, Dậu
    const hasThaiTue = thaiTueAnimals.includes(animalIdx);

    return {
      age,
      kimLau: hasKimLau ? 'Phạm Kim Lâu' : 'Không phạm',
      hoangOc: hoMap[hoVal] + (hasHoangOc ? ' (Xấu)' : ' (Tốt)'),
      thaiTue: hasThaiTue ? 'Phạm Thái Tuế' : 'Không phạm'
    };
  };

  const huongDo = data.degree;
  const menhQuaiName = data.menhQuai.split(' ')[0];
  const menhType = getMenhType(menhQuaiName);

  // Tìm khu vực để luận hướng nhà
  const getHuongQuai = (deg) => {
    const d = (deg + 22.5) % 360;
    const idx = Math.floor(d / 45);
    return ['Khảm', 'Cấn', 'Chấn', 'Tốn', 'Ly', 'Khôn', 'Đoài', 'Càn'][idx];
  };

  const huongQuai = getHuongQuai(huongDo);
  const huongSao = getBatTrachStar(menhQuaiName, huongQuai);
  const saoInfo = BAT_TRACH_STARS[huongSao] || {};
  
  // Tổng hợp hướng Cát Hung
  const allStars = Object.entries(BAT_TRACH_MATRIX[menhQuaiName]).reduce((acc, [qua, star]) => {
    const type = BAT_TRACH_STARS[star].type;
    const dirName = GUA_DIRECTIONS.find(g => g.name === qua).dir;
    acc[type].push({ qua, dirName, star });
    return acc;
  }, { 'Cát': [], 'Hung': [] });

  const hanInfo = getTuoiHan(data.birthYear);

  const captureScreen = async () => {
    if (!resultRef.current) return;
    try {
      const canvas = await html2canvas(resultRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/jpeg', 0.8);
      
      // Share API if mobile
      if (navigator.share) {
        const blob = await (await fetch(imgData)).blob();
        const file = new File([blob], 'PhongThuy.jpg', { type: 'image/jpeg' });
        await navigator.share({
          title: 'Kết Quả Phong Thủy',
          text: `Luận giải Phong Thủy cho tuổi ${data.birthYear} - Mệnh ${data.menhQuai}`,
          files: [file]
        });
      } else {
        // Download fallback
        const link = document.createElement('a');
        link.download = `PhongThuy_${data.birthYear}.jpg`;
        link.href = imgData;
        link.click();
      }
    } catch (err) {
      console.error(err);
      alert("Tính năng Share cần hỗ trợ trên trình duyệt điện thoại.");
    }
  };

  const exportPDF = async () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const W = pdf.internal.pageSize.getWidth();
      const H = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentW = W - margin * 2;
      let y = margin;

      // ─── FONT LOADING ───
      try {
        const arrayBufferToBase64 = (buffer) => {
          let binary = '';
          const bytes = new Uint8Array(buffer);
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          return btoa(binary);
        };
        const regRes = await fetch('/Roboto-Regular.ttf');
        const regBuf = await regRes.arrayBuffer();
        pdf.addFileToVFS('Roboto-Regular.ttf', arrayBufferToBase64(regBuf));
        pdf.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');

        const boldRes = await fetch('/Roboto-Bold.ttf');
        const boldBuf = await boldRes.arrayBuffer();
        pdf.addFileToVFS('Roboto-Bold.ttf', arrayBufferToBase64(boldBuf));
        pdf.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');

        pdf.setFont('Roboto', 'normal');
      } catch (err) {
        console.warn('Cannot load font', err);
      }

      const setFont = (style = 'normal', size = 10) => {
        pdf.setFont('Roboto', style);
        pdf.setFontSize(size);
      };

      // ─── Helper functions ───
      const checkPage = (need = 30) => { if (y + need > H - margin) { pdf.addPage(); y = margin; } };
      const drawHR = () => {
        pdf.setDrawColor(200); pdf.setLineWidth(0.3);
        pdf.line(margin, y, W - margin, y); y += 4;
      };

      // ─── HEADER ───
      pdf.setFillColor(30, 41, 59);
      pdf.rect(0, 0, W, 42, 'F');
      pdf.setTextColor(255);
      setFont('bold', 20);
      pdf.text('BÁO CÁO PHONG THỦY', W / 2, 16, { align: 'center' });
      setFont('normal', 10);
      pdf.text('Khảo Sát Nhanh - Bát Trạch & Khí Cung', W / 2, 25, { align: 'center' });
      setFont('normal', 8);
      pdf.setTextColor(180);
      const now = new Date();
      pdf.text(`Ngày lập: ${now.toLocaleDateString('vi-VN')} ${now.toLocaleTimeString('vi-VN')}`, W / 2, 34, { align: 'center' });
      y = 50;

      // ─── 1. THONG TIN GIA CHU ───
      pdf.setTextColor(30, 41, 59);
      setFont('bold', 13);
      pdf.text('1. THÔNG TIN GIA CHỦ', margin, y);
      y += 8;

      pdf.setFillColor(238, 242, 255);
      pdf.roundedRect(margin, y, contentW, 38, 3, 3, 'F');
      setFont('normal', 10);
      pdf.setTextColor(60);
      const info = [
        ['Năm sinh:', `${data.birthYear} (Tuổi mụ: ${hanInfo.age})`],
        ['Giới tính:', data.gender],
        ['Cung phi:', data.menhQuai],
        ['Nhóm:', menhType],
      ];
      let infoY = y + 7;
      info.forEach(([label, val]) => {
        pdf.setTextColor(120);
        setFont('normal', 10);
        pdf.text(label, margin + 6, infoY);
        pdf.setTextColor(30, 41, 59);
        setFont('bold', 10);
        pdf.text(val, margin + 40, infoY);
        infoY += 8;
      });
      y += 44;

      // ─── 2. LUAN HUONG NHA ───
      checkPage(50);
      pdf.setTextColor(30, 41, 59);
      setFont('bold', 13);
      pdf.text('2. LUẬN HƯỚNG NHÀ ĐANG ĐO', margin, y);
      y += 8;

      const isCat = saoInfo.type === 'Cat' || saoInfo.type === 'Cát';
      pdf.setFillColor(isCat ? 236 : 254, isCat ? 253 : 242, isCat ? 245 : 242);
      pdf.roundedRect(margin, y, contentW, 42, 3, 3, 'F');

      setFont('normal', 10);
      pdf.setTextColor(60);
      pdf.text(`Hướng độ: ${huongDo}°`, margin + 6, y + 8);
      const guaDir = GUA_DIRECTIONS.find(g => g.name === huongQuai);
      pdf.text(`Phương: ${guaDir ? guaDir.dir : huongQuai}`, margin + 90, y + 8);

      pdf.text('Gặp sao:', margin + 6, y + 18);
      pdf.setTextColor(isCat ? 21 : 185, isCat ? 128 : 28, isCat ? 61 : 28);
      setFont('bold', 10);
      pdf.text(`${huongSao} (${saoInfo.type || ''})`, margin + 35, y + 18);

      pdf.setTextColor(60);
      setFont('normal', 8);
      const descLines = pdf.splitTextToSize(saoInfo.desc || '', contentW - 12);
      let descY = y + 27;
      descLines.forEach(line => {
        if (descY < y + 42) { pdf.text(line, margin + 6, descY); descY += 4; }
      });
      y += 48;

      // ─── 3. GOI Y PHOI TRI KHONG GIAN ───
      checkPage(50);
      pdf.setTextColor(30, 41, 59);
      setFont('bold', 13);
      pdf.text('3. GỢI Ý PHỐI TRÍ KHÔNG GIAN', margin, y);
      y += 8;

      const colW = (contentW - 6) / 2;
      const leftX = margin;
      const rightX = margin + colW + 6;

      // Cát table
      pdf.setFillColor(236, 253, 245);
      pdf.roundedRect(leftX, y, colW, 8, 2, 2, 'F');
      pdf.setTextColor(21, 128, 61);
      setFont('bold', 9);
      pdf.text('HƯỚNG CÁT (Cửa, Giường):', leftX + 4, y + 5.5);

      // Hung table
      pdf.setFillColor(254, 242, 242);
      pdf.roundedRect(rightX, y, colW, 8, 2, 2, 'F');
      pdf.setTextColor(185, 28, 28);
      setFont('bold', 9);
      pdf.text('HƯỚNG HUNG (Tọa Bếp, WC):', rightX + 4, y + 5.5);
      
      let tableY = y + 10;
      let startTableY = tableY;

      setFont('normal', 8);
      allStars['Cát'].forEach((x) => {
        pdf.setFillColor(249, 250, 251);
        pdf.roundedRect(leftX + 2, tableY, colW - 4, 7, 1, 1, 'F');
        pdf.setTextColor(21, 128, 61);
        pdf.text(`${x.star}`, leftX + 5, tableY + 5);
        pdf.setTextColor(80);
        pdf.text(`- ${x.dirName} (${x.qua})`, leftX + 32, tableY + 5);
        tableY += 8;
      });

      let maxTableY = tableY;
      tableY = startTableY;

      allStars['Hung'].forEach((x) => {
        pdf.setFillColor(249, 250, 251);
        pdf.roundedRect(rightX + 2, tableY, colW - 4, 7, 1, 1, 'F');
        pdf.setTextColor(185, 28, 28);
        pdf.text(`${x.star}`, rightX + 5, tableY + 5);
        pdf.setTextColor(80);
        pdf.text(`- ${x.dirName} (${x.qua})`, rightX + 32, tableY + 5);
        tableY += 8;
      });

      if (tableY > maxTableY) maxTableY = tableY;
      y = maxTableY + 4;


      // ─── 4. TUOI HAN ───
      checkPage(45);
      pdf.setTextColor(30, 41, 59);
      setFont('bold', 13);
      pdf.text('4. TUỔI HẠN (Năm hiện tại 2026)', margin, y);
      y += 8;

      pdf.setFillColor(255, 251, 235);
      pdf.roundedRect(margin, y, contentW, 30, 3, 3, 'F');
      setFont('normal', 10);
      const hanData = [
        ['Kim Lâu:', hanInfo.kimLau],
        ['Hoang Ốc:', hanInfo.hoangOc],
        ['Thái Tuế:', hanInfo.thaiTue],
      ];
      let hanY = y + 8;
      hanData.forEach(([label, val]) => {
        pdf.setTextColor(120, 53, 2);
        setFont('bold', 10);
        pdf.text(label, margin + 6, hanY);
        pdf.setTextColor(60);
        setFont('normal', 10);
        const isXau = val.includes('Phạm') || val.includes('Xấu') || val.includes('Xau') || val.includes('Pham');
        if (isXau) pdf.setTextColor(185, 28, 28);
        pdf.text(val, margin + 40, hanY);
        hanY += 9;
      });
      y += 38;


      // ─── 5. IMAGE CAPTURE (La Kinh) ───
      if (planRef.current) {
        checkPage(50);
        pdf.setTextColor(30, 41, 59);
        setFont('bold', 13);
        pdf.text('5. BẢN VẼ MẶT BẰNG & LA KINH', margin, y);
        y += 6;

        try {
          const canvasImage = await html2canvas(planRef.current, { scale: 2, useCORS: true, logging: false, backgroundColor: '#f1f5f9' });
          const imgData = canvasImage.toDataURL('image/jpeg', 0.85);
          
          const imgRatio = canvasImage.height / canvasImage.width;
          let drawW = contentW;
          let drawH = drawW * imgRatio;

          const availableH = H - margin - y - 15; // remaining space

          if (drawH > availableH) {
            // Need more space
            if (availableH < 120 && drawH > availableH) { 
               pdf.addPage();
               y = margin;
               drawW = contentW;
               drawH = drawW * imgRatio;
               const maxNewH = H - margin * 2 - 15;
               if (drawH > maxNewH) {
                  drawH = maxNewH;
                  drawW = drawH / imgRatio;
               }
            } else {
               drawH = availableH;
               drawW = drawH / imgRatio;
            }
          }
          
          pdf.addImage(imgData, 'JPEG', margin + (contentW - drawW)/2, y, drawW, drawH);
          y += drawH + 10;
        } catch (e) {
          console.warn('Lỗi capture bản vẽ:', e);
          y += 5;
        }
      }

      // ─── FOOTER ───
      checkPage(25);
      drawHR();
      pdf.setFillColor(30, 41, 59);
      pdf.roundedRect(margin, y, contentW, 18, 3, 3, 'F');
      pdf.setTextColor(255);
      setFont('bold', 9);
      pdf.text('Huyền Không Phi Tinh - Phần mềm phong thủy chuyên nghiệp', W / 2, y + 7, { align: 'center' });
      setFont('normal', 7);
      pdf.setTextColor(180);
      pdf.text('Để phân tích chuyên sâu Huyền Không, vui lòng đăng nhập ứng dụng.', W / 2, y + 13, { align: 'center' });

      // Save
      pdf.save(`PhongThuy_${data.birthYear}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
      alert("Lỗi khi xuất PDF. Vui lòng thử lại.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 h-full animate-slide-up" ref={resultRef}>
      
      {/* LEFT: Read-only Blueprint + Compass */}
      <div className="w-full md:w-1/2 bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200/60 p-4">
        <h4 className="font-black text-slate-800 mb-2 flex items-center gap-2">
          <MapIcon size={16} className="text-indigo-600"/> Sơ Đồ Căn Bản
        </h4>
        <div className="relative bg-slate-100 rounded-xl w-full border border-slate-200 overflow-hidden flex items-center justify-center p-4 h-[300px] md:h-[450px]" ref={planRef}>
          {data.planData.image && (
             <img src={data.planData.image} alt="Bản vẽ" className="absolute object-contain"
               style={{ maxWidth: '80%', maxHeight: '80%', opacity: 0.8,
               transform: `rotate(${data.planData.imgTransform.rot}deg)`,
               filter: data.planData.imgTransform.highContrast ? 'grayscale(100%) contrast(200%)' : 'none' 
             }} />
          )}
          {!data.planData.image && data.planData.shapeParams && (
            <div style={{ padding: '20px' }}>[Mô phỏng kích thước: {data.planData.shapeParams.width}m x {data.planData.shapeParams.length}m]</div>
          )}
          {data.planData.showLk && (
            <div className="absolute pointer-events-none drop-shadow-xl"
              style={{
                width: `80%`, height: `80%`, zIndex: 10, left: '50%', top: '50%', transform: 'translate(-50%, -50%)'
              }}>
              <BatTrachCompass degree={huongDo} menhQuai={data.menhQuai} bgOpacity={data.planData.lkOpacity / 100} />
            </div>
          )}
        </div>
        <div className="flex justify-between items-center mt-3">
          <button onClick={onBack} className="text-indigo-600 text-sm font-bold flex items-center gap-1.5 hover:underline">
            <ArrowLeft size={16}/> Chỉnh sửa Sơ Đồ
          </button>
          <div className="flex gap-2">
            <button onClick={captureScreen} className="bg-slate-800 hover:bg-slate-900 text-white rounded-lg px-3 py-2 text-sm font-bold flex items-center gap-1 shadow-md">
              <Share2 size={14}/> Lưu ảnh
            </button>
            <button onClick={exportPDF} className="bg-rose-600 hover:bg-rose-700 text-white rounded-lg px-3 py-2 text-sm font-bold flex items-center gap-1 shadow-md">
              <Download size={14}/> Xuất PDF
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: Analysis Results */}
      <div className="w-full md:w-1/2 flex flex-col gap-4">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-5 md:p-6 overflow-y-auto max-h-[550px]">
          <h3 className="text-lg md:text-xl font-black text-slate-800 border-b pb-3 mb-4">Kết Quả Phân Tích</h3>
          
          <div className="space-y-5">
            {/* 1. Master Info */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
              <h4 className="text-indigo-800 font-bold text-sm mb-2 uppercase tracking-wide flex items-center gap-2"><User size={16}/> Thông Tin Gia Chủ</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-slate-500">Năm sinh:</span> <span className="font-bold text-slate-800">{data.birthYear} (Tuổi mụ: {hanInfo.age})</span></div>
                <div><span className="text-slate-500">Giới tính:</span> <span className="font-bold text-slate-800">{data.gender}</span></div>
                <div><span className="text-slate-500">Cung phi:</span> <span className="font-bold text-indigo-700 text-base">{data.menhQuai}</span></div>
                <div><span className="text-slate-500">Nhóm:</span> <span className="font-bold text-indigo-700 text-base">{menhType}</span></div>
              </div>
            </div>

            {/* 2. Analysis */}
            <div>
              <h4 className="text-slate-800 font-bold text-sm mb-2 uppercase tracking-wide flex items-center gap-2"><Compass size={16}/> Luận Hướng Nhà Đang Đo</h4>
              <div className={`rounded-xl p-4 border ${saoInfo.type === 'Cát' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'} text-sm`}>
                <p className="mb-1"><span className="text-slate-600">Hướng độ:</span> <span className="font-black text-lg">{huongDo}°</span> (phương {GUA_DIRECTIONS.find(g => g.name === huongQuai).dir})</p>
                <p className="mb-1"><span className="text-slate-600">Gặp sao:</span> <span className={`font-black text-lg ${saoInfo.type === 'Cát' ? 'text-emerald-700' : 'text-red-700'}`}>{huongSao} ({saoInfo.type})</span></p>
                <p className="text-slate-700 leading-relaxed text-xs md:text-sm mt-2">{saoInfo.desc}</p>
              </div>
            </div>

            {/* 3. Phối Trí */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm">
              <h4 className="text-slate-800 font-bold text-sm mb-2 uppercase tracking-wide">Gợi Ý Phối Trí Không Gian</h4>
              <ul className="space-y-2 text-slate-700 text-xs md:text-sm">
                <li><strong className="text-emerald-700">Hướng Cát bổ ích (Nên mở Cửa, đặt Giường, Ban chờ):</strong> <br/>{allStars['Cát'].map(x => `${x.dirName} (${x.star})`).join(', ')}.</li>
                <li><strong className="text-red-700">Hướng Hung (Tọa Hung Hướng Cát cho Bếp, WC):</strong> <br/>{allStars['Hung'].map(x => `${x.dirName} (${x.star})`).join(', ')}. Đặt tọa tại các hướng này để trấn yểm.</li>
              </ul>
            </div>

            {/* 4. Hạn */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
              <h4 className="text-amber-900 font-bold text-sm mb-2 uppercase tracking-wide">Tuổi Hạn (Năm hiện tại 2026)</h4>
              <ul className="space-y-1.5 text-slate-800 text-xs md:text-sm">
                <li><strong className="w-24 inline-block text-amber-900">Kim Lâu:</strong> {hanInfo.kimLau}</li>
                <li><strong className="w-24 inline-block text-amber-900">Hoang Ốc:</strong> {hanInfo.hoangOc}</li>
                <li><strong className="w-24 inline-block text-amber-900">Thái Tuế:</strong> {hanInfo.thaiTue}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-slate-800 to-indigo-900 p-4 md:p-5 rounded-2xl shadow-xl border border-indigo-700 mt-auto">
          <h4 className="text-white font-black text-sm md:text-base mb-1">Cần phân tích chuyên sâu Huyền Không?</h4>
          <p className="text-indigo-200 text-xs mb-3">Xem các vòng sao phi tinh, phân tích sát khí loan đầu và nhận báo cáo chi tiết!</p>
          <button onClick={onGoToLogin} className="w-full bg-white text-indigo-900 hover:bg-slate-50 font-black py-3 rounded-xl shadow-lg transition-all hover:scale-105">
            🔑 Đăng Nhập & Mở Khóa Full App
          </button>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// MAIN WIZARD
// ══════════════════════════════════════════════════════════════
const GuestWizard = ({ onGoToLogin, onCancel }) => {
  const [step, setStep] = useState(1);
  const [projectData, setProjectData] = useState({
    degree: 0, birthYear: 1990, gender: 'Nam', menhQuai: '', planData: null
  });

  // ── Compass state ──
  const [compassMode, setCompassMode]        = useState('MANUAL');
  const [isCompassActive, setCompassActive]   = useState(false);
  const [compassCaptured, setCompassCapture]  = useState(false);
  const [compassError, setCompassError]       = useState('');

  const handleOrientation = useCallback((ev) => {
    let h;
    if (ev.webkitCompassHeading !== undefined) h = Math.round(ev.webkitCompassHeading);
    else if (ev.alpha !== null) h = Math.round((360 - ev.alpha) % 360);
    if (h !== undefined) setProjectData(prev => ({ ...prev, degree: h }));
  }, []);

  const startSensor = async () => {
    setCompassError('');
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const perm = await DeviceOrientationEvent.requestPermission();
        if (perm === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation, true);
          setCompassActive(true);
        } else { setCompassError('Quyền cảm biến bị từ chối.'); }
      } catch { setCompassError('Cần HTTPS để dùng cảm biến.'); }
    } else if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientationabsolute', handleOrientation, true);
      window.addEventListener('deviceorientation', handleOrientation, true);
      setCompassActive(true);
    } else {
      setCompassError('Thiết bị không hỗ trợ la bàn – hãy nhập thủ công.');
    }
  };

  const stopSensor = useCallback(() => {
    window.removeEventListener('deviceorientation', handleOrientation, true);
    window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
    setCompassActive(false);
  }, [handleOrientation]);

  useEffect(() => () => stopSensor(), [stopSensor]);

  // ── Menh Quai ──
  const calcMenhQuai = (year, gender) => {
    let y = parseInt(year);
    if (isNaN(y) || y < 1900 || y > 2100) return 'Khảm';
    let sum = 0;
    while (y > 0) { sum += y % 10; y = Math.floor(y / 10); }
    while (sum > 9) { let t = 0; while (sum > 0) { t += sum % 10; sum = Math.floor(sum / 10); } sum = t; }
    if (gender === 'Nam') return { 1:'Khảm',2:'Ly',3:'Cấn',4:'Đoài',5:'Càn',6:'Khôn',7:'Tốn',8:'Chấn',9:'Khôn' }[sum] || 'Khảm';
    return { 1:'Cấn',2:'Càn',3:'Đoài',4:'Cấn',5:'Ly',6:'Khảm',7:'Khôn',8:'Chấn',9:'Tốn' }[sum] || 'Khảm';
  };

  const STEPS = [
    { n: 1, label: 'Gia Chủ', Icon: User },
    { n: 2, label: 'La Bàn',  Icon: Compass },
    { n: 3, label: 'Bản Vẽ',  Icon: MapIcon },
    { n: 4, label: 'Kết Quả', Icon: FileText },
  ];

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900 overflow-y-auto">
      <div className="w-full max-w-5xl mx-auto bg-gradient-to-b from-slate-900 to-slate-950 min-h-screen relative shadow-2xl md:border-x md:border-slate-800 flex flex-col pb-20">
        
        <button onClick={onCancel}
          className="fixed top-3 right-3 md:absolute md:top-4 md:right-4 p-2 bg-slate-800/90 backdrop-blur rounded-full text-slate-400 hover:text-red-400 hover:bg-red-950/50 transition z-50 shadow-md border border-slate-700">
          <X size={18} />
        </button>

        {/* ── HEADER ── */}
        <div className="bg-slate-800/60 backdrop-blur-sm border-b border-slate-700/50 p-5 pt-9 md:pt-8 px-6 text-center relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-600/10 rounded-full blur-3xl" />

          <h2 className="text-xl md:text-2xl font-black text-white relative z-10">Khảo Sát Khí Cung & Bát Trạch</h2>
          
          <div className="flex justify-center items-center mt-6 gap-0 relative z-10 max-w-lg mx-auto">
            {STEPS.map((s, i) => {
              const { Icon } = s;
              const isActive  = step >= s.n;
              const isCurrent = step === s.n;
              return (
                <React.Fragment key={s.n}>
                  {i > 0 && <div className={`flex-1 h-0.5 mx-1 rounded-full transition-colors duration-500 ${step > s.n - 1 ? 'bg-indigo-500' : 'bg-slate-700'}`} />}
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all duration-300
                      ${isCurrent ? 'bg-indigo-600 border-indigo-500 text-white scale-110 shadow-lg shadow-indigo-500/30'
                        : isActive ? 'bg-indigo-500/20 border-indigo-400/50 text-indigo-400'
                        : 'bg-slate-800 border-slate-600 text-slate-500'}`}>
                      <Icon size={14} />
                    </div>
                    <span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-wider hidden md:block
                      ${isCurrent ? 'text-indigo-400' : isActive ? 'text-slate-500' : 'text-slate-600'}`}>
                      {s.label}
                    </span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="p-4 md:p-6 flex-1 flex flex-col">
          
          {/* STEP 1: BIRTH INFO */}
          {step === 1 && (
            <div className="animate-slide-up space-y-6 flex-1 flex flex-col items-center justify-center">
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/50 shadow-xl w-full max-w-md text-center space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mx-auto">
                  <User className="text-amber-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">Thông Tin Gia Chủ</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">Dùng để tính Mệnh Quái và tuổi Hạn</p>
                </div>
                <div className="space-y-4 text-left">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Năm Sinh (DL)</label>
                    <input type="number" min="1900" max="2050" value={projectData.birthYear} onChange={e => setProjectData({ ...projectData, birthYear: e.target.value })}
                      className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 text-center focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition bg-white" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Giới Tính</label>
                    <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                      <button onClick={() => setProjectData({ ...projectData, gender: 'Nam' })}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${projectData.gender === 'Nam' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>♂ Nam</button>
                      <button onClick={() => setProjectData({ ...projectData, gender: 'Nữ' })}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${projectData.gender === 'Nữ' ? 'bg-white shadow text-rose-500' : 'text-slate-500'}`}>♀ Nữ</button>
                    </div>
                  </div>
                </div>
              </div>
              <button onClick={() => {
                setProjectData(prev => ({ ...prev, menhQuai: calcMenhQuai(prev.birthYear, prev.gender) }));
                setStep(2);
              }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-8 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2 hover:shadow-indigo-500/20">
                Tiếp tục <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* STEP 2: COMPASS */}
          {step === 2 && (
            <div className="animate-slide-up space-y-5">
              <div className="bg-white rounded-2xl border border-slate-200/50 shadow-xl overflow-hidden max-w-lg mx-auto">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center shrink-0">
                    <Compass className="text-indigo-600" size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-800">Đo Hướng Nhà</h3>
                    <p className="text-[11px] text-slate-400 font-semibold">Quay ra cửa chính, điện thoại song song mặt đất</p>
                  </div>
                </div>
                <div className="p-4 md:p-5 space-y-5">
                  <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                    <button onClick={() => setCompassMode('AUTO')} className={`flex-1 py-2 text-xs md:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${compassMode === 'AUTO' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}><Smartphone size={14} /> Điên Thoại</button>
                    <button onClick={() => { stopSensor(); setCompassMode('MANUAL'); }} className={`flex-1 py-2 text-xs md:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${compassMode === 'MANUAL' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}><Keyboard size={14} /> Nhập Tay</button>
                  </div>
                  <div className="flex justify-center">
                    <DynamicCompass degree={projectData.degree} onChange={compassMode === 'MANUAL' ? d => setProjectData({ ...projectData, degree: d }) : undefined} readOnly={compassMode === 'AUTO'} />
                  </div>
                  {compassMode === 'AUTO' && (
                    <div className="space-y-3 max-w-sm mx-auto">
                      {compassError && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-medium flex items-center gap-2"><AlertCircle size={14} /> {compassError}</div>}
                      {!isCompassActive && !compassCaptured && <button onClick={startSensor} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-3 rounded-xl shadow-md w-full transition text-sm">🧭 Bật Cảm Biến</button>}
                      {isCompassActive && !compassCaptured && (
                        <div className="space-y-3">
                          <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 p-3 rounded-xl font-black text-2xl text-center">{projectData.degree}°</div>
                          <button onClick={() => { stopSensor(); setCompassCapture(true); }} className="bg-red-500 hover:bg-red-600 text-white font-black px-5 py-3 rounded-xl shadow-md w-full transition animate-pulse text-sm">CHỐT HƯỚNG</button>
                        </div>
                      )}
                      {compassCaptured && (
                        <div className="space-y-2">
                          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-xl font-black text-xl text-center flex items-center justify-center gap-2"><Check size={18} /> {projectData.degree}°</div>
                          <button onClick={() => { setCompassCapture(false); startSensor(); }} className="text-slate-500 hover:text-slate-700 font-bold text-xs underline mx-auto block">Đo lại</button>
                        </div>
                      )}
                    </div>
                  )}
                  {compassMode === 'MANUAL' && (
                    <div className="flex items-center justify-center gap-3 max-w-xs mx-auto">
                      <label className="text-sm font-bold text-slate-600 whitespace-nowrap">Hướng:</label>
                      <input type="number" min="0" max="360" step="0.5" value={projectData.degree} onChange={e => setProjectData({ ...projectData, degree: Math.min(360, Math.max(0, Number(e.target.value))) })}
                        className="w-20 px-2 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 text-center text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition bg-white" />
                      <span className="text-base font-bold text-slate-400">°</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-center gap-4">
                <button onClick={() => setStep(1)} className="px-5 py-2.5 font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition flex items-center gap-1.5 text-sm"><ArrowLeft size={16} /> Quay lại</button>
                <button onClick={() => setStep(3)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-2 text-sm">Xác nhận <ArrowRight size={16} /></button>
              </div>
            </div>
          )}

          {/* STEP 3: FLOOR PLAN */}
          {step === 3 && (
             <div className="animate-slide-up flex-1 flex flex-col items-center">
               <div className="w-full h-full max-w-3xl">
                 <SmartMiniFloorPlan 
                   degree={projectData.degree} 
                   menhQuai={projectData.menhQuai}
                   initialData={projectData.planData}
                   onComplete={(planData) => {
                     setProjectData(p => ({ ...p, planData }));
                     setStep(4);
                   }} />
               </div>
               <button onClick={() => setStep(2)} className="mt-4 px-5 py-2.5 font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition flex items-center gap-1.5 text-sm">
                 <ArrowLeft size={16} /> Sửa La Bàn
               </button>
             </div>
          )}

          {/* STEP 4: RESULTS */}
          {step === 4 && projectData.planData && (
             <BasicAnalysisSummary 
               data={projectData} 
               onBack={() => setStep(3)}
               onGoToLogin={() => onGoToLogin(projectData)} 
             />
          )}

        </div>
      </div>
    </div>
  );
};

export default GuestWizard;

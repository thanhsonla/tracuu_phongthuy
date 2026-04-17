import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowRight, ArrowLeft, MapPin, Compass, User,
  Map as MapIcon, X, Upload, ZoomIn, ZoomOut,
  Eye, EyeOff, RotateCcw, Check, AlertCircle,
  Smartphone, Keyboard, Pencil, Image as ImageIcon,
  Target, Undo2, Trash2
} from 'lucide-react';
import BatTrachCompass from './BatTrachCompass';
import DynamicCompass from './DynamicCompass';

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
// FLOOR PLAN + LA KINH OVERLAY  (Step 4)
// ══════════════════════════════════════════════════════════════
const SmartMiniFloorPlan = ({ degree, menhQuai, onComplete }) => {
  const [tab, setTab]             = useState('SHAPE');
  const [shapeParams, setShape]   = useState({ width: 5, length: 15 });
  const [image, setImage]         = useState(null);
  const [fileName, setFileName]   = useState('');
  const [loadingFile, setLoading] = useState(false);

  // La Kinh controls
  const [lkScale, setLkScale]     = useState(80);
  const [lkOpacity, setLkOpacity] = useState(85);
  const [showLk, setShowLk]       = useState(true);

  // Drawing state
  const [drawPoints, setDrawPoints]         = useState([]);
  const [isPolygonClosed, setPolygonClosed]  = useState(false);
  const [centroid, setCentroid]              = useState(null);

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

  // File upload (PNG, JPG, PDF)
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

  // ── Drawing handlers ──
  const handleCanvasClick = (e) => {
    if (tab !== 'DRAW' || isPolygonClosed) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // Close if click near first point
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
    setDrawPoints([]);
    setPolygonClosed(false);
    setCentroid(null);
  };

  // ── Floor plan size (80% of container) ──
  const aspect  = shapeParams.width / shapeParams.length;
  const maxPW   = dims.w * 0.8;
  const maxPH   = dims.h * 0.8;
  const planW   = maxPW / aspect <= maxPH ? maxPW : maxPH * aspect;
  const planH   = maxPW / aspect <= maxPH ? maxPW / aspect : maxPH;

  // La Kinh size
  const lkPx = Math.min(dims.w, dims.h) * (lkScale / 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xl overflow-hidden">
      {/* ── Header ── */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center shrink-0">
          <MapIcon className="text-emerald-600" size={18} />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-black text-slate-800 leading-tight">Sơ Đồ Không Gian Xung Quanh</h3>
          <p className="text-[11px] text-slate-400 font-semibold truncate">La Kinh Bát Trạch chồng lớp lên bản vẽ</p>
        </div>
      </div>

      <div className="p-4 md:p-5 space-y-4">
        {/* ── 3-Tab switch ── */}
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

        {/* ── Shape inputs ── */}
        {tab === 'SHAPE' && (
          <div className="flex items-end gap-2 justify-center">
            <div className="w-28">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block text-center">Ngang (m)</label>
              <input type="number" min="1" max="200" step="0.5" value={shapeParams.width}
                onChange={e => setShape({ ...shapeParams, width: Math.max(1, Number(e.target.value)) })}
                className="w-full mt-1 px-2 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 text-center focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition bg-white" />
            </div>
            <span className="text-slate-300 font-bold text-lg pb-2">×</span>
            <div className="w-28">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block text-center">Sâu (m)</label>
              <input type="number" min="1" max="200" step="0.5" value={shapeParams.length}
                onChange={e => setShape({ ...shapeParams, length: Math.max(1, Number(e.target.value)) })}
                className="w-full mt-1 px-2 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 text-center focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition bg-white" />
            </div>
          </div>
        )}

        {/* ── File upload (PNG / JPG / PDF) ── */}
        {tab === 'IMAGE' && (
          <label className="cursor-pointer border-2 border-dashed border-slate-300 bg-white p-4 rounded-xl flex items-center gap-4 hover:bg-indigo-50 hover:border-indigo-300 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center shrink-0 transition-colors">
              {loadingFile
                ? <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                : <Upload className="text-slate-400 group-hover:text-indigo-500 transition-colors" size={18} />}
            </div>
            <div className="min-w-0">
              <span className="font-bold text-sm text-slate-600 group-hover:text-indigo-600 block truncate">
                {loadingFile ? 'Đang xử lý...' : fileName || 'Chọn File Bản Vẽ'}
              </span>
              <span className="text-[10px] text-slate-400">Hỗ trợ PNG, JPG, PDF</span>
            </div>
            <input type="file" accept="image/*,.pdf,application/pdf" className="hidden" onChange={handleFile} />
          </label>
        )}

        {/* ── Draw instructions ── */}
        {tab === 'DRAW' && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-indigo-700 flex items-center gap-2">
            <Target size={14} className="shrink-0" />
            {!isPolygonClosed
              ? drawPoints.length === 0
                ? 'Bấm trên canvas để đánh dấu các đỉnh nhà'
                : drawPoints.length < 3
                  ? `Đã đặt ${drawPoints.length} đỉnh — cần ≥ 3 đỉnh`
                  : `${drawPoints.length} đỉnh — bấm gần điểm đầu hoặc "Đóng đa giác"`
              : `✅ ${drawPoints.length} đỉnh — Trung tâm đã xác định`}
          </div>
        )}

        {/* ── La Kinh controls ── */}
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
          {/* Zoom */}
          <div className="flex items-center gap-2">
            <ZoomOut size={12} className="text-slate-400 shrink-0" />
            <input type="range" min="30" max="150" step="5" value={lkScale}
              onChange={e => setLkScale(Number(e.target.value))}
              className="flex-1 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600" />
            <ZoomIn size={12} className="text-slate-400 shrink-0" />
            <span className="text-[10px] font-bold text-slate-400 w-9 text-right">{lkScale}%</span>
          </div>
          {/* Opacity (smart: only background fills) */}
          <div className="flex items-center gap-2">
            <EyeOff size={12} className="text-slate-400 shrink-0" />
            <input type="range" min="10" max="100" step="5" value={lkOpacity}
              onChange={e => setLkOpacity(Number(e.target.value))}
              className="flex-1 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600" />
            <Eye size={12} className="text-slate-400 shrink-0" />
            <span className="text-[10px] font-bold text-slate-400 w-9 text-right">{lkOpacity}%</span>
          </div>
        </div>

        {/* ── CANVAS ── */}
        <div ref={canvasRef}
          onClick={tab === 'DRAW' ? handleCanvasClick : undefined}
          className="relative bg-slate-100 rounded-xl w-full border border-slate-200 overflow-hidden flex items-center justify-center"
          style={{ height: '55vh', minHeight: '380px', cursor: tab === 'DRAW' && !isPolygonClosed ? 'crosshair' : 'default' }}>

          {/* Shape mode — thick walls */}
          {tab === 'SHAPE' && (
            <div style={{ width: `${planW}px`, height: `${planH}px` }}
              className="bg-white border-[5px] border-slate-900 shadow-2xl relative flex flex-col items-center justify-between transition-all duration-500 rounded-sm">
              <span className="text-[9px] font-bold text-slate-400 mt-1.5 select-none">
                {shapeParams.width}m × {shapeParams.length}m
              </span>
              <div className="absolute inset-[6px] border-2 border-slate-500/30 pointer-events-none rounded-sm" />
              <span className="text-[10px] font-black text-white bg-red-600 px-3 py-0.5 rounded-full absolute -bottom-3 z-20 shadow-md whitespace-nowrap tracking-wide">
                HƯỚNG NHÀ {degree}°
              </span>
            </div>
          )}

          {/* Image mode */}
          {tab === 'IMAGE' && image && (
            <img src={image} alt="Bản vẽ" className="absolute object-contain transition-opacity"
              style={{ maxWidth: '80%', maxHeight: '80%', opacity: 0.5 }} />
          )}
          {tab === 'IMAGE' && !image && (
            <div className="text-center text-slate-400 select-none">
              <MapIcon size={40} className="mx-auto mb-2 opacity-20" />
              <p className="text-sm font-bold">Chưa có bản vẽ</p>
              <p className="text-[11px]">Tải PNG / JPG / PDF bên trên</p>
            </div>
          )}

          {/* Draw mode — grid bg + SVG overlay */}
          {tab === 'DRAW' && (
            <>
              {/* Light grid background */}
              <div className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                  opacity: 0.5
                }} />

              {/* SVG polygon overlay */}
              <svg className="absolute inset-0 w-full h-full z-[5]" style={{ pointerEvents: isPolygonClosed ? 'none' : 'auto' }}>
                {/* Filled polygon */}
                {drawPoints.length > 2 && (
                  <polygon
                    points={drawPoints.map(p => `${p.x},${p.y}`).join(' ')}
                    fill={isPolygonClosed ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.06)'}
                    stroke="#6366f1" strokeWidth="2.5"
                    strokeDasharray={isPolygonClosed ? '0' : '6 3'}
                    strokeLinejoin="round" />
                )}

                {/* Edge lines for 1-2 points */}
                {drawPoints.length >= 2 && drawPoints.length <= 2 && (
                  <polyline
                    points={drawPoints.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none" stroke="#6366f1" strokeWidth="2" strokeDasharray="6 3" />
                )}

                {/* Preview line from last to first */}
                {!isPolygonClosed && drawPoints.length > 1 && (
                  <line
                    x1={drawPoints[drawPoints.length - 1].x} y1={drawPoints[drawPoints.length - 1].y}
                    x2={drawPoints[0].x} y2={drawPoints[0].y}
                    stroke="#818cf8" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
                )}

                {/* Vertex circles */}
                {drawPoints.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r={i === 0 ? 8 : 5}
                    fill={i === 0 ? '#6366f1' : '#818cf8'}
                    stroke="white" strokeWidth="2" />
                ))}

                {/* Centroid marker */}
                {centroid && (
                  <g>
                    <circle cx={centroid.x} cy={centroid.y} r={7} fill="#ef4444" stroke="white" strokeWidth="2.5" />
                    <line x1={centroid.x - 14} y1={centroid.y} x2={centroid.x + 14} y2={centroid.y} stroke="#ef4444" strokeWidth="2" />
                    <line x1={centroid.x} y1={centroid.y - 14} x2={centroid.x} y2={centroid.y + 14} stroke="#ef4444" strokeWidth="2" />
                  </g>
                )}
              </svg>

              {/* Draw controls floating bar */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-20">
                <div className="flex gap-1.5">
                  <button onClick={(e) => { e.stopPropagation(); undoPoint(); }}
                    disabled={!drawPoints.length}
                    className="bg-white/90 backdrop-blur shadow-sm border border-slate-200 text-slate-600 disabled:text-slate-300 px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 hover:bg-white transition disabled:cursor-not-allowed">
                    <Undo2 size={12} /> Bỏ điểm
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); clearDraw(); }}
                    disabled={!drawPoints.length}
                    className="bg-white/90 backdrop-blur shadow-sm border border-slate-200 text-red-500 disabled:text-slate-300 px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 hover:bg-white transition disabled:cursor-not-allowed">
                    <Trash2 size={12} /> Xóa
                  </button>
                </div>
                {drawPoints.length > 2 && !isPolygonClosed && (
                  <button onClick={(e) => { e.stopPropagation(); closePolygon(); }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-md transition">
                    <Check size={12} /> Đóng đa giác
                  </button>
                )}
              </div>
            </>
          )}

          {/* ── La Kinh overlay (smart opacity via bgOpacity prop) ── */}
          {showLk && (
            <div className="absolute pointer-events-none transition-all duration-300 drop-shadow-xl"
              style={{
                width: `${lkPx}px`, height: `${lkPx}px`,
                zIndex: 10,
                ...(centroid && tab === 'DRAW'
                  ? { left: `${centroid.x - lkPx / 2}px`, top: `${centroid.y - lkPx / 2}px` }
                  : { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' })
              }}>
              <BatTrachCompass degree={degree} menhQuai={menhQuai} bgOpacity={lkOpacity / 100} />
            </div>
          )}
        </div>

        {/* ── CTA ── */}
        <div className="bg-gradient-to-r from-red-50 to-amber-50 p-4 md:p-5 rounded-xl border border-amber-200/80">
          <h4 className="text-sm md:text-base font-black text-rose-800 mb-1">Phân Tích Chuyên Sâu Hơn?</h4>
          <p className="text-[11px] md:text-xs font-medium text-amber-900/80 mb-3 leading-relaxed">
            Kết quả trên bao gồm Bát Trạch cơ bản. Để phân tích Huyền Không Phi Tinh &amp; Sát Khí Loan Đầu, hãy đăng nhập!
          </p>
          <button onClick={onComplete}
            className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-black px-5 py-2.5 rounded-xl shadow-lg w-full transition-all hover:scale-[1.02] hover:shadow-xl">
            🔓 Đăng Nhập Full Tính Năng
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
    address: '', degree: 0, birthYear: 1990, gender: 'Nam', menhQuai: ''
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

  // ── Step definitions ──
  const STEPS = [
    { n: 1, label: 'Định Vị',  Icon: MapPin },
    { n: 2, label: 'La Bàn',   Icon: Compass },
    { n: 3, label: 'Cung Phi', Icon: User },
    { n: 4, label: 'Sơ Đồ',   Icon: MapIcon },
  ];

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900 overflow-y-auto">
      <div className="w-full max-w-4xl mx-auto bg-gradient-to-b from-slate-900 to-slate-950 min-h-screen relative shadow-2xl md:border-x md:border-slate-800 flex flex-col pb-20">

        {/* Close */}
        <button onClick={onCancel}
          className="fixed top-3 right-3 md:absolute md:top-4 md:right-4 p-2 bg-slate-800/90 backdrop-blur rounded-full text-slate-400 hover:text-red-400 hover:bg-red-950/50 transition z-50 shadow-md border border-slate-700">
          <X size={18} />
        </button>

        {/* ── HEADER (dark) ── */}
        <div className="bg-slate-800/60 backdrop-blur-sm border-b border-slate-700/50 p-5 pt-9 md:pt-8 px-6 text-center relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-600/10 rounded-full blur-3xl" />

          <h2 className="text-xl md:text-2xl font-black text-white relative z-10">Khảo Sát Khí Cung Nhà Ở Nhanh</h2>
          <p className="text-slate-400 font-semibold text-xs mt-1 relative z-10">Phiên bản sơ kết hợp Bát Trạch Điện Toán</p>

          {/* Progress */}
          <div className="flex justify-center items-center mt-6 gap-0 relative z-10 max-w-md mx-auto">
            {STEPS.map((s, i) => {
              const { Icon } = s;
              const isActive  = step >= s.n;
              const isCurrent = step === s.n;
              return (
                <React.Fragment key={s.n}>
                  {i > 0 && (
                    <div className={`flex-1 h-0.5 mx-1 rounded-full transition-colors duration-500
                      ${step > s.n - 1 ? 'bg-indigo-500' : 'bg-slate-700'}`} />
                  )}
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

          {/* ═══ STEP 1: ADDRESS ═══ */}
          {step === 1 && (
            <div className="animate-slide-up space-y-6 flex-1 flex flex-col items-center justify-center">
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/50 shadow-xl w-full max-w-md text-center space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center mx-auto">
                  <MapPin className="text-indigo-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">Vị Trí Công Trình</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                    Nhập tên đường hoặc sử dụng GPS. Không bắt buộc nhưng giúp định vị từ tính chính xác hơn.
                  </p>
                </div>
                <input type="text" placeholder="VD: 123 Nguyễn Huệ, Q.1, TP.HCM"
                  value={projectData.address}
                  onChange={e => setProjectData({ ...projectData, address: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none font-bold text-center text-sm transition bg-white" />
                <button onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      pos => { alert(`Tọa độ: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`); setProjectData({ ...projectData, address: 'Đã xác định vị trí GPS' }); },
                      () => alert('Lỗi lấy vị trí'));
                  }
                }} className="text-indigo-600 font-bold text-xs hover:text-indigo-800 underline underline-offset-2">
                  📍 Hoặc dùng GPS hiện tại
                </button>
              </div>
              <button onClick={() => setStep(2)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-8 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2 hover:shadow-indigo-500/20">
                Tiếp theo <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* ═══ STEP 2: COMPASS ═══ */}
          {step === 2 && (
            <div className="animate-slide-up space-y-5">
              <div className="bg-white rounded-2xl border border-slate-200/50 shadow-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center shrink-0">
                    <Compass className="text-indigo-600" size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-800">Đo Hướng Nhà</h3>
                    <p className="text-[11px] text-slate-400 font-semibold">Quay mặt ra cửa chính, điện thoại song song mặt đất</p>
                  </div>
                </div>

                <div className="p-4 md:p-5 space-y-5">
                  {/* Mode toggle */}
                  <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                    <button onClick={() => setCompassMode('AUTO')}
                      className={`flex-1 py-2 text-xs md:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5
                        ${compassMode === 'AUTO' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>
                      <Smartphone size={14} /> La Bàn Điện Thoại
                    </button>
                    <button onClick={() => { stopSensor(); setCompassMode('MANUAL'); }}
                      className={`flex-1 py-2 text-xs md:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5
                        ${compassMode === 'MANUAL' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>
                      <Keyboard size={14} /> Nhập Số Độ
                    </button>
                  </div>

                  {/* Compass visual */}
                  <div className="flex justify-center">
                    <DynamicCompass
                      degree={projectData.degree}
                      onChange={compassMode === 'MANUAL' ? d => setProjectData({ ...projectData, degree: d }) : undefined}
                      readOnly={compassMode === 'AUTO'} />
                  </div>

                  {/* AUTO */}
                  {compassMode === 'AUTO' && (
                    <div className="space-y-3 max-w-sm mx-auto">
                      {compassError && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-medium flex items-center gap-2">
                          <AlertCircle size={14} /> {compassError}
                        </div>
                      )}
                      {!isCompassActive && !compassCaptured && (
                        <button onClick={startSensor}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-3 rounded-xl shadow-md w-full transition text-sm">
                          🧭 Kích Hoạt La Bàn Vệ Tinh
                        </button>
                      )}
                      {isCompassActive && !compassCaptured && (
                        <div className="space-y-3">
                          <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 p-3 rounded-xl font-black text-2xl text-center">
                            {projectData.degree}°
                          </div>
                          <button onClick={() => { stopSensor(); setCompassCapture(true); }}
                            className="bg-red-500 hover:bg-red-600 text-white font-black px-5 py-3 rounded-xl shadow-md w-full transition animate-pulse text-sm">
                            CHỐT TỌA ĐỘ
                          </button>
                        </div>
                      )}
                      {compassCaptured && (
                        <div className="space-y-2">
                          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-xl font-black text-xl text-center flex items-center justify-center gap-2">
                            <Check size={18} /> {projectData.degree}°
                          </div>
                          <button onClick={() => { setCompassCapture(false); startSensor(); }}
                            className="text-slate-500 hover:text-slate-700 font-bold text-xs underline mx-auto block">Đo lại</button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* MANUAL */}
                  {compassMode === 'MANUAL' && (
                    <div className="flex items-center justify-center gap-3 max-w-xs mx-auto">
                      <label className="text-sm font-bold text-slate-600 whitespace-nowrap">Hướng:</label>
                      <input type="number" min="0" max="360" step="0.5"
                        value={projectData.degree}
                        onChange={e => setProjectData({ ...projectData, degree: Math.min(360, Math.max(0, Number(e.target.value))) })}
                        className="w-20 px-2 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 text-center text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition bg-white" />
                      <span className="text-base font-bold text-slate-400">°</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Nav */}
              <div className="flex justify-center gap-4">
                <button onClick={() => setStep(1)}
                  className="px-5 py-2.5 font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition flex items-center gap-1.5 text-sm">
                  <ArrowLeft size={16} /> Quay lại
                </button>
                <button onClick={() => setStep(3)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-2 text-sm">
                  Xác nhận ({projectData.degree}°) <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ═══ STEP 3: BIRTH INFO ═══ */}
          {step === 3 && (
            <div className="animate-slide-up space-y-6 flex-1 flex flex-col items-center justify-center">
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/50 shadow-xl w-full max-w-md text-center space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mx-auto">
                  <User className="text-amber-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">Thông Tin Trạch Chủ</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">Dùng để tính Mệnh Quái theo Bát Trạch</p>
                </div>
                <div className="space-y-4 text-left">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Năm Sinh (Dương Lịch)</label>
                    <input type="number" min="1900" max="2050"
                      value={projectData.birthYear}
                      onChange={e => setProjectData({ ...projectData, birthYear: e.target.value })}
                      className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 text-center focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition bg-white" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Giới Tính</label>
                    <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                      <button onClick={() => setProjectData({ ...projectData, gender: 'Nam' })}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all
                          ${projectData.gender === 'Nam' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>♂ Nam</button>
                      <button onClick={() => setProjectData({ ...projectData, gender: 'Nữ' })}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all
                          ${projectData.gender === 'Nữ' ? 'bg-white shadow text-rose-500' : 'text-slate-500'}`}>♀ Nữ</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-4">
                <button onClick={() => setStep(2)}
                  className="px-5 py-2.5 font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition flex items-center gap-1.5 text-sm">
                  <ArrowLeft size={16} /> Quay lại
                </button>
                <button onClick={() => {
                  setProjectData(prev => ({ ...prev, menhQuai: calcMenhQuai(prev.birthYear, prev.gender) }));
                  setStep(4);
                }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-2 text-sm">
                  Phân Tích Cung Phi <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ═══ STEP 4: FLOOR PLAN ═══ */}
          {step === 4 && (
            <div className="animate-slide-up flex-1">
              <SmartMiniFloorPlan
                degree={projectData.degree}
                menhQuai={projectData.menhQuai}
                onComplete={() => onGoToLogin(projectData)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestWizard;

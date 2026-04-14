import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { getLocalYMD } from '../data/constants';

// ====== CONSTANTS ======
const A4_W = 210;
const A4_H = 297;
const M = 15; // margin
const CW = A4_W - M * 2; // content width
const HDR_H = 18;
const FTR_H = 12;
const TOP_Y = M + HDR_H + 4; // content start Y after header
const BTM_Y = A4_H - M - FTR_H - 4; // max Y before footer

const C = {
  dark:  [30, 41, 59],
  accent:[180, 40, 35],
  gold:  [180, 142, 38],
  mid:   [100, 116, 139],
  light: [203, 213, 225],
  bg:    [248, 250, 252],
  white: [255, 255, 255],
  good:  [5, 120, 85],
  bad:   [200, 30, 30],
  info:  [50, 100, 200],
};

// ====== FONT LOADING ======
const loadFont = async (doc) => {
  try {
    // Load Regular
    const regRes = await fetch('/Roboto-Regular.ttf');
    const regBuf = await regRes.arrayBuffer();
    const regB64 = arrayBufferToBase64(regBuf);
    doc.addFileToVFS('Roboto-Regular.ttf', regB64);
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');

    // Load Bold
    const boldRes = await fetch('/Roboto-Bold.ttf');
    const boldBuf = await boldRes.arrayBuffer();
    const boldB64 = arrayBufferToBase64(boldBuf);
    doc.addFileToVFS('Roboto-Bold.ttf', boldB64);
    doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');

    return true;
  } catch (e) {
    console.warn('Font loading failed, using fallback:', e);
    return false;
  }
};

const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

// ====== FONT HELPERS ======
let FONT_NAME = 'helvetica'; // fallback

const setFont = (doc, style = 'normal', size = 9) => {
  doc.setFont(FONT_NAME, style);
  doc.setFontSize(size);
};

// ====== PAGE HEADER & FOOTER ======
const addHeader = (doc, logoImg, title, pageNum, total) => {
  // Clean header area
  doc.setFillColor(...C.white);
  doc.rect(0, 0, A4_W, M + HDR_H, 'F');

  if (logoImg) {
    try { doc.addImage(logoImg, 'PNG', M, M - 1, 28, 14); } catch {}
  }

  setFont(doc, 'bold', 8);
  doc.setTextColor(...C.dark);
  doc.text('HKPT PRO — Báo Cáo Phong Thủy', M + 31, M + 4);

  setFont(doc, 'normal', 6.5);
  doc.setTextColor(...C.mid);
  doc.text(title, M + 31, M + 9);

  // Red accent line
  doc.setDrawColor(...C.accent);
  doc.setLineWidth(0.6);
  doc.line(M, M + HDR_H - 1, A4_W - M, M + HDR_H - 1);

  // Page number
  setFont(doc, 'normal', 6.5);
  doc.setTextColor(...C.mid);
  doc.text(`${pageNum} / ${total}`, A4_W - M, M + 4, { align: 'right' });
};

const addFooter = (doc, dateStr) => {
  const y = A4_H - M;
  doc.setDrawColor(...C.light);
  doc.setLineWidth(0.2);
  doc.line(M, y - FTR_H + 2, A4_W - M, y - FTR_H + 2);

  setFont(doc, 'normal', 5.5);
  doc.setTextColor(...C.mid);
  doc.text('HKPT PRO — Phần Mềm Phong Thủy Chuyên Nghiệp', M, y - 2);
  doc.text(dateStr, A4_W - M, y - 2, { align: 'right' });
};

// ====== SECTION TITLE ======
const addSection = (doc, y, text) => {
  setFont(doc, 'bold', 13);
  doc.setTextColor(...C.dark);
  doc.text(text, M, y);
  y += 3;
  doc.setDrawColor(...C.accent);
  doc.setLineWidth(0.6);
  doc.line(M, y, M + 70, y);
  return y + 5;
};

// ====== CAPTURE ELEMENT ======
const captureElement = async (el, scale = 2.5) => {
  if (!el) return null;
  try {
    const canvas = await html2canvas(el, {
      scale,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      allowTaint: true,
    });
    return canvas.toDataURL('image/png');
  } catch (e) {
    console.warn('Capture failed:', e);
    return null;
  }
};

// ====== COVER PAGE ======
const buildCover = (doc, project, logoImg, dateStr) => {
  // Background
  doc.setFillColor(...C.bg);
  doc.rect(0, 0, A4_W, A4_H, 'F');

  // Top accent bars
  doc.setFillColor(...C.accent);
  doc.rect(0, 0, A4_W, 5, 'F');
  doc.setFillColor(...C.gold);
  doc.rect(0, 5, A4_W, 1.2, 'F');

  // Logo
  if (logoImg) {
    try { doc.addImage(logoImg, 'PNG', A4_W / 2 - 28, 40, 56, 28); } catch {}
  }

  // Main title
  setFont(doc, 'bold', 26);
  doc.setTextColor(...C.dark);
  doc.text('BÁO CÁO PHONG THỦY', A4_W / 2, 92, { align: 'center' });

  setFont(doc, 'bold', 11);
  doc.setTextColor(...C.accent);
  doc.text('HUYỀN KHÔNG PHI TINH', A4_W / 2, 102, { align: 'center' });

  // Gold divider
  doc.setDrawColor(...C.gold);
  doc.setLineWidth(0.8);
  doc.line(A4_W / 2 - 35, 110, A4_W / 2 + 35, 110);

  // Info box
  const bx = M + 25;
  const bw = CW - 50;
  const by = 122;
  const bh = 85;

  doc.setFillColor(...C.white);
  doc.roundedRect(bx, by, bw, bh, 3, 3, 'F');
  doc.setDrawColor(...C.light);
  doc.setLineWidth(0.4);
  doc.roundedRect(bx, by, bw, bh, 3, 3, 'S');

  // Project name
  let iy = by + 18;
  setFont(doc, 'bold', 15);
  doc.setTextColor(...C.dark);
  const pName = project.projectName || project.clientName;
  doc.text(pName, A4_W / 2, iy, { align: 'center', maxWidth: bw - 20 });

  // Info lines
  iy += 14;
  setFont(doc, 'normal', 9);
  doc.setTextColor(...C.mid);

  const birthYear = project.dob ? new Date(project.dob).getFullYear() : '---';
  const lines = [
    `Gia chủ: ${project.clientName} — ${project.gender || ''} — Sinh năm: ${birthYear}`,
    `Địa chỉ: ${project.address || 'Chưa cập nhật'}`,
    `Năm xây: ${project.buildYear} | Vận: ${project.period} | Hướng: ${project.degree}\u00B0`,
    `Mệnh Quái: ${project.menhQuai || '---'}`,
  ];

  lines.forEach(l => {
    doc.text(l, A4_W / 2, iy, { align: 'center', maxWidth: bw - 30 });
    iy += 9;
  });

  // Bottom bars
  doc.setFillColor(...C.gold);
  doc.rect(0, A4_H - 6.5, A4_W, 1.2, 'F');
  doc.setFillColor(...C.accent);
  doc.rect(0, A4_H - 5, A4_W, 5, 'F');

  // Date
  setFont(doc, 'normal', 7);
  doc.setTextColor(...C.mid);
  doc.text(`Ngày lập: ${dateStr}`, A4_W / 2, A4_H - 12, { align: 'center' });
};

// ====== MAIN EXPORT ======
export const generatePdfReport = async ({ project, chartData, customAnalysis, refs }) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const dateStr = new Date().toLocaleDateString('vi-VN');
  const pName = project.projectName || project.clientName;

  // Load Vietnamese font
  const fontLoaded = await loadFont(doc);
  FONT_NAME = fontLoaded ? 'Roboto' : 'helvetica';

  // Load logo
  let logoImg = null;
  try {
    const r = await fetch('/logo_report.png');
    const b = await r.blob();
    logoImg = await new Promise(res => {
      const reader = new FileReader();
      reader.onload = e => res(e.target.result);
      reader.readAsDataURL(b);
    });
  } catch {}

  const totalPages = 4 + (project.notes?.length > 0 ? 1 : 0);

  // ==================== PAGE 1: COVER ====================
  buildCover(doc, project, logoImg, dateStr);

  // ==================== PAGE 2: LA KINH + KĨ THUẬT ====================
  doc.addPage();
  addHeader(doc, logoImg, `Báo cáo: ${pName}`, 2, totalPages);
  addFooter(doc, dateStr);

  let y = addSection(doc, TOP_Y, '1. LA KINH — THÔNG TIN KĨ THUẬT');

  // ---- Technical info table ----
  const fl = chartData.facingLine;
  const sm = chartData.sittingMountain;

  doc.setFillColor(...C.bg);
  doc.roundedRect(M, y, CW, 36, 2, 2, 'F');
  doc.setDrawColor(...C.light);
  doc.roundedRect(M, y, CW, 36, 2, 2, 'S');

  const col1x = M + 4;
  const col2x = M + CW / 2 + 4;
  let ty = y + 8;

  // Left column
  setFont(doc, 'normal', 7);
  doc.setTextColor(...C.mid);
  doc.text('Tọa / Hướng', col1x, ty);
  setFont(doc, 'bold', 9);
  doc.setTextColor(...C.dark);
  doc.text(`Tọa ${sm.name} — Hướng ${fl.mountain.name} (${project.degree}\u00B0)`, col1x, ty + 5);

  setFont(doc, 'normal', 7);
  doc.setTextColor(...C.mid);
  doc.text('Loại tuyến', col1x, ty + 14);
  setFont(doc, 'bold', 9);
  doc.setTextColor(...C.dark);
  doc.text(fl.type || '---', col1x, ty + 19);

  // Right column
  setFont(doc, 'normal', 7);
  doc.setTextColor(...C.mid);
  doc.text('Vận / Năm xây', col2x, ty);
  setFont(doc, 'bold', 9);
  doc.setTextColor(...C.dark);
  doc.text(`Vận ${project.period} — Năm ${project.buildYear}`, col2x, ty + 5);

  setFont(doc, 'normal', 7);
  doc.setTextColor(...C.mid);
  doc.text('Mệnh Quái gia chủ', col2x, ty + 14);
  setFont(doc, 'bold', 9);
  doc.setTextColor(...C.dark);
  doc.text(project.menhQuai || '---', col2x, ty + 19);

  if (fl.msg) {
    ty += 26;
    setFont(doc, 'normal', 7);
    doc.setTextColor(...C.accent);
    doc.text(`Lưu ý: ${fl.msg}`, col1x, ty);
  }

  y += 40;

  // ---- La Kinh Image (centered, proportional) ----
  const compassMaxH = BTM_Y - y - 6;
  if (refs.compassRef?.current) {
    const compassImg = await captureElement(refs.compassRef.current, 3);
    if (compassImg) {
      const compassSize = Math.min(compassMaxH, CW * 0.72, 130);
      const cx = A4_W / 2 - compassSize / 2;
      doc.addImage(compassImg, 'PNG', cx, y, compassSize, compassSize);

      // Label under compass
      setFont(doc, 'normal', 6.5);
      doc.setTextColor(...C.mid);
      doc.text('Hình 1: La Kinh — Tọa Hướng công trình', A4_W / 2, y + compassSize + 4, { align: 'center' });
    }
  }

  // ==================== PAGE 3: TINH BÀN + CÁCH CỤC ====================
  doc.addPage();
  addHeader(doc, logoImg, `Báo cáo: ${pName}`, 3, totalPages);
  addFooter(doc, dateStr);

  y = addSection(doc, TOP_Y, `2. TINH BÀN VẬN ${project.period}`);

  // ---- Tinh Ban Grid (centered, controlled size) ----
  if (refs.gridRef?.current) {
    const gridImg = await captureElement(refs.gridRef.current, 3);
    if (gridImg) {
      const gridSize = Math.min(CW * 0.65, 110);
      const gx = A4_W / 2 - gridSize / 2;
      // Get actual aspect ratio from captured image
      const tempImg = new Image();
      tempImg.src = gridImg;
      await new Promise(r => { tempImg.onload = r; });
      const aspect = tempImg.naturalHeight / tempImg.naturalWidth;
      const gridH = gridSize * aspect;

      doc.addImage(gridImg, 'PNG', gx, y, gridSize, gridH);

      // Label
      setFont(doc, 'normal', 6.5);
      doc.setTextColor(...C.mid);
      doc.text(`Hình 2: Tinh bàn Vận ${project.period} — Tọa ${sm.name} Hướng ${fl.mountain.name}`, A4_W / 2, y + gridH + 4, { align: 'center' });

      y += gridH + 12;
    }
  }

  // ---- Cách Cục Toàn Bàn ----
  if (chartData.formations?.length > 0) {
    if (y > BTM_Y - 30) {
      doc.addPage();
      addHeader(doc, logoImg, `Báo cáo: ${pName}`, 3, totalPages);
      addFooter(doc, dateStr);
      y = TOP_Y;
    }

    setFont(doc, 'bold', 10);
    doc.setTextColor(...C.dark);
    doc.text('CÁCH CỤC TOÀN BÀN', M, y);
    y += 6;

    chartData.formations.forEach(f => {
      if (y > BTM_Y - 14) return;

      const color = f.type === 'good' ? C.good : f.type === 'bad' ? C.bad : C.info;

      // Colored dot
      doc.setFillColor(...color);
      doc.circle(M + 2, y - 1, 1.2, 'F');

      setFont(doc, 'bold', 8);
      doc.setTextColor(...color);
      doc.text(f.name, M + 6, y);
      y += 4.5;

      setFont(doc, 'normal', 7);
      doc.setTextColor(...C.mid);
      const dl = doc.splitTextToSize(f.desc, CW - 10);
      doc.text(dl, M + 6, y);
      y += dl.length * 3.3 + 3;
    });
  }

  // ==================== PAGE 4+: PHÂN TÍCH 9 CUNG ====================
  doc.addPage();
  addHeader(doc, logoImg, `Báo cáo: ${pName}`, 4, totalPages);
  addFooter(doc, dateStr);

  y = addSection(doc, TOP_Y, '3. PHÂN TÍCH CÁT HUNG 9 CUNG');

  const { LABELS, getCombinationDesc } = await import('../data/constants.js');
  const permMap = chartData.permutationMap;
  const grid = chartData.finalGrid;

  for (let idx = 0; idx < permMap.length; idx++) {
    const oi = permMap[idx];
    const data = grid[oi];
    const label = LABELS[oi];

    const raw = (customAnalysis?.[oi] !== undefined && customAnalysis[oi])
      ? customAnalysis[oi]
      : getCombinationDesc(data.sitting, data.facing, project.period);

    const txt = raw || '';
    const lines = doc.splitTextToSize(txt, CW - 14);
    const blockH = 12 + lines.length * 3.2 + 4;

    // Auto-page break
    if (y + blockH > BTM_Y) {
      doc.addPage();
      addHeader(doc, logoImg, `Báo cáo: ${pName}`, 4, totalPages);
      addFooter(doc, dateStr);
      y = TOP_Y;
    }

    // Direction name
    const dirName = oi === 4 ? 'Trung Cung' : `${label.dir} — ${label.tri}`;

    // Box background
    doc.setFillColor(...C.bg);
    doc.roundedRect(M, y, CW, blockH, 1.5, 1.5, 'F');
    doc.setDrawColor(...C.light);
    doc.setLineWidth(0.3);
    doc.roundedRect(M, y, CW, blockH, 1.5, 1.5, 'S');

    // Left accent bar
    doc.setFillColor(...C.accent);
    doc.rect(M, y, 2, blockH, 'F');

    // Title row
    setFont(doc, 'bold', 8.5);
    doc.setTextColor(...C.accent);
    doc.text(dirName, M + 6, y + 6);

    setFont(doc, 'normal', 7);
    doc.setTextColor(...C.mid);
    doc.text(`Sơn ${data.sitting} — Hướng ${data.facing}`, M + CW - 4, y + 6, { align: 'right' });

    // Content
    setFont(doc, 'normal', 7);
    doc.setTextColor(...C.dark);
    doc.text(lines, M + 6, y + 12, { lineHeightFactor: 1.35 });

    y += blockH + 2.5;
  }

  // ==================== PAGE 5: GHI CHÚ ====================
  if (project.notes?.length > 0) {
    doc.addPage();
    addHeader(doc, logoImg, `Báo cáo: ${pName}`, 5, totalPages);
    addFooter(doc, dateStr);

    y = addSection(doc, TOP_Y, '4. NHẬT KÝ TƯ VẤN');

    [...project.notes].reverse().forEach(note => {
      const nl = doc.splitTextToSize(note.text, CW - 16);
      const nh = 8 + nl.length * 3.2 + 4;

      if (y + nh > BTM_Y) {
        doc.addPage();
        addHeader(doc, logoImg, `Báo cáo: ${pName}`, 5, totalPages);
        addFooter(doc, dateStr);
        y = TOP_Y;
      }

      // Timeline dot and line
      doc.setFillColor(...C.accent);
      doc.circle(M + 3, y + 2.5, 1.5, 'F');
      doc.setDrawColor(...C.light);
      doc.setLineWidth(0.3);
      doc.line(M + 3, y + 5, M + 3, y + nh);

      // Date
      setFont(doc, 'bold', 6.5);
      doc.setTextColor(...C.mid);
      doc.text(new Date(note.date).toLocaleString('vi-VN'), M + 8, y + 3.5);

      // Content
      setFont(doc, 'normal', 7.5);
      doc.setTextColor(...C.dark);
      doc.text(nl, M + 8, y + 9);

      y += nh + 3;
    });
  }

  // ==================== DISCLAIMER ====================
  const lastP = doc.getNumberOfPages();
  doc.setPage(lastP);

  const dy = A4_H - M - FTR_H - 12;
  doc.setDrawColor(...C.light);
  doc.setLineWidth(0.2);
  doc.line(M, dy, A4_W - M, dy);

  setFont(doc, 'normal', 5.5);
  doc.setTextColor(...C.mid);
  doc.text(
    'Lưu ý: Báo cáo này được tạo tự động bởi phần mềm HKPT PRO. Kết quả mang tính tham khảo và cần kết hợp với khảo sát thực tế.',
    M, dy + 4,
    { maxWidth: CW }
  );

  // ==================== SAVE ====================
  const safeName = pName.replace(/[^a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF\s]/g, '').replace(/\s+/g, '_').substring(0, 40);
  const ds = getLocalYMD().replace(/-/g, '');
  doc.save(`BaoCao_${safeName}_${ds}.pdf`);

  return true;
};

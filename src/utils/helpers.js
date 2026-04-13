import { KUA_MAP } from '../data/constants';
import { Solar, Lunar } from 'lunar-javascript';
import { getHiepKyInfo, getChiRelations, HIEPKY_DICT } from '../data/hiepKy';
import { calculateTruc, getHoangDaoHours } from '../services/trachNhat';

// --- Bảng dịch Can Chi sang Tiếng Việt ---
const GAN_VN = { '甲':'Giáp','乙':'Ất','丙':'Bính','丁':'Đinh','戊':'Mậu','己':'Kỷ','庚':'Canh','辛':'Tân','壬':'Nhâm','癸':'Quý' };
const ZHI_VN = { '子':'Tý','丑':'Sửu','寅':'Dần','卯':'Mão','辰':'Thìn','巳':'Tỵ','午':'Ngọ','未':'Mùi','申':'Thân','酉':'Dậu','戌':'Tuất','亥':'Hợi' };

export const translateGanZhi = (gz) => {
  if (!gz) return gz;
  if (gz.length === 1) {
    return GAN_VN[gz] || ZHI_VN[gz] || gz;
  }
  const g = GAN_VN[gz[0]] || gz[0];
  const z = ZHI_VN[gz[1]] || gz[1];
  return `${g} ${z}`;
};

// --- Tiết Khí ---
const JIEQI_VN = {
  '立春': 'Lập Xuân', '雨水': 'Vũ Thủy', '惊蛰': 'Kinh Trập', '春分': 'Xuân Phân',
  '清明': 'Thanh Minh', '谷雨': 'Cốc Vũ', '立夏': 'Lập Hạ', '小满': 'Tiểu Mãn',
  '芒种': 'Mang Chủng', '夏至': 'Hạ Chí', '小暑': 'Tiểu Thử', '大暑': 'Đại Thử',
  '立秋': 'Lập Thu', '处暑': 'Xử Thử', '白露': 'Bạch Lộ', '秋分': 'Thu Phân',
  '寒露': 'Hàn Lộ', '霜降': 'Sương Giáng', '立冬': 'Lập Đông', '小雪': 'Tiểu Tuyết',
  '大雪': 'Đại Tuyết', '冬至': 'Đông Chí', '小寒': 'Tiểu Hàn', '大寒': 'Đại Hàn'
};

export const GAN_ELEMENTS = {
  'Giáp': 'Mộc', 'Ất': 'Mộc',
  'Bính': 'Hỏa', 'Đinh': 'Hỏa',
  'Mậu': 'Thổ', 'Kỷ': 'Thổ',
  'Canh': 'Kim', 'Tân': 'Kim',
  'Nhâm': 'Thủy', 'Quý': 'Thủy'
};

export const ZHI_ELEMENTS = {
  'Dần': 'Mộc', 'Mão': 'Mộc',
  'Tỵ': 'Hỏa', 'Ngọ': 'Hỏa',
  'Thân': 'Kim', 'Dậu': 'Kim',
  'Hợi': 'Thủy', 'Tý': 'Thủy',
  'Thìn': 'Thổ', 'Tuất': 'Thổ', 'Sửu': 'Thổ', 'Mùi': 'Thổ'
};

// --- QUAN HỆ NGŨ HÀNH ---
const ELEMENT_MAP = { 1: 'Thủy', 2: 'Thổ', 3: 'Mộc', 4: 'Mộc', 5: 'Thổ', 6: 'Kim', 7: 'Kim', 8: 'Thổ', 9: 'Hỏa' };
const SINH = { 'Thủy': 'Mộc', 'Mộc': 'Hỏa', 'Hỏa': 'Thổ', 'Thổ': 'Kim', 'Kim': 'Thủy' };
const KHAC = { 'Thủy': 'Hỏa', 'Hỏa': 'Kim', 'Kim': 'Mộc', 'Mộc': 'Thổ', 'Thổ': 'Thủy' };

const getRelation = (eSon, eHuong) => {
  if (eSon === eHuong) return 'Tỷ Hòa';
  if (SINH[eSon] === eHuong) return 'Sơn sinh Hướng (Sinh Xuất)';
  if (SINH[eHuong] === eSon) return 'Hướng sinh Sơn (Sinh Nhập)';
  if (KHAC[eSon] === eHuong) return 'Sơn khắc Hướng';
  if (KHAC[eHuong] === eSon) return 'Hướng khắc Sơn';
  return '';
};

export const evaluateDungThan = (subjectElement, dungThan) => {
  if (!subjectElement || !dungThan || dungThan === 'Chưa xác định') return { status: 'none' };
  
  if (subjectElement === dungThan) return { status: 'best', label: 'Tỷ Hòa', ext: '(Tương Trợ)' };
  if (SINH[subjectElement] === dungThan) return { status: 'best', label: 'Sinh Nhập', ext: '(Thái Cát)' }; // Ngày/Giờ sinh Dụng Thần
  
  if (KHAC[subjectElement] === dungThan) return { status: 'bad', label: 'Khắc Nhập', ext: '(Đại Hung)' }; // Ngày/Giờ khắc Dụng Thần
  if (KHAC[dungThan] === subjectElement) return { status: 'neutral', label: 'Khắc Xuất', ext: '(Xấu nhẹ)' }; // Dụng Thần khắc Ngày/Giờ
  
  if (SINH[dungThan] === subjectElement) return { status: 'neutral', label: 'Sinh Xuất', ext: '(Bình ổn)' }; // Dụng Thần sinh Ngày/Giờ
  
  return { status: 'none' };
};

export const getCanChiElements = (ganZhiStr) => {
  if (!ganZhiStr) return { can: null, chi: null };
  const parts = ganZhiStr.split(' ');
  if (parts.length < 2) return { can: null, chi: null };
  return {
    can: GAN_ELEMENTS[parts[0]] || null,
    chi: ZHI_ELEMENTS[parts[1]] || null
  };
};

const jieToMonth = {
  '立春': 1, '惊蛰': 2, '清明': 3, '立夏': 4, '芒种': 5, '小暑': 6,
  '立秋': 7, '白露': 8, '寒露': 9, '立冬': 10, '大雪': 11, '小寒': 12
};

const starMap = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9 };

// 12 thời thần và giờ tương ứng (Giờ Việt Nam = giờ địa phương)
export const THOI_THAN = [
  { name: 'Tý',  zhi: '子', startH: 23, endH: 1  },
  { name: 'Sửu', zhi: '丑', startH: 1,  endH: 3  },
  { name: 'Dần', zhi: '寅', startH: 3,  endH: 5  },
  { name: 'Mão', zhi: '卯', startH: 5,  endH: 7  },
  { name: 'Thìn',zhi: '辰', startH: 7,  endH: 9  },
  { name: 'Tỵ',  zhi: '巳', startH: 9,  endH: 11 },
  { name: 'Ngọ', zhi: '午', startH: 11, endH: 13 },
  { name: 'Mùi', zhi: '未', startH: 13, endH: 15 },
  { name: 'Thân',zhi: '申', startH: 15, endH: 17 },
  { name: 'Dậu', zhi: '酉', startH: 17, endH: 19 },
  { name: 'Tuất',zhi: '戌', startH: 19, endH: 21 },
  { name: 'Hợi', zhi: '亥', startH: 21, endH: 23 },
];

// --- Phi tinh 12 giờ trong ngày ---
export const getHourlyStars = (dateStr) => {
  const baseD = new Date(dateStr);
  const baseSolar = Solar.fromDate(baseD);
  const baseLunar = Lunar.fromSolar(baseSolar);
  const hdHours = getHoangDaoHours(baseLunar);

  return THOI_THAN.map((t) => {
    // Thời gian chuẩn để check sao của khung giờ này
    const testHour = t.startH === 23 ? 0 : t.startH + 1;
    const testD = new Date(baseD);
    testD.setHours(testHour, 15, 0); // cộng 15 phút để ở giữa khung giờ (ví dụ Tý -> 0h15, Sửu -> 2h15)

    const timeSolar = Solar.fromDate(testD);
    const timeLunar = Lunar.fromSolar(timeSolar);
    const star = starMap[timeLunar.getTimeNineStar().getNumber()] || 1;
    const hourGZ = translateGanZhi(timeLunar.getTimeInGanZhi());
    
    const hdInfo = hdHours.find(h => h.name === t.name) || {};

    return { ...t, centerStar: star, ...hdInfo, hourGZ };
  });
};

// --- Lấy thông tin đầy đủ phi tinh thời gian ---
export const getTimeStars = (dateObj) => {
  if (!dateObj) return { annual: null, monthly: null, daily: null };
  const d = new Date(dateObj);
  const solar = Solar.fromDate(d);
  const lunar = Lunar.fromSolar(solar);

  const prevJie = lunar.getPrevJie();
  const jieName = prevJie.getName();
  const fsMonth = jieToMonth[jieName] || 1;

  let fsYear = d.getFullYear();
  if (d.getMonth() <= 1 && (fsMonth === 12 || fsMonth === 11)) {
     fsYear = d.getFullYear() - 1;
  }

  let annual = starMap[lunar.getYearNineStar().getNumber()] || 1;
  let monthly = starMap[lunar.getMonthNineStar().getNumber()] || 1;
  let daily = starMap[lunar.getDayNineStar().getNumber()] || 1;

  const currentJieQi = lunar.getPrevJieQi(true);
  const nextJieQi = lunar.getNextJieQi(true);

  // Can Chi năm / tháng / ngày (theo tiết khí)
  const yearGZ  = translateGanZhi(lunar.getYearInGanZhiExact());
  const monthGZ = translateGanZhi(lunar.getMonthInGanZhiExact());
  const dayGZ   = translateGanZhi(lunar.getDayInGanZhi());

  // Dương Độn: tháng phong thủy 1-6; Âm Độn: 7-12
  const isDuongDon = fsMonth <= 6;

  // Hàm điều chỉnh múi giờ: Lunar JS mặc định xuất GMT+8, trừ đi 1 giờ thành GMT+7 (VN)
  const formatVNTime = (solar) => {
    const dStr = solar.toYmdHms().replace(' ', 'T');
    const d = new Date(dStr);
    d.setHours(d.getHours() - 1);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  return {
    annual, monthly, daily,
    fsYear, fsMonth, isDuongDon,
    yearGZ, monthGZ, dayGZ,
    termName: JIEQI_VN[currentJieQi.getName()],
    termTime: formatVNTime(currentJieQi.getSolar()),
    nextTermName: JIEQI_VN[nextJieQi.getName()],
    nextTermTime: formatVNTime(nextJieQi.getSolar()),
    hiepKy: getHiepKyInfo(lunar),
    dayTianShen: {
       name: HIEPKY_DICT[lunar.getDayTianShen()] || lunar.getDayTianShen(),
       type: lunar.getDayTianShenType() === '黄道' ? 'Hoàng Đạo' : 'Hắc Đạo'
    },
    chiRelations: getChiRelations(dayGZ),
    lunarMonth: lunar.getMonth(),
    lunarDay: lunar.getDay(),
    truc: calculateTruc(lunar),
    hoangDaoHours: getHoangDaoHours(lunar)
  };
};

// --- Màu sắc theo sao và ngũ hành ---
export const getStarColor = (star) => {
  switch (star) {
    case 1: return 'text-blue-600 drop-shadow-[0_0_6px_rgba(37,99,235,0.4)]';
    case 3: case 4: return 'text-emerald-600 drop-shadow-[0_0_6px_rgba(5,150,105,0.4)]';
    case 9: return 'text-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.4)]';
    case 2: case 5: case 8: return 'text-amber-600 drop-shadow-[0_0_6px_rgba(217,119,6,0.4)]';
    case 6: case 7: return 'text-slate-400 drop-shadow-[0_0_6px_rgba(148,163,184,0.4)]';
    default: return 'text-slate-800';
  }
};

export const getElementBgColor = (star) => {
  switch (star) {
    case 1: return 'bg-blue-50/40'; case 3: case 4: return 'bg-emerald-50/40';
    case 9: return 'bg-red-50/40'; case 2: case 5: case 8: return 'bg-amber-50/40';
    case 6: case 7: return 'bg-slate-50/40'; default: return 'bg-white';
  }
};

export const calculateMenhQuai = (dobString, gender) => {
  if (!dobString || !gender) return 'Chưa xác định';
  const year = new Date(dobString).getFullYear();
  if (isNaN(year)) return 'Chưa xác định';
  let sum = year.toString().split('').reduce((a, b) => a + parseInt(b), 0);
  while (sum > 9) sum = sum.toString().split('').reduce((a, b) => a + parseInt(b), 0);
  let kua;
  if (year >= 2000) { kua = gender === 'Nam' ? 10 - sum : 5 + sum; }
  else              { kua = gender === 'Nam' ? 11 - sum : 4 + sum; }
  while (kua > 9) kua -= 9;
  if (kua === 5) kua = gender === 'Nam' ? 2 : 8;
  return KUA_MAP[kua];
};

export const getPeriodFromYear = (year) => {
  if (!year) return 9;
  const y = parseInt(year);
  if (y >= 2044) return 1;
  if (y >= 2024) return 9;
  if (y >= 2004) return 8;
  if (y >= 1984) return 7;
  if (y >= 1964) return 6;
  if (y >= 1944) return 5;
  if (y >= 1924) return 4;
  if (y >= 1904) return 3;
  if (y >= 1884) return 2;
  return 1;
};

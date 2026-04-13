import { translateHK } from '../data/hiepKy';
import { translateGanZhi } from '../utils/helpers';

// Các Trực tóm tắt ý nghĩa
const TRUC_DESC = {
  'Kiến': 'Tốt với việc thăng quan, nhậm chức. Kỵ xây kho, đào giếng.',
  'Trừ': 'Tốt với việc tẩy uế, dọn dẹp, chữa bệnh. Kỵ nhậm chức, khai trương.',
  'Mãn': 'Tốt với cầu tài, lập kho, nhậm chức. Kỵ an táng, trị bệnh.',
  'Bình': 'Tốt với làm đường, san lấp, sửa tường. Kỵ kinh doanh, nhậm chức.',
  'Định': 'Tốt với kinh doanh, thi cử, kết hôn. Kỵ làm lại nhà, tố tụng.',
  'Chấp': 'Tốt với trồng trọt, xây dựng, kết hôn. Kỵ dọn nhà, khai trương.',
  'Phá': 'Tốt với phá dỡ, chữa bệnh. Kỵ kết hôn, giao dịch, khai trương.',
  'Nguy': 'Tốt với an sàng, tế tự. Kỵ leo cao, mạo hiểm, đi thuyền.',
  'Thành': 'Tốt với khai trương, giao dịch, học hành. Kỵ kiện tụng.',
  'Thâu': 'Tốt với thu tiền, kết hôn, nhập trạch. Kỵ an táng.',
  'Khai': 'Tốt với mở cửa, kết hôn, nhậm chức. Kỵ an táng, chặt cây.',
  'Bế': 'Tốt với đắp đê, vá lấp. Kỵ chữa mắt, phẫu thuật, mở cửa.'
};

const HOANG_DAO_STARS = ['Thanh Long', 'Minh Đường', 'Kim Quỹ', 'Thiên Đức', 'Ngọc Đường', 'Tư Mệnh'];

export const calculateTruc = (lunar) => {
  if (!lunar) return null;
  const zhiXing = lunar.getZhiXing(); // VD: "建"
  const truc = translateHK(zhiXing) || zhiXing;
  return {
    name: truc,
    desc: TRUC_DESC[truc] || ''
  };
};

export const getHoangDaoHours = (lunar) => {
  if (!lunar) return [];
  const times = lunar.getTimes();
  
  // Lọc lấy 12 giờ duy nhất (vì getTimes trả về 13 giờ gồm Tý Sớm và Tý Muộn)
  const uniqueTimes = [];
  const seenZhi = new Set();
  for (const time of times) {
    const zhi = time.getZhi();
    if (!seenZhi.has(zhi)) {
      seenZhi.add(zhi);
      uniqueTimes.push(time);
    }
  }

  // THOI_THAN maps Zhi -> startH, endH
  const hourMapping = {
    '子': { startH: 23, endH: 1 },
    '丑': { startH: 1,  endH: 3 },
    '寅': { startH: 3,  endH: 5 },
    '卯': { startH: 5,  endH: 7 },
    '辰': { startH: 7,  endH: 9 },
    '巳': { startH: 9,  endH: 11 },
    '午': { startH: 11, endH: 13 },
    '未': { startH: 13, endH: 15 },
    '申': { startH: 15, endH: 17 },
    '酉': { startH: 17, endH: 19 },
    '戌': { startH: 19, endH: 21 },
    '亥': { startH: 21, endH: 23 },
  };

  return uniqueTimes.map(hour => {
    const zhi = hour.getZhi();
    const rawTianShen = hour.getTianShen();
    const tianShen = translateHK(rawTianShen) || rawTianShen;
    const isHoangDao = HOANG_DAO_STARS.includes(tianShen);
    const mapping = hourMapping[zhi] || { startH: 0, endH: 0 };
    
    const ganZhi = hour.getGanZhi();
    
    return {
      name: translateGanZhi(zhi),
      ganZhi: translateGanZhi(ganZhi),
      startH: mapping.startH,
      endH: mapping.endH,
      tianShen: tianShen,
      isHoangDao: isHoangDao,
      yi: hour.getYi().map(translateHK).filter(Boolean),
      ji: hour.getJi().map(translateHK).filter(Boolean)
    };
  });
};

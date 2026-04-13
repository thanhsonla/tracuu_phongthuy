export const BAT_TRACH_STARS = {
  'Sinh Khí': { 
     element: 'Mộc', type: 'Cát', level: 1, 
     desc: 'Chủ công danh tài lộc, thăng quan tiến chức, con cháu đông đúc. Rất tốt cho hướng cửa, hướng bếp, bàn làm việc.',
     colors: { bg: 'bg-emerald-500', text: 'text-white', border: 'border-emerald-600', hue: 'emerald' }
  },
  'Thiên Y': { 
     element: 'Thổ', type: 'Cát', level: 2, 
     desc: 'Chủ sức khỏe, tuổi thọ, bệnh tật thuyên giảm. Thường có quý nhân phù trợ. Tốt để đặt phòng ngủ, bếp.',
     colors: { bg: 'bg-yellow-500', text: 'text-black', border: 'border-yellow-600', hue: 'yellow' }
  },
  'Diên Niên': { 
     element: 'Kim', type: 'Cát', level: 3, 
     desc: 'Chủ hòa thuận, quan hệ gia đạo êm ấm, hôn nhân hạnh phúc. Rất tốt để làm hướng đặt giường ngủ, ban thờ.',
     colors: { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300', hue: 'white' } // Kim Trắng
  },
  'Phục Vị': { 
     element: 'Mộc', type: 'Cát', level: 4, 
     desc: 'Chủ sự tĩnh lặng, bình yên, giữ gìn tài sản. Tốt cho phòng thờ, phòng tĩnh tu, nơi học hành.',
     colors: { bg: 'bg-green-600', text: 'text-white', border: 'border-green-700', hue: 'green' }
  },
  'Tuyệt Mệnh': { 
     element: 'Kim', type: 'Hung', level: -1, 
     desc: 'Chủ bệnh tật nghiêm trọng, tổn thọ, tán gia bại sản. Là hung tinh mạnh nhất, tuyệt đối tránh đặt hướng cửa chính hay phòng ngủ.',
     colors: { bg: 'bg-white', text: 'text-slate-900', border: 'border-slate-800', hue: 'white-danger' } // Kim Trắng nhưng tương phản xám đen
  },
  'Ngũ Quỷ': { 
     element: 'Hỏa', type: 'Hung', level: -2, 
     desc: 'Chủ giam giữ, thị phi, tai họa, tiểu nhân hãm hại, tổn hao tài sản. Tốt nhất làm nơi đặt nhà vệ sinh hoặc nhà kho để trấn áp.',
     colors: { bg: 'bg-red-600', text: 'text-white', border: 'border-red-700', hue: 'red' }
  },
  'Lục Sát': { 
     element: 'Thủy', type: 'Hung', level: -3, 
     desc: 'Chủ dâm đãng, tai tiếng, đào hoa xấu, mâu thuẫn gia đình. Thủy khí lạnh lẽo dễ dính luật pháp kiện cáo.',
     colors: { bg: 'bg-zinc-900', text: 'text-white', border: 'border-zinc-700', hue: 'black' } // Thủy Đen
  },
  'Họa Hại': { 
     element: 'Thổ', type: 'Hung', level: -4, 
     desc: 'Chủ thị phi, kiện tụng, rắc rối nhảm nhí, hao tài nhỏ lẻ. Năng lượng trì trệ không tốt.',
     colors: { bg: 'bg-amber-700', text: 'text-white', border: 'border-amber-900', hue: 'amber' } // Thổ tối
  }
};

export const GUA_DIRECTIONS = [
  { name: 'Khảm', dir: 'Bắc', angle: 0 },
  { name: 'Cấn', dir: 'Đông Bắc', angle: 45 },
  { name: 'Chấn', dir: 'Đông', angle: 90 },
  { name: 'Tốn', dir: 'Đông Nam', angle: 135 },
  { name: 'Ly', dir: 'Nam', angle: 180 },
  { name: 'Khôn', dir: 'Tây Nam', angle: 225 },
  { name: 'Đoài', dir: 'Tây', angle: 270 },
  { name: 'Càn', dir: 'Tây Bắc', angle: 315 }
];

export const BAT_TRACH_MATRIX = {
  'Càn':  { 'Khảm': 'Lục Sát', 'Cấn': 'Thiên Y', 'Chấn': 'Ngũ Quỷ', 'Tốn': 'Họa Hại', 'Ly': 'Tuyệt Mệnh', 'Khôn': 'Diên Niên', 'Đoài': 'Sinh Khí', 'Càn': 'Phục Vị' },
  'Khảm': { 'Khảm': 'Phục Vị', 'Cấn': 'Ngũ Quỷ', 'Chấn': 'Thiên Y', 'Tốn': 'Sinh Khí', 'Ly': 'Diên Niên', 'Khôn': 'Tuyệt Mệnh', 'Đoài': 'Họa Hại', 'Càn': 'Lục Sát' },
  'Cấn':  { 'Khảm': 'Ngũ Quỷ', 'Cấn': 'Phục Vị', 'Chấn': 'Lục Sát', 'Tốn': 'Tuyệt Mệnh', 'Ly': 'Họa Hại', 'Khôn': 'Sinh Khí', 'Đoài': 'Diên Niên', 'Càn': 'Thiên Y' },
  'Chấn': { 'Khảm': 'Thiên Y', 'Cấn': 'Lục Sát', 'Chấn': 'Phục Vị', 'Tốn': 'Diên Niên', 'Ly': 'Sinh Khí', 'Khôn': 'Họa Hại', 'Đoài': 'Tuyệt Mệnh', 'Càn': 'Ngũ Quỷ' },
  'Tốn':  { 'Khảm': 'Sinh Khí', 'Cấn': 'Tuyệt Mệnh', 'Chấn': 'Diên Niên', 'Tốn': 'Phục Vị', 'Ly': 'Thiên Y', 'Khôn': 'Ngũ Quỷ', 'Đoài': 'Lục Sát', 'Càn': 'Họa Hại' },
  'Ly':   { 'Khảm': 'Diên Niên', 'Cấn': 'Họa Hại', 'Chấn': 'Sinh Khí', 'Tốn': 'Thiên Y', 'Ly': 'Phục Vị', 'Khôn': 'Lục Sát', 'Đoài': 'Ngũ Quỷ', 'Càn': 'Tuyệt Mệnh' },
  'Khôn': { 'Khảm': 'Tuyệt Mệnh', 'Cấn': 'Sinh Khí', 'Chấn': 'Họa Hại', 'Tốn': 'Ngũ Quỷ', 'Ly': 'Lục Sát', 'Khôn': 'Phục Vị', 'Đoài': 'Thiên Y', 'Càn': 'Diên Niên' },
  'Đoài': { 'Khảm': 'Họa Hại', 'Cấn': 'Diên Niên', 'Chấn': 'Tuyệt Mệnh', 'Tốn': 'Lục Sát', 'Ly': 'Ngũ Quỷ', 'Khôn': 'Thiên Y', 'Đoài': 'Phục Vị', 'Càn': 'Sinh Khí' }
};

export const TRIGRAM_SYMBOLS = {
  'Càn': '☰',
  'Khôn': '☷',
  'Chấn': '☳',
  'Tốn': '☴',
  'Khảm': '☵',
  'Ly': '☲',
  'Cấn': '☶',
  'Đoài': '☱'
};

export const getBatTrachStar = (menhQuaiStr, huongQua) => {
  if (!menhQuaiStr) return null;
  const menhQuaiMatched = menhQuaiStr.match(/^([A-ZÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬĐEÈÉẺẼẸÊỀẾỂỄỆIÌÍỈĨỊOÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢUÙÚỦŨỤƯỪỨỬỮỰYỲÝỶỸỴa-zàáảãạăằắẳẵặâầấẩẫậđeèéẻẽẹêềếểễệiìíỉĩịoòóỏõọôồốổỗộơờớởỡợuùúủũụưừứửữựyỳýỷỹỵ]+)/i);
  if (!menhQuaiMatched) return null;
  const mq = menhQuaiMatched[1];
  return BAT_TRACH_MATRIX[mq] ? BAT_TRACH_MATRIX[mq][huongQua] : null;
};

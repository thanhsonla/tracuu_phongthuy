const GUA_NAMES = [
  [],
  [ "", "Thuần Càn", "Thiên Trạch Lý", "Thiên Hỏa Đồng Nhân", "Thiên Lôi Vô Vọng", "Thiên Phong Cấu", "Thiên Thủy Tụng", "Thiên Sơn Độn", "Thiên Địa Bĩ" ], 
  [ "", "Trạch Thiên Quải", "Thuần Đoài", "Trạch Hỏa Cách", "Trạch Lôi Tùy", "Trạch Phong Đại Quá", "Trạch Thủy Khốn", "Trạch Sơn Hàm", "Trạch Địa Tụy" ], 
  [ "", "Hỏa Thiên Đại Hữu", "Hỏa Trạch Khuê", "Thuần Ly", "Hỏa Lôi Phệ Hạp", "Hỏa Phong Đỉnh", "Hỏa Thủy Vị Tế", "Hỏa Sơn Lữ", "Hỏa Địa Tấn" ], 
  [ "", "Lôi Thiên Đại Tráng", "Lôi Trạch Quy Muội", "Lôi Hỏa Phong", "Thuần Chấn", "Lôi Phong Hằng", "Lôi Thủy Giải", "Lôi Sơn Tiểu Quá", "Lôi Địa Dự" ], 
  [ "", "Phong Thiên Tiểu Súc", "Phong Trạch Trung Phu", "Phong Hỏa Gia Nhân", "Phong Lôi Ích", "Thuần Tốn", "Phong Thủy Hoán", "Phong Sơn Tiệm", "Phong Địa Quan" ], 
  [ "", "Thủy Thiên Nhu", "Thủy Trạch Tiết", "Thủy Hỏa Ký Tế", "Thủy Lôi Truân", "Thủy Phong Tỉnh", "Thuần Khảm", "Thủy Sơn Kiển", "Thủy Địa Tỷ" ], 
  [ "", "Sơn Thiên Đại Súc", "Sơn Trạch Tổn", "Sơn Hỏa Bí", "Sơn Lôi Di", "Sơn Phong Cổ", "Sơn Thủy Mông", "Thuần Cấn", "Sơn Địa Bác" ], 
  [ "", "Địa Thiên Thái", "Địa Trạch Lâm", "Địa Hỏa Minh Di", "Địa Lôi Phục", "Địa Phong Thăng", "Địa Thủy Sư", "Địa Sơn Khiêm", "Thuần Khôn" ]
];

const getMaiHoaGua = (yearChiName, lunarMonth, lunarDay, hourName) => {
  const CAN_CHI = ['Tý','Sửu','Dần','Mão','Thìn','Tị','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'];
  const getIdx = (name) => {
    if (!name || typeof name !== 'string') return 1;
    let clean = name.replace(/^.+ /g, '').trim();
    if (clean === 'Tỵ') clean = 'Tị';
    const idx = CAN_CHI.indexOf(clean);
    return idx === -1 ? 1 : (idx + 1);
  };
  const yearChiIdx = getIdx(yearChiName);
  const hourChiIdx = getIdx(hourName);
  const sum1 = yearChiIdx + Math.abs(lunarMonth) + lunarDay;
  let upper = sum1 % 8;
  if (upper === 0) upper = 8;
  const sum2 = sum1 + hourChiIdx;
  let lower = sum2 % 8;
  if (lower === 0) lower = 8;
  let movingLine = sum2 % 6;
  if (movingLine === 0) movingLine = 6;
  const fullName = GUA_NAMES[upper][lower];
  return { yearChiIdx, hourChiIdx, sum1, upper, sum2, lower, fullName };
};
console.log(getMaiHoaGua('Bính Ngọ', 2, 21, 'Thân'));

// matrix for 64 Hexagrams in Chu Dịch (Tiên Thiên Bát Quái)
export const GUA_NAMES = [
  // 0 is unused, 1-8 are Càn Đoài Ly Chấn Tốn Khảm Cấn Khôn
  // Each array index corresponds to Upper Trigram 1-8
  [],
  [ "", "Thuần Càn", "Thiên Trạch Lý", "Thiên Hỏa Đồng Nhân", "Thiên Lôi Vô Vọng", "Thiên Phong Cấu", "Thiên Thủy Tụng", "Thiên Sơn Độn", "Thiên Địa Bĩ" ], // Upper 1 Càn
  [ "", "Trạch Thiên Quải", "Thuần Đoài", "Trạch Hỏa Cách", "Trạch Lôi Tùy", "Trạch Phong Đại Quá", "Trạch Thủy Khốn", "Trạch Sơn Hàm", "Trạch Địa Tụy" ], // Upper 2 Đoài
  [ "", "Hỏa Thiên Đại Hữu", "Hỏa Trạch Khuê", "Thuần Ly", "Hỏa Lôi Phệ Hạp", "Hỏa Phong Đỉnh", "Hỏa Thủy Vị Tế", "Hỏa Sơn Lữ", "Hỏa Địa Tấn" ], // Upper 3 Ly
  [ "", "Lôi Thiên Đại Tráng", "Lôi Trạch Quy Muội", "Lôi Hỏa Phong", "Thuần Chấn", "Lôi Phong Hằng", "Lôi Thủy Giải", "Lôi Sơn Tiểu Quá", "Lôi Địa Dự" ], // Upper 4 Chấn
  [ "", "Phong Thiên Tiểu Súc", "Phong Trạch Trung Phu", "Phong Hỏa Gia Nhân", "Phong Lôi Ích", "Thuần Tốn", "Phong Thủy Hoán", "Phong Sơn Tiệm", "Phong Địa Quan" ], // Upper 5 Tốn
  [ "", "Thủy Thiên Nhu", "Thủy Trạch Tiết", "Thủy Hỏa Ký Tế", "Thủy Lôi Truân", "Thủy Phong Tỉnh", "Thuần Khảm", "Thủy Sơn Kiển", "Thủy Địa Tỷ" ], // Upper 6 Khảm
  [ "", "Sơn Thiên Đại Súc", "Sơn Trạch Tổn", "Sơn Hỏa Bí", "Sơn Lôi Di", "Sơn Phong Cổ", "Sơn Thủy Mông", "Thuần Cấn", "Sơn Địa Bác" ], // Upper 7 Cấn
  [ "", "Địa Thiên Thái", "Địa Trạch Lâm", "Địa Hỏa Minh Di", "Địa Lôi Phục", "Địa Phong Thăng", "Địa Thủy Sư", "Địa Sơn Khiêm", "Thuần Khôn" ] // Upper 8 Khôn
];

export const getMaiHoaGua = (yearChiName, lunarMonth, lunarDay, hourName) => {
  const CAN_CHI = ['Tý','Sửu','Dần','Mão','Thìn','Tị','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'];
  // Xử lý cả "Tỵ" và "Tị"
  const getIdx = (name) => {
    if (!name || typeof name !== 'string') return 1; // Mặc định là Tý nếu lỗi
    let clean = name.replace(/^.+ /g, '').trim();
    if (clean === 'Tỵ') clean = 'Tị';
    const idx = CAN_CHI.indexOf(clean);
    return idx === -1 ? 1 : (idx + 1); // 1-indexed
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
  const shortName = fullName.split(' ').pop();
  
  return {
    upper,
    lower,
    movingLine,
    name: fullName,
    shortName: shortName
  };
};

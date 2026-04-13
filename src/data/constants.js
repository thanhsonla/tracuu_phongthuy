export const MOUNTAINS = [
  { name: 'Tý', degree: 0, type: 'Thiên', yinYang: '-', trigram: 1, element: 'Thủy' },
  { name: 'Quý', degree: 15, type: 'Nhân', yinYang: '-', trigram: 1, element: 'Thủy' },
  { name: 'Sửu', degree: 30, type: 'Địa', yinYang: '-', trigram: 8, element: 'Thổ' },
  { name: 'Cấn', degree: 45, type: 'Thiên', yinYang: '+', trigram: 8, element: 'Thổ' },
  { name: 'Dần', degree: 60, type: 'Nhân', yinYang: '+', trigram: 8, element: 'Mộc' },
  { name: 'Giáp', degree: 75, type: 'Địa', yinYang: '+', trigram: 3, element: 'Mộc' },
  { name: 'Mão', degree: 90, type: 'Thiên', yinYang: '-', trigram: 3, element: 'Mộc' },
  { name: 'Ất', degree: 105, type: 'Nhân', yinYang: '-', trigram: 3, element: 'Mộc' },
  { name: 'Thìn', degree: 120, type: 'Địa', yinYang: '-', trigram: 4, element: 'Thổ' },
  { name: 'Tốn', degree: 135, type: 'Thiên', yinYang: '+', trigram: 4, element: 'Mộc' },
  { name: 'Tỵ', degree: 150, type: 'Nhân', yinYang: '+', trigram: 4, element: 'Hỏa' },
  { name: 'Bính', degree: 165, type: 'Địa', yinYang: '+', trigram: 9, element: 'Hỏa' },
  { name: 'Ngọ', degree: 180, type: 'Thiên', yinYang: '-', trigram: 9, element: 'Hỏa' },
  { name: 'Đinh', degree: 195, type: 'Nhân', yinYang: '-', trigram: 9, element: 'Hỏa' },
  { name: 'Mùi', degree: 210, type: 'Địa', yinYang: '-', trigram: 2, element: 'Thổ' },
  { name: 'Khôn', degree: 225, type: 'Thiên', yinYang: '+', trigram: 2, element: 'Thổ' },
  { name: 'Thân', degree: 240, type: 'Nhân', yinYang: '+', trigram: 2, element: 'Kim' },
  { name: 'Canh', degree: 255, type: 'Địa', yinYang: '+', trigram: 7, element: 'Kim' },
  { name: 'Dậu', degree: 270, type: 'Thiên', yinYang: '-', trigram: 7, element: 'Kim' },
  { name: 'Tân', degree: 285, type: 'Nhân', yinYang: '-', trigram: 7, element: 'Kim' },
  { name: 'Tuất', degree: 300, type: 'Địa', yinYang: '-', trigram: 6, element: 'Thổ' },
  { name: 'Càn', degree: 315, type: 'Thiên', yinYang: '+', trigram: 6, element: 'Kim' },
  { name: 'Hợi', degree: 330, type: 'Nhân', yinYang: '+', trigram: 6, element: 'Thủy' },
  { name: 'Nhâm', degree: 345, type: 'Địa', yinYang: '+', trigram: 1, element: 'Thủy' },
];

export const FORWARD_FLIGHT = [4, 8, 5, 6, 1, 7, 2, 3, 0];
export const BACKWARD_FLIGHT = [4, 0, 3, 2, 7, 1, 6, 5, 8];

export const REPLACEMENT_STARS = {
  'Tý': 1, 'Quý': 1, 'Giáp': 1, 'Thân': 1,
  'Khôn': 2, 'Nhâm': 2, 'Ất': 2, 'Mão': 2, 'Mùi': 2,
  'Tuất': 6, 'Càn': 6, 'Hợi': 6, 'Thìn': 6, 'Tốn': 6, 'Tỵ': 6,
  'Cấn': 7, 'Bính': 7, 'Tân': 7, 'Dậu': 7,
  'Dần': 9, 'Ngọ': 9, 'Canh': 9, 'Đinh': 9
};

export const VIEW_PERMUTATIONS = {
  1: [8, 7, 6, 5, 4, 3, 2, 1, 0],
  8: [7, 6, 3, 8, 4, 0, 5, 2, 1],
  3: [6, 3, 0, 7, 4, 1, 8, 5, 2],
  4: [3, 0, 1, 6, 4, 2, 7, 8, 5],
  9: [0, 1, 2, 3, 4, 5, 6, 7, 8],
  2: [1, 2, 5, 0, 4, 8, 3, 6, 7],
  7: [2, 5, 8, 1, 4, 7, 0, 3, 6],
  6: [5, 8, 7, 2, 4, 6, 1, 0, 3]
};

// LABELS phải là Array để .map() hoạt động, đồng thời tương thích truy cập LABELS[index]
export const LABELS = [
  { dir: 'Đông Nam', tri: 'Tốn', ele: 'Mộc', color: 'text-emerald-600', base: 4 },
  { dir: 'Nam', tri: 'Ly', ele: 'Hỏa', color: 'text-red-500', base: 9 },
  { dir: 'Tây Nam', tri: 'Khôn', ele: 'Thổ', color: 'text-amber-600', base: 2 },
  { dir: 'Đông', tri: 'Chấn', ele: 'Mộc', color: 'text-emerald-600', base: 3 },
  { dir: 'Trung Cung', tri: '', ele: 'Thổ', color: 'text-amber-600', base: 5 },
  { dir: 'Tây', tri: 'Đoài', ele: 'Kim', color: 'text-slate-500', base: 7 },
  { dir: 'Đông Bắc', tri: 'Cấn', ele: 'Thổ', color: 'text-amber-600', base: 8 },
  { dir: 'Bắc', tri: 'Khảm', ele: 'Thủy', color: 'text-blue-600', base: 1 },
  { dir: 'Tây Bắc', tri: 'Càn', ele: 'Kim', color: 'text-slate-500', base: 6 }
];

export const trigramToGridIndex = { 1: 7, 2: 2, 3: 3, 4: 0, 6: 8, 7: 5, 8: 6, 9: 1 };

// --- TÍNH CHẤT CÁC SAO (từ Thuvien.md) ---
export const STAR_PROPERTIES = {
  1: { name: 'Nhất Bạch', han: 'Tham Lang', element: 'Thủy', vượng: [1,6], suy: [2,5,8], desc: 'Chủ trí tuệ, tài năng, văn chương, quan chức. Thủy tinh mưu lược.' },
  2: { name: 'Nhị Hắc', han: 'Cự Môn', element: 'Thổ', vượng: [8,9], suy: [3,4], desc: 'Chủ bệnh tật, đặc biệt bệnh dạ dày, phụ nữ. Còn gọi Bệnh Phù tinh.' },
  3: { name: 'Tam Bích', han: 'Lộc Tồn', element: 'Mộc', vượng: [1,4], suy: [6,7], desc: 'Chủ thị phi, kiện tụng, tranh cãi, trộm cắp. Thất vận cực hung.' },
  4: { name: 'Tứ Lục', han: 'Văn Khúc', element: 'Mộc', vượng: [1,3], suy: [6,7], desc: 'Chủ Văn Xương, trí tuệ, thi cử đỗ đạt, nghệ thuật. Thất vận phong lưu.' },
  5: { name: 'Ngũ Hoàng', han: 'Liêm Trinh', element: 'Thổ', vượng: [], suy: [1,3,4], desc: 'Đại Sát tinh. Hung dữ nhất trong 9 sao. Kỵ động thổ, kỵ kích hoạt.' },
  6: { name: 'Lục Bạch', han: 'Vũ Khúc', element: 'Kim', vượng: [8,2], suy: [9], desc: 'Chủ quyền uy, võ tướng, lãnh đạo. Kim tinh cương quyết, giàu có.' },
  7: { name: 'Thất Xích', han: 'Phá Quân', element: 'Kim', vượng: [8,2], suy: [9], desc: 'Chủ khẩu thiệt, đâm chém, trộm cướp. Thất vận hung bạo, quan phi.' },
  8: { name: 'Bát Bạch', han: 'Tả Phụ', element: 'Thổ', vượng: [9,2], suy: [3,4], desc: 'Đại Cát tinh. Vượng tài vượng đinh, sung túc, phú quý, bất động sản.' },
  9: { name: 'Cửu Tử', han: 'Hữu Bật', element: 'Hỏa', vượng: [3,4], suy: [1], desc: 'Chủ hỷ khánh, danh tiếng, sắc đẹp, lễ nghi. Đương vận (V9) Đại Cát.' }
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

// --- 81 TỔ HỢP ĐẦY ĐỦ (tính chất vượng suy) ---
export const COMBINATIONS_81 = {
  "1-1": "Nhất Nhất Phục Ngâm (Thủy-Thủy Tỷ Hòa). Đắc vận: Văn chương cái thế, trí tuệ xuất chúng, quan vận hanh thông. Thất vận: Đào hoa tai họa, trầm cảm, bệnh thận, bệnh máu huyết.",
  "1-2": "Nhất Bạch + Nhị Hắc (Thủy-Thổ). Thổ khắc Thủy. Phụ nữ lấn lướt chồng, tổn thương nhân đinh, bệnh thận, dạ dày, tai bụng.",
  "1-3": "Nhất Bạch + Tam Bích (Thủy-Mộc). Thủy sinh Mộc = Sinh Xuất. Hao tốn nhân lực, thị phi, trộm cắp, tha hương cầu thực.",
  "1-4": "Nhất Bạch + Tứ Lục (Thủy-Mộc). Thủy sinh Mộc = Văn Xương. Khoa cử đỗ đạt, thi cử thành danh, nghệ thuật thăng hoa. Thất vận: Đào hoa, lăng nhăng.",
  "1-5": "Nhất Bạch + Ngũ Hoàng (Thủy-Thổ). Thổ khắc Thủy. Ngũ Hoàng gặp nhau: Bệnh tật nặng nề, tổn đinh, bệnh sinh dục, thận.",
  "1-6": "Nhất Bạch + Lục Bạch (Thủy-Kim). Kim sinh Thủy = Sinh Nhập. Hợp Thủy Tiên Thiên. Võ tướng xuất chúng, trí tuệ mưu lược, quyền uy vượng tài.",
  "1-7": "Nhất Bạch + Thất Xích (Thủy-Kim). Kim sinh Thủy = Sinh Nhập. Đắc vận tương đối tốt, tài lộc ổn. Thất vận: Đào hoa, rượu chè, mâu thuẫn vợ chồng.",
  "1-8": "Nhất Bạch + Bát Bạch (Thủy-Thổ). Thổ khắc Thủy. Nếu đắc vận (V8-V9) thì hóa giải được bớt, vượng tài nhẹ. Thất vận: Bệnh tai, thận.",
  "1-9": "Nhất Bạch + Cửu Tử (Thủy-Hỏa). Thủy khắc Hỏa. Tiên Thiên Hỏa giao Hậu Thiên Thủy. Nếu đắc vận: Thông minh nhưng bất ổn. Thất vận: Bệnh mắt, tim.",
  "2-1": "Nhị Hắc + Nhất Bạch (Thổ-Thủy). Thổ khắc Thủy. Bệnh dạ dày, thận, phụ nữ đau yếu, tổn hao nhân đinh.",
  "2-2": "Nhị Nhị Phục Ngâm (Thổ-Thổ Tỷ Hòa). Bệnh Phù tinh trùng lặp. Bệnh dạ dày, bụng, phụ nữ bệnh nặng, goá bụa.",
  "2-3": "Nhị Hắc + Tam Bích (Thổ-Mộc). Mộc khắc Thổ = Đấu Ngưu Sát. Tranh cãi, kiện tụng, bất hòa gia đình, bạo lực gia đình.",
  "2-4": "Nhị Hắc + Tứ Lục (Thổ-Mộc). Mộc khắc Thổ. Phụ nữ đương quyền khống chế chồng. Bệnh dạ dày, gan.",
  "2-5": "Nhị Ngũ Giao Gia (Thổ-Thổ). ĐẠI HUNG SÁT. Chủ bệnh tật nan y, chết chóc, phá sản. Tuyệt đối kỵ động thổ, kỵ bếp/giường.",
  "2-6": "Nhị Hắc + Lục Bạch (Thổ-Kim). Thổ sinh Kim = Sinh Xuất. Lão mẫu gặp lão phụ. Cô quả, phụ nữ vất vả mưu sinh.",
  "2-7": "Nhị Hắc + Thất Xích (Thổ-Kim). Thổ sinh Kim = Sinh Xuất. Đắc vận: Tài lộc do phụ nữ mang lại. Thất vận: Hỏa tai, thị phi.",
  "2-8": "Nhị Hắc + Bát Bạch (Thổ-Thổ Tỷ Hòa). Vượng Thổ, phát phú bất động sản. Đắc vận V8-V9 tốt. Nhưng cũng kỵ động thổ khi thất vận.",
  "2-9": "Nhị Hắc + Cửu Tử (Thổ-Hỏa). Hỏa sinh Thổ = Sinh Nhập. Đắc vận: Phát tài nhờ nữ giới. Thất vận: Hỏa tai, bệnh dạ dày.",
  "3-1": "Tam Bích + Nhất Bạch (Mộc-Thủy). Thủy sinh Mộc = Sinh Nhập. Đắc vận: Thông minh, tài năng, quan lộc. Thất vận: Trộm cắp, thị phi.",
  "3-2": "Tam Bích + Nhị Hắc (Mộc-Thổ). Mộc khắc Thổ = Đấu Ngưu Sát. Tranh chấp đất đai, kiện tụng, bệnh gan tỳ.",
  "3-3": "Tam Tam Phục Ngâm (Mộc-Mộc Tỷ Hòa). Trộm cắp, thị phi, làm ăn thua lỗ liên miên. Cực kỵ ở phương cửa chính.",
  "3-4": "Bích Lục Phong Ba (Mộc-Mộc). Mộc vượng. Đắc vận: Phát phú nhưng cực nhọc. Thất vận: Thần kinh bất ổn, đạo tặc, phong lưu.",
  "3-5": "Tam Bích + Ngũ Hoàng (Mộc-Thổ). Mộc khắc Thổ. Ngũ Hoàng bị kích: Tai nạn tay chân, kiện tụng, phá sản.",
  "3-6": "Tam Bích + Lục Bạch (Mộc-Kim). Kim khắc Mộc. Quan sát, bị thượng cấp hoặc quan quyền chèn ép, tổn chân tay.",
  "3-7": "Tam Bích + Thất Xích (Mộc-Kim). Kim khắc Mộc = Xuyên Tâm Sát. Bị cướp, bị đâm chém, trộm cắp có bạo lực, vướng lao lý.",
  "3-8": "Tam Bích + Bát Bạch (Mộc-Thổ). Mộc khắc Thổ. Thất vận: Tốn tài, tổn thương trẻ nhỏ. Đắc lệnh V8: Hóa giải được phần nào.",
  "3-9": "Tam Bích + Cửu Tử (Mộc-Hỏa). Mộc sinh Hỏa = Sinh Xuất. Đắc vận: Thông minh, danh tiếng. Thất vận: Hỏa tai, trộm cắp.",
  "4-1": "Tứ Lục + Nhất Bạch (Mộc-Thủy). Thủy sinh Mộc = Sinh Nhập. Văn Xương. Thông minh, giỏi nghệ thuật. Thất vận: Dâm đãng, đào hoa sát.",
  "4-2": "Tứ Lục + Nhị Hắc (Mộc-Thổ). Mộc khắc Thổ. Phụ nữ bệnh dạ dày, con gái không thuận, bệnh gan.",
  "4-3": "Tứ Lục + Tam Bích (Mộc-Mộc Tỷ Hòa). Phong Ba kiếp sát. Thất vận: điên loạn, tự tử, nghiện ngập.",
  "4-4": "Tứ Tứ Phục Ngâm (Mộc-Mộc Tỷ Hòa). Đắc vận: Văn khoa vinh hiển. Thất vận: Dâm loạn, phong tình.",
  "4-5": "Tứ Lục + Ngũ Hoàng (Mộc-Thổ). Mộc khắc Thổ. Ngũ Hoàng bị kích: Bệnh vú, bệnh gan, tai nạn.",
  "4-6": "Tứ Lục + Lục Bạch (Mộc-Kim). Kim khắc Mộc. Bị thượng cấp trấn áp, đau đầu, bệnh gan mật.",
  "4-7": "Tứ Lục + Thất Xích (Mộc-Kim). Kim khắc Mộc. Đắc vận V7: Tài đào hoa. Thất vận: Bị lừa, mất tiền vì tình.",
  "4-8": "Tứ Lục + Bát Bạch (Mộc-Thổ). Mộc khắc Thổ. Trẻ em hư hỏng, bệnh tay chân, tổn tài nhẹ. V8 đắc vận thì khá.",
  "4-9": "Tứ Lục + Cửu Tử (Mộc-Hỏa). Mộc sinh Hỏa = Sinh Xuất. Đắc vận V9 cực tốt, danh tiếng văn chương. Thất vận: Hỏa tai.",
  "5-1": "Ngũ Hoàng + Nhất Bạch (Thổ-Thủy). Thổ khắc Thủy. Bệnh sinh dục, thận, tai nạn nước, tổn đinh.",
  "5-2": "Ngũ Nhị Giao Gia (Thổ-Thổ). Tọa chủ Đại Sát, Hướng chủ Bệnh Phù. CỰC HUNG, tai nạn thảm khốc, chết chóc.",
  "5-3": "Ngũ Hoàng + Tam Bích (Thổ-Mộc). Mộc khắc Thổ kích Ngũ Hoàng: Đại xung sát, kiện tụng, phá sản.",
  "5-4": "Ngũ Hoàng + Tứ Lục (Thổ-Mộc). Mộc khắc Thổ kích Ngũ Hoàng: Bệnh vú, bệnh gan, phụ nữ mắc nạn.",
  "5-5": "Ngũ Ngũ Phục Ngâm (Thổ-Thổ). SONG NGŨ HOÀNG ĐẠI SÁT. Tai họa cực lớn, chết chóc, phá sản, tuyệt đối kỵ.",
  "5-6": "Ngũ Hoàng + Lục Bạch (Thổ-Kim). Thổ sinh Kim = Sinh Xuất. Giảm bớt hung khí Ngũ Hoàng. Bệnh đầu, xương.",
  "5-7": "Ngũ Hoàng + Thất Xích (Thổ-Kim). Thổ sinh Kim = Sinh Xuất. Giảm bớt hung. Bệnh miệng, hô hấp.",
  "5-8": "Ngũ Hoàng + Bát Bạch (Thổ-Thổ Tỷ Hòa). V8 đắc vận phát tài lớn. Qua V9 thì bệnh tật, tổn đinh.",
  "5-9": "Ngũ Hoàng + Cửu Tử (Thổ-Hỏa). Hỏa sinh Thổ tăng hung Ngũ Hoàng. Hỏa tai, bệnh mắt, tim.",
  "6-1": "Lục Bạch + Nhất Bạch (Kim-Thủy). Kim sinh Thủy = Sinh Xuất. Nhân đinh xuất chúng tạo tiền tài. Quyền uy vượng tài, trí tuệ.",
  "6-2": "Lục Bạch + Nhị Hắc (Kim-Thổ). Thổ sinh Kim = Sinh Nhập. Đắc vận: Mẹ giúp con phát tài. Thất vận phụ nữ bệnh.",
  "6-3": "Lục Bạch + Tam Bích (Kim-Mộc). Kim khắc Mộc. Quan tai, bệnh chân tay, con cái bất hiếu.",
  "6-4": "Lục Bạch + Tứ Lục (Kim-Mộc). Kim khắc Mộc. Mâu thuẫn cha con, bệnh đùi hông, phụ nữ khó sinh.",
  "6-5": "Lục Bạch + Ngũ Hoàng (Kim-Thổ). Thổ sinh Kim. Giảm hung Ngũ Hoàng nhưng vẫn kỵ. Bệnh đầu, xương.",
  "6-6": "Lục Lục Phục Ngâm (Kim-Kim Tỷ Hòa). Cô quả, đau đầu, bệnh xương. Đắc vận V6 thì quyền uy tuyệt đỉnh.",
  "6-7": "Giao Kiếm Sát (Kim-Kim). Kim Kim tương chiến. Hung bạo, đâm chém, mổ xẻ, trộm cướp, vướng lao lý.",
  "6-8": "Lục Bạch + Bát Bạch (Kim-Thổ). Thổ sinh Kim = Sinh Nhập. V8: Phát tài phát đinh, bất động sản. Cực tốt.",
  "6-9": "Lục Bạch + Cửu Tử (Kim-Hỏa). Hỏa khắc Kim. Đau đầu, bệnh phổi, huyết áp, hỏa tai nhẹ.",
  "7-1": "Thất Xích + Nhất Bạch (Kim-Thủy). Kim sinh Thủy = Sinh Xuất. Đắc vận: Tài lộc tốt, giao tiếp rộng. Thất vận: Rượu chè, hao tài.",
  "7-2": "Thất Xích + Nhị Hắc (Kim-Thổ). Thổ sinh Kim = Sinh Nhập. Đắc vận: Phụ nữ phát tài. Thất vận: Bệnh phụ khoa.",
  "7-3": "Xuyên Tâm Sát (Kim-Mộc). Kim khắc Mộc. Bị cướp, đâm chém, trộm cắp có bạo lực, lao lý.",
  "7-4": "Thất Xích + Tứ Lục (Kim-Mộc). Kim khắc Mộc. Đào hoa tai nạn, bệnh gan mật, phụ nữ hao tài.",
  "7-5": "Thất Xích + Ngũ Hoàng (Kim-Thổ). Thổ sinh Kim giảm bớt hung Ngũ Hoàng. Bệnh miệng, hô hấp.",
  "7-6": "Thất Xích + Lục Bạch (Kim-Kim Tỷ Hòa). Giao Kiếm Sát ngược. Đâm chém, phẫu thuật, trộm cắp.",
  "7-7": "Thất Thất Phục Ngâm (Kim-Kim Tỷ Hòa). V7 đắc vận: Phát tài mãnh liệt. Thất vận: Trộm cướp, khẩu thiệt, đâm chém.",
  "7-8": "Thất Xích + Bát Bạch (Kim-Thổ). Thổ sinh Kim = Sinh Nhập. V8 rất tốt, tài lộc ổn định. Qua V9 giảm dần.",
  "7-9": "Hồi Lộc Chi Tai (Kim-Hỏa). Hỏa khắc Kim. Cực dễ cháy nhà, hao tài tốn của, bệnh tim mạch, sinh non.",
  "8-1": "Bát Bạch + Nhất Bạch (Thổ-Thủy). Thổ khắc Thủy. V8 đắc vận: Phát tài ổn. Thất vận: Bệnh tai, thận, trẻ nhỏ.",
  "8-2": "Bát Bạch + Nhị Hắc (Thổ-Thổ Tỷ Hòa). V8 phát phú bất động sản. Qua V9 bệnh dạ dày, phụ nữ yếu.",
  "8-3": "Bát Bạch + Tam Bích (Thổ-Mộc). Mộc khắc Thổ. Trẻ nhỏ bị tổn thương, bệnh tay chân, tốn tài nhẹ.",
  "8-4": "Bát Bạch + Tứ Lục (Thổ-Mộc). Mộc khắc Thổ. Bệnh vai gáy. Trẻ nhỏ hư hỏng. V8 đắc lệnh thì khá.",
  "8-5": "Bát Bạch + Ngũ Hoàng (Thổ-Thổ Tỷ Hòa). V8 đắc vận phát tài rực rỡ. Nhưng khi thất vận bệnh tật nặng.",
  "8-6": "Bát Bạch + Lục Bạch (Thổ-Kim). Thổ sinh Kim = Sinh Xuất. V8 phát tài quan lộc. Cát lành, phú quý.",
  "8-7": "Bát Bạch + Thất Xích (Thổ-Kim). Thổ sinh Kim = Sinh Xuất. V8 tài lộc ổn. Qua V9 thì giảm, kỵ thị phi.",
  "8-8": "Song Bát Hội Tụ (Thổ-Thổ Tỷ Hòa). Vượng đinh vượng tài CỰC ĐIỂM trong V8. Qua V9 thoái khí, bình thường.",
  "8-9": "Bát Bạch + Cửu Tử (Thổ-Hỏa). Hỏa sinh Thổ = Sinh Nhập. V9 và V8 đều tốt, thiên về hỷ khánh, danh tiếng, tài lộc.",
  "9-1": "Cửu Tử + Nhất Bạch (Hỏa-Thủy). Thủy khắc Hỏa. V9 đắc lệnh: Trí tuệ phi phàm. Thất vận: Bệnh mắt, máu huyết.",
  "9-2": "Cửu Tử + Nhị Hắc (Hỏa-Thổ). Hỏa sinh Thổ = Sinh Xuất. Đắc vận: Phụ nữ phát tài. Thất vận: Hỏa tai, bệnh dạ dày.",
  "9-3": "Cửu Tử + Tam Bích (Hỏa-Mộc). Mộc sinh Hỏa = Sinh Nhập. V9 đắc vận: Rực rỡ, danh tiếng. Thất vận: Trộm cắp, hỏa hoạn.",
  "9-4": "Cửu Tử + Tứ Lục (Hỏa-Mộc). Mộc sinh Hỏa = Sinh Nhập. V9 Đại Cát: Văn chương, nghệ thuật, danh tiếng lẫy lừng.",
  "9-5": "Cửu Tử + Ngũ Hoàng (Hỏa-Thổ). Hỏa sinh Thổ tăng sức Ngũ Hoàng. HUNG: Hỏa tai lớn, bệnh mắt, tim, tổn đinh.",
  "9-6": "Cửu Tử + Lục Bạch (Hỏa-Kim). Hỏa khắc Kim. Đau đầu, bệnh phổi, huyết áp. Xung đột cha con.",
  "9-7": "Hỏa Kim tương khắc (Hỏa-Kim). Hao tài, hỏa hoạn, bệnh tim, mắt, máu huyết, phẫu thuật.",
  "9-8": "Cửu Tử + Bát Bạch (Hỏa-Thổ). Hỏa sinh Thổ = Sinh Xuất. V8 V9 đều Đại Cát. Tài phú hỷ khánh, danh tiếng.",
  "9-9": "Cửu Cửu Phục Ngâm (Hỏa-Hỏa Tỷ Hòa). Đắc lệnh V9: ĐẠI CÁT, vượng đinh vượng tài, danh tiếng. Thất vận: Bệnh mắt, bốc hỏa."
};

export const getCombinationDesc = (s, h, period) => {
    const key = `${s}-${h}`;
    let desc = COMBINATIONS_81[key];
    
    if (!desc) {
        const eS = ELEMENT_MAP[s] || 'Thổ';
        const eH = ELEMENT_MAP[h] || 'Thổ';
        const rel = getRelation(eS, eH);
        return `Tổ hợp Sơn ${s} (${eS}) và Hướng ${h} (${eH}). ${rel}. Sơn quản nhân đinh, Hướng quản tài lộc.`;
    }

    if (!period) return desc;

    const timelyStars = period === 9 ? [9, 1] : period === 8 ? [8, 9, 1] : [period];
    const isTimely = timelyStars.includes(s) || timelyStars.includes(h);

    const thatVanIndex = desc.toLowerCase().indexOf('thất vận');
    if (thatVanIndex === -1) return desc;

    const dacVanPattern = /(đắc vận|đắc lệnh|nếu đắc vận|v8 đắc vận|v9 đắc lệnh|đắc lệnh v9)/i;
    const dacMatch = desc.match(dacVanPattern);

    if (isTimely) {
        let timelyText = desc.substring(0, thatVanIndex).trim();
        timelyText = timelyText.replace(/[\.\s:]+$/, '.');
        return timelyText;
    } else {
        let baseText = '';
        let thatVanText = desc.substring(thatVanIndex);

        if (dacMatch) {
            baseText = desc.substring(0, dacMatch.index).trim();
        } else {
            const dotIndex = desc.lastIndexOf('.', thatVanIndex);
            if (dotIndex > 0) {
               baseText = desc.substring(0, dotIndex + 1).trim();
            } else {
               baseText = desc.substring(0, thatVanIndex).trim();
            }
        }
        return `${baseText} ${thatVanText}`;
    }
};

export const KUA_MAP = {
  1: 'Khảm (Thủy)', 2: 'Khôn (Thổ)', 3: 'Chấn (Mộc)', 4: 'Tốn (Mộc)',
  6: 'Càn (Kim)', 7: 'Đoài (Kim)', 8: 'Cấn (Thổ)', 9: 'Ly (Hỏa)'
};

// Hàm format ngày dd/mm/yyyy
export const formatDateDMY = (d) => {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '';
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

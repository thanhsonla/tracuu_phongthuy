export const analyzeFormations = (grid, period, facingIdx, sittingIdx) => {
  const formations = [];
  const isVSVH = grid[sittingIdx].sitting === period && grid[facingIdx].facing === period;
  const isTSHT = grid[facingIdx].sitting === period && grid[sittingIdx].facing === period;
  const isSTHH = grid[facingIdx].sitting === period && grid[facingIdx].facing === period;
  const isSTHT = grid[sittingIdx].sitting === period && grid[sittingIdx].facing === period;

  // =====================================================
  // I. CÁC CÁCH CỤC CƠ BẢN (CÁT - HUNG BIẾN THIÊN)
  // =====================================================

  // 1. VƯỢNG SƠN VƯỢNG HƯỚNG (ĐÁO SƠN ĐÁO HƯỚNG)
  if (isVSVH) formations.push({ 
    name: 'Vượng Sơn Vượng Hướng (Đáo Sơn Đáo Hướng)', 
    desc: `Đây là cách cục chuẩn mực nhất để đạt được sự cân bằng tuyệt đối giữa Nhân (Đinh) và Quả (Tài).

• Nguyên lý: Sao Đương Vượng của Vận ${period} (sao ${period}) bay đến đúng phương Tọa (Sơn bàn) và phương Hướng (Hướng bàn).
• Vượng Sơn: Sao chủ về nhân đinh nằm ở phía sau nhà. Nếu phía sau có núi, nhà cao tầng, hoặc thế tựa vững chãi, nó sẽ "đắc địa", giúp người trong nhà khỏe mạnh, gia đạo hòa hợp, ít bệnh tật và có địa vị xã hội.
• Vượng Hướng: Sao chủ về tài lộc nằm ở phía trước. Nếu phía trước có nước, khoảng không, hoặc đường sá, tài khí sẽ được kích hoạt, mang lại sự giàu sang và cơ hội kinh doanh.

⚠ Điều kiện cần: Loan đầu phải thuận (Tiền đê hậu cao). Nếu gặp Loan đầu nghịch (phía sau có nước, phía trước có núi), cách cục này sẽ biến thành "Thượng Sơn Hạ Thủy" trá hình.`, 
    loanDau: `🏔 Loan đầu (Ngoại thất):
• Phía sau (Tọa): Cần "Thật Sơn". Có núi thật, đồi cao hoặc các tòa nhà cao tầng làm điểm tựa vững chắc. KHÔNG được có ao hồ, hố ga hoặc đường xá dốc xuống phía sau.
• Phía trước (Hướng): Cần "Thật Thủy". Có hồ nước, sông uốn khúc hoặc ngã ba, ngã tư, minh đường (khoảng sân) rộng rãi để tụ khí.

🏠 Bố trí nội thất:
• Phía sau: Bố trí phòng ngủ, phòng làm việc hoặc đặt các tủ cao, kệ sách nặng. Tường phía sau nên sơn màu trầm, vững chãi.
• Phía trước: Đặt cửa chính, cửa sổ lớn. Phòng khách nên đặt tại đây. Có thể đặt phong thủy luân (đài phun nước nhỏ) để kích hoạt tài lộc.`, 
    type: 'good' 
  });

  // 2. THƯỢNG SƠN HẠ THỦY (PHÁ CÁCH CHI CỤC)
  else if (isTSHT) formations.push({ 
    name: 'Thượng Sơn Hạ Thủy (Phá Cách Chi Cục)', 
    desc: `Đây là cách cục gây ra sự xáo trộn năng lượng NGHIÊM TRỌNG NHẤT trong Huyền Không Phi Tinh.

• Nguyên lý: Sao Đương Vượng phương Sơn lại rơi vào Hướng (Thủy), và sao Đương Vượng phương Hướng lại rơi vào Tọa (Sơn). Sơn Thần và Thủy Thần đều bị đảo vị trí.
• Hệ lụy:
  → "Sơn thần hạ thủy": Nhân đinh suy yếu, dễ gặp tai nạn, hiếm muộn hoặc các bệnh nan y.
  → "Thủy thần thượng sơn": Tài lộc bị bế tắc, kinh doanh thua lỗ, tiền bạc "đội nón ra đi".

⚠ Góc nhìn chuyên sâu: Thực tế, nếu địa thế đất là "Tiền cao hậu đê" (trước cao sau thấp), người thầy phong thủy giỏi có thể dùng cách cục này để "thu nghịch khí", biến hung thành cát. Nhưng với nhà ở đô thị thông thường, đây là một ĐẠI KỊ.`, 
    loanDau: `Cách cục này là "nghịch", nên ta phải dùng kỹ thuật "ĐẢO LOAN ĐẦU" để cứu vãn.

🏔 Loan đầu (Ngoại thất):
• Phía trước (Hướng): Cần có Núi hoặc vật cao che chắn (vốn để thu sao Sơn vượng đang bị lạc ra trước). Tránh có nước hay đường xá lưu thông mạnh tại đây.
• Phía sau (Tọa): Cần có Nước hoặc không gian trống thấp (để thu sao Hướng vượng đang bị lạc ra sau).

🏠 Bố trí nội thất:
• Phía trước: Đặt các vật phẩm thuộc hành Thổ như bình gốm lớn, hòn non bộ khô để "giữ chân" sao Sơn. Tránh mở cửa chính quá rộng nếu trước mặt là khoảng không lớn.
• Phía sau: Mở cửa hậu hoặc cửa sổ lớn để đón khí. Có thể đặt bể cá hoặc tiểu cảnh nước tại khu vực này.`, 
    type: 'bad' 
  });

  // 3a. SONG TINH ĐÁO HƯỚNG
  else if (isSTHH) formations.push({ 
    name: 'Song Tinh Đáo Hướng (Song Tinh Hội Hướng)', 
    desc: `Đây là cách cục mang tính "lệch cực", tạo ra sự phát triển KHÔNG ĐỒNG ĐỀU — cực kỳ thiên về TÀI LỘC.

• Nguyên lý: Cả hai sao chủ về Đinh (Sơn tinh) và Tài (Hướng tinh) cùng tập trung ở mặt tiền nhà.
• Ưu điểm: Cực kỳ phát về tiền bạc, nổi tiếng nhanh chóng, sự nghiệp bùng nổ. Thích hợp cho cơ sở kinh doanh, cửa hàng, văn phòng thương mại.
• Nhược điểm: Nếu phía trước chỉ có nước mà không có núi (vật cao), nhân đinh sẽ bị tổn hại — "vượng tài tổn đinh". Có thể dẫn đến bệnh tật, hiếm muộn, con cái bất hiếu.

⚠ Điều kiện cần: Cần hình thế "Thủy ngoại hữu sơn" (nước gần, núi xa) ở phía trước mới vẹn cả đôi đường.`, 
    loanDau: `Cần hình thế "Thủy ngoại hữu sơn" (Nước gần, Núi xa).

🏔 Loan đầu (Ngoại thất):
• Phía trước nhà gần nhất là ao hồ/đường đi (Thủy), nhưng ngay sau khoảng nước đó phải thấy núi hoặc tòa nhà cao (Sơn).

🏠 Bố trí nội thất:
• Cửa chính mở rộng để đón tài khí. Tuy nhiên, ngay trong sảnh vào (huyền quan) nên đặt một bức bình phong hoặc một biểu tượng thuộc hành Thổ (như đá thạch anh lớn) để thu nạp sao Sơn, bảo vệ sức khỏe gia chủ.`, 
    type: 'good' 
  });

  // 3b. SONG TINH ĐÁO TỌA
  else if (isSTHT) formations.push({ 
    name: 'Song Tinh Đáo Tọa (Song Tinh Hội Tọa)', 
    desc: `Cách cục "lệch cực" ngược với Song Tinh Đáo Hướng — thiên về NHÂN ĐINH, sức khỏe.

• Nguyên lý: Cả hai sao Sơn tinh và Hướng tinh cùng tập trung ở phía sau nhà (Tọa).
• Ưu điểm: Gia đình rất hạnh phúc, con cái thành đạt, sức khỏe tốt, gia đạo hòa thuận. Thích hợp cho nhà ở gia đình, nhà dưỡng sinh.
• Nhược điểm: Tiền bạc thường khó tích lũy hoặc không có sự đột phá rõ rệt về tài chính. Làm ăn bình bình, không phá sản nhưng cũng không đại phú.

⚠ Điều kiện cần: Cần hình thế "Sơn ngoại hữu thủy" (sau núi có dòng nước uốn lượn) ở phía sau mới mong phát tài.`, 
    loanDau: `Cần hình thế "Sơn ngoại hữu thủy" (Núi gần, Nước xa).

🏔 Loan đầu (Ngoại thất):
• Phía sau nhà là núi hoặc nhà cao (Sơn), nhưng phía sau núi đó lại có dòng sông hoặc con đường uốn lượn (Thủy).

🏠 Bố trí nội thất:
• Phía sau bố trí phòng ngủ chính để vượng nhân đinh. Tuy nhiên, tại khu vực này vẫn cần có cửa sổ hoặc khe thông gió nhỏ để dẫn tài khí vào nhà.
• Có thể dùng gương để "phản chiếu" tài khí từ phía sau vào trung tâm nhà.`, 
    type: 'good' 
  });

  // =====================================================
  // II. CÁC CÁCH CỤC ĐẶC BIỆT (THÔNG KHÍ & CỨU GIẢI)
  // =====================================================

  // 4. HỢP THẬP TOÀN BÀN (PHỤC PHỐI)
  let hopThapVanSon = true, hopThapVanHuong = true, hopThapSonHuong = true;
  for (let i = 0; i < 9; i++) {
    if (grid[i].base + grid[i].sitting !== 10) hopThapVanSon = false;
    if (grid[i].base + grid[i].facing !== 10) hopThapVanHuong = false;
    if (grid[i].sitting + grid[i].facing !== 10) hopThapSonHuong = false;
  }

  if (hopThapVanSon) formations.push({ 
    name: 'Hợp Thập Toàn Bàn (Vận + Sơn)', 
    desc: `Số 10 là số hoàn hảo trong Hà Đồ, tượng trưng cho sự quay về gốc. Khi Vận bàn + Sơn bàn luôn bằng 10 ở mọi cung vị, nó tạo ra luồng sinh khí luân chuyển không ngừng, giúp hóa giải các tổ hợp sao xấu.

• Cực kỳ có lợi khi nhà đang vào giai đoạn suy thoái — giữ cho gia đạo bình an, vượng nhân đinh.
• Hóa giải thần kỳ các hung tinh 2-5, 5-9, giúp ngôi nhà vượt qua sóng gió.`, 
    loanDau: `Yêu cầu quan trọng nhất là sự "Thông thấu khí hóa".

🏔 Loan đầu: Tránh các vật cản sắc nhọn (Thiên trảm sát) chĩa vào nhà. Cần môi trường xung quanh hài hòa, không có sự đứt gãy về địa hình. Bắt buộc hình thể nhà VUÔNG VỨC, không khuyết góc.

🏠 Bố trí nội thất:
• Trung cung: Cần để trống, thoáng (tạo thành giếng trời hoặc sảnh chung).
• Kết nối: Các cửa phòng nên bố trí đối diện nhau hoặc thông qua hành lang rộng để dòng khí Hợp Thập có thể luân chuyển tuần hoàn, hóa giải mọi nút thắt năng lượng.`, 
    type: 'good' 
  });
  if (hopThapVanHuong) formations.push({ 
    name: 'Hợp Thập Toàn Bàn (Vận + Hướng)', 
    desc: `Vận bàn + Hướng bàn = 10 tại mọi cung. Lý khí Thiên Tâm Thập Đạo thông suốt toàn bàn.

• Tạo lực mạnh về vượng tài lộc, hóa giải mọi hung sát liên quan đến tài chính.
• Là "Phục phối" — khí lượng luân chuyển tự nhiên, không cần can thiệp quá nhiều vẫn cát.`, 
    loanDau: `Yêu cầu quan trọng nhất là sự "Thông thấu khí hóa".

🏔 Loan đầu: Tránh các vật cản sắc nhọn chĩa vào nhà. Hình thể nhà vuông vức, không chia quá nhiều vách ngăn.

🏠 Bố trí nội thất:
• Trung cung: Cần để trống, thoáng (giếng trời hoặc sảnh chung).
• Tập trung không gian ĐỘNG — phòng khách rộng rãi, xuyên suốt thông thoáng. Cửa chính luôn mở, lối đi sáng sủa.
• Các cửa phòng bố trí đối diện hoặc thông hành lang rộng để dòng khí luân chuyển tuần hoàn.`, 
    type: 'good' 
  });
  if (hopThapSonHuong) formations.push({ 
    name: 'Hợp Thập Toàn Bàn (Sơn + Hướng)', 
    desc: `Sơn bàn + Hướng bàn = 10 tại mọi cung. Âm dương giao hòa hoàn mỹ.

• Hưng vượng CẢ đinh lẫn tài. Nếu loan đầu Tọa/Hướng không tốt, nhờ Hợp Thập có thể tự động cứu vãn.
• Là cách cục "bảo hiểm" — dù ở vận suy cũng bảo vệ gia chủ qua giai đoạn khó khăn.`, 
    loanDau: `🏔 Loan đầu: Sơn Thủy ngoại cục phải hài hòa. Nhờ Hợp Thập nên dù loan đầu khiếm khuyết, vẫn tự động hóa giải phần nào. Tránh các vật cản sắc nhọn chĩa vào nhà.

🏠 Bố trí nội thất:
• Trung cung: Để trống, thoáng — giếng trời hoặc sảnh chung.
• TRÁNH chia vụn không gian nhà. Không xây vách ngăn quá nhiều, giữ khoảng thông suốt để khí lưu chuyển đều giữa các cung.`, 
    type: 'good' 
  });

  // 5. TAM BAN XẢO QUÁI (ĐỈNH CAO CỦA LÝ KHÍ)
  const isLienChuString = (arr) => ['123','234','345','456','567','678','789','189','129'].includes([...arr].sort().join(''));
  const isPhuMauString = (arr) => ['147','258','369'].includes([...arr].sort().join(''));

  let isLienChuToanBan = true, isPhuMauToanBan = true;
  for(let i=0; i<9; i++) {
    const nums = [grid[i].base, grid[i].sitting, grid[i].facing];
    if (!isLienChuString(nums)) isLienChuToanBan = false;
    if (!isPhuMauString(nums)) isPhuMauToanBan = false;
  }

  // 5A. LIÊN CHU TAM BAN XẢO QUÁI
  if (isLienChuToanBan) formations.push({ 
    name: 'Liên Châu Tam Ban Xảo Quái', 
    desc: `Đây là cách cục "linh hoạt" (Xảo), có khả năng thông khí cho cả 3 nguyên 1-4-7, 2-5-8, 3-6-9.

• Dấu hiệu: Ba sao tại mỗi cung vị tạo thành một chuỗi liên tục (VD: 1-2-3, 7-8-9).
• Ý nghĩa: Tạo ra sự liên kết chặt chẽ giữa quá khứ, hiện tại và tương lai. Nhà có cách cục này thì vận thế KHÔNG BAO GIỜ bị đứt đoạn, luôn có quý nhân phò trợ trong mọi hoàn cảnh.
• Tam nguyên bất bại — vượng xuyên suốt Thượng, Trung, Hạ nguyên.`, 
    loanDau: `Cần lưu ý: Nếu cách cục này trùng với Thượng Sơn Hạ Thủy, cần yếu tố loan đầu Đảo Kỵ Long để hóa giải.\n\n🏠 Nội thất: Cửa ra vào linh hoạt ở mọi phương đều vượng. Ưu tiên giữ không gian mở, không bít kín bất kỳ cung nào. Bố trí bàn thờ, phòng thờ tại cung có sao Sơn đương lệnh.`, 
    type: 'good' 
  });

  // 5B. PHỤ MẪU TAM BAN QUÁI
  if (isPhuMauToanBan) formations.push({ 
    name: 'Phụ Mẫu Tam Ban Xảo Quái', 
    desc: `Đây là cách cục TUYỆT QUÝ — "trường cửu" — đỉnh cao của Lý khí Huyền Không.

• Dấu hiệu: Tổ hợp các sao tại mỗi cung thuộc các nhóm số 1-4-7, 2-5-8, 3-6-9 (Thiên Địa Nhân tam tài).
• Đặc tính: Không phát nhanh như Đả Kiếp nhưng cực kỳ BỀN VỮNG. Đại diện cho sự ổn định của gia tộc, học hành đỗ đạt và thanh danh bền vững qua NHIỀU THẾ HỆ.
• Thu thông khí Thượng - Trung - Hạ nguyên, đảm bảo ngôi nhà vượng suốt 180 năm.`, 
    loanDau: `Cổng, Cửa, Bếp, Giường phải ĐỒNG NGUYÊN LONG — tức cùng thuộc một nhóm Thiên/Địa/Nhân nguyên long.\n\n⚠ Không kiêm hướng quá 3 độ. Nếu sai lệch, Phụ Mẫu Tam Ban sẽ bị phá vỡ hoàn toàn và mất hết công hiệu.`, 
    type: 'good' 
  });

  // 5C. THẤT TINH ĐẢ KIẾP (BÍ PHÁP CƯỚP VẬN KHÍ)
  if (isSTHH && !isPhuMauToanBan) {
    const lyChanCan = [grid[1], grid[3], grid[8]];
    const khamTonDoai = [grid[7], grid[0], grid[5]];
    
    if (isPhuMauString(lyChanCan.map(c=>c.facing)) && isPhuMauString(lyChanCan.map(c=>c.sitting))) {
      formations.push({ 
        name: 'Thất Tinh Đả Kiếp (Ly Đả Kiếp)', 
        desc: `Đây được coi là "BÍ PHÁP" trong Huyền Không để hóa giải những hướng nhà không được vượng khí.

• Cơ chế: Kết nối năng lượng của 3 cung vị chiến lược Ly – Chấn – Càn thông qua bộ số 1-4-7, 2-5-8, 3-6-9.
• Mục đích: "Đả kiếp" nghĩa là CƯỚP lấy khí đương vượng của tương lai để dùng ngay cho hiện tại. Biến ngôi nhà đang ở vận suy thành nhà đại vượng về tài lộc.`,
        loanDau: `Đây là cách cục cần sự tác động cơ học MẠNH MẼ nhất.

🏠 Bố trí nội thất (Quyết định):
• Khí khẩu liên thông: PHẢI mở được cửa hoặc cửa sổ tại đúng 3 cung vị Ly – Chấn – Càn.
• Phòng ốc: 3 khu vực này nên là không gian sinh hoạt chung (phòng khách, phòng ăn) để sự hoạt động của con người giúp "kích khí".
• TUYỆT ĐỐI TRÁNH: Đặt nhà vệ sinh, nhà kho hoặc các vật ô uế tại 3 cung vị này. Nếu không, việc "đả kiếp" sẽ mang về toàn uế khí, tai họa khôn lường.

🏔 Loan đầu: Tại 3 phương vị Ly, Chấn, Càn — ngoại cảnh phải sạch sẽ, không có cột điện, ống khói hoặc bãi rác.`, 
        type: 'good' 
      });
    } else if (isPhuMauString(khamTonDoai.map(c=>c.facing)) && isPhuMauString(khamTonDoai.map(c=>c.sitting))) {
      formations.push({ 
        name: 'Thất Tinh Đả Kiếp (Khảm Đả Kiếp)', 
        desc: `"Bí pháp" Đả Kiếp hệ Khảm — cướp vận khí tương lai để dùng cho hiện tại.

• Cơ chế: Kết nối năng lượng qua 3 cung vị chiến lược Khảm – Tốn – Đoài thông qua bộ số 1-4-7, 2-5-8, 3-6-9.
• Mục đích: Thu tài đắc lộc cực mạnh, biến nhà vận suy thành nhà đại vượng.`,
        loanDau: `Đây là cách cục cần sự tác động cơ học MẠNH MẼ nhất.

🏠 Bố trí nội thất (Quyết định):
• Khí khẩu liên thông: PHẢI mở được cửa hoặc cửa sổ tại đúng 3 cung vị Khảm – Tốn – Đoài.
• Phòng ốc: 3 khu vực này nên là không gian sinh hoạt chung (phòng khách, phòng ăn) để sự hoạt động của con người giúp "kích khí".
• TUYỆT ĐỐI TRÁNH: Đặt nhà vệ sinh, nhà kho hoặc vật ô uế tại 3 cung vị này.

🏔 Loan đầu: Tại 3 phương vị Khảm, Tốn, Đoài — ngoại cảnh phải sạch sẽ, không có cột điện, ống khói hoặc bãi rác.`, 
        type: 'good' 
      });
    }
  }

  // =====================================================
  // BÌNH CỤC (KHÔNG CÓ CÁCH CỤC ĐẶC BIỆT)
  // =====================================================
  if (formations.length === 0) {
    formations.push({
      name: 'Bình Cục (Thu Sơn Xuất Sát Cơ Bản)',
      desc: `Toàn bàn không hình thành cách cục đặc biệt nào. Cát hung KHÔNG định sẵn nhờ Cách cục mà phụ thuộc hoàn toàn vào quá trình thiết kế, bố trí chi tiết từng không gian cụ thể.

• Cần phân tích kỹ từng cung vị, xem tổ hợp Sơn - Hướng tinh tại mỗi cung để bố trí nội thất phù hợp.
• Không nên quá bi quan — nhiều ngôi nhà Bình Cục vẫn rất tốt nếu loan đầu thuận và bố trí nội thất chuẩn phong thủy.`,
      loanDau: `THU SƠN XUẤT SÁT CƠ BẢN:

🏔 Ngoại thất:
• Tìm phương vị sao Sơn ${period} (đương lệnh) → cần thế tựa vững, có tòa nhà/đồi che chắn.
• Tìm phương vị sao Hướng ${period} (đương lệnh) → cần Minh đường sáng sủa, có nước lưu quang.

🏠 Nội thất:
• Phương nào có sao Hướng vượng → đặt cổng cửa, phòng khách, lối đi (ĐỘNG).
• Phương nào có sao Sơn vượng → đặt giường ngủ, bàn thờ, két sắt (TĨNH).
• Tránh kích hoạt các phương có hung tinh 2-5, 5-9.`,
      type: 'neutral'
    });
  }
  return formations;
};

// --- HÓA GIẢI & KÍCH HOẠT TỰ ĐỘNG ---
export const generateRemedies = (finalGrid, period) => {
  const sittingRemedies = {};
  const facingRemedies = {};
  
  const STAR_NAMES = {
    1: 'Nhất Bạch', 2: 'Nhị Hắc', 3: 'Tam Bích', 4: 'Tứ Lục', 5: 'Ngũ Hoàng',
    6: 'Lục Bạch', 7: 'Thất Xích', 8: 'Bát Bạch', 9: 'Cửu Tử'
  };

  const analyzeStar = (star, typeStr) => {
     const name = STAR_NAMES[star];

     if (star === 5) {
        return {
           starNumber: star,
           level: 'danger',
           title: `${name} Đại Sát (${star})`,
           desc: `Có sao Ngũ Hoàng kịch độc chiếu tới. Đại hung tinh chủ tai họa, máu huyết, suy bại.`,
           advice: `CẤM động thổ. Treo chuông gió 6 ống, hũ muối nước (An Nhẫn Thủy). Kỵ màu Đỏ/Vàng.`
        };
     } 
     
     if (star === 2) {
        return {
           starNumber: star,
           level: 'danger',
           title: `${name} Bệnh Phù (${star})`,
           desc: `Có sao Nhị Hắc chiếu tới. Hung tinh chủ ốm đau, bệnh tật trường kỳ.`,
           advice: `Treo 6 đồng tiền lục đế, Hồ lô đồng. Hạn chế ngủ/nghỉ lâu dài ở đây.`
        };
     } 
     
     if (star === period) {
        return {
           starNumber: star,
           level: 'success',
           title: `${name} Đương Lệnh (${star})`,
           desc: `Sao ${name} đang nắm quyền Đương Vượng. Cực kỳ cát lợi, vượng ${typeStr === 'Sơn Tinh' ? 'nhân đinh, sức khỏe' : 'tài lộc, sự nghiệp'}.`,
           advice: typeStr === 'Sơn Tinh' 
              ? 'Nên bố trí tĩnh: Đặt phòng ngủ, giường, bàn thờ, non bộ khô để vượng đinh.' 
              : 'Nên bố trí động: Mở cửa, lối đi, đặt Phong thủy luân (thác nước), đèn sáng để kích Tài.'
        };
     } 
     
     if (star === 3) {
        return {
           starNumber: star,
           level: 'warning',
           title: `${name} Thị Phi (${star})`,
           desc: `Sao Tam Bích thoái khí chủ thị phi, trộm cắp, cãi vã, kiện cáo.`,
           advice: `Dùng ngũ hành Hỏa (Thảm đỏ, đèn sáng) để tiết Mộc khí.`
        };
     }
     
     if (star === 7) {
        return {
           starNumber: star,
           level: 'warning',
           title: `${name} Thoái Khí (${star})`,
           desc: `Sao Thất Xích thoái khí chủ mổ xẻ, hao tài, đâm chém, họa từ miệng.`,
           advice: `Dùng ngũ hành Thủy (Bể cá tĩnh, thảm xanh) để tiết Kim khí.`
        };
     }
     
     if (star === 1 || star === 8 || star === 9) {
        return {
           starNumber: star,
           level: 'success',
           title: `${name} Cát Tinh (${star})`,
           desc: `Sao ${name} là cát tinh mang lại may mắn, ${star === 1 ? 'học vấn, trí tuệ' : star === 8 ? 'tài lộc vững bền' : 'hỷ khánh, bùng nổ'}.`,
           advice: 'Bố trí thoáng đãng, đặt bàn làm việc, nhiều ánh sáng. Kích hoạt thêm họa tiết màu bản mệnh.'
        };
     }
     
     if (star === 4) {
        return {
           starNumber: star,
           level: 'info',
           title: `${name} Văn Khúc (${star})`,
           desc: `Sao Tứ Lục tuy thoái khí nhưng mang lại duyên đào hoa, học hành, văn chương.`,
           advice: 'Có thể đặt bàn học, giá sách, tháp Văn Xương 9 tầng hoặc 4 cành trúc để kích vượng.'
        };
     }
     
     if (star === 6) {
        return {
           starNumber: star,
           level: 'info',
           title: `${name} Vũ Khúc (${star})`,
           desc: `Sao Lục Bạch thoái khí nhẹ chủ về quyền lực, quan lộc, uy tín.`,
           advice: 'Hợp làm phòng làm việc của lãnh đạo. Có thể kích hoạt bằng vật Kim loại (Kỳ Lân, Ấn tượng).'
        };
     }

     return {
        starNumber: star,
        level: 'info',
        title: `${name} Bình Hòa`,
        desc: `Sao ${name} không mang năng lượng cực đoan.`,
        advice: `Sử dụng bình thường, dọn dẹp sạch sẽ.`
     };
  };

  for(let i = 0; i < 9; i++) {
     const cell = finalGrid[i];
     sittingRemedies[i] = analyzeStar(cell.sitting, 'Sơn Tinh');
     facingRemedies[i] = analyzeStar(cell.facing, 'Hướng Tinh');
  }
  
  return { sittingRemedies, facingRemedies };
};


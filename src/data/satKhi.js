/**
 * CƠ SỞ DỮ LIỆU SÁT KHÍ PHONG THỦY
 * Nguồn: Tài liệu thư viện Huyền Không Các
 * 20 loại sát khí cơ bản và cách hóa giải
 */

export const SAT_KHI_DATABASE = [
  {
    id: 'thuong_sat',
    name: 'Xung Sát (Thương Sát)',
    keywords: ['đường đâm', 'hẻm đâm', 'đường thẳng', 'ngõ đâm', 'ngõ thẳng', 'xung sát', 'thương sát', 'đường chĩa', 'hẻm chĩa', 'duong dam', 'hem dam', 'ngo dam', 'xung sat', 'thuong sat', 'đâm thẳng vào', 'dam thang vao', 'đường lao thẳng', 'duong lao thang', 'đường xung', 'ngõ cụt đâm', 'hẻm cụt', 'hem cut', 'đường chạy thẳng', 'ngo chay thang', 'đường nhắm thẳng', 'đường hướng vào', 'lao thẳng vào cửa', 'đường đối diện cửa'],
    icon: '🏹',
    severity: 'critical', // critical, high, medium, low
    desc: `Đường hoặc hẻm đâm thẳng vào cửa nhà. Về vật lý, gió và bụi theo trục đường lao thẳng vào nhà với tốc độ cao, không có khoảng đệm. Về phong thủy, đây là "ác khí" đi theo đường thẳng (Sinh khí đi theo đường vòng). Sự xung kích này phá vỡ từ trường bình ổn, khiến gia chủ dễ gặp tai nạn đột ngột, phẫu thuật, hoặc hao tài tốn của cực mạnh.`,
    hoaGiai: [
      { phap: 'Ấn pháp', detail: 'Đặt bia đá khắc "Thái Sơn Thạch Cảm Đương" trước cửa để định danh và chặn đứng luồng khí.' },
      { phap: 'Thủy pháp', detail: 'Xây bể cá hoặc đài phun nước chắn ngang. Nước (Thủy) có tính dung chứa, sẽ làm dịu và tản mát luồng xung khí — "Khí giới Thủy tắc chỉ".' },
      { phap: 'Mộc pháp', detail: 'Dùng hàng cây chậu kiểng vươn cao xếp hình vòng cung trước nhà để "mềm hóa" đường bay của sát khí.' },
    ]
  },
  {
    id: 'thien_tram_sat',
    name: 'Thiên Trảm Sát',
    keywords: ['khe hẹp', 'khe giữa', '2 tòa nhà', 'hai tòa nhà', 'kẽ hở', 'thiên trảm', 'giữa hai nhà', 'khe nhà', 'khe hep', 'thien tram', 'ke ho', 'giua hai nha', '2 toa nha', 'hai toa nha', 'khe hai', 'khe tòa', 'khe toa', 'kẽ giữa 2', 'ke giua 2', 'khe hở giữa', 'khe ho giua', 'giữa 2 tòa', 'giua 2 toa', 'khe hai tòa', 'khe hẹp hai', 'khe nha', 'kẽ hẹp', 'sát giữa hai nhà', 'khe giữa hai tòa'],
    icon: '⚔️',
    severity: 'critical',
    desc: `Khe hẹp giữa 2 tòa nhà đối diện. Áp dụng hiệu ứng Venturi: gió lùa qua khe hẹp gia tăng vận tốc đột ngột, tạo thành "đao phong" (gió như dao cắt) chém thẳng vào nhà. Gây áp lực tâm lý nặng nề, suy nhược thần kinh, vận khí gia đạo trồi sụt, nguy cơ dính líu pháp lý.`,
    hoaGiai: [
      { phap: 'Trấn pháp', detail: 'Bày cặp Kỳ lân đá hoặc Tỳ hưu nhìn thẳng ra khe hẹp để "nuốt" sát khí.' },
      { phap: 'Hóa pháp', detail: 'Treo Gương Bát quái lồi để phản xạ khuếch tán luồng gió độc bật ngược trở lại.' },
      { phap: 'Mộc pháp', detail: 'Cây xanh tán rộng ở ban công là lá chắn vật lý tuyệt vời để băm nhỏ luồng khí mạnh trước khi lùa vào phòng.' },
    ]
  },
  {
    id: 'liem_dao_sat',
    name: 'Liêm Đao Sát',
    keywords: ['đường cong', 'cầu vượt', 'liêm đao', 'đường vòng cung', 'cong chém', 'cầu vượt chém', 'duong cong', 'cau vuot', 'liem dao', 'cong chem', 'đường cong chém', 'cầu vượt gần', 'cầu vượt cắt', 'cau vuot cat', 'đường cung', 'duong cung', 'đường uốn cong', 'duong uon cong', 'lưỡi liềm', 'luoi liem', 'cung đường', 'đường vòng', 'duong vong', 'cầu cong', 'cau cong', 'đường cắt ngang', 'vòng cung chém'],
    icon: '🗡️',
    severity: 'high',
    desc: `Đường cong hoặc cầu vượt chém vào nhà. Khí bị dồn ép và văng ra từ lực ly tâm của phương tiện lưu thông. Mang theo tiếng ồn và khói bụi tạo thành "Động sát". Cắt đứt cơ hội làm ăn, người trong nhà hay bị thương chân tay, tinh thần bất an.`,
    hoaGiai: [
      { phap: 'Hóa pháp', detail: 'Đặt cặp Voi đồng tại bậu cửa sổ, vòi hướng ra phía "lưỡi liềm" để thu nạp tài lộc bị văng ra.' },
      { phap: 'Ấn pháp', detail: 'Treo 6 đồng xu cổ (Lục đế tiền) dưới bậu cửa sổ hoặc ban công để ổn định từ trường.' },
    ]
  },
  {
    id: 'phan_cung_sat',
    name: 'Phản Cung Sát',
    keywords: ['đường uốn cong', 'sông uốn', 'phản cung', 'mặt lồi', 'vòng cung úp ngược', 'phan cung', 'mat loi', 'song uon', 'đường cong ngược', 'duong cong nguoc', 'sông cong', 'song cong', 'vòng cung lồi', 'vong cung loi', 'sông uốn khúc', 'song uon khuc', 'cung ngược', 'cung nguoc', 'đường quay lưng', 'duong quay lung', 'vòng cung quay lưng', 'đường ôm ngược', 'lồi ra phía nhà', 'cong lồi'],
    icon: '🏹',
    severity: 'high',
    desc: `Đường hoặc sông uốn cong úp ngược, nhà nằm ở mặt lồi của vòng cung. Năng lượng tốt liên tục bị đẩy trôi đi, trong khi rác rưởi, bụi bặm bị đẩy vào. Gia đạo cãi vã, con cái ly tán, tiền bạc kiếm được nhưng không giữ được.`,
    hoaGiai: [
      { phap: 'Họa pháp', detail: 'Bên trong nhà treo tranh Sơn Thủy (Núi vững vàng, Nước tĩnh lặng) để trấn an trường khí.' },
      { phap: 'Trấn pháp', detail: 'Đặt cặp Sư tử đá trước cổng/cửa để trấn giữ tài lộc không bị cuốn đi.' },
    ]
  },
  {
    id: 'tien_dao_sat',
    name: 'Tiễn Đao Sát',
    keywords: ['giao lộ', 'chữ y', 'ngã tư chéo', 'tiễn đao', 'ngã ba', 'lưỡi kéo', 'giao lo', 'chu y', 'nga tu cheo', 'tien dao', 'nga ba', 'luoi keo', 'ngã tư', 'nga tu', 'giao nhau', 'giao cắt', 'giao cat', 'ngã rẽ', 'nga re', 'đường giao', 'duong giao', 'chữ Y', 'chu Y', 'ngã 3', 'nga 3', 'ngã 4', 'nga 4', 'nút giao', 'nut giao', 'đường cắt chéo', 'duong cat cheo'],
    icon: '✂️',
    severity: 'critical',
    desc: `Nhà nằm ở giao lộ chữ Y, ngã tư chéo (lưỡi kéo). Có sự giao cắt và va đập mạnh mẽ của nhiều luồng khí. Từ trường cực kỳ nhiễu loạn, mang tính Hỏa rất cao. Gây ra tai nạn giao thông tàn khốc, làm ăn lụi bại nhanh chóng.`,
    hoaGiai: [
      { phap: 'Mộc & Thổ pháp', detail: 'Xây bồn hoa bằng đá/gạch (Thổ) và trồng rặng cây dày (Mộc) tại đúng mũi nhọn để chặn đứng luồng sát.' },
      { phap: 'Ấn pháp', detail: 'Đặt khối đá thạch anh lớn nguyên khối hoặc đá tảng tự nhiên tại mũi nhọn để mượn năng lượng Thổ tĩnh hóa giải Hỏa động.' },
    ]
  },
  {
    id: 'tiem_xa_sat',
    name: 'Tiêm Xạ Sát',
    keywords: ['góc nhọn', 'mái nhọn', 'nhà chỉa', 'góc mái', 'tiêm xạ', 'mái nhà nhọn', 'nhọn chĩa', 'goc nhon', 'mai nhon', 'tiem xa', 'nhon chia', 'góc nhọn chĩa', 'goc nhon chia', 'mũi nhọn', 'mui nhon', 'nhà nhọn', 'nha nhon', 'mái tam giác', 'mai tam giac', 'mái chỉa', 'mai chia', 'đầu nhọn', 'dau nhon', 'đỉnh nhọn', 'dinh nhon', 'góc nhà chĩa', 'cạnh nhọn', 'canh nhon', 'nhà đối diện nhọn'],
    icon: '📐',
    severity: 'high',
    desc: `Góc nhọn của mái hoặc nhà đối diện chĩa vào. Góc nhọn mang thuộc tính Hỏa, tạo năng lượng hội tụ tại một điểm (như tia laser). Gây ức chế thần kinh, viêm nhiễm cấp tính, bệnh về mắt, dễ bị gièm pha, đâm chọc sau lưng.`,
    hoaGiai: [
      { phap: 'Hóa pháp', detail: 'Dùng rèm cửa dày, rèm tăm tre che chắn. Hoặc treo quả cầu thủy tinh vát cạnh để tán xạ tia sát khí.' },
      { phap: 'Thủy pháp', detail: 'Đặt lu nước tĩnh (không nuôi cá) phía trước góc nhọn chĩa vào. Thủy khắc Hỏa, dập tắt năng lượng xấu.' },
    ]
  },
  {
    id: 'xuyen_tam_sat',
    name: 'Xuyên Tâm Sát',
    keywords: ['cột điện', 'cây to', 'giữa cửa', 'xuyên tâm', 'trụ điện', 'cột trước cửa', 'cây cản cửa', 'cot dien', 'cay to', 'giua cua', 'xuyen tam', 'tru dien', 'cot truoc cua', 'cây trước cửa', 'cay truoc cua', 'cột đèn', 'cot den', 'cột trước nhà', 'cot truoc nha', 'cây lớn trước cửa', 'cay lon truoc cua', 'trụ đèn', 'tru den', 'cột chắn', 'cot chan', 'cây chắn cửa', 'cay chan cua', 'cột giữa', 'cot giua', 'cây giữa cửa', 'cot chính giữa'],
    icon: '⚡',
    severity: 'high',
    desc: `Cột điện hoặc cây to đứng chính giữa cửa chính. Luồng sinh khí bị chẻ làm đôi, tạo sự bất hòa hợp ngay từ lối vào. Người trong nhà cảm thấy bít bùng, nghẽn lối. Dẫn đến bệnh tim mạch, hệ tiêu hóa, vận quý nhân bị cản trở.`,
    hoaGiai: [
      { phap: 'Hóa pháp', detail: 'Nếu là cột điện (Hỏa), sơn tường rào bằng màu Thổ (Vàng, Đất) để Hỏa sinh Thổ, tiêu hao sức mạnh.' },
      { phap: 'Ấn pháp', detail: 'Treo Hồ Lô đồng tại cửa chính để thu nạp và chuyển hóa thứ khí bị chẻ gãy thành khí ôn hòa.' },
    ]
  },
  {
    id: 'kinh_quyen_sat',
    name: 'Kình Quyền Sát',
    keywords: ['tòa nhà nhô', 'nhà nhô ra', 'nắm đấm', 'kình quyền', 'nhà đối diện to', 'chèn ép', 'toa nha nho', 'nha nho ra', 'nam dam', 'kinh quyen', 'chen ep', 'nhà nhô', 'nha nho', 'nhô ra', 'nho ra', 'nhà lồi', 'nha loi', 'tòa nhà lồi', 'toa nha loi', 'nhà to đè', 'nha to de', 'cao đè', 'cao de', 'áp chế', 'ap che', 'nhà cao lấn', 'nha cao lan', 'tòa nhà to', 'toa nha to', 'nhà to chắn', 'nha to chan', 'nhà đối diện cao'],
    icon: '👊',
    severity: 'medium',
    desc: `Tòa nhà nhô ra như nắm đấm đe dọa. Gây áp lực vô hình lên tâm lý chủ nhân. Trong công ty hay bị cấp trên chèn ép, ra ngoài bị bắt nạt, sự nghiệp khó thăng tiến.`,
    hoaGiai: [
      { phap: 'Họa pháp', detail: 'Treo tranh Đại Bàng tung cánh hoặc Mãnh Hổ xuống núi để đối ứng lại sự uy hiếp bên ngoài.' },
      { phap: 'Mộc pháp', detail: 'Trồng cây thân gỗ thẳng tắp, cứng cáp (tùng, bách) để vươn lên đỡ lấy áp lực.' },
    ]
  },
  {
    id: 'xung_thien_sat',
    name: 'Xung Thiên Sát',
    keywords: ['ống khói', 'tháp phát sóng', 'xung thiên', 'tháp viễn thông', 'trạm BTS', 'ống khói nhà máy', 'ong khoi', 'thap phat song', 'xung thien', 'thap vien thong', 'tram BTS', 'ống xả', 'ong xa', 'ống khói xưởng', 'ong khoi xuong', 'nhà máy', 'nha may', 'cột sóng', 'cot song', 'tháp sóng', 'thap song', 'cột phát sóng', 'cot phat song', 'trạm điện', 'tram dien', 'trạm phát sóng', 'tram phat song', 'antena', 'ăng ten', 'ang ten'],
    icon: '🏭',
    severity: 'critical',
    desc: `Ống khói hoặc tháp phát sóng gần nhà. Tạo từ trường điện từ mạnh, xả khí bẩn. Kết hợp Hỏa sát và Âm sát. Phá hủy hệ hô hấp, suy giảm trí nhớ, đau đầu kinh niên và vô sinh.`,
    hoaGiai: [
      { phap: 'Trấn & Hóa pháp', detail: 'Treo chuông gió bằng đồng (6 ống). Âm thanh Kim loại làm tan Hỏa sát, rung động không khí phá vỡ từ trường xấu.' },
      { phap: 'Mộc pháp', detail: 'Trồng cây cau cảnh hoặc cây lọc bức xạ tốt (Lưỡi hổ) ở cửa sổ.' },
    ]
  },
  {
    id: 'bach_ho_sat',
    name: 'Bạch Hổ Sát',
    keywords: ['bên phải cao', 'bạch hổ', 'phải cao hơn', 'bên phải đào', 'bên phải xây', 'phía phải nhà cao', 'ben phai cao', 'bach ho', 'phai cao hon', 'ben phai dao', 'ben phai xay', 'phải cao', 'phai cao', 'hổ cao', 'ho cao', 'bên phải', 'ben phai', 'hữu cao', 'huu cao', 'tay phải cao', 'tay phai cao', 'bên phải lấn', 'ben phai lan', 'nhà phải cao', 'nha phai cao', 'phải nhà cao hơn', 'nha cao hon ben trai', 'bên phải nhà cao hơn', 'phải lớn hơn trái'],
    icon: '🐯',
    severity: 'high',
    desc: `Bên phải nhà cao hơn hoặc đang đào bới. Bạch Hổ đại diện cho tính hung, khi cao hoặc động hơn bên Thanh Long thì tạo sự lấn lướt. Nữ chủ nhân vất vả, nam chủ nhân yếu thế, dễ ốm đau hoặc vướng pháp lý.`,
    hoaGiai: [
      { phap: 'Trấn pháp', detail: 'Đặt tượng Rồng (Thanh Long) bằng đồng hoặc đá ở phía bên Trái ngôi nhà để cân bằng lại.' },
      { phap: 'Thủy pháp', detail: 'Đặt đài phun nước mini hoặc phong thủy luân ở bên Trái để kích hoạt sinh khí bên Long.' },
    ]
  },
  {
    id: 'am_sat',
    name: 'Âm Sát',
    keywords: ['nghĩa trang', 'nhà xác', 'bệnh viện', 'gần nghĩa trang', 'âm sát', 'nhà tang', 'gần bệnh viện', 'gần nhà xác', 'nghia trang', 'nha xac', 'benh vien', 'am sat', 'nha tang', 'nghĩa địa', 'nghia dia', 'mộ', 'mo', 'mồ mả', 'mo ma', 'đất nghĩa trang', 'dat nghia trang', 'nhà quàn', 'nha quan', 'nhà đám', 'nha dam', 'viện', 'vien', 'lò thiêu', 'lo thieu', 'gần mộ', 'gan mo', 'bên cạnh nghĩa trang', 'gần nghĩa địa', 'gan nghia dia', 'tang lễ'],
    icon: '⚰️',
    severity: 'high',
    desc: `Gần nghĩa trang, nhà xác, bệnh viện. Tích tụ u sầu, tử khí, vi khuẩn. Âm khí lấn át Dương khí khiến nhà lạnh lẽo. Dễ trầm cảm, bóng đè, mộng mị, ốm vặt không rõ nguyên nhân, thiếu sinh lực.`,
    hoaGiai: [
      { phap: 'Hóa pháp (Quang)', detail: 'Mở rộng cửa sổ hướng Đông/Nam đón nắng. Giữ nhà sáng sủa, khô ráo. Xông trầm hương hoặc tinh dầu tẩy uế.' },
      { phap: 'Ấn pháp', detail: 'Thỉnh tượng Phật, Bồ Tát hoặc vật phẩm tâm linh tin tưởng (đã khai quang) để an trấn tinh thần.' },
      { phap: 'Họa pháp', detail: 'Sơn tường màu ấm (vàng nhạt, cam nhạt), dùng ánh sáng đèn vàng.' },
    ]
  },
  {
    id: 'quang_sat',
    name: 'Quang Sát',
    keywords: ['ánh sáng', 'đèn pha', 'kính phản quang', 'quang sát', 'hắt sáng', 'chói mắt', 'phản chiếu ánh sáng', 'anh sang', 'den pha', 'kinh phan quang', 'quang sat', 'hat sang', 'choi mat', 'phan chieu', 'gương kính', 'guong kinh', 'kính chiếu', 'kinh chieu', 'sáng chói', 'sang choi', 'lóa mắt', 'loa mat', 'ánh nắng hắt', 'anh nang hat', 'kính phản xạ', 'kinh phan xa', 'kính tòa nhà', 'kinh toa nha', 'phản sáng', 'phan sang', 'đèn chiếu', 'den chieu', 'ánh sáng chiếu thẳng'],
    icon: '☀️',
    severity: 'medium',
    desc: `Ánh sáng đèn pha hoặc kính phản quang chiếu vào nhà. Gây ô nhiễm ánh sáng, phá vỡ nhịp sinh học. Hỏa vượng dẫn đến tính tình cáu bẳn, xung đột vợ chồng, huyết áp cao.`,
    hoaGiai: [
      { phap: 'Mộc pháp', detail: 'Trồng cây leo hoặc rặng cây dày che chắn. Mộc hấp thụ ánh sáng tốt.' },
      { phap: 'Thủy pháp', detail: 'Thủy khắc Hỏa. Đặt chậu nước lớn hoặc bể cá ở khu vực bị hắt sáng. Rèm cửa màu Thủy (xanh dương đậm, ghi xám).' },
    ]
  },
  {
    id: 'hoa_hinh_sat',
    name: 'Hỏa Hình Sát',
    keywords: ['tam giác', 'trạm biến áp', 'hỏa hình', 'nhà tam giác', 'kiến trúc nhọn', 'biến thế', 'tam giac', 'tram bien ap', 'hoa hinh', 'nha tam giac', 'kien truc nhon', 'bien the', 'trạm điện', 'tram dien', 'hình tam giác', 'hinh tam giac', 'biến áp', 'bien ap', 'máy biến áp', 'may bien ap', 'tháp nhọn', 'thap nhon', 'mái tam giác', 'mai tam giac', 'đất tam giác', 'dat tam giac', 'nhà hình chóp'],
    icon: '🔻',
    severity: 'critical',
    desc: `Kiến trúc hình tam giác hoặc trạm biến áp gần nhà. Tính Hỏa cực mạnh. Gây bệnh Máu và Tim. Gia đình dễ dính cờ bạc, bạo lực hoặc hỏa hoạn nguy hiểm.`,
    hoaGiai: [
      { phap: 'Thủy pháp', detail: 'Nếu là công trình tam giác, dùng Thủy pháp mạnh (bể nước lớn) để khắc chế.' },
      { phap: 'Thổ pháp', detail: 'Nếu là trạm điện (thực Hỏa), TUYỆT ĐỐI KHÔNG dùng Thủy. Dùng đồ gốm sứ, màu nâu đất (Hỏa sinh Thổ) + tiền xu đồng (Thổ sinh Kim) để dẫn hóa khí xấu.' },
    ]
  },
  {
    id: 'vo_tinh_sat',
    name: 'Vô Tình Sát',
    keywords: ['bức tường', 'vách cụt', 'tường lớn', 'vô tình', 'bít minh đường', 'tường chắn', 'bí cửa', 'buc tuong', 'vach cut', 'tuong lon', 'vo tinh', 'bit minh duong', 'tuong chan', 'bi cua', 'tường bít', 'tuong bit', 'tường đâm', 'tuong dam', 'tường chặn', 'tuong chan', 'đối diện tường', 'doi dien tuong', 'tường cao', 'tuong cao', 'vách chằn', 'vach chan', 'tường lớn đối diện', 'tuong lon doi dien', 'bí lối', 'bi loi', 'bế tắc', 'be tac', 'cụt đường', 'cut duong', 'không có lối'],
    icon: '🧱',
    severity: 'medium',
    desc: `Đối diện bức tường lớn hoặc vách cụt. Sinh khí bị chặn đứng, Minh đường bị bít. Tượng trưng cho sự "hết đường lui", bế tắc. Tiền đồ mờ mịt, quan hệ xã hội thu hẹp, khó phát triển kinh doanh.`,
    hoaGiai: [
      { phap: 'Họa pháp', detail: 'Treo tranh phong cảnh mở (cánh đồng, biển cả) tạo "ảo ảnh" chiều sâu không gian, giải tỏa tâm lý.' },
      { phap: 'Thủy pháp', detail: 'Tạo tiểu cảnh nước chảy róc rách ở khu vực đó để tự tạo "Động khí", sinh năng lượng sống.' },
    ]
  },
  {
    id: 'huy_sat',
    name: 'Hủy Sát',
    keywords: ['mỏ chim', 'mái hiên nhọn', 'hủy sát', 'góc hiên', 'mái hiên chĩa', 'mo chim', 'mai hien nhon', 'huy sat', 'goc hien', 'mai hien chia', 'mái nhọn', 'mai nhon', 'mỏ chim mổ', 'mo chim mo', 'mái chĩa', 'mai chia', 'hiên nhọn', 'hien nhon', 'mũi mái', 'mui mai', 'mái nhô nhọn', 'mai nho nhon'],
    icon: '🦅',
    severity: 'medium',
    desc: `Mái hiên hoặc góc nhà có hình mỏ chim mổ. Mang tính chất "Khẩu thiệt" — tạo sự đố kỵ, soi mói từ hàng xóm. Gia đình hay vướng kiện cáo, vu khống, mang tiếng ác.`,
    hoaGiai: [
      { phap: 'Trấn pháp', detail: 'Treo gương bát quái lồi chiếu thẳng vào "mỏ chim" để hóa giải sự sắc nhọn.' },
      { phap: 'Mộc pháp', detail: 'Đặt chậu cây có gai (Xương rồng, hoa hồng, lưỡi hổ) ngoài ban công. Lấy gai nhọn chống mũi nhọn (Dĩ độc trị độc).' },
    ]
  },
  {
    id: 'thich_dien_sat',
    name: 'Thích Diện Sát',
    keywords: ['đồi núi lởm chởm', 'gạch đá ngổn ngang', 'thích diện', 'đổ nát', 'xây dở', 'phế tích', 'doi nui lom chom', 'gach da ngon ngang', 'thich dien', 'do nat', 'xay do', 'phe tich', 'lởm chởm', 'lom chom', 'gồ ghề', 'go ghe', 'hoang tàn', 'hoang tan', 'đổ nát', 'do nat', 'xây dang dở', 'xay dang do', 'đá sỏi', 'da soi', 'phế liệu', 'phe lieu', 'đất đá ngổn ngang', 'dat da ngon ngang', 'gạch vỡ', 'gach vo', 'tường rêu', 'tuong reu'],
    icon: '🏚️',
    severity: 'medium',
    desc: `Đối diện đồi núi lởm chởm, gạch đá ngổn ngang. Hình ảnh xói mòn, đổ nát mang năng lượng suy thoái (Tử khí). Cản trở công danh, dễ mắc bệnh da liễu, hay bị trộm cướp dòm ngó.`,
    hoaGiai: [
      { phap: 'Hóa pháp', detail: 'Rào giậu kín đáo, kéo rèm — "Mắt không thấy thì tâm không phiền" (Khuất tầm nhìn).' },
      { phap: 'Ấn & Trấn pháp', detail: 'Treo 2 xâu tiền Lục đế ở hai bên cửa sổ. Đặt thêm cặp Tỳ hưu nhìn ra ngoài để bảo vệ tài sản.' },
    ]
  },
  {
    id: 'co_duong_sat',
    name: 'Cô Dương Sát',
    keywords: ['miếu', 'đền thờ', 'đình', 'chùa gần', 'cô dương', 'gần đền', 'gần miếu', 'gần chùa', 'mieu', 'den tho', 'dinh', 'chua', 'co duong', 'gan den', 'gan mieu', 'gan chua', 'miếu mạo', 'mieu mao', 'đền', 'den', 'chùa', 'chua gan', 'am', 'miễu', 'nhà thờ', 'nha tho', 'gần miếu', 'gần đình', 'gan dinh', 'gần đền chùa', 'gan den chua', 'phía cạnh chùa', 'bên cạnh đền', 'cạnh đình', 'canh dinh'],
    icon: '🛕',
    severity: 'high',
    desc: `Nhà gần miếu mạo, đền thờ. Nơi thờ cúng tập trung Dương khí cực mạnh. Ngôi nhà bị hút cạn sinh khí, "Cô dương bất sinh". Người ở lập dị, cô độc, vất vả đường tình duyên, khó giữ tài lộc.`,
    hoaGiai: [
      { phap: 'Thủy pháp', detail: 'Bố trí lu nước, phong thủy luân phía trước nhà để "giữ" khí lại. Thủy đại diện Âm, cân bằng Dương quá vượng.' },
      { phap: 'Ấn pháp', detail: 'Đặt la bàn phong thủy (Hoàng Lịch) tại phòng khách để tự tạo lập trường khí riêng biệt.' },
    ]
  },
  {
    id: 'doc_am_sat',
    name: 'Độc Âm Sát',
    keywords: ['cống rãnh', 'bãi rác', 'nhà vệ sinh công cộng', 'độc âm', 'hôi thối', 'ô nhiễm', 'gần bãi rác', 'gần cống', 'cong ranh', 'bai rac', 'doc am', 'hoi thoi', 'o nhiem', 'gan bai rac', 'gan cong', 'cống thối', 'cong thoi', 'rác thải', 'rac thai', 'nước thải', 'nuoc thai', 'mương', 'muong', 'kênh nước bẩn', 'kenh nuoc ban', 'ao tù', 'ao tu', 'nước đọng', 'nuoc dong', 'nước bẩn', 'nuoc ban', 'hôi hám', 'hoi ham', 'bốc mùi', 'boc mui', 'rác', 'rac', 'cống', 'cong'],
    icon: '🗑️',
    severity: 'high',
    desc: `Gần cống rãnh, bãi rác, nhà vệ sinh công cộng. Uế khí bốc lên mang vi khuẩn và năng lượng bẩn thỉu (Thủy sát bẩn). Tác động đến dạ dày, hệ tiêu hóa. Sự nghiệp lầy lội, dính dáng chuyện mờ ám.`,
    hoaGiai: [
      { phap: 'Hóa pháp (Hương)', detail: 'Luôn thắp sáng khu vực này. Trồng cây tỏa hương (hoa mộc, ngọc lan, sả, chanh) để lấn át uế khí.' },
      { phap: 'Ấn pháp', detail: 'Treo đá thạch anh tự nhiên (Thổ) hoặc Hồ Lô gỗ đào để hút và thanh lọc khí độc. Thổ thấm hút Thủy bẩn.' },
    ]
  },
  {
    id: 'van_tien_sat',
    name: 'Vạn Tiễn Xuyên Tâm Sát',
    keywords: ['dây điện', 'cáp điện', 'chằng chịt', 'vạn tiễn', 'dây chằng', 'dây cáp', 'day dien', 'cap dien', 'chang chit', 'van tien', 'day chang', 'day cap', 'dây cáp chằng', 'day cap chang', 'lưới điện', 'luoi dien', 'dây nhện', 'day nhen', 'chằng chịt dây', 'chang chit day', 'dây kéo', 'day keo', 'dây giăng', 'day giang', 'chằng chịt trước', 'chang chit truoc', 'dây điện rối', 'day dien roi', 'mạng dây', 'mang day', 'dây điện trước cửa'],
    icon: '🕸️',
    severity: 'medium',
    desc: `Dây điện, cáp đan chằng chịt trước cửa/cửa sổ. Gây nhiễu loạn thị giác và rối loạn từ trường. Người trong nhà suy nghĩ lộn xộn, đau đầu kinh niên, các mâu thuẫn vụn vặt không lối thoát.`,
    hoaGiai: [
      { phap: 'Mộc pháp', detail: 'Dùng khung cửa sổ bằng Gỗ (Mộc), tránh khung Sắt/Nhôm (Kim dẫn truyền từ trường). Trồng dây leo che lấp mạng lưới dây điện.' },
      { phap: 'Hóa pháp', detail: 'Treo 1-2 chiếc chuông gió bằng tre/gỗ để âm thanh mộc mạc làm dịu sự rối rắm.' },
    ]
  },
  {
    id: 'doan_ho_sat',
    name: 'Đoạn Hổ Sát',
    keywords: ['đứt gãy', 'dang dở', 'xây dở', 'khuyết góc lớn', 'đoạn hổ', 'bỏ hoang', 'công trình dở', 'dut gay', 'dang do', 'xay do', 'khuyet goc', 'doan ho', 'bo hoang', 'cong trinh do', 'nhà dở', 'nha do', 'nhà bỏ hoang', 'nha bo hoang', 'hoang phế', 'hoang phe', 'bỏ dở', 'bo do', 'nhà hoang', 'nha hoang', 'xây dang dở', 'xay dang do', 'dở dang', 'do dang', 'khuyết', 'khuyet', 'đổ dở', 'do do', 'công trình bỏ', 'cong trinh bo', 'nhà không người ở'],
    icon: '💔',
    severity: 'medium',
    desc: `Công trình đối diện bị đứt gãy, dang dở, khuyết góc lớn. Năng lượng bị đứt đoạn. Gia chủ làm việc "đầu voi đuôi chuột", hứa hẹn nhiều nhưng không thành, hợp đồng hay đổ bể phút chót.`,
    hoaGiai: [
      { phap: 'Họa pháp', detail: 'Trang trí bằng vật phẩm mang tính trọn vẹn, liền mạch. Treo tranh núi non trùng điệp hoặc "Cửu ngư quần hội" để bổ sung sự viên mãn.' },
      { phap: 'Thủy pháp', detail: 'Sử dụng quả cầu phong thủy bằng đá kết hợp thác nước tuần hoàn (chảy xoay vòng không dứt) để kích hoạt sự luân chuyển liên tục, bù lấp đứt gãy.' },
    ]
  },
];

/**
 * Chuẩn hóa chuỗi tiếng Việt: lowercase, bỏ dấu, đ→d
 */
const normalizeVN = (str) => {
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'd');
};

/**
 * Phân tích sát khí từ mô tả loan đầu do người dùng nhập
 * Hỗ trợ cả tiếng Việt có dấu và không dấu
 * Mở rộng từ khóa đồng nghĩa, mô tả gần giống
 */
export const analyzeSatKhi = (loanDauText) => {
  if (!loanDauText || loanDauText.trim().length < 2) return [];
  
  // Chuẩn hóa input: bỏ dấu để so sánh
  const normalizedInput = normalizeVN(loanDauText);
  // Cũng giữ bản gốc lowercase để so sánh tiếng Việt có dấu
  const originalInput = loanDauText.toLowerCase();
  
  const found = [];
  
  for (const sat of SAT_KHI_DATABASE) {
    let matched = false;
    for (const kw of sat.keywords) {
      const kwNormalized = normalizeVN(kw);
      const kwOriginal = kw.toLowerCase();
      
      // So sánh cả 2 bản: bỏ dấu vs bỏ dấu, gốc vs gốc
      if (normalizedInput.includes(kwNormalized) || originalInput.includes(kwOriginal)) {
        matched = true;
        break;
      }
    }
    if (matched) found.push(sat);
  }
  
  // Sắp xếp theo mức độ nghiêm trọng
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  found.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  
  return found;
};

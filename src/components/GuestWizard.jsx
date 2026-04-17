import React, { useState, useRef } from 'react';
import { ArrowRight, MapPin, Compass, User, Map, AlertCircle, X, Download } from 'lucide-react';
import MobileSensorCompass from './MobileSensorCompass';
import BatTrachCompass from './BatTrachCompass';

const SmartMiniFloorPlan = ({ degree, menhQuai, onComplete }) => {
  const [tab, setTab] = useState('SHAPE'); // SHAPE or IMAGE
  const [shapeParams, setShapeParams] = useState({ width: 5, length: 15 });
  const [image, setImage] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
      <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
        <Map className="text-emerald-600" /> Sơ Đồ Không Gian Xung Quanh
      </h3>
      
      <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
         <button onClick={() => setTab('SHAPE')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${tab === 'SHAPE' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>Hình Trụ Kích Thước</button>
         <button onClick={() => setTab('IMAGE')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${tab === 'IMAGE' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>Tải Ảnh Bản Vẽ</button>
      </div>

      {tab === 'SHAPE' && (
        <div className="flex gap-4 mb-6">
           <div className="flex-1">
             <label className="text-xs font-bold text-slate-500">Mặt Tiền (Ngang - Rộng)</label>
             <input type="number" value={shapeParams.width} onChange={(e) => setShapeParams({...shapeParams, width: Number(e.target.value)})} className="w-full mt-1 p-2 border border-slate-300 rounded-lg outline-none font-bold text-slate-700" />
           </div>
           <div className="flex-1">
             <label className="text-xs font-bold text-slate-500">Chiều Sâu (Lùi)</label>
             <input type="number" value={shapeParams.length} onChange={(e) => setShapeParams({...shapeParams, length: Number(e.target.value)})} className="w-full mt-1 p-2 border border-slate-300 rounded-lg outline-none font-bold text-slate-700" />
           </div>
        </div>
      )}

      {tab === 'IMAGE' && (
        <div className="mb-6">
           <label className="cursor-pointer border-2 border-dashed border-slate-300 bg-slate-50 p-6 rounded-xl flex flex-col items-center justify-center text-center hover:bg-slate-100 transition-colors">
              <Download className="text-slate-400 mb-2" />
              <span className="font-bold text-slate-600">Bấm để tải File Ảnh Bản Vẽ</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
           </label>
        </div>
      )}

      {/* OVERLAY AREA */}
      <div className="relative bg-slate-100 rounded-2xl w-full h-[400px] md:h-[500px] border border-slate-200 overflow-hidden flex items-center justify-center">
         {/* Background Structure */}
         {tab === 'SHAPE' && (
            <div 
              style={{
                 width: `${shapeParams.width * 15}px`,
                 height: `${shapeParams.length * 15}px`,
                 minWidth: '50px', minHeight: '50px'
              }}
              className="bg-white border-2 border-slate-800 shadow-lg relative flex items-end justify-center pb-2 transition-all duration-500"
            >
               <span className="text-[10px] font-black text-white bg-red-500 px-2 rounded-full absolute -bottom-3">HƯỚNG NHÀ</span>
            </div>
         )}
         {tab === 'IMAGE' && image && (
            <img src={image} alt="Sơ đồ" className="max-w-full max-h-full object-contain opacity-50 absolute" />
         )}

         {/* La Kinh Bat Trach centered */}
         <div className="absolute z-10 w-[300px] h-[300px] opacity-90 pointer-events-none drop-shadow-xl">
            <BatTrachCompass degree={degree} menhQuai={menhQuai} />
         </div>
      </div>

      <div className="mt-8 text-center bg-gradient-to-r from-red-50 to-amber-50 p-6 rounded-2xl border border-amber-200">
         <h4 className="text-lg font-black text-rose-800 mb-2">Bạn muốn xem Phân Tích Chuyên Sâu?</h4>
         <p className="text-sm font-medium text-amber-900 mb-4">
           Kết quả trên chỉ bao gồm phân tích cơ bản theo phái Bát Trạch. Để thiết kế phong thủy chính xác chuyên sâu tính theo Huyền Không Phi Tinh và Sát Khí Loan Đầu (Nhà bạn đang bị sao Ngũ Hoàng sát khí chiếu vào đâu, cửa sổ nên đặt hướng nào thu tài lộc...), vui lòng đăng nhập để lập Dự án Chuyên Sâu!
         </p>
         <button onClick={onComplete} className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-black px-6 py-3 rounded-xl shadow-lg w-full transition-transform hover:scale-[1.02]">
           🔓 Đăng nhập Trải Nghiệm Full Tính Năng
         </button>
      </div>
    </div>
  );
};

const GuestWizard = ({ onGoToLogin, onCancel }) => {
  const [step, setStep] = useState(1);
  const [projectData, setProjectData] = useState({
     address: '',
     degree: 0,
     birthYear: 1990,
     gender: 'Nam',
     menhQuai: ''
  });

  // Calculate Menh Quai logic locally for guest, same as CreateProject
  const calculateMenhQuai = (year, gender) => {
    let y = parseInt(year);
    if(isNaN(y) || y < 1900 || y > 2100) return 'Khảm';
    let sum = 0;
    while(y > 0) { sum += y % 10; y = Math.floor(y / 10); }
    while(sum > 9) { let t = 0; while(sum > 0) { t += sum%10; sum = Math.floor(sum/10); } sum = t; }
    
    let quai = '';
    if(gender === 'Nam') {
       const namMap = {1:'Khảm', 2:'Ly', 3:'Cấn', 4:'Đoài', 5:'Càn', 6:'Khôn', 7:'Tốn', 8:'Chấn', 9:'Khôn'};
       quai = namMap[sum] || 'Khảm';
    } else {
       const nuMap = {1:'Cấn', 2:'Càn', 3:'Đoài', 4:'Cấn', 5:'Ly', 6:'Khảm', 7:'Khôn', 8:'Chấn', 9:'Tốn'};
       quai = nuMap[sum] || 'Khảm';
    }
    return quai;
  };

  const mapStep = (num, title, icon) => (
    <div className={`flex items-center gap-2 ${step >= num ? 'text-indigo-600' : 'text-slate-400 opacity-50'}`}>
       <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm border-2 ${step >= num ? 'bg-indigo-100 border-indigo-600' : 'border-slate-300'}`}>{icon}</div>
       <span className="text-xs font-bold hidden md:block uppercase tracking-wider">{title}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
       <div className="bg-slate-50 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden relative my-auto">
          <button onClick={onCancel} className="absolute top-4 right-4 p-2 bg-white rounded-full text-slate-500 hover:text-red-500 hover:bg-red-50 transition z-50 shadow-sm border border-slate-200"><X size={20}/></button>

          {/* WIZARD HEADER */}
          <div className="bg-white border-b border-slate-200 p-6 pt-10 px-8 text-center relative overflow-hidden">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
             <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
             
             <h2 className="text-2xl font-black text-slate-800 relative z-10">Khảo Sát Khí Cung Nhà Ở Nhanh</h2>
             <p className="text-slate-500 font-medium text-sm mt-1 relative z-10">Phiên bản trải nghiệm sơ kết hợp Bát Trạch Điện Toán</p>

             {/* Progress Bar */}
             <div className="flex justify-between items-center mt-8 relative z-10 max-w-xl mx-auto">
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-200 -z-10"></div>
                {mapStep(1, 'Định vị', <MapPin size={14}/>)}
                {mapStep(2, 'La Bàn', <Compass size={14}/>)}
                {mapStep(3, 'Cung Phi', <User size={14}/>)}
                {mapStep(4, 'Sơ Đồ', <Map size={14}/>)}
             </div>
          </div>

          {/* WIZARD CONTENT */}
          <div className="p-6 md:p-8 bg-slate-50/50">
             
             {step === 1 && (
               <div className="space-y-6 animate-slide-up text-center">
                  <h3 className="text-xl font-black text-slate-800">Cung cấp Vị Trí Công Trình</h3>
                  <p className="text-sm font-medium text-slate-600 mb-4">Vui lòng cho phép quyền truy cập vị trí trên trình duyệt hoặc nhập tên đường bạn đang đứng (Không bắt buộc nhưng giúp định vị từ tính tốt hơn).</p>
                  
                  <div className="max-w-sm mx-auto">
                    <input 
                       type="text" placeholder="Nhập địa chỉ của bạn..." 
                       value={projectData.address}
                       onChange={(e) => setProjectData({...projectData, address: e.target.value})}
                       className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-500 outline-none font-bold text-center"
                    />
                    <button onClick={() => {
                        if(navigator.geolocation) {
                           navigator.geolocation.getCurrentPosition((pos) => {
                              alert(`Đã nhận tọa độ: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
                              setProjectData({...projectData, address: 'Đã xác định vị trí thực địa'});
                           }, () => { alert('Lỗi lấy vị trí'); });
                        }
                    }} className="mt-3 text-indigo-600 font-bold underline text-sm hover:text-indigo-800">
                       Hoặc Điền tự động GPS hiện tại
                    </button>
                  </div>
                  
                  <div className="flex justify-center mt-8">
                     <button onClick={() => setStep(2)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 py-3 rounded-xl shadow-md transition-all flex items-center gap-2">
                        Tiếp theo <ArrowRight size={18} />
                     </button>
                  </div>
               </div>
             )}

             {step === 2 && (
               <div className="animate-slide-up">
                  <MobileSensorCompass onDegreeCapture={(deg) => setProjectData({...projectData, degree: deg})} />
                  <div className="flex justify-center gap-4 mt-8">
                     <button onClick={() => setStep(1)} className="px-6 py-3 font-black text-slate-500 hover:bg-slate-200 rounded-xl transition">Quay lại</button>
                     <button disabled={projectData.degree === undefined} onClick={() => setStep(3)} className="bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-slate-300 font-black px-8 py-3 rounded-xl shadow-md transition-all flex items-center gap-2">
                        Xác nhận Hướng ({projectData.degree}°) <ArrowRight size={18} />
                     </button>
                  </div>
               </div>
             )}

             {step === 3 && (
               <div className="animate-slide-up text-center space-y-6">
                  <h3 className="text-xl font-black text-slate-800">Thông tin Trạch Chủ</h3>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-sm mx-auto space-y-4 text-left">
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Năm Sinh (DL)</label>
                        <input type="number" min="1900" max="2050" value={projectData.birthYear} onChange={e => setProjectData({...projectData, birthYear: e.target.value})} className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-300 font-bold text-slate-800" />
                     </div>
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Giới Tính</label>
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                           <button onClick={() => setProjectData({...projectData, gender: 'Nam'})} className={`flex-1 py-1.5 text-sm font-bold rounded ${projectData.gender === 'Nam' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>Nam</button>
                           <button onClick={() => setProjectData({...projectData, gender: 'Nữ'})} className={`flex-1 py-1.5 text-sm font-bold rounded ${projectData.gender === 'Nữ' ? 'bg-white shadow text-rose-500' : 'text-slate-500'}`}>Nữ</button>
                        </div>
                     </div>
                  </div>

                  <div className="flex justify-center gap-4 mt-8">
                     <button onClick={() => setStep(2)} className="px-6 py-3 font-black text-slate-500 hover:bg-slate-200 rounded-xl transition">Quay lại</button>
                     <button onClick={() => {
                        const mq = calculateMenhQuai(projectData.birthYear, projectData.gender);
                        const quaiText = `${mq} Trạch`; // Simple representation
                        setProjectData({...projectData, menhQuai: mq});
                        setStep(4);
                     }} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 py-3 rounded-xl shadow-md transition-all flex items-center gap-2">
                        Phân Tích Cung Phi <ArrowRight size={18} />
                     </button>
                  </div>
               </div>
             )}

             {step === 4 && (
                <div className="animate-slide-up">
                   <SmartMiniFloorPlan 
                      degree={projectData.degree} 
                      menhQuai={projectData.menhQuai} 
                      onComplete={() => onGoToLogin(projectData)}
                   />
                </div>
             )}

          </div>
       </div>
    </div>
  );
};

export default GuestWizard;

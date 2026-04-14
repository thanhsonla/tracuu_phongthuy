import React, { useState, useEffect, useRef } from 'react';
import { Users, Home, Compass, ArrowLeft, Plus, Trash2, Save, MapPin, Navigation } from 'lucide-react';
import { calculateMenhQuai, getPeriodFromYear } from '../utils/helpers';

const CreateProject = ({ setView, projects, setProjects, setCurrentProject, currentProject }) => {
  const isEditMode = !!currentProject;

  const [formData, setFormData] = useState(() => {
    if (currentProject) return {
      projectName: currentProject.projectName || '',
      clientName: currentProject.clientName || '',
      dob: currentProject.dob || '',
      gender: currentProject.gender || 'Nam',
      familyMembers: currentProject.familyMembers || [],
      address: currentProject.address || '',
      buildYear: currentProject.buildYear || currentProject.yearBuilt || new Date().getFullYear(),
      degree: currentProject.degree || 180,
      designReq: currentProject.designReq || '',
      loanDau: currentProject.loanDau || '',
    };
    return {
      projectName: '',
      clientName: '', dob: '', gender: 'Nam', 
      familyMembers: [],
      address: '', buildYear: new Date().getFullYear(),
      degree: 180, designReq: '', loanDau: ''
    };
  });

  // === GPS / Mini-Map State ===
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [gpsLat, setGpsLat] = useState(currentProject?.details?.mapCoords?.lat || '');
  const [gpsLng, setGpsLng] = useState(currentProject?.details?.mapCoords?.lng || '');
  const [geocoding, setGeocoding] = useState(false);
  const miniMapRef = useRef(null);
  const miniMapInstanceRef = useRef(null);
  const miniMarkerRef = useRef(null);

  const handleAddMember = () => {
    setFormData({
      ...formData,
      familyMembers: [...formData.familyMembers, { name: '', dob: '', gender: 'Nữ', relation: 'Vợ/Chồng' }]
    });
  };

  const handleRemoveMember = (index) => {
    const newMembers = [...formData.familyMembers];
    newMembers.splice(index, 1);
    setFormData({ ...formData, familyMembers: newMembers });
  };

  const handleMemberChange = (index, field, value) => {
    const newMembers = [...formData.familyMembers];
    newMembers[index][field] = value;
    setFormData({ ...formData, familyMembers: newMembers });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clientName) { alert('Vui lòng nhập họ tên gia chủ'); return; }
    
    const menhQuai = formData.dob ? calculateMenhQuai(formData.dob, formData.gender) : (currentProject?.menhQuai || 'Chưa xác định');
    const period = getPeriodFromYear(formData.buildYear);
    
    // Tự động suy ra Ngũ Hành Dụng Thần từ Mệnh Quái (Ví dụ 'Khảm (Thủy)' -> 'Thủy')
    const match = menhQuai.match(/\((.*?)\)/);
    const dungThan = match ? match[1] : 'Chưa xác định';
    
    // Clean empty members
    const cleanedMembers = (formData.familyMembers || []).filter(m => m.name && m.name.trim() !== '');
    
    const newProject = {
       ...formData, 
       projectName: formData.projectName.trim() || formData.clientName,
       familyMembers: cleanedMembers,
       notes: currentProject ? currentProject.notes : [],
       analysis: currentProject ? currentProject.analysis : {},
       details: {
         ...(currentProject?.details || {}),
         mapCoords: (gpsLat && gpsLng) ? { lat: parseFloat(gpsLat), lng: parseFloat(gpsLng) } : (currentProject?.details?.mapCoords || null)
       },
       id: currentProject ? currentProject.id : Date.now(), 
       menhQuai, dungThan, period, degree: parseFloat(formData.degree)
    };

    try {
      if (isEditMode) {
         await fetch(`/api/projects/${currentProject.id}`, {
           method: 'PUT',
           headers: {'Content-Type': 'application/json'},
           body: JSON.stringify(newProject)
         });
         const updated = projects.map(p => p.id === currentProject.id ? newProject : p);
         setProjects(updated);
         setCurrentProject(newProject);
         setView('RESULT');
      } else {
         const res = await fetch('/api/projects', {
           method: 'POST',
           headers: {'Content-Type': 'application/json'},
           body: JSON.stringify(newProject)
         });
         const data = await res.json();
         if (data.id) newProject.id = data.id;
         const updated = [newProject, ...projects];
         setProjects(updated);
         setCurrentProject(newProject);
         setView('RESULT');
      }
    } catch (e) {
      console.error('Save project error:', e);
      alert('Lỗi lưu dự án vào Server!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-3xl shadow-lg border border-slate-200 animate-slide-in-right">
       <button onClick={() => setView(isEditMode ? 'RESULT' : 'DASHBOARD')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold mb-6 transition-colors">
          <ArrowLeft size={20} /> Quay lại {isEditMode ? 'Kết Quả' : 'Dashboard'}
       </button>
       
       <h2 className="text-3xl font-black text-slate-800 mb-8 border-b pb-4">{isEditMode ? 'Cập Nhật Dự Án Phong Thủy' : 'Khởi Tạo Dự Án Phong Thủy'}</h2>
       
       <form onSubmit={handleSubmit} className="space-y-8">
          {/* 0. TÊN HỒ SƠ DỰ ÁN */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-6">
             <div className="space-y-1.5 focus-within:text-indigo-600 transition-colors">
                <label className="text-sm font-bold text-slate-600 uppercase tracking-widest">Tên Hồ Sơ / Tên Dự Án</label>
                <input type="text" value={formData.projectName} onChange={e=>setFormData({...formData, projectName: e.target.value})} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 outline-none font-black text-lg bg-white text-slate-800 placeholder-slate-300" placeholder="VD: Biệt Thự Gamuda Anh Hùng, Nhà Bác Ba - 85 độ... (Nếu để trống sẽ lấy Tên Gia chủ)"/>
             </div>
          </div>

          {/* 1. THÔNG TIN GIA ĐÌNH */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-5">
              <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-2 text-lg"><Users size={20}/> 1. Thông Tin Gia Đình</h3>
              
              {/* Gia chủ */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                 <h4 className="font-bold text-slate-600 uppercase tracking-widest text-xs border-b pb-2">Thông tin Gia chủ (Bắt buộc)</h4>
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="space-y-1.5 lg:col-span-1">
                       <label className="text-xs font-bold text-slate-500 uppercase">Họ tên Gia chủ</label>
                       <input type="text" required value={formData.clientName} onChange={e=>setFormData({...formData, clientName: e.target.value})} className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 focus:border-indigo-500 outline-none font-medium text-sm text-slate-800 bg-white" placeholder="Nguyễn Văn A"/>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-slate-500 uppercase">Ngày Sinh</label>
                       <input type="date" required value={formData.dob} onChange={e=>setFormData({...formData, dob: e.target.value})} className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 focus:border-indigo-500 outline-none font-medium text-sm text-slate-800 bg-white"/>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-slate-500 uppercase">Giới Tính</label>
                       <select value={formData.gender} onChange={e=>setFormData({...formData, gender: e.target.value})} className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 focus:border-indigo-500 outline-none font-medium text-sm text-slate-800 bg-white">
                          <option value="Nam">Nam</option><option value="Nữ">Nữ</option>
                       </select>
                    </div>
                 </div>
              </div>

              {/* Vợ/Chồng & Con cái */}
              <div className="space-y-3">
                 <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-600 uppercase tracking-widest text-xs">Thành viên khác (Tùy chọn)</h4>
                    <button type="button" onClick={handleAddMember} className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-indigo-200 transition-colors">
                       <Plus size={14}/> Thêm người
                    </button>
                 </div>
                 
                 {formData.familyMembers.length === 0 && (
                   <p className="text-sm text-slate-400 italic text-center py-2 bg-white/50 rounded-lg border border-dashed border-slate-200">Chưa có thành viên nào được thêm. (Vợ/Chồng, con cái...)</p>
                 )}

                 {formData.familyMembers.map((member, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 relative animate-fade-in">
                       <button type="button" onClick={() => handleRemoveMember(index)} className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1.5 rounded-full hover:bg-red-200 transition-colors shadow-sm">
                          <Trash2 size={12} />
                       </button>
                       <div className="flex-1 space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Vai trò</label>
                          <select value={member.relation} onChange={e=>handleMemberChange(index, 'relation', e.target.value)} className="w-full px-2 py-1.5 rounded bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none text-sm text-slate-800">
                             <option value="Vợ/Chồng">Vợ / Chồng</option>
                             <option value="Con cái">Con cái</option>
                             <option value="Bố/Mẹ">Bố / Mẹ</option>
                             <option value="Khác">Phụ thuộc khác</option>
                          </select>
                       </div>
                       <div className="flex-[2] space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Họ tên</label>
                          <input type="text" placeholder="Họ và tên" value={member.name} onChange={e=>handleMemberChange(index, 'name', e.target.value)} className="w-full px-2 py-1.5 rounded bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none text-sm text-slate-800"/>
                       </div>
                       <div className="flex-1 space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Ngày sinh</label>
                          <input type="date" value={member.dob} onChange={e=>handleMemberChange(index, 'dob', e.target.value)} className="w-full px-2 py-1.5 rounded bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none text-sm leading-none text-slate-800"/>
                       </div>
                       <div className="flex-1 space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Giới tính</label>
                          <select value={member.gender} onChange={e=>handleMemberChange(index, 'gender', e.target.value)} className="w-full px-2 py-1.5 rounded bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none text-sm text-slate-800">
                             <option value="Nam">Nam</option><option value="Nữ">Nữ</option>
                          </select>
                       </div>
                    </div>
                 ))}
              </div>
          </div>

          {/* 2. THÔNG TIN CÔNG TRÌNH */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-5">
              <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-2 text-lg"><Home size={20}/> 2. Thông Tin Công Trình</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-4">
                 <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Địa chỉ Công trình</label>
                    <div className="flex gap-2">
                       <input type="text" value={formData.address} onChange={e=>setFormData({...formData, address: e.target.value})} className="flex-1 px-3 py-2.5 rounded-lg border-2 border-slate-200 focus:border-indigo-500 outline-none font-medium bg-white text-sm text-slate-800" placeholder="Số nhà, đường, quận/huyện..."/>
                       <button type="button" onClick={async () => {
                          if (!formData.address || formData.address.trim().length < 3) { alert('Vui lòng nhập địa chỉ trước'); return; }
                          setGeocoding(true);
                          try {
                            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address)}&limit=1`;
                            const res = await fetch(url, { headers: { 'Accept-Language': 'vi' } });
                            const data = await res.json();
                            if (data.length > 0) {
                              setGpsLat(parseFloat(data[0].lat).toFixed(6));
                              setGpsLng(parseFloat(data[0].lon).toFixed(6));
                              setShowMiniMap(true);
                            } else {
                              alert('Không tìm thấy tọa độ cho địa chỉ này. Hãy chọn thủ công trên bản đồ.');
                              setShowMiniMap(true);
                            }
                          } catch(e) { alert('Lỗi kết nối mạng.'); }
                          setGeocoding(false);
                       }} disabled={geocoding} className="shrink-0 bg-violet-600 hover:bg-violet-700 text-white px-3 py-2.5 rounded-lg font-bold text-xs flex items-center gap-1 transition disabled:opacity-50">
                         <MapPin size={14}/> {geocoding ? 'Đang tìm...' : 'Định vị'}
                       </button>
                     </div>
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Năm Xây *</label>
                    <input type="number" required value={formData.buildYear} onChange={e=>setFormData({...formData, buildYear: e.target.value})} className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 focus:border-indigo-500 outline-none font-medium bg-white text-sm text-slate-800" placeholder="VD: 2024"/>
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Tọa độ hướng (Độ) *</label>
                    <input type="number" required min="0" max="360" step="0.1" value={formData.degree} onChange={e=>setFormData({...formData, degree: e.target.value})} className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 focus:border-indigo-500 outline-none font-black text-indigo-700 bg-white text-sm" placeholder="Dải 0-360"/>
                 </div>
              </div>

              {/* GPS Coordinates */}
              <div className="mt-3 flex flex-wrap items-end gap-3">
                  <div className="space-y-1">
                     <label className="text-[10px] font-bold text-slate-400 uppercase">Vĩ độ (Lat)</label>
                     <input type="number" step="0.000001" value={gpsLat} onChange={e => setGpsLat(e.target.value)} className="w-36 px-2 py-1.5 rounded-lg border border-slate-200 focus:border-violet-500 outline-none text-xs font-mono text-slate-700 bg-white" placeholder="VD: 10.7769"/>
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-bold text-slate-400 uppercase">Kinh độ (Lng)</label>
                     <input type="number" step="0.000001" value={gpsLng} onChange={e => setGpsLng(e.target.value)} className="w-36 px-2 py-1.5 rounded-lg border border-slate-200 focus:border-violet-500 outline-none text-xs font-mono text-slate-700 bg-white" placeholder="VD: 106.7009"/>
                  </div>
                  <button type="button" onClick={() => setShowMiniMap(!showMiniMap)} className="text-xs font-bold text-violet-600 bg-violet-50 border border-violet-200 px-3 py-1.5 rounded-lg hover:bg-violet-100 transition flex items-center gap-1">
                     <Navigation size={12}/> {showMiniMap ? 'Ẩn bản đồ' : 'Mở bản đồ'}
                  </button>
               </div>

               {/* Mini Map */}
               {showMiniMap && (
                  <MiniMapPicker
                     lat={gpsLat ? parseFloat(gpsLat) : 16.0}
                     lng={gpsLng ? parseFloat(gpsLng) : 106.0}
                     zoom={gpsLat ? 16 : 6}
                     onSelect={(lat, lng) => {
                        setGpsLat(lat.toFixed(6));
                        setGpsLng(lng.toFixed(6));
                     }}
                  />
               )}

              <div className="space-y-1.5 mt-2">
                 <label className="text-xs font-bold text-slate-500 uppercase">Yêu cầu thiết kế</label>
                 <textarea rows="2" value={formData.designReq} onChange={e=>setFormData({...formData, designReq: e.target.value})} className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 outline-none font-medium resize-none bg-white text-sm text-slate-800 placeholder-slate-400" placeholder="VD: Cần 4 phòng ngủ, phòng thờ tầng 1..."></textarea>
              </div>

              <div className="space-y-1.5">
                 <label className="text-xs font-bold text-slate-500 uppercase">Hình thế Loan Đầu & Sát khí ngoài nhà (Hệ thống sẽ tự động phân tích)</label>
                 <textarea rows="3" value={formData.loanDau} onChange={e=>setFormData({...formData, loanDau: e.target.value})} className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 outline-none font-medium resize-none bg-white text-sm text-slate-800 placeholder-slate-400" placeholder="VD: Trước cửa có cột điện lớn, bên phải nhà cao hơn trái, hẻm nhỏ phía sau đâm thẳng vào, gần nghĩa trang, đối diện khe hẹp 2 tòa nhà, dây điện chằng chịt trước cửa sổ..."></textarea>
                 <p className="text-[11px] text-slate-400 italic">💡 Mô tả chi tiết môi trường xung quanh nhà. Hệ thống sẽ tự động nhận diện 20 loại sát khí và đề xuất phương pháp hóa giải.</p>
              </div>
          </div>

          <div className="pt-4">
             <button type="submit" className="w-full bg-slate-900 hover:bg-indigo-600 text-white text-lg py-4 rounded-xl font-black shadow-lg transition-all hover:scale-[1.01] flex justify-center items-center gap-2 cursor-pointer">
                {isEditMode ? <><Save size={24}/> LƯU CẬP NHẬT & XEM PHÂN TÍCH</> : <><Compass size={24}/> LẬP TINH BÀN & PHÂN TÍCH</>}
             </button>
          </div>
       </form>
    </div>
  );
};

// =============================================
// MINI MAP PICKER (Leaflet CDN)
// =============================================
function MiniMapPicker({ lat, lng, zoom, onSelect }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    // Load Leaflet dynamically
    const loadLeaflet = () => {
      return new Promise((resolve) => {
        if (window.L) { resolve(window.L); return; }
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => resolve(window.L);
        document.head.appendChild(script);
      });
    };

    loadLeaflet().then(L => {
      if (!containerRef.current || mapRef.current) return;
      const map = L.map(containerRef.current, {
        center: [lat, lng],
        zoom: zoom,
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onSelect(pos.lat, pos.lng);
      });

      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        onSelect(e.latlng.lat, e.latlng.lng);
      });

      mapRef.current = map;
      markerRef.current = marker;
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update marker when lat/lng props change from parent
  useEffect(() => {
    if (markerRef.current && mapRef.current && lat && lng) {
      markerRef.current.setLatLng([lat, lng]);
      mapRef.current.setView([lat, lng], zoom || 16);
    }
  }, [lat, lng]);

  return (
    <div className="mt-3 rounded-xl border border-violet-200 overflow-hidden shadow-sm">
      <div ref={containerRef} style={{ height: '280px', width: '100%' }} />
      <p className="text-[10px] text-violet-500 font-medium text-center py-1.5 bg-violet-50">
        Click hoặc kéo ghim để chọn vị trí chính xác
      </p>
    </div>
  );
}

export default CreateProject;

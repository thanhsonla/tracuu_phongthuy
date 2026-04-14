import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Eye, Layers, Navigation, X, ExternalLink } from 'lucide-react';

// =============================================
// BẢN ĐỒ DỰ ÁN - LEAFLET / OPENSTREETMAP
// =============================================

// Load Leaflet CSS + JS from CDN (chỉ 1 lần)
const loadLeaflet = (() => {
  let promise = null;
  return () => {
    if (promise) return promise;
    promise = new Promise((resolve, reject) => {
      if (window.L) { resolve(window.L); return; }
      
      // CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      // JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => resolve(window.L);
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return promise;
  };
})();

// Geocode address → [lat, lng] using Nominatim (miễn phí, không cần API key)
async function geocodeAddress(address) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'vi' } });
  const data = await res.json();
  if (data.length > 0) {
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), display: data[0].display_name };
  }
  return null;
}

export default function ProjectMapView({ projects, onOpenProject }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [L, setL] = useState(null);
  const [loading, setLoading] = useState(true);
  const [geocodedProjects, setGeocodedProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [geocodingStatus, setGeocodingStatus] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);

  // 1. Load Leaflet
  useEffect(() => {
    loadLeaflet().then(leaflet => {
      setL(leaflet);
    }).catch(() => {
      console.error('Không thể tải thư viện bản đồ Leaflet');
      setLoading(false);
    });
  }, []);

  // 2. Init map sau khi Leaflet load xong
  useEffect(() => {
    if (!L || !mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [16.0, 106.0], // Trung tâm Việt Nam
      zoom: 6,
      zoomControl: true,
      attributionControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Geocode all projects that have addresses
    geocodeAllProjects(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [L]);

  const geocodeAllProjects = async (map) => {
    const projectsWithAddress = projects.filter(p => p.address && p.address.trim().length > 3);
    
    if (projectsWithAddress.length === 0) {
      setLoading(false);
      setGeocodingStatus('Không có dự án nào có địa chỉ để hiển thị.');
      return;
    }

    setGeocodingStatus(`Đang định vị ${projectsWithAddress.length} dự án...`);
    const results = [];

    for (let i = 0; i < projectsWithAddress.length; i++) {
      const p = projectsWithAddress[i];
      
      // Check cache in project.details
      if (p.details?.mapCoords) {
        results.push({ ...p, coords: p.details.mapCoords });
        continue;
      }

      try {
        setGeocodingStatus(`Đang định vị (${i+1}/${projectsWithAddress.length}): ${p.projectName || p.clientName}...`);
        const geo = await geocodeAddress(p.address);
        if (geo) {
          results.push({ ...p, coords: { lat: geo.lat, lng: geo.lng, display: geo.display } });
        }
        // Nominatim rate limit: 1 request/second
        if (i < projectsWithAddress.length - 1) {
          await new Promise(r => setTimeout(r, 1100));
        }
      } catch(e) {
        console.error('Geocode error for', p.address, e);
      }
    }

    setGeocodedProjects(results);
    addMarkers(map, results);
    setLoading(false);
    setGeocodingStatus(`Đã ghim ${results.length}/${projectsWithAddress.length} dự án trên bản đồ.`);
  };

  const addMarkers = (map, geoProjects) => {
    // Clear existing markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    const bounds = [];

    geoProjects.forEach(p => {
      if (!p.coords) return;
      const { lat, lng } = p.coords;
      bounds.push([lat, lng]);

      // Custom icon
      const icon = L.divIcon({
        className: 'custom-map-marker',
        html: `<div style="
          background:linear-gradient(135deg,#4f46e5,#7c3aed);
          color:white; 
          width:32px; height:32px; 
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          display:flex; align-items:center; justify-content:center;
          box-shadow: 0 3px 10px rgba(79,70,229,0.4);
          border: 2px solid white;
          font-weight:900; font-size:12px;
        "><span style="transform:rotate(45deg)">${(p.projectName || p.clientName || '?')[0].toUpperCase()}</span></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

      const marker = L.marker([lat, lng], { icon, draggable: true }).addTo(map);
      
      marker.bindPopup(`
        <div style="min-width:200px;font-family:system-ui,sans-serif;">
          <h3 style="font-weight:900;font-size:14px;margin:0 0 4px 0;color:#1e293b;">${p.projectName || p.clientName}</h3>
          <p style="font-size:11px;color:#64748b;margin:0 0 6px 0;">${p.address || ''}</p>
          <div style="display:flex;gap:8px;font-size:11px;">
            <span style="background:#e0e7ff;color:#4f46e5;padding:2px 8px;border-radius:6px;font-weight:700;">Vận ${p.period}</span>
            <span style="background:#fef3c7;color:#b45309;padding:2px 8px;border-radius:6px;font-weight:700;">${p.degree}°</span>
            ${p.buildArea ? `<span style="background:#dcfce7;color:#166534;padding:2px 8px;border-radius:6px;font-weight:700;">${p.buildArea}m²</span>` : ''}
          </div>
          <p style="font-size:9px;color:#a78bfa;margin-top:6px;font-style:italic;">Kéo ghim để điều chỉnh vị trí</p>
        </div>
      `);

      marker.on('click', () => setSelectedProject(p));

      // Draggable: save new position after drag
      marker.on('dragend', async () => {
        const pos = marker.getLatLng();
        const newCoords = { lat: pos.lat, lng: pos.lng };
        // Update local state
        setGeocodedProjects(prev => prev.map(gp => gp.id === p.id ? { ...gp, coords: newCoords } : gp));
        // Save to backend
        try {
          const updatedDetails = { ...(p.details || {}), mapCoords: newCoords };
          await fetch(`/api/projects/${p.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...p, details: updatedDetails })
          });
          setGeocodingStatus(`Đã cập nhật vị trí mới cho "${p.projectName || p.clientName}".`);
        } catch(e) {
          console.error('Save coords error:', e);
          setGeocodingStatus('Lỗi lưu tọa độ mới.');
        }
      });

      markersRef.current.push(marker);
    });

    // Zoom to fit all markers
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  };

  // Search & fly to
  const handleSearch = async () => {
    if (!searchQuery.trim() || !mapInstanceRef.current) return;
    setGeocodingStatus('Đang tìm kiếm...');
    const geo = await geocodeAddress(searchQuery);
    if (geo) {
      mapInstanceRef.current.flyTo([geo.lat, geo.lng], 16, { duration: 1.5 });
      setGeocodingStatus(`Đã tìm thấy: ${geo.display}`);
    } else {
      setGeocodingStatus('Không tìm thấy địa chỉ này.');
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <MapPin className="text-indigo-600" /> Bản Đồ Dự Án
          </h2>
          <p className="text-slate-500 text-sm mt-1">Tổng quan vị trí tất cả công trình trên bản đồ.</p>
        </div>
        <div className="flex gap-2 items-center text-sm">
          <span className="text-slate-400 bg-white border border-slate-200 px-3 py-1.5 rounded-lg font-bold">{geocodedProjects.length}/{projects.length} dự án đã ghim</span>
        </div>
      </div>

      {/* Search bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Tìm kiếm địa điểm trên bản đồ..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:border-indigo-500 outline-none shadow-sm"
          />
        </div>
        <button onClick={handleSearch} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition">
          Tìm
        </button>
      </div>

      {/* Status */}
      {geocodingStatus && (
        <p className="text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-2 rounded-xl">
          {geocodingStatus}
        </p>
      )}

      {/* Map + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* Map Container */}
        <div className="lg:col-span-3 relative">
          <div
            ref={mapRef}
            className="w-full rounded-2xl border border-slate-200 shadow-lg overflow-hidden bg-slate-100"
            style={{ height: '550px' }}
          />
          {loading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-2xl z-[1000]">
              <div className="text-center">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm font-bold text-slate-600">{geocodingStatus || 'Đang tải bản đồ...'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Project List */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col" style={{ height: '550px' }}>
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-100">
            <h4 className="font-black text-slate-800 text-sm flex items-center gap-2">
              <Layers size={14} className="text-indigo-500" /> Danh Sách Dự Án
            </h4>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {geocodedProjects.length === 0 && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                <MapPin size={36} className="opacity-20 mb-2" />
                <p className="text-xs font-medium">Chưa có dự án nào được ghim. Hãy nhập địa chỉ khi tạo dự án.</p>
              </div>
            )}
            {geocodedProjects.map(p => (
              <div
                key={p.id}
                onClick={() => {
                  setSelectedProject(p);
                  if (mapInstanceRef.current && p.coords) {
                    mapInstanceRef.current.flyTo([p.coords.lat, p.coords.lng], 16, { duration: 1 });
                  }
                }}
                className={`p-3 rounded-xl cursor-pointer transition-all border ${
                  selectedProject?.id === p.id
                    ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                    : 'border-transparent hover:bg-slate-50'
                }`}
              >
                <p className="font-black text-sm text-slate-800 truncate">{p.projectName || p.clientName}</p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">{p.address}</p>
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  <span className="text-[9px] font-bold bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded">V{p.period}</span>
                  <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">{p.degree}°</span>
                  {p.buildArea && <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">{p.buildArea}m²</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Selected project action */}
          {selectedProject && (
            <div className="border-t border-slate-100 p-3 bg-slate-50">
              <button
                onClick={() => onOpenProject && onOpenProject(selectedProject)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-2.5 rounded-xl flex justify-center items-center gap-2 transition shadow-md"
              >
                <Eye size={14} /> Mở Hồ Sơ: {(selectedProject.projectName || selectedProject.clientName || '').slice(0, 15)}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

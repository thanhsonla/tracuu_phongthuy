import React, { useState, useEffect } from 'react';
import { Compass, Calendar, MapPin, Navigation } from 'lucide-react';
import CompassGraphic from './CompassGraphic';

const InputForm = ({ onCalculate }) => {
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    degree: 0, // 0 - 360
    latitude: '',
    longitude: ''
  });

  const [dirInfo, setDirInfo] = useState({ mainDir: 'N', dev: 0 });

  useEffect(() => {
    const deg = parseFloat(formData.degree) || 0;
    const normalized = ((deg % 360) + 360) % 360;
    const index = Math.round(normalized / 45) % 8;
    const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const mainDir = dirs[index];
    const mainAngle = index * 45;
    
    let dev = normalized - mainAngle;
    if (dev > 180) dev -= 360;
    if (dev < -180) dev += 360;

    setDirInfo({ mainDir, dev });
  }, [formData.degree]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDegreeAdjust = (adjustment) => {
    setFormData(prev => {
      let newDeg = (parseFloat(prev.degree) || 0) + adjustment;
      newDeg = ((newDeg % 360) + 360) % 360;
      return { ...prev, degree: newDeg };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCalculate({
      year: formData.year,
      mainDirection: dirInfo.mainDir,
      deviation: dirInfo.dev.toFixed(1)
    });
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
        <Compass size={28} className="text-gold" />
        <h2 style={{ fontSize: '1.4rem' }}>Tọa Độ & La Bàn</h2>
      </div>

      <CompassGraphic degree={formData.degree} direction={dirInfo.mainDir} />
      
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
          Hướng {dirInfo.mainDir}
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Kiêm Hướng (Lệch): {dirInfo.dev > 0 ? '+' : ''}{dirInfo.dev.toFixed(1)}°
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label" style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Navigation size={16} /> 
              Độ Phân Kim (0 - 360°)
            </span>
            <span className="text-gold" style={{ fontSize: '1.1rem' }}>{parseFloat(formData.degree).toFixed(1)}°</span>
          </label>
          <input 
            type="range" 
            name="degree" 
            min="0" 
            max="360" 
            step="0.5"
            className="form-input" 
            style={{ padding: '0', height: 'auto', background: 'transparent' }}
            value={formData.degree} 
            onChange={handleChange} 
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
            <button type="button" onClick={() => handleDegreeAdjust(-1)} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>-1°</button>
            <button type="button" onClick={() => handleDegreeAdjust(1)} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>+1°</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <MapPin size={16} /> Vĩ độ
            </label>
            <input 
              type="text" 
              name="latitude" 
              className="form-input" 
              placeholder="Ví dụ: 21.028"
              value={formData.latitude} 
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Kinh độ</label>
            <input 
              type="text" 
              name="longitude" 
              className="form-input" 
              placeholder="Ví dụ: 105.854"
              value={formData.longitude} 
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '0.5rem' }}>
          <label className="form-label" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Calendar size={16} /> Năm xây dựng (Âm Lịch)
          </label>
          <input 
            type="number" 
            name="year" 
            className="form-input" 
            value={formData.year} 
            onChange={handleChange}
            min="1800"
            max="2100"
            required 
          />
        </div>

        <div style={{ marginTop: '2rem' }}>
          <button type="submit" className="btn-primary">
            LẬP TINH BÀN
          </button>
        </div>
      </form>
    </div>
  );
};

export default InputForm;

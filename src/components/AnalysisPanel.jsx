import React from 'react';
import { Activity, TrendingUp, Heart, ShieldPlus } from 'lucide-react';

const AnalysisPanel = ({ analysis }) => {
  if (!analysis) return null;

  const { skills, details } = analysis;

  const getStatusColor = (score) => {
    if (score >= 3) return '#10b981'; // Green
    if (score > 0) return '#3b82f6'; // Blue
    if (score < -2) return '#ef4444'; // Red
    if (score < 0) return '#f59e0b'; // Orange
    return '#8a8a93'; // Gray
  };

  const renderSkillBar = (skillKey, icon) => {
    const skill = skills[skillKey];
    if (!skill) return null;
    
    // Normalize score between -5 and 5 to 0-100%
    const normalized = Math.max(0, Math.min(100, (skill.score + 5) * 10));
    
    return (
      <div style={{ marginBottom: '1rem' }} key={skillKey}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {icon}
            <span>{skill.name}</span>
          </div>
          <span style={{ color: getStatusColor(skill.score), fontWeight: 'bold' }}>
            {skill.score > 0 ? '+' : ''}{skill.score}
          </span>
        </div>
        <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
          <div 
            style={{ 
              height: '100%', 
              width: `${normalized}%`, 
              background: getStatusColor(skill.score),
              transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
            }} 
          />
        </div>
      </div>
    );
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
      <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Activity size={24} className="text-gold" />
        <span className="text-gold">Phân Tích Cục Diện</span>
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <div>
          {renderSkillBar('wealth', <TrendingUp size={16} />)}
          {renderSkillBar('career', <Activity size={16} />)}
        </div>
        <div>
          {renderSkillBar('health', <ShieldPlus size={16} />)}
          {renderSkillBar('romance', <Heart size={16} />)}
        </div>
      </div>

      {details && details.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h4 style={{ color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>
            Cách Cục Đặc Biệt
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {details.map((detail, idx) => (
              <div 
                key={idx} 
                style={{ 
                  padding: '1rem', 
                  background: 'rgba(0,0,0,0.2)', 
                  borderRadius: '12px',
                  borderLeft: `3px solid ${detail.type.includes('Hung') || detail.type.includes('Xấu') ? '#ef4444' : '#10b981'}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <strong>Cung {detail.palace}: {detail.name}</strong>
                  <span style={{ fontSize: '0.8rem', padding: '2px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                    {detail.type}
                  </span>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{detail.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisPanel;

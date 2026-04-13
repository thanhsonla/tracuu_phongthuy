import React from 'react';

const CompassGraphic = ({ degree = 0, direction = 'N' }) => {
  // In Feng Shui, South (S) is usually placed at the top of the Luo Pan.
  // We'll rotate the compass such that South is Top, or stick to standard Western (North Top).
  // Standard Western: North Top.
  
  const normalizedDegree = ((degree % 360) + 360) % 360;

  return (
    <div style={{
      position: 'relative',
      width: '180px',
      height: '180px',
      margin: '0 auto 1.5rem',
      borderRadius: '50%',
      background: 'rgba(0,0,0,0.5)',
      border: '4px solid var(--border-color)',
      boxShadow: '0 0 15px var(--primary-glow) inset, 0 0 10px rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Compass Markers */}
      {["N", "NE", "E", "SE", "S", "SW", "W", "NW"].map((dir, i) => {
        const angle = i * 45;
        const isMain = i % 2 === 0;
        return (
          <div key={dir} style={{
            position: 'absolute',
            transform: `rotate(${angle}deg) translateY(-75px)`,
            transformOrigin: '0 75px',
            fontSize: isMain ? '0.85rem' : '0.65rem',
            fontWeight: isMain ? 'bold' : 'normal',
            color: dir === 'N' ? '#ef4444' : 'var(--text-muted)'
          }}>
            <div style={{ transform: `rotate(-${angle}deg)` }}>{dir}</div>
          </div>
        )
      })}
      
      {/* Center dot */}
      <div style={{
        width: '12px',
        height: '12px',
        background: 'var(--primary)',
        borderRadius: '50%',
        zIndex: 10,
        boxShadow: '0 0 5px #000'
      }}></div>

      {/* Needle */}
      <div style={{
        position: 'absolute',
        width: '4px',
        height: '70px',
        background: 'linear-gradient(to top, var(--primary) 0%, #ef4444 100%)',
        bottom: '50%',
        left: 'calc(50% - 2px)',
        transformOrigin: 'bottom center',
        transform: `rotate(${normalizedDegree}deg)`,
        borderRadius: '2px 2px 0 0',
        transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 5
      }}>
        <div style={{
          position: 'absolute',
          top: '-6px',
          left: '-3px',
          width: '0',
          height: '0',
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderBottom: '8px solid #ef4444'
        }}></div>
      </div>
      
      {/* Target Degree Info overlay */}
      <div style={{
        position: 'absolute',
        top: '50%',
        marginTop: '15px',
        fontSize: '0.75rem',
        color: 'var(--text-main)',
        background: 'rgba(0,0,0,0.6)',
        padding: '2px 6px',
        borderRadius: '8px',
        fontWeight: 'bold'
      }}>
        {normalizedDegree.toFixed(1)}°
      </div>
    </div>
  );
};

export default CompassGraphic;

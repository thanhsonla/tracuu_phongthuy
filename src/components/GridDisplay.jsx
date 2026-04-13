import React from 'react';
import StarCell from './StarCell';

const GridDisplay = ({ gridData, layout }) => {
  if (!gridData || !layout) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <p className="text-muted">Nhập thông tin bên trái để lập tinh bàn.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <span className="text-gold">Tinh Bàn Huyền Không</span>
      </h2>
      
      <div className="star-grid-container">
        {layout.map((row, rowIndex) => (
          <React.Fragment key={`row-${rowIndex}`}>
            {row.map(palaceIndex => (
              <StarCell 
                key={`palace-${palaceIndex}`} 
                palaceIndex={palaceIndex}
                content={gridData[palaceIndex]} 
              />
            ))}
          </React.Fragment>
        ))}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '1.5rem', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--mountain-color)' }}></div>
          <span>Sơn Tinh</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--facing-color)' }}></div>
          <span>Hướng Tinh</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--base-color)' }}></div>
          <span>Vận Tinh</span>
        </div>
      </div>
    </div>
  );
};

export default GridDisplay;

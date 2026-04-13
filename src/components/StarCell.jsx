import React from 'react';
import { PALACE_POSITIONS } from '../data/constants';

const StarCell = ({ content, palaceIndex }) => {
  if (!content) return <div className="star-cell empty" />;

  const { base, mountain, facing } = content;
  const palaceName = PALACE_POSITIONS[palaceIndex]?.name || '';

  return (
    <div className="star-cell">
      <div className="palace-number">{palaceIndex}</div>
      <div className="palace-name">{palaceName}</div>
      
      <div className="stars-top">
        <div className="mountain-star" title="Sơn Tinh (Mountain)">{mountain}</div>
        <div className="facing-star" title="Hướng Tinh (Facing)">{facing}</div>
      </div>
      
      <div className="base-star" title="Vận Tinh (Base)">{base}</div>
    </div>
  );
};

export default StarCell;

import { MOUNTAINS, FORWARD_FLIGHT, BACKWARD_FLIGHT, REPLACEMENT_STARS } from '../data/constants';

export const analyzeLine = (degree) => {
  const normDegree = (degree + 360) % 360;
  const mIdx = Math.floor(((normDegree + 7.5) % 360) / 15);
  const mountain = MOUNTAINS[mIdx];
  const centerDegree = mountain.degree;
  
  let diff = normDegree - centerDegree;
  if (diff < -180) diff += 360;
  if (diff > 180) diff -= 360;
  const absDiff = Math.abs(diff);

  const isDaiKhongVong = Math.abs((normDegree % 45) - 22.5) <= 1.5;
  const isTieuKhongVong = Math.abs((normDegree % 15) - 7.5) <= 1.5;

  let type = 'Chính Hướng';
  let isKeim = false;
  let needQueThe = false;
  let isVoid = false;
  let msg = '';
  let leanMountain = null;

  if (absDiff > 4.5) { 
    isKeim = true;
    const leanIdx = diff > 0 ? (mIdx + 1) % 24 : (mIdx - 1 + 24) % 24;
    leanMountain = MOUNTAINS[leanIdx];
    if (mountain.yinYang !== leanMountain.yinYang || mountain.trigram !== leanMountain.trigram) {
        needQueThe = true;
    }
  }

  if (isDaiKhongVong) {
    type = 'Đại Không Vong'; isVoid = true; msg = 'ĐẠI HUNG! Nằm ranh giới 2 quẻ. Tuyệt đối kỵ lập hướng.';
  } else if (isTieuKhongVong) {
    type = 'Tiểu Không Vong'; isVoid = true; msg = 'HUNG! Nằm ranh giới 2 sơn. Tiến thoái lưỡng nan.';
  } else if (isKeim) { 
    if (needQueThe) {
        type = 'Kiêm Hướng (Khởi Tinh)'; msg = `Lệch ${absDiff.toFixed(1)}° về ${leanMountain.name}. CẦN QUẺ THẾ.`;
    } else {
        type = 'Kiêm Hướng (Đồng Âm Dương)'; msg = `Lệch ${absDiff.toFixed(1)}° về ${leanMountain.name}. DÙNG QUẺ THƯỜNG.`;
    }
  }

  return { mountain, type, isKeim, needQueThe, isVoid, msg, absDiff, leanMountain };
};

export const findMountainForStar = (starNumber, type) => {
  if (starNumber === 5) return null;
  return MOUNTAINS.find(m => m.trigram === starNumber && m.type === type);
};

export const flyStar = (centerStar, isForward) => {
  const path = isForward ? FORWARD_FLIGHT : BACKWARD_FLIGHT;
  const grid = new Array(9).fill(0);
  let currentStar = centerStar;
  grid[4] = currentStar; 
  for (let i = 0; i < 8; i++) {
    currentStar = currentStar === 9 ? 1 : currentStar + 1;
    grid[path[i + 1]] = currentStar;
  }
  return grid;
};

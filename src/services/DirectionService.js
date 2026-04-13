import { DIRECTIONS_LIST } from '../data/constants';

export const getOppositeDirection = (direction) => {
  const index = DIRECTIONS_LIST.indexOf(direction);
  if (index === -1) return null;
  return DIRECTIONS_LIST[(index + 4) % 8];
};

export const getDeviationDirection = (mainDirection, deviationAngle) => {
  const index = DIRECTIONS_LIST.indexOf(mainDirection);
  if (index === -1) return mainDirection;

  const deviation = parseFloat(deviationAngle) || 0;
  if (Math.abs(deviation) === 0) return mainDirection;

  let degree = index * 45;
  let newDegree = (degree + deviation + 360) % 360;
  let newIndex = Math.round(newDegree / 45) % 8;

  return DIRECTIONS_LIST[newIndex];
};

export const getDeviationType = (deviationAngle) => {
  const deviation = parseFloat(deviationAngle) || 0;
  if (deviation > 0) return 'right';
  if (deviation < 0) return 'left';
  return 'none';
};

export const validateCoordinates = (lat, lng) => {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  if (isNaN(latitude) || latitude < -90 || latitude > 90) return false;
  if (isNaN(longitude) || longitude < -180 || longitude > 180) return false;
  return true;
};

export const validateDate = (year, month, day) => {
  if (year < 1864 || year > 2100) return false;
  if (month && (month < 1 || month > 12)) return false;
  if (day && (day < 1 || day > 31)) return false;
  return true;
};

export const validateDirection = (direction, deviation) => {
  const validDirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  if (!validDirs.includes(direction)) return false;
  if (deviation && (deviation < -15 || deviation > 15)) return false;
  return true;
};

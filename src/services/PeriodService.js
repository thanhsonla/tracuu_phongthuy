export const getPeriodFromYear = (year) => {
  let normalizedYear = parseInt(year);
  if (isNaN(normalizedYear)) return 8; // Default current period

  if (normalizedYear < 1864) {
    while (normalizedYear < 1864) {
      normalizedYear += 180;
    }
  }
  return (Math.floor((normalizedYear - 1864) / 20) % 9) + 1;
};

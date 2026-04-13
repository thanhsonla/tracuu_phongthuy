import { Solar, Lunar } from 'lunar-javascript';
import fs from 'fs';

const d1 = Solar.fromYmdHms(2025, 2, 3, 21, 9, 0); // Before Lap Xuan 21:10
const lunar1 = Lunar.fromSolar(d1);

const d2 = Solar.fromYmdHms(2025, 2, 3, 21, 11, 0); // After Lap Xuan 21:10
const lunar2 = Lunar.fromSolar(d2);

let output = `=== 3 Feb 2025 21:09 ===\n`;
output += `Year BaZi exact: ${lunar1.getYearInGanZhiExact()}\n`;
output += `Month BaZi exact: ${lunar1.getMonthInGanZhiExact()}\n`;

output += `=== 3 Feb 2025 21:11 ===\n`;
output += `Year BaZi exact: ${lunar2.getYearInGanZhiExact()}\n`;
output += `Month BaZi exact: ${lunar2.getMonthInGanZhiExact()}\n`;

fs.writeFileSync('bazi_output.txt', output);

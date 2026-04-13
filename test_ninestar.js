import { Solar, Lunar } from 'lunar-javascript';
import fs from 'fs';

const d1 = Solar.fromYmdHms(2025, 2, 4, 12, 0, 0); // After Lap Xuan 2025
const lunar1 = Lunar.fromSolar(d1);

let output = `=== 4 Feb 2025 (After Lap Xuan) ===\n`;
output += `Year Star: ${lunar1.getYearNineStar().getNumber()}\n`;
output += `Month Star: ${lunar1.getMonthNineStar().getNumber()}\n`;
output += `Day Star: ${lunar1.getDayNineStar().getNumber()}\n`;
output += `Time Star: ${lunar1.getTimeNineStar().getNumber()}\n`;

const d2 = Solar.fromYmdHms(2025, 2, 3, 12, 0, 0); // Before Lap Xuan 2025
const lunar2 = Lunar.fromSolar(d2);
output += `=== 3 Feb 2025 (Before Lap Xuan) ===\n`;
output += `Year Star: ${lunar2.getYearNineStar().getNumber()}\n`;
output += `Month Star: ${lunar2.getMonthNineStar().getNumber()}\n`;
output += `Day Star: ${lunar2.getDayNineStar().getNumber()}\n`;
output += `Time Star: ${lunar2.getTimeNineStar().getNumber()}\n`;

fs.writeFileSync('ninestar_output.txt', output);

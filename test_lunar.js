import { Solar, Lunar } from 'lunar-javascript';
import fs from 'fs';

let output = '';

// Check Tiết khí for Lap Xuan (Lập Xuân) 2025
// Tinhmenhdo.com sets Lap Xuan 2025 at: 2025-02-03 21:10:00 (Vietnam time)
const d1 = Solar.fromYmdHms(2025, 2, 3, 21, 10, 0); 
const lunar1 = Lunar.fromSolar(d1);

output += `=== 3 Feb 2025 21:10 ===\n`;
output += `Prev JieQi: ${lunar1.getPrevJieQi(true).getName()} - ${lunar1.getPrevJieQi(true).getSolar().toYmdHms()}\n`;
output += `Next JieQi: ${lunar1.getNextJieQi(true).getName()} - ${lunar1.getNextJieQi(true).getSolar().toYmdHms()}\n`;

const d2 = Solar.fromYmdHms(2025, 6, 21, 12, 0, 0);
const lunar2 = Lunar.fromSolar(d2);
output += `=== Xia Zhi (Hạ Chí) 2025 ===\n`;
output += `Prev JieQi: ${lunar2.getPrevJieQi(true).getName()} - ${lunar2.getPrevJieQi(true).getSolar().toYmdHms()}\n`;
output += `Next JieQi: ${lunar2.getNextJieQi(true).getName()} - ${lunar2.getNextJieQi(true).getSolar().toYmdHms()}\n`;

fs.writeFileSync('lunar_output.txt', output);

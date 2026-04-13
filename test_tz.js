import { Solar, Lunar } from 'lunar-javascript';
import fs from 'fs';

process.env.TZ = 'Asia/Ho_Chi_Minh';

const vDate1 = new Date('2025-02-03T21:09:00+07:00');
const vDate2 = new Date('2025-02-03T21:11:00+07:00');

const s1 = Solar.fromDate(vDate1);
const s2 = Solar.fromDate(vDate2);

const l1 = Lunar.fromSolar(s1);
const l2 = Lunar.fromSolar(s2);

let output = `--- with TZ Asia/Ho_Chi_Minh ---\n`;
output += `vDate1 21:09 Bazi: ${l1.getYearInGanZhiExact()} ${l1.getMonthInGanZhiExact()}\n`;
output += `vDate2 21:11 Bazi: ${l2.getYearInGanZhiExact()} ${l2.getMonthInGanZhiExact()}\n`;

fs.writeFileSync('bazi_tz_output.txt', output);

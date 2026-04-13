const { Lunar } = require('lunar-javascript');

try {
  let lunar = Lunar.fromDate(new Date());
  let times = lunar.getTimes();
  const hour = times[0];
  console.log("Yi exists?", typeof hour.getYi === 'function');
  if (typeof hour.getYi === 'function') {
    console.log("Yi:", hour.getYi());
  }
} catch (e) {
  console.error("Error:", e);
}

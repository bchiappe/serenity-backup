const config = require("config");
const Database = require("./services/database");
const Scheduler = require("./services/scheduler");

(async () => {
  // Initialize and connect database
  const d = new Database();
  await d.connect();
  // Invoke schedule
  const s = new Scheduler();
  // Wait until next minute to start scheduler
  const now = new Date();
  const wait = (60 - now.getSeconds()) * 1000;
  console.log(`Starting scheduler in ${wait / 1000} seconds...`);
  setTimeout(function () {
    console.log(`Scheduler started.`);
    setInterval(s.runDueSchedules, 60000);
    s.runDueSchedules();
  }, wait);
})();

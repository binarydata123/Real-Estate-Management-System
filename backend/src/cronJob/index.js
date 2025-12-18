import cron from "node-cron";
import { meetingReminderCronJob } from "./cronJobFunctions/MeetingReminderCronJob.js";
import { meetingStatusUpdateCronJob } from "./cronJobFunctions/MeetingStatusUpdate.js";

/**
 * Runs multiple cron jobs from a config object
 * @param {Array} jobs - Array of jobs with schedule and task
 */
export function startCronJob() {
  // Daily reminder at 10 AM
  cron.schedule("0 10 * * *", () => {
    console.log("🔔 Running daily meeting reminders...");
    meetingReminderCronJob("today");
  });

  // Hour before reminder - every 10 minutes
  cron.schedule("*/10 * * * *", () => {
    console.log("⏰ Running hourly meeting reminders...");
    meetingReminderCronJob("hourBefore");
  });

  // Status update - every 1 minute
  cron.schedule("* * * * *", async () => {
    console.log("🔄 Running meeting status update...");
    await meetingStatusUpdateCronJob();
  });

  console.log("✅ All cron jobs started successfully");
}

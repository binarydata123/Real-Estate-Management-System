import cron from "node-cron";
import { meetingReminderCronJob } from "./cronJobFunctions/MeetingReminderCronJob.js";

/**
 * Runs multiple cron jobs from a config object
 * @param {Array} jobs - Array of jobs with schedule and task
 */
export function startCronJob() {
  cron.schedule("0 10 * * *", () => {
    meetingReminderCronJob("today");
  });
  cron.schedule("*/10 * * * *", () => {
    meetingReminderCronJob("hourBefore");
  });
}

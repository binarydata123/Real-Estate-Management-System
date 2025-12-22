import { Meetings } from "../../models/Agent/MeetingModel.js";
import moment from "moment-timezone";

export async function meetingStatusUpdateCronJob() {
  try {
    // Always calculate time in IST
    const twoHoursAgo = moment().tz("Asia/Kolkata").subtract(2, "hours");

    // Get all scheduled/rescheduled meetings
    const meetings = await Meetings.find({
      status: { $in: ["scheduled", "rescheduled"] },
    }).lean();

    // Filter meetings that should be marked as past
    const meetingIdsToUpdate = meetings
      .filter((meeting) => {
        if (!meeting.date || !meeting.time) return false;

        // Expecting time format "HH:mm"
        const [hours, minutes] = meeting.time.split(":").map(Number);

        if (isNaN(hours) || isNaN(minutes)) return false;

        // Build meeting datetime in IST
        const meetingDateTime = moment.tz(meeting.date, "Asia/Kolkata").set({
          hour: hours,
          minute: minutes,
          second: 0,
          millisecond: 0,
        });

        return meetingDateTime.isSameOrBefore(twoHoursAgo);
      })
      .map((m) => m._id);

    // Update in bulk
    if (meetingIdsToUpdate.length > 0) {
      const result = await Meetings.updateMany(
        { _id: { $in: meetingIdsToUpdate } },
        { $set: { status: "past" } }
      );

      console.log(
        `Meeting status update cron ran - Updated ${result.modifiedCount} meetings to 'past' status`
      );

      return result;
    } else {
      console.log("Meeting status update cron ran - No meetings to update");
      return { modifiedCount: 0 };
    }
  } catch (error) {
    console.error("Meeting status update cron error:", error);
    throw error;
  }
}

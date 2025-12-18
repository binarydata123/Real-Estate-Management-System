import { Meetings } from "../../models/Agent/MeetingModel.js";

export async function meetingStatusUpdateCronJob() {
  try {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    // Get all scheduled/rescheduled meetings
    const meetings = await Meetings.find({
      status: { $in: ["scheduled", "rescheduled"] },
    }).lean();

    // Filter meetings that should be marked as past
    const meetingIdsToUpdate = meetings
      .filter((meeting) => {
        const [hours, minutes] = meeting.time.split(":").map(Number);
        const meetingDateTime = new Date(meeting.date);
        meetingDateTime.setHours(hours, minutes, 0, 0);

        return meetingDateTime <= twoHoursAgo;
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
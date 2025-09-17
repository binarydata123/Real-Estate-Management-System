import { Meetings } from "../../models/Agent/MeetingModel.js";
import { User } from "../../models/Common/UserModel.js";
import { sendPushNotification } from "../../utils/pushService.js";

export async function meetingReminderCronJob(mode = "today") {
  try {
    const now = new Date();
    let query = {
      status: { $in: ["scheduled", "rescheduled"] },
    };

    let meetingsQuery = {
      status: { $in: ["scheduled", "rescheduled"] },
    };

    if (mode === "today") {
      // All meetings for today
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      meetingsQuery.date = { $gte: startOfToday, $lte: endOfToday };
    } else if (mode === "hourBefore") {
      // Roughly filter today's meetings, exact check will be done later
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      meetingsQuery.date = { $gte: startOfToday, $lte: endOfToday };
    }

    let meetings = await Meetings.find(
      meetingsQuery,
      "agencyId customerId date time status"
    )
      .populate("customerId", "fullName")
      .populate("agencyId", "name")
      .lean();

    if (mode === "hourBefore") {
      const now = new Date();
      const start = new Date(now.getTime() + 50 * 60 * 1000); // 50 mins later
      const end = new Date(now.getTime() + 60 * 60 * 1000); // 60 mins later

      meetings = meetings.filter((m) => {
        const [hours, minutes] = m.time.split(":").map(Number);

        const meetingDateTime = new Date(m.date);
        meetingDateTime.setHours(hours, minutes, 0, 0);

        return meetingDateTime >= start && meetingDateTime <= end;
      });
    }
    console.log(meetings);
    for (let meeting of meetings) {
      const user = await User.findOne({ agencyId: meeting.agencyId._id });

      // Push notification to agency user
      await sendPushNotification({
        userId: user._id,
        title: "Meeting Scheduled",
        message: `You have a meeting scheduled with ${meeting.customerId.fullName} today at ${meeting.time}.`,
        urlPath: "meetings",
      });

      // Push notification to customer
      await sendPushNotification({
        userId: meeting.customerId._id,
        title: "New Meeting Reminder",
        message: `You have a meeting scheduled with ${meeting.agencyId.name} today at ${meeting.time}.`,
        urlPath: "meetings",
      });
    }
  } catch (error) {
    console.error("Error fetching meetings:", error);
  }
}

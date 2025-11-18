import { createNotification } from "../../../utils/apiFunctions/Notifications/index.js";
import { sendPushNotification } from "../../../utils/pushService.js";
import { VapiClient } from "@vapi-ai/server-sdk";
import generateToken from "../../../utils/generateToken.js";
import { Meetings } from "../../../models/Agent/MeetingModel.js";
import { Customer } from "../../../models/Agent/CustomerModel.js";
import { User } from "../../../models/Common/UserModel.js";
const vapi = new VapiClient({ token: process.env.VAPI_SERVER_API_KEY });

export const startMeetingSession = async (req, res) => {
  try {
    const { assistantId, userId } = req.body;
    if (!assistantId)
      return res.status(400).json({
        success: false,
        message: "Missing assistantId (check .env)",
      });

    const session = await vapi.sessions.create({
      assistantId,
      metadata: {
        userId: userId,
      },
    });

    return res.json({ success: true, sessionId: session.id });
  } catch (error) {
    console.error("❌ Error starting session:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createMeetingRecord = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }
    console.log("Auth", req.user);
    console.log("🔍 RAW BODY:", JSON.stringify(req.body, null, 2));

    // -------------------------------
    // HELPERS
    // -------------------------------
    const isNullish = (val) =>
      val === undefined ||
      val === null ||
      val === "" ||
      val === "null" ||
      val === "undefined";

    const clean = (val) => {
      if (isNullish(val)) return null;
      return typeof val === "string" ? val.trim() : val;
    };

    // -------------------------------
    // EXTRACT STRUCTURED OUTPUT SAFELY
    // -------------------------------
    // -------------------------------
    // EXTRACT STRUCTURED OUTPUT SAFELY (UPDATED FOR YOUR FORMAT)
    // -------------------------------
    let structuredOutput = null;

    try {
      // Case: SO is directly in body with UUID
      if (
        typeof req.body === "object" &&
        !Array.isArray(req.body) &&
        Object.keys(req.body).length > 0 &&
        Object.values(req.body)[0]?.result
      ) {
        structuredOutput = Object.values(req.body)[0].result;
        // eslint-disable-next-line brace-style
      }
      // Old Vapi format
      else if (req.body?.message?.artifact?.structuredOutputs) {
        const outputs = req.body.message.artifact.structuredOutputs;
        structuredOutput = outputs[Object.keys(outputs)[0]]?.result;
        // eslint-disable-next-line brace-style
      }
      // New Vapi event format
      else if (req.body?.data?.result) {
        structuredOutput = req.body.data.result;
      }
    } catch (err) {
      console.error("❌ SO Parsing crashed:", err);
    }

    // -------------------------------
    // HANDLE NO STRUCTURED OUTPUT
    // -------------------------------
    if (!structuredOutput || typeof structuredOutput !== "object") {
      console.warn("⚠️ No structured output found or invalid");
      return res.status(200).json({
        success: true,
        note: "No meeting data yet",
      });
    }

    console.log("🗓️ Structured Meeting Data:", structuredOutput);

    // -------------------------------
    // HANDLE NO STRUCTURED OUTPUT
    // -------------------------------
    if (!structuredOutput || typeof structuredOutput !== "object") {
      console.warn("⚠️ No structured output found or invalid");
      return res.status(200).json({
        success: true,
        note: "No meeting data yet",
      });
    }

    console.log("🗓️ Structured Meeting Data:", structuredOutput);

    // -------------------------------
    // CLEAN EXTRACTED VALUES
    // -------------------------------
    const customerId = clean(structuredOutput.customerId);
    const propertyId = clean(structuredOutput.propertyId);
    const date = clean(structuredOutput.date);
    const time = clean(structuredOutput.time);
    const notes = clean(structuredOutput.notes);
    const status = "scheduled"; // fixed value since AI does not send status anymore

    // -------------------------------
    // VALIDATE REQUIRED FIELDS
    // -------------------------------
    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: "customerId is missing or invalid",
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "date is missing or invalid",
      });
    }

    if (!req.user?.agencyId?._id) {
      return res.status(400).json({
        success: false,
        message: "Agency information missing in request user",
      });
    }

    const agencyId = req.user.agencyId._id;

    // -------------------------------
    // CUSTOMER LOOKUP (DIRECT BY ID)
    // -------------------------------
    const selectedCustomer = await Customer.findById(customerId);

    if (!selectedCustomer) {
      return res.status(404).json({
        success: false,
        message: `Customer not found with ID "${customerId}"`,
      });
    }

    // -------------------------------
    // BUILD FINAL MEETING DOCUMENT
    // -------------------------------
    const meetingData = {
      customerId: selectedCustomer._id,
      propertyId: propertyId || null,
      agencyId,
      date: new Date(date),
      time: isNullish(time) ? null : time,
      status,
      notes: notes || "",
    };

    // -------------------------------
    // SAVE MEETING
    // -------------------------------
    const meeting = new Meetings(meetingData);
    const savedMeeting = await meeting.save();

    console.log(`✅ Meeting saved for ${selectedCustomer.fullName}`);

    // -------------------------------
    // USER + NOTIFICATIONS
    // -------------------------------
    const agent = req.user;
    const customerUser = await User.findOne({ email: selectedCustomer.email });

    if (!customerUser) {
      return res.status(404).json({
        success: false,
        message: "Customer's user account not found",
      });
    }

    const agentToken = generateToken(agent._id, agent.role);
    const customerToken = generateToken(customerUser._id, customerUser.role);

    // Internal + Push notifications
    await createNotification({
      agencyId,
      userId: agent._id,
      message: `Meeting scheduled with ${
        selectedCustomer.fullName
      } on ${date} at ${time || "TBD"}.`,
      type: "meeting_scheduled",
    });

    await createNotification({
      userId: customerUser._id,
      message: `${agent.name} scheduled a meeting with you on ${date} at ${
        time || "TBD"
      }.`,
      type: "meeting_scheduled",
    });

    await sendPushNotification({
      userId: agent._id,
      title: "Meeting Scheduled",
      message: `You have successfully scheduled a meeting with ${selectedCustomer.fullName}.`,
      urlPath: "/meetings",
      data: { meetingId: savedMeeting._id, token: agentToken },
    });

    await sendPushNotification({
      userId: customerUser._id,
      title: "New Meeting Invitation",
      message: `${agent.name} scheduled a meeting with you on ${date} at ${
        time || "TBD"
      }.`,
      urlPath: "/meetings",
      data: { meetingId: savedMeeting._id, token: customerToken },
    });

    // -------------------------------
    // FINAL RESPONSE
    // -------------------------------
    return res.status(201).json({
      success: true,
      data: savedMeeting,
      message: "Meeting successfully scheduled.",
    });
  } catch (err) {
    console.error("❌ HARD ERROR:", err.stack || err);

    return res.status(500).json({ success: false, error: err.message });
  }
};

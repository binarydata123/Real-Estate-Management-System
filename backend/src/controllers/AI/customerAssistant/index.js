import { Customer } from "../../../models/Agent/CustomerModel.js";
import { createNotification } from "../../../utils/apiFunctions/Notifications/index.js";
import { VapiClient } from "@vapi-ai/server-sdk";

import { sendPushNotification } from "../../../utils/pushService.js";
const vapi = new VapiClient({ token: process.env.VAPI_SERVER_API_KEY });

export const createCustomerAssistant = async (req, res) => {
  try {
    const WEBHOOK_URL =
      "https://api.real-estate.ai-developer.site/api/vapi/save-lead";

    const systemPrompt = `
You are a friendly onboarding assistant.
Collect only two details:
1. Full name
2. Phone number

Ask naturally:
- "Hi! May I know your full name, please?"
- After they reply, ask: "Thanks! Could you share your phone number?"

When both are collected, confirm them back and say:
"Thank you! I’ve saved your details. Have a great day!"

Finally, output a structured JSON like:
{
  "fullName": "John Doe",
  "phoneNumber": "9876543210"
}
`;

    const assistant = await vapi.assistants.create({
      name: "Quick Lead Capture Assistant",
      model: {
        provider: "openai",
        model: "gpt-4o-mini",
        systemPrompt,
      },
      voice: {
        provider: "vapi",
        voiceId: "Neha",
      },
      server: {
        url: WEBHOOK_URL,
      },
      firstMessage: "Hi! May I know your full name, please?",
    });

    console.log("✅ Lead Capture Assistant created:", assistant.id);
    res.status(200).json({ success: true, assistantId: assistant.id });
  } catch (error) {
    console.error("❌ Error creating Lead Capture Assistant:", error);
    res.status(500).json({
      success: false,
      message:
        error.body?.message || error.message || "Failed to create assistant",
    });
  }
};

export const createCustomerRecord = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // 🟡 Debug: Log incoming payload for traceability
    console.log("📥 Incoming payload received from Vapi", req.user);

    let structuredOutput;

    // ✅ Try to extract structured output from all possible formats
    if (req.body?.message?.artifact?.structuredOutputs) {
      const outputs = req.body.message.artifact.structuredOutputs;
      const firstKey = Object.keys(outputs)[0];
      structuredOutput = outputs[firstKey]?.result;
    } else if (req.body?.data?.result) {
      structuredOutput = req.body.data.result;
    } else if (
      typeof req.body === "object" &&
      !Array.isArray(req.body) &&
      Object.values(req.body)?.[0]?.result
    ) {
      structuredOutput = Object.values(req.body)[0]?.result;
    } else if (req.body?.result) {
      structuredOutput = req.body.result;
    }

    // ⚠️ No structured output found — skip saving
    if (!structuredOutput) {
      console.warn("⚠️ No structured output found in webhook payload");
      return res.status(200).json({ success: true, note: "No lead data yet" });
    }

    const { fullName, phoneNumber } = structuredOutput;

    if (!fullName || !phoneNumber) {
      console.error("❌ Missing required fields:", structuredOutput);
      return res.status(400).json({
        error: "Missing fullName or phoneNumber in structured output",
      });
    }

    // ✅ Prepare customer data
    const customerData = {
      fullName,
      phoneNumber,
      email: structuredOutput.email || null,
      whatsAppNumber: structuredOutput.whatsAppNumber || null,
      minimumBudget: structuredOutput.minimumBudget || null,
      maximumBudget: structuredOutput.maximumBudget || null,
      leadSource: structuredOutput.leadSource || null,
      initialNotes: structuredOutput.initialNotes || null,
      status: "new",
      role: "customer",
      agencyId: "68c55d7c2df74062c8341bf7",
    };

    if (!customerData.agencyId) {
      console.error("❌ Missing agencyId from req.user");
      return res
        .status(400)
        .json({ error: "Missing agencyId in request user" });
    }

    // 🔍 Check for existing customer
    const existingCustomer = await Customer.findOne({
      phoneNumber: customerData.phoneNumber,
      agencyId: customerData.agencyId,
    });

    if (existingCustomer) {
      console.log(`ℹ️ Duplicate customer detected: ${fullName}`);
      return res.status(409).json({
        success: false,
        message: "This customer already exists in your agency.",
      });
    }

    // 💾 Save customer
    const savedCustomer = await new Customer(customerData).save();
    console.log(`✅ Customer saved: ${savedCustomer.fullName}`);

    // 🔔 Send notifications
    await createNotification({
      agencyId: savedCustomer.agencyId,
      userId: "68c55d7b2df74062c8341bf5",
      message: `A new customer lead (${savedCustomer.fullName}) has been created successfully.`,
      type: "new_lead",
    });

    await sendPushNotification({
      userId: "68c55d7b2df74062c8341bf5",
      title: "New Customer Lead",
      message: `A new customer "${savedCustomer.fullName}" has been added to your agency.`,
      urlPath: "/agent/customers",
    });

    return res.status(201).json({
      success: true,
      data: savedCustomer,
      message: "Customer has been successfully added.",
    });
  } catch (err) {
    console.error("❌ Webhook error:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const startCustomerSession = async (req, res) => {
  try {
    const { assistantId } = req.body;

    if (!assistantId)
      return res.status(400).json({
        success: false,
        message: "Missing assistantId (check .env)",
      });

    const session = await vapi.sessions.create({
      assistantId,
    });

    console.log("🎬 Session created:", session.id);
    res.json({ success: true, sessionId: session.id });
  } catch (error) {
    console.error("❌ Error starting session:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

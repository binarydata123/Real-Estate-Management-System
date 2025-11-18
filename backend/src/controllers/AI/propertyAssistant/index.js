import { Property } from "../../../models/Agent/PropertyModel.js";
import { PropertyFeedback } from "../../../models/Common/PropertyFeedbackModel.js";
import { createNotification } from "../../../utils/apiFunctions/Notifications/index.js";
import { sendPushNotification } from "../../../utils/pushService.js";
import { VapiClient } from "@vapi-ai/server-sdk";
const vapi = new VapiClient({ token: process.env.VAPI_SERVER_API_KEY });

export const createPropertyAssistant = async (req, res) => {
  try {
    const systemPrompt = `
You are a highly efficient real estate assistant named Prop-E. Your goal is to help an agent quickly add a new property listing by asking for details in a structured, conversational manner.

**Conversation Flow:**

1.  **Greeting:** Start with a friendly and professional greeting. "Hi! I'm Prop-E. I can help you list a new property. Let's start with the basics."

2.  **Collect Core Details:** Ask for the following information one by one. Be natural.
    - **Property Type:** "First, is the property 'residential' or 'commercial'?"
    - **Category:** "Got it. And what category is it? For example, a 'flat', 'villa', 'plot', or 'office'?"
    - **Location:** "Great. Where is the property located? Please provide the full address or area."
    - **Price:** "Understood. What is the asking price in Rupees?"
    - **Bedrooms (if residential):** If the type is 'residential' and category is not 'plot' or 'land', ask: "How many bedrooms does it have?"
    - **Built-up Area:** "What is the total built-up area? You can specify the unit, like 'square feet' or 'gaj'."

3.  **Confirmation:** After collecting the details, confirm them back to the user. "Okay, let me confirm: A [category] in [location] for ₹[price], with [bedrooms] bedrooms and an area of [built_up_area]. Is that correct?"

4.  **Final Output:** Once the user confirms, say "Perfect! I've saved the initial details. You can add more information and images from the property page. Have a great day!" and then immediately output the structured JSON.

**JSON Output Format:**
When the conversation is complete, you MUST output a JSON object with the collected data like this:
{
  "type": "residential",
  "category": "flat",
  "location": "Bandra West, Mumbai",
  "price": 5000000,
  "bedrooms": 2,
  "built_up_area": "1200 square feet"
}
`;

    const assistant = await vapi.assistants.create({
      name: "Property Listing Assistant",
      model: {
        provider: "openai",
        model: "gpt-4o-mini",
        systemPrompt,
      },
      voice: { provider: "vapi", voiceId: "Neha" },
      firstMessage:
        "Hi! I'm Prop-E. I can help you list a new property. Let's start with the basics.",
    });

    res.status(200).json({ success: true, assistantId: assistant.id });
  } catch (error) {
    console.error("❌ Error creating Property Listing Assistant:", error);
    res.status(500).json({
      success: false,
      message: error.body?.message || "Failed to create assistant",
    });
  }
};

export const startPropertySession = async (req, res) => {
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

    return res.json({ success: true, sessionId: session.id });
  } catch (error) {
    console.error("❌ Error starting session:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createPropertyRecord = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }
    console.log("📥 Incoming payload received from Vapi", req.user);

    let structuredOutput;

    // ✅ Extract structured output (handles different Vapi formats)
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

    // ⚠️ No structured output found
    if (!structuredOutput) {
      console.warn("⚠️ No structured output found in webhook payload");
      return res
        .status(200)
        .json({ success: true, note: "No property data yet" });
    }

    console.log("🏗️ Structured Property Data:", structuredOutput);

    // 🧹 Helper functions to sanitize data
    const isNullish = (val) =>
      val === undefined ||
      val === null ||
      val === "" ||
      val === "null" ||
      val === "undefined";

    const toNumber = (val) => {
      if (isNullish(val)) return 0;
      const num = Number(val);
      return isNaN(num) ? 0 : num;
    };

    const normalize = (val) =>
      typeof val === "string" ? val.trim().toLowerCase() : val;

    const capitalize = (s) =>
      typeof s === "string" && s.length > 0
        ? s.charAt(0).toUpperCase() + s.slice(1)
        : "";

    const safeArray = (val) =>
      Array.isArray(val) ? val : typeof val === "string" && val ? [val] : [];

    // 🧩 Destructure safely
    const {
      title,
      type,
      category,
      location,
      price,
      built_up_area,
      carpet_area,
      bedrooms,
      bathrooms,
      balconies,
      floor_number,
      total_floors,
      furnishing,
      flooring_type,
      facing,
      amenities,
      features,
      description,
      owner_name,
      owner_contact,
      rera_status,
      gated_community,
      property_code,
      cabins,
      washrooms,
      conference_rooms,
    } = structuredOutput;

    // 🧩 Validate required fields
    if (!type || !category) {
      return res.status(400).json({
        success: false,
        error: "Missing required property fields: type or category",
      });
    }

    // 🏷️ Auto-generate title if not provided
    const generatedTitle =
      !isNullish(title) && title?.trim()
        ? title.trim()
        : `${capitalize(normalize(type))} ${capitalize(normalize(category))}`;

    // 🏗️ Build property data safely
    const propertyData = {
      title: generatedTitle,
      type: normalize(type),
      category: normalize(category),
      description: isNullish(description) ? "" : description,
      location: isNullish(location) ? "" : location,
      price: toNumber(price),
      built_up_area: toNumber(built_up_area),
      carpet_area: toNumber(carpet_area),
      bedrooms: toNumber(bedrooms),
      bathrooms: toNumber(bathrooms),
      balconies: toNumber(balconies),
      floor_number: toNumber(floor_number),
      total_floors: toNumber(total_floors),
      washrooms: toNumber(washrooms),
      cabins: toNumber(cabins),
      conference_rooms: toNumber(conference_rooms),
      furnishing: normalize(furnishing) || "unfurnished",
      flooring_type: normalize(flooring_type),
      facing: normalize(facing),
      amenities: safeArray(amenities),
      features: safeArray(features),
      owner_name: isNullish(owner_name) ? "" : owner_name,
      owner_contact: isNullish(owner_contact) ? "" : owner_contact,
      rera_status: normalize(rera_status) || "not approved",
      gated_community: normalize(gated_community) || "no",
      property_code:
        !isNullish(property_code) && property_code
          ? property_code
          : `PROP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      agencyId: req.user?.agencyId._id,
      status: "Available",
    };

    // // 🕵️‍♂️ Check for duplicate property by title + location + agency
    // const existingProperty = await Property.findOne({
    //   title: propertyData.title,
    //   location: propertyData.location,
    //   agencyId: propertyData.agencyId,
    // });

    // if (existingProperty) {
    //   console.log(`ℹ️ Duplicate property detected: ${propertyData.title}`);
    //   return res.status(409).json({
    //     success: false,
    //     message: "This property already exists in your agency.",
    //   });
    // }

    // 💾 Save property to DB
    const savedProperty = await new Property(propertyData).save();
    console.log(`✅ Property saved: ${savedProperty.title}`);

    // 🔔 Send notifications
    await createNotification({
      agencyId: savedProperty.agencyId,
      userId: req.user._id, // Example agent
      message: `A new property (${savedProperty.title}) has been added.`,
      type: "property_added",
    });

    await sendPushNotification({
      userId: req.user._id,
      title: "New Property Added",
      message: `A new property "${savedProperty.title}" has been created.`,
      urlPath: "/agent/properties",
    });

    return res.status(201).json({
      success: true,
      data: savedProperty,
      message: "Property successfully added.",
    });
  } catch (err) {
    console.error("❌ Property creation error:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const createPropertyFeedback = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    console.log("📥 Incoming FEEDBACK payload:", req.body);
    const metadata =
      req.body?.message?.call?.assistantOverrides?.metadata ||
      req.body?.message?.artifact?.variables?.metadata;
    console.log("TOOL INPUT:", req.body);

    console.log("📌 Extracted Metadata:", metadata);
    let structuredOutput;

    // Extract structured output (Vapi sends different formats)
    if (req.body?.message?.artifact?.structuredOutputs) {
      const out = req.body.message.artifact.structuredOutputs;
      const firstKey = Object.keys(out)[0];
      structuredOutput = out[firstKey]?.result;
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

    // No structured output found
    if (!structuredOutput) {
      console.warn("⚠️ No feedback structured output found.");
      return res.status(200).json({
        success: true,
        note: "No feedback data yet",
      });
    }

    console.log("📝 Structured Feedback:", structuredOutput);

    // Extract fields (REMOVE vapiUserId)
    const { liked, reason, notes, propertyId } = structuredOutput;

    // Validate required fields
    if (liked === undefined) {
      return res.status(400).json({
        success: false,
        error: "'liked' field is required",
      });
    }

    if (!propertyId || propertyId === "property") {
      return res.status(400).json({
        success: false,
        error: "Valid propertyId required inside structuredOutput",
      });
    }

    if (!req.user?._id) {
      return res.status(400).json({
        success: false,
        error: "Authed user not found",
      });
    }

    // Lookup property
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        error: "Property not found",
      });
    }

    // Convert liked to boolean
    const likedBoolean =
      typeof liked === "string"
        ? liked.trim().toLowerCase() === "true"
        : Boolean(liked);

    // Prepare feedback data
    const feedbackData = {
      userId: req.user._id,
      propertyId,
      liked: likedBoolean,
      reason: reason || "",
      notes: notes || "",
    };

    // Save feedback
    const savedFeedback = await new PropertyFeedback(feedbackData).save();
    console.log("✅ Feedback saved:", savedFeedback._id);

    // Notify agent
    await createNotification({
      agencyId: req.user?.agencyId?._id,
      userId: req.user._id,
      message: `Customer submitted feedback for property: ${property.title}`,
      type: "property_feedback",
    });

    await sendPushNotification({
      userId: req.user._id,
      title: "New Property Feedback",
      message: `Feedback received for "${property.title}".`,
      urlPath: `/agent/properties/${property._id}`,
    });

    return res.status(201).json({
      success: true,
      data: savedFeedback,
      message: "Feedback submitted successfully",
    });
  } catch (err) {
    console.error("❌ Feedback creation error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

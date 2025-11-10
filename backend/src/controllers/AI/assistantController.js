import OpenAI from "openai";
import { Property } from "../../models/Agent/PropertyModel.js";
import { Preference } from "../../models/Common/PreferenceModel.js";
import { VapiClient } from "@vapi-ai/server-sdk";
import PropertyAICache from "../../models/AI/PropertyAICache.js";
import { AdminSettings } from "../../models/Admin/AdminSettingsModel.js";
import { Customer } from "../../models/Agent/CustomerModel.js";
import { createCustomer } from "../../controllers/Agent/CustomerController.js";
import { createNotification } from "../../utils/apiFunctions/Notifications/index.js";
import { sendPushNotification } from "../../utils/pushService.js";

// ✅ Create instance
const vapi = new VapiClient({ token: process.env.VAPI_SERVER_API_KEY });
// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const askQuestion = async (req, res) => {
  const { question, propertyData } = req.body;

  if (!question || !propertyData) {
    return res
      .status(400)
      .json({ message: "Question and property data are required." });
  }

  // Convert property data to a readable string for the AI
  const context = `
    Property Information:
    - Title: ${propertyData.title}
    - Type: ${propertyData.type} - ${propertyData.category}
    - Location: ${propertyData.location}
    - Price: ₹${propertyData.price.toLocaleString()}
    - Description: ${propertyData.description}
    - Bedrooms: ${propertyData.bedrooms}
    - Bathrooms: ${propertyData.bathrooms}
    - Built-up Area: ${propertyData.built_up_area} ${
    propertyData.unit_area_type
  }
    - Furnishing: ${propertyData.furnishing}
    - Features: ${propertyData.features.join(", ")}
    - Amenities: ${propertyData.amenities.join(", ")}
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an expert real estate sales assistant. Your goal is to answer user questions and persuade them to be interested in the property. Answer concisely and with a positive, confident tone. Do not mention you are an AI. If a detail isn't available, frame it as an opportunity for a follow-up, for example: 'That's a great question, I would be happy to find that specific detail for you.'",
        },
        {
          role: "user",
          content: `Context:\n${context}\n\nQuestion: ${question}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 100,
    });

    res.json({ answer: completion.choices[0].message.content.trim() });
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    res
      .status(500)
      .json({ message: "Failed to get a response from the AI assistant." });
  }
};

export const generateSpeech = async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ message: "Text to speak is required." });
  }

  try {
    // Using OpenAI's TTS for a simple, cost-effective solution during development.
    const mp3 = await openai.audio.speech.create({
      model: "tts-1", // A cost-effective and fast model.
      voice: "alloy", // A clear, professional female voice.
      input: text,
      response_format: "mp3",
      speed: 0.95,
    });

    res.setHeader("Content-Type", "audio/mpeg");
    // Stream the audio buffer back to the client.
    res.send(Buffer.from(await mp3.arrayBuffer()));
  } catch (error) {
    console.error("Error calling OpenAI TTS:", error);
    res
      .status(500)
      .json({ message: "Failed to generate speech from the AI assistant." });
  }
};

// 🎯 Generate Property Prompt (Dynamic Language Support)
export const propertyPrompt = async (req, res) => {
  try {
    const { propertyId, userId } = req.params;

    // Fetch property & user preference
    const property = await Property.findById(propertyId);
    const preference = await Preference.findOne({ userId });

    if (!property || !preference) {
      return res
        .status(404)
        .json({ message: "Property or Preference not found" });
    }

    // ✅ Fetch language from Admin Settings
    const adminSettings = await AdminSettings.findOne({});
    const language = adminSettings?.voiceLanguage || "Hinglish"; // Default

    // 🧠 Language-specific prompt base
    let languagePrompt = "";

    switch (language.toLowerCase()) {
      case "english":
        languagePrompt = `
You are **Prop-E**, a professional and friendly real estate assistant.
Speak in **clear, fluent English** with a confident and natural tone.
Your goal is to sound warm, engaging, and persuasive, not robotic.`;
        break;

      case "hindi":
        languagePrompt = `
आप **Prop-E** हैं — एक दोस्ताना और भरोसेमंद रियल एस्टेट असिस्टेंट।
पूरी बातचीत **हिंदी** में करें — एक इंसान की तरह बोलें, ना कि किसी मशीन की तरह।
आपका उद्देश्य है खरीदार को संपत्ति के लिए उत्साहित और आश्वस्त करना।`;
        break;

      default:
        // Hinglish (Default)
        languagePrompt = `
You are **Prop-E**, a friendly and persuasive Indian real estate assistant.
Speak in **natural Hinglish** (mix Hindi + English) — like a helpful property consultant talking to a customer in India.
Keep your tone warm, positive, and conversational — not robotic.`;
        break;
    }

    // 🧩 Full prompt generation
    const prompt = `
${languagePrompt}

---

🎯 **Your Goal:**
Deliver a short, engaging, and persuasive property summary to potential buyer **${
      preference.name
    }**.

**Guidelines:**
1. Greet the user naturally (e.g. "Namaste ${
      preference.name
    }! Yeh property aapke liye perfect ho sakti hai.")
2. Highlight the most attractive features — focus on what matters to someone looking for a **${
      preference.type
    }** property between ₹${preference.minPrice} - ₹${preference.maxPrice}.
3. Keep it short (under 45 seconds).
4. End politely — encourage the user to explore more details, for example:
   > "You can check out more details and photos right here on this page. Happy exploring!"

---

🏠 **Property Details:**
- **Title:** ${property.title}
- **Location:** ${property.location}
- **Price:** ₹${property.price.toLocaleString()}
- **Category:** ${property.category}
- **Bedrooms:** ${property.bedrooms}
- **Amenities:** ${property.amenities?.join(", ") || "None"}
- **Features:** ${property.features?.join(", ") || "None"}
- **Description:** ${property.description}

---

🗣️ Use a confident, human-like tone and match the language style selected: **${language}**.
`;

    res.json({ prompt, language });
  } catch (err) {
    console.error("❌ Error generating prompt:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🎙️ Create a new Vapi Assistant (Hinglish voice)
export const createAssistant = async (req, res) => {
  try {
    const { propertyId, prompt } = req.body;

    // ✅ Fetch language from Admin Settings
    const adminSettings = await AdminSettings.findOne({});
    const language = adminSettings?.voiceLanguage || "Hinglish"; // Default

    const greetings = {
      hinglish:
        "Namaste! Main Prop-E bol rahi hoon. Aapke liye ek amazing property hai. Let’s explore!",
      english:
        "Hi there! I'm Prop-E, your property assistant. Let’s check out this amazing home together!",
      hindi:
        "नमस्ते! मैं प्रॉप-ई बोल रही हूँ। आपके लिए एक शानदार प्रॉपर्टी है। आइए देखते हैं!",
    };

    // 🧠 Feminine grammar + single greeting fix
    const finalPrompt = `
You are **Prop-E**, a friendly and persuasive **female** Indian real estate assistant.

🧍‍♀️ **Character Guide:**
- You are a **female voice**, always use feminine forms (e.g., “main batati hoon” not “batata hoon”).
- Speak in **natural ${language}**, mixing Hindi and English smoothly if it's Hinglish.
- Keep your tone confident, warm, and human — never robotic.
- Do **not** start every response with greetings like “Namaste” — that should only be said at the start of the call.
- Avoid repeating information unless asked.
- Before ending your response, always add a polite line like: "If you have any question then feel free to ask."

---

${prompt}
`;

    // ✅ Create the assistant
    const assistant = await vapi.assistants.create({
      name: `Prop-E ${language} Assistant`,
      model: {
        provider: "openai",
        model: "gpt-4o-mini",
        systemPrompt: finalPrompt,
      },
      voice: {
        provider: "vapi",
        voiceId: "Neha", // female Indian-American accent
      },
      transcriber: {
        provider: "deepgram",
        language: "en",
      },
      // 👇 Only greet once at the start
      firstMessage: greetings[language.toLowerCase()] || greetings.hinglish,
    });

    return res.status(200).json({
      success: true,
      assistantId: assistant.id,
    });
  } catch (error) {
    console.error("❌ Error creating assistant:", error);
    return res.status(500).json({
      success: false,
      message:
        error.body?.message || error.message || "Failed to create assistant",
      details: error.body || {},
    });
  }
};

export const createCustomerAssistant = async (req, res) => {
  try {
    const WEBHOOK_URL =
      "https://ad54a224df68.ngrok-free.app/api/vapi/save-lead";

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

    // ✅ No structuredOutputs property here
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

    const { message, data } = req.body || {};
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
    const assistantId =
      process.env.CUSTOMER_ASSISTANT_ID ||
      "169e7d86-11a9-475f-a055-4d4bd10ada9d"; // fallback

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

// In handleVapiWebhook (backend code)
export const handleVapiWebhook = async (req, res) => {
  try {
    const event = req.body;
    const eventType = event.message?.type || event.type;
    console.log(`📩 Vapi webhook event: ${eventType}`);

    switch (
      eventType // ⭐ FIX: Use the end-of-call-report to grab the final data
    ) {
      case "end-of-call-report": {
        console.log("✅ Call ended. Processing report for data saving...");

        const report = event.report || event.message?.report;
        if (!report?.messages) {
          console.log(
            "⚠️ No report.messages found:",
            JSON.stringify(event, null, 2)
          );
          return res.status(200).json({ success: true });
        }

        const finalAssistantMessage = report.messages.slice(-1)[0]?.content;
        if (!finalAssistantMessage) {
          console.log("No final assistant message found in report.");
          return res.status(200).json({ success: true });
        }

        const jsonMatch = finalAssistantMessage.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const customerData = JSON.parse(jsonMatch[0].trim());
            console.log("📦 Extracted Customer Data:", customerData);

            const response = await fetch(
              "http://localhost:5001/api/assistant/create-customer-record",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(customerData),
              }
            );
            const result = await response.json();
            console.log("✅ Customer record saved to DB:", result);
          } catch (parseError) {
            console.error("❌ Error parsing final JSON:", parseError);
          }
        } else {
          console.log("Final JSON summary not found in last message.");
        }

        break;
      }

      case "function-call": {
        // If you were using this, it's safer to stick to the 'end-of-call-report'
        // for final data collection. Omitted for simplicity and focus.
        break;
      }
      case "transcript":
        console.log(`${event.message.role}: ${event.message.transcript}`);
        break; // ... other cases ...
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Webhook handler error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

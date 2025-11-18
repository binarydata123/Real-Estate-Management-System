// import OpenAI from "openai";
import { Property } from "../../models/Agent/PropertyModel.js";
import { Preference } from "../../models/Common/PreferenceModel.js";
import { VapiClient } from "@vapi-ai/server-sdk";
import { AdminSettings } from "../../models/Admin/AdminSettingsModel.js";

// ✅ Create instance
const vapi = new VapiClient({ token: process.env.VAPI_SERVER_API_KEY });
// Initialize OpenAI
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// export const askQuestion = async (req, res) => {
//   const { question, propertyData } = req.body;

//   if (!question || !propertyData) {
//     return res
//       .status(400)
//       .json({ message: "Question and property data are required." });
//   }

//   // Convert property data to a readable string for the AI
//   const context = `
//     Property Information:
//     - Title: ${propertyData.title}
//     - Type: ${propertyData.type} - ${propertyData.category}
//     - Location: ${propertyData.location}
//     - Price: ₹${propertyData.price.toLocaleString()}
//     - Description: ${propertyData.description}
//     - Bedrooms: ${propertyData.bedrooms}
//     - Bathrooms: ${propertyData.bathrooms}
//     - Built-up Area: ${propertyData.built_up_area} ${
//     propertyData.unit_area_type
//   }
//     - Furnishing: ${propertyData.furnishing}
//     - Features: ${propertyData.features.join(", ")}
//     - Amenities: ${propertyData.amenities.join(", ")}
//   `;

//   try {
//     const completion = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [
//         {
//           role: "system",
//           content:
//             "You are an expert real estate sales assistant. Your goal is to answer user questions and persuade them to be interested in the property. Answer concisely and with a positive, confident tone. Do not mention you are an AI. If a detail isn't available, frame it as an opportunity for a follow-up, for example: 'That's a great question, I would be happy to find that specific detail for you.'",
//         },
//         {
//           role: "user",
//           content: `Context:\n${context}\n\nQuestion: ${question}`,
//         },
//       ],
//       temperature: 0.5,
//       max_tokens: 100,
//     });

//     res.json({ answer: completion.choices[0].message.content.trim() });
//   } catch (error) {
//     console.error("Error calling OpenAI:", error);
//     res
//       .status(500)
//       .json({ message: "Failed to get a response from the AI assistant." });
//   }
// };

// export const generateSpeech = async (req, res) => {
//   const { text } = req.body;

//   if (!text) {
//     return res.status(400).json({ message: "Text to speak is required." });
//   }

//   try {
//     // Using OpenAI's TTS for a simple, cost-effective solution during development.
//     const mp3 = await openai.audio.speech.create({
//       model: "tts-1", // A cost-effective and fast model.
//       voice: "alloy", // A clear, professional female voice.
//       input: text,
//       response_format: "mp3",
//       speed: 0.95,
//     });

//     res.setHeader("Content-Type", "audio/mpeg");
//     // Stream the audio buffer back to the client.
//     res.send(Buffer.from(await mp3.arrayBuffer()));
//   } catch (error) {
//     console.error("Error calling OpenAI TTS:", error);
//     res
//       .status(500)
//       .json({ message: "Failed to generate speech from the AI assistant." });
//   }
// };

// 🎯 Generate Property Prompt (Dynamic Language Support)
export const propertyPrompt = async (req, res) => {
  try {
    const { propertyId, userId } = req.params;

    const property = await Property.findById(propertyId);
    const preference = await Preference.findOne({ userId });

    if (!property || !preference) {
      return res
        .status(404)
        .json({ message: "Property or Preference not found" });
    }

    const adminSettings = await AdminSettings.findOne({});
    const language = adminSettings?.voiceLanguage || "Hinglish";

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
        languagePrompt = `
You are **Prop-E**, a friendly and persuasive Indian real estate assistant.
Speak in **natural Hinglish** — warm, positive and conversational.`;
        break;
    }

    const prompt = `
${languagePrompt}

---

🎯 **Your Goal:** Create a short and persuasive summary for **${
      preference.name
    }**.

🏠 **Property Details:**
- Title: ${property.title}
- Location: ${property.location}
- Price: ₹${property.price.toLocaleString()}
- Category: ${property.category}
- Bedrooms: ${property.bedrooms}
- Amenities: ${property.amenities?.join(", ") || "None"}
- Features: ${property.features?.join(", ") || "None"}
- Description: ${property.description}

Match the language style: **${language}**
`;

    return res.json({ prompt, language });
  } catch (err) {
    console.error("❌ Error generating prompt:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// 🎙️ Create a new Vapi Assistant (Hinglish voice)
export const createAssistant = async (req, res) => {
  try {
    const { prompt } = req.body;

    // Get admin language setting
    const adminSettings = await AdminSettings.findOne({});
    const language = adminSettings?.voiceLanguage || "Hinglish";

    const greetings = {
      hinglish:
        "Namaste! Main Prop-E bol rahi hoon. Aapke liye ek amazing property hai. Let’s explore!",
      english:
        "Hi there! I'm Prop-E, your property assistant. Let’s check out this amazing home together!",
      hindi:
        "नमस्ते! मैं प्रॉप-ई बोल रही हूँ। आपके लिए एक शानदार प्रॉपर्टी है। आइए देखते हैं!",
    };

    // Build final system prompt
    const finalPrompt = `
You are **Prop-E**, a friendly and persuasive **female** Indian real estate assistant.

🧍‍♀️ **Character Guide:**
- You are a **female voice**, always use feminine forms (e.g., “batati hoon”, never “batata hoon”).
- Speak in **natural ${language}**.
- Keep tone confident, warm, human — never robotic.
- Only greet ONCE at the beginning of the call.
- Avoid repetition unless asked.
- End politely: "If you have any question then feel free to ask."

---

${prompt}
`;

    // Create assistant
    const assistant = await vapi.assistants.create({
      name: `Prop-E ${language} Assistant`,
      model: {
        provider: "openai",
        model: "gpt-4o-mini",
        systemPrompt: finalPrompt,
      },
      voice: {
        provider: "vapi",
        voiceId: "Neha",
      },
      transcriber: {
        provider: "deepgram",
        language: "en",
      },
      firstMessage: greetings[language.toLowerCase()] || greetings.hinglish,
    });

    return res.status(200).json({
      success: true,
      assistantId: assistant.id,
    });
  } catch (error) {
    console.error("❌ Error creating assistant:", error); // allowed in backend
    return res.status(500).json({
      success: false,
      message:
        error.body?.message || error.message || "Failed to create assistant",
      details: error.body || {},
    });
  }
};

export const startPreferenceSession = async (req, res) => {
  try {
    const { assistantId, userId, propertyId } = req.body;

    const property = await Property.findById(propertyId);
    const preference = await Preference.findOne({ userId });

    const session = await vapi.sessions.create({
      assistantId,
      metadata: { userId, propertyId },
    });

    return res.json({
      success: true,
      sessionId: session.id,
      property,
      preference,
    });
  } catch (error) {
    console.error("❌ Error starting call:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

import OpenAI from "openai";
import { Property } from "../../models/Agent/PropertyModel.js";
import { Preference } from "../../models/Common/PreferenceModel.js";
import { VapiClient } from "@vapi-ai/server-sdk";
import PropertyAICache from "../../models/AI/PropertyAICache.js";
import { AdminSettings } from "../../models/Admin/AdminSettingsModel.js";

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

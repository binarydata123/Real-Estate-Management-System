import OpenAI from "openai";
import { Property } from "../../models/Agent/PropertyModel.js";
import { Preference } from "../../models/Common/PreferenceModel.js";
// Make sure to set your OPENAI_API_KEY in your .env file
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const askQuestion = async (req, res) => {
    const { question, propertyData } = req.body;

    if (!question || !propertyData) {
        return res.status(400).json({ message: "Question and property data are required." });
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
    - Built-up Area: ${propertyData.built_up_area} ${propertyData.unit_area_type}
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
                    content: "You are an expert real estate sales assistant. Your goal is to answer user questions and persuade them to be interested in the property. Answer concisely and with a positive, confident tone. Do not mention you are an AI. If a detail isn't available, frame it as an opportunity for a follow-up, for example: 'That's a great question, I would be happy to find that specific detail for you.'",
                },
                { role: "user", content: `Context:\n${context}\n\nQuestion: ${question}` },
            ],
            temperature: 0.5,
            max_tokens: 100,
        });

        res.json({ answer: completion.choices[0].message.content.trim() });
    } catch (error) {
        console.error("Error calling OpenAI:", error);
        res.status(500).json({ message: "Failed to get a response from the AI assistant." });
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
            model: 'tts-1', // A cost-effective and fast model.
            voice: 'alloy',  // A clear, professional female voice.
            input: text,
            response_format: 'mp3',
            speed: 0.95,
        });

        res.setHeader("Content-Type", "audio/mpeg");
        // Stream the audio buffer back to the client.
        res.send(Buffer.from(await mp3.arrayBuffer()));
    } catch (error) {
        console.error("Error calling OpenAI TTS:", error);
        res.status(500).json({ message: "Failed to generate speech from the AI assistant." });
    }
};

export const propertyPrompt = async (req, res) => {
    try {
        const { propertyId, userId } = req.params;

        const property = await Property.findById(propertyId);
        const preference = await Preference.findOne({ userId: userId });

        if (!property || !preference) {
            return res.status(404).json({ message: "Property or Preference not found" });
        }

        // Build prompt dynamically
        const prompt = `You are an expert real estate sales assistant named Prop-E. Your goal is to deliver a compelling, friendly, and persuasive summary of the property below to a potential buyer named ${preference.name}.

**Your Task:**
1.  Start immediately by greeting the user and presenting the property highlights. Do not ask any questions.
2.  Focus on the most attractive features that align with a buyer looking for a ${preference.type} property in the price range of ₹${preference.minPrice} to ₹${preference.maxPrice}.
3.  Keep the summary concise, under 45 seconds.
4.  End by encouraging the user to explore more details on the page. For example: "You can find more details and pictures right here on this page. Happy exploring!"

**Property Details:**
Title: ${property.title}
Location: ${property.location}
Price: ₹${property.price}
Category: ${property.category}
Bedrooms: ${property.bedrooms}
Amenities: ${property.amenities?.join(", ") || "None"}
Features: ${property.features?.join(", ") || "None"}
Description: ${property.description}`;

        res.json({ prompt });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}
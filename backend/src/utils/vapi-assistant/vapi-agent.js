import Vapi from "@vapi-ai/sdk";
import dotenv from "dotenv";
dotenv.config();

const vapi = new Vapi(process.env.VAPI_API_KEY);

// Define the agent
const agent = await vapi.agents.create({
  name: "Customer Onboarding Assistant",
  model: "gpt-4o-mini",
  voice: "alloy", // optional, if voice needed
  systemPrompt: `
You are a friendly customer onboarding assistant.
Guide the user through filling out a customer form for our CRM.
Ask for each field one by one.
If a field is optional, tell the user they can say "skip" to move on.
Validate responses (like valid phone, numbers, email).
After collecting all required data, call the function 'createCustomerRecord'.
End conversation after successful creation.`,
  functions: [
    {
      name: "createCustomerRecord",
      description: "Send collected customer data to backend API",
      parameters: {
        type: "object",
        properties: {
          fullName: { type: "string" },
          phoneNumber: { type: "string" },
          email: { type: "string" },
          whatsAppNumber: { type: "string" },
          minimumBudget: { type: "number" },
          maximumBudget: { type: "number" },
          leadSource: { type: "string" },
          initialNotes: { type: "string" },
        },
        required: ["fullName", "phoneNumber"],
      },
    },
  ],
});

console.log("✅ Vapi agent created:", agent.id);

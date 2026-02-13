import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import "dotenv/config";

// Models
import { Customer } from "../models/Agent/CustomerModel.js";
import CustomerSettings from "../models/Customer/SettingsModel.js";

/**
 * 🧰 CREATE CUSTOMER TOOL (UNCHANGED)
 */
const createCustomerTool = (agencyId) =>
    new DynamicStructuredTool({
        name: "create_new_customer",
        description:
            "Create a new customer when both fullName and phoneNumber are available.",
        schema: z.object({
            fullName: z.string(),
            phoneNumber: z
                .string()
                .transform((val) => val.replace(/\D/g, ""))
                .refine((val) => /^[0-9]{10}$/.test(val), {
                    message:
                        "Invalid phone number. Please provide a valid 10-digit mobile number.",
                }),
        }),

        func: async ({ fullName, phoneNumber }) => {
            try {
                const cleanedPhone = phoneNumber.replace(/\s+/g, "");

                const existingCustomer = await Customer.findOne({
                    phoneNumber: cleanedPhone,
                    agencyId,
                    isDeleted: false,
                });

                if (existingCustomer) {
                    return "Customer already exists with this phone number.";
                }

                const customer = new Customer({
                    fullName,
                    phoneNumber: cleanedPhone,
                    agencyId,
                });

                const savedCustomer = await customer.save();

                await CustomerSettings.create({
                    userId: savedCustomer._id,
                    security: { twoFactorAuth: false },
                });

                return `Success! Customer ${fullName} created`;
            } catch (error) {
                console.error("CREATE CUSTOMER ERROR:", error);
                return `Error while saving: ${error.message}`;
            }
        },
    });

/**
 * 🧰 FIND CUSTOMER TOOL (NEW)
 */
const findCustomerTool = (agencyId) =>
    new DynamicStructuredTool({
        name: "find_customer",
        description:
            "Find a customer by full name when user asks to search or find a customer.",
        schema: z.object({
            fullName: z.string(),
        }),

        func: async ({ fullName }) => {
            try {
                const customers = await Customer.find({
                    agencyId,
                    isDeleted: false,
                    fullName: { $regex: fullName, $options: "i" },
                }).limit(5);

                if (!customers.length) {
                    return `No customer found with name ${fullName}`;
                }

                return `Found customers: ${customers
                    .map((c) => `${c.fullName} (${c.phoneNumber})`)
                    .join(", ")}`;
            } catch (e) {
                console.error("FIND CUSTOMER ERROR:", e);
                return "Error while searching customer";
            }
        },
    });

/**
 * 🤖 LLM MODEL
 */
const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    apiKey: process.env.GOOGLE_API_KEY,
});

/**
 * 💾 MEMORY
 */
const memory = new MemorySaver();

/**
 * 🚀 MAIN FUNCTION
 */
export const handleVoiceCommand = async (
    userInput,
    agencyId,
    threadId
) => {
    try {
        // 🔥 BOTH TOOLS
        const tools = [
            createCustomerTool(agencyId),
            findCustomerTool(agencyId),
        ];

        const agent = createReactAgent({
            llm: model,
            tools,
            checkpointSaver: memory,
            prompt: `
You are a Real Estate Voice Assistant.

INTENTS:
- If user wants to create customer → use create_new_customer tool.
- If user wants to find/search customer → use find_customer tool.

RULES:
- Ask ONLY ONE question at a time.
- Be short, natural, conversational.
- Do NOT ask for phone number when searching.
`,
        });

        const result = await agent.invoke(
            {
                messages: [{ role: "user", content: userInput }],
            },
            {
                configurable: { thread_id: threadId },
            }
        );

        const lastMessage = result.messages.at(-1);
        const replyText = lastMessage?.content || "Okay";

        /**
         * 🔥 SIMPLE INTENT DETECTOR (FOR UI)
         * create flow untouched
         */
        let intent = null;
        let name = null;

        if (/find|search/i.test(userInput)) {
            intent = "find_customer";

            const match = userInput.match(/name\s*(is)?\s*([a-zA-Z\s]+)/i);
            if (match) {
                name = match[2]?.trim();
            }
        }

        return {
            reply: replyText,
            intent,
            name,
        };
    } catch (error) {
        console.error("Agent Error:", error);
        return {
            reply: "Sorry, I am unable to process your request right now.",
        };
    }
};

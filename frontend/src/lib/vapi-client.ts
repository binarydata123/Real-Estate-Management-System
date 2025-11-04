import Vapi from "@vapi-ai/web";

const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY!;
export const vapi = new Vapi(apiKey);

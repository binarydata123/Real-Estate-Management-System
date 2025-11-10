import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const URL = new Vapi(process.env.API_URL);
export async function createCustomerRecord(params) {
  const response = await fetch(`${URL}/agent/customers/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const result = await response.json();
  return result;
}

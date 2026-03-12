// import express from "express";
// import { WebSocket } from "ws";

// const router = express.Router();

// router.post("/chat", async (req, res) => {
//   const { message } = req.body;
//   const token = process.env.NEXT_PUBLIC_OPENCLAW_TOKEN;

//   const ws = new WebSocket(`ws://127.0.0.1:18789?token=${token}`);

//   ws.on("message", async (data) => {
//     const evt = JSON.parse(data);

//     if (evt?.event === "connect.challenge") {
//       ws.send(
//         JSON.stringify({
//           type: "connect",
//           nonce: evt.payload.nonce,
//           auth: { token: token },
//         }),
//       );
//     }

//     if (evt?.event === "connect.ready") {
//       ws.send(
//         JSON.stringify({
//           jsonrpc: "2.0",
//           id: 1,
//           method: "chat",
//           params: { message },
//         }),
//       );
//     }

//     if (evt?.result || evt?.params?.message) {
//       res.json({
//         reply: evt?.result?.message || evt?.params?.message,
//       });
//       ws.close();
//     }
//   });

//   ws.on("error", () => {
//     res.status(500).json({ reply: "OpenClaw connection failed" });
//   });
// });

// export default router;

import express from "express";

const router = express.Router();

// router.post("/chat", async (req, res) => {
//   const { message } = req.body;

//   // 🚨 SECURITY: Your OpenClaw Gateway Token goes here!
//   const OPENCLAW_TOKEN = "b13d857976f18276854f5e6b05bf15decf5794a64b7714fd";

//   // 👇 Get the Auth Token, Agency ID, AND User ID from your backend auth middleware!
//   const userToken = req.headers.authorization;
//   const agencyId = req.user?.agencyId || "AGENCY_ID_HERE";
//   const userId = req.user?._id || req.user?.id || "USER_ID_HERE"; // Make sure to get this!

//   try {
//     const response = await fetch("http://127.0.0.1:18789/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${OPENCLAW_TOKEN}`,
//         "x-openclaw-agent-id": "main",
//       },
//       body: JSON.stringify({
//         model: "openclaw",
//         messages: [
//           {
//             role: "system",
//             content: `You are a strict CRM API Assistant. Do NOT use WhatsApp or any other external communication tools. Your ONLY job is to manage the CRM database using the 'exec' tool to run 'curl' commands against the backend API.

//     CONTEXT:
//     - userId: ${userId}
//     - agencyId: ${agencyId}
//     - userToken: ${userToken}
//     - baseUrl: http://localhost:5001/api

//     RULES FOR SCHEDULING A MEETING:
//     1. First, you MUST run a curl GET request to \`\${baseUrl}/agent/customers/get-all?userId=\${userId}\` with header \`Authorization: \${userToken}\`.
//     2. Read the JSON response to find the customer's \`_id\` matching the requested name.
//     3. Once you have the \`_id\`, you MUST run a curl POST request to \`\${baseUrl}/agent/meetings/create\` with header \`Authorization: \${userToken}\` and \`Content-Type: application/json\`.
//     4. The POST body must be JSON: {"customerId": "<id>", "date": "YYYY-MM-DD", "time": "HH:MM"}.
//     5. Reply to the user ONLY after the curl command succeeds. Do not ask for phone numbers.`,
//           },
//           { role: "user", content: message },
//         ],
//       }),
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error("OpenClaw API error:", response.status, errorText);
//       return res
//         .status(response.status)
//         .json({ reply: "Error: Gateway rejected request" });
//     }

//     const data = await response.json();
//     const replyText = data.choices[0].message.content;
//     res.json({ reply: replyText });
//   } catch (error) {
//     console.error("Error talking to OpenClaw:", error);
//     res
//       .status(500)
//       .json({ reply: "Error: Could not connect to OpenClaw Gateway." });
//   }
// });



router.post("/chat", async (req, res) => {
  const { message } = req.body;

  // 🚨 SECURITY: Your OpenClaw Gateway Token goes here!
  const OPENCLAW_TOKEN = "b13d857976f18276854f5e6b05bf15decf5794a64b7714fd";

  // 👇 Get the Auth Token, Agency ID, AND User ID from your backend auth middleware!
  const userToken = req.headers.authorization;
  const agencyId = req.user?.agencyId || "AGENCY_ID_HERE";
  const userId = req.user?._id || req.user?.id || "USER_ID_HERE"; 

  try {
    const response = await fetch("http://127.0.0.1:18789/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENCLAW_TOKEN}`,
        "x-openclaw-agent-id": "main",
      },
      body: JSON.stringify({
        model: "openclaw",
        messages: [
          {
            role: "system",
            content: `You are a strict internal API Assistant for our platform. Do NOT use WhatsApp, email, or external communication tools. 
            Your ONLY job is to execute user commands by looking up your configured SKILL files and using the 'exec' tool to run 'curl' commands against our backend API.

            GLOBAL API CONTEXT:
            - userId: ${userId}
            - agencyId: ${agencyId}
            - userToken: ${userToken}
            - baseUrl: http://localhost:5001/api

            STRICT RULES:
            1. ALWAYS use the 'exec' tool with 'curl' to interact with the API.
            2. ALWAYS include the header: -H "Authorization: ${userToken}"
            3. NEVER ask the user for external phone numbers. Perform the action directly via the API.
            4. Reply to the user ONLY after the API curl command succeeds or fails, summarizing the result.`,
          },
          { role: "user", content: message },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenClaw API error:", response.status, errorText);
      return res
        .status(response.status)
        .json({ reply: "Error: Gateway rejected request" });
    }

    const data = await response.json();
    const replyText = data.choices[0].message.content;
    res.json({ reply: replyText });
  } catch (error) {
    console.error("Error talking to OpenClaw:", error);
    res
      .status(500)
      .json({ reply: "Error: Could not connect to OpenClaw Gateway." });
  }
});

export default router;
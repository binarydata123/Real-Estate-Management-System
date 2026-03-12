const BACKEND_URL = "http://localhost:5001"; 

export async function sendMessageToOpenClaw(userMessage: string): Promise<string> {
  try {
    // Optional: If your Express backend uses this token to verify the user is logged into your website, you can send it.
    const userToken = typeof window !== "undefined" ? localStorage.getItem("openClawToken") : null;

    // Send the user's message to YOUR Express backend
    const response = await fetch(`${BACKEND_URL}/api/openclaw/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${userToken}` // Uncomment this if your backend uses authentication middleware
      },
      body: JSON.stringify({ message: userMessage }),
    });

    if (!response.ok) {
      console.error("Backend error:", response.status);
      return `⚠️ Error ${response.status}: Server rejected request.`;
    }

    const data = await response.json();
    
    // Return the string response from the backend
    return data.reply || "No response received.";

  } catch (error) {
    console.error("Error talking to backend:", error);
    return "⚠️ Error: Could not connect to the backend server.";
  }
}
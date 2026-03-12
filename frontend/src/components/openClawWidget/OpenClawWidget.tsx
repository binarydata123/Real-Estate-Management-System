// "use client";
// import { useState, useEffect, useRef, useCallback } from "react";
// import { Bot, X, Send, Loader2 } from "lucide-react";
// import { sendMessageToOpenClaw } from "../../utils/openClawApi"; // Adjust path

// const OpenClawWidget = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [input, setInput] = useState("");
//   const [messages, setMessages] = useState<
//     { role: "bot" | "user"; text: string; timestamp?: Date }[]
//   >([{ role: "bot", text: "Ready for commands.", timestamp: new Date() }]);
//   const [isLoading, setIsLoading] = useState(false);

//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null);

//   // Auto-scroll
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const handleSend = useCallback(async () => {
//     if (!input.trim() || isLoading) return;

//     const userMessage = input.trim();

//     // Add user message
//     setMessages((prev) => [
//       ...prev,
//       { role: "user", text: userMessage, timestamp: new Date() },
//     ]);
//     setInput("");
//     setIsLoading(true);

//     // Get bot response via Backend API
//     const botReply = await sendMessageToOpenClaw(userMessage);

//     // Add bot message
//     setMessages((prev) => [
//       ...prev,
//       { role: "bot", text: botReply, timestamp: new Date() },
//     ]);
//     setIsLoading(false);
//   }, [input, isLoading]);

//   return (
//     <div className="fixed bottom-6 right-6 z-50 font-sans">
//       {isOpen && (
//         <div className="mb-4 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden h-[600px]">
//           {/* Header */}
//           <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3 flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
//                 <Bot className="w-5 h-5 text-white" />
//               </div>
//               <div>
//                 <p className="text-white font-semibold text-sm">
//                   OpenClaw Assistant
//                 </p>
//                 <div className="flex items-center gap-1.5 mt-0.5">
//                   <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
//                   <p className="text-xs text-green-400">Online</p>
//                 </div>
//               </div>
//             </div>
//             <button
//               onClick={() => setIsOpen(false)}
//               className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-700 rounded-lg"
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>

//           {/* Messages */}
//           <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-slate-50">
//             {messages.map((msg, i) => (
//               <div
//                 key={i}
//                 className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
//               >
//                 <div
//                   className={`max-w-[85%] px-4 py-2.5 text-sm shadow-sm ${
//                     msg.role === "user"
//                       ? "bg-blue-600 text-white rounded-2xl rounded-tr-none"
//                       : msg.text.startsWith("⚠️")
//                         ? "bg-red-50 text-red-800 rounded-2xl border border-red-200"
//                         : "bg-white text-slate-800 rounded-2xl rounded-tl-none border border-gray-100"
//                   }`}
//                 >
//                   <p className="whitespace-pre-wrap break-words">{msg.text}</p>
//                   {msg.timestamp && (
//                     <p
//                       className={`text-[10px] mt-1 ${
//                         msg.role === "user" ? "text-blue-200" : "text-slate-400"
//                       }`}
//                     >
//                       {msg.timestamp.toLocaleTimeString()}
//                     </p>
//                   )}
//                 </div>
//               </div>
//             ))}
//             {isLoading && (
//               <div className="flex justify-start">
//                 <div className="bg-white text-slate-800 rounded-2xl rounded-tl-none px-4 py-2 border border-gray-100">
//                   <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
//                 </div>
//               </div>
//             )}
//             <div ref={messagesEndRef} />
//           </div>

//           {/* Input */}
//           <div className="p-3 bg-white border-t border-gray-100">
//             <div className="flex gap-2">
//               <input
//                 ref={inputRef}
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 onKeyDown={(e) => e.key === "Enter" && handleSend()}
//                 placeholder={
//                   !localStorage.getItem("openClawToken")
//                     ? "Please log in first..."
//                     : isLoading
//                       ? "Thinking..."
//                       : "Type a message..."
//                 }
//                 disabled={isLoading || !localStorage.getItem("openClawToken")}
//                 className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50 disabled:bg-slate-100"
//               />
//               <button
//                 onClick={handleSend}
//                 disabled={
//                   !input.trim() ||
//                   isLoading ||
//                   !localStorage.getItem("openClawToken")
//                 }
//                 className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 shadow-sm"
//               >
//                 <Send className="w-4 h-4" />
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Toggle Button */}
//       {!isOpen && (
//         <button
//           onClick={() => setIsOpen(true)}
//           className="group w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 hover:bg-blue-700 transition-all duration-200 relative"
//         >
//           <Bot className="w-7 h-7 group-hover:rotate-12 transition-transform" />
//           {!localStorage.getItem("openClawToken") && (
//             <span
//               className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full"
//               title="Not logged in"
//             />
//           )}
//         </button>
//       )}
//     </div>
//   );
// };

// export default OpenClawWidget;

"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Bot, X, Send, Loader2, Mic, MicOff } from "lucide-react";
import { sendMessageToOpenClaw } from "../../utils/openClawApi"; // Adjust path

// Define proper types for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onstart: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: { new (): SpeechRecognition };
    webkitSpeechRecognition: { new (): SpeechRecognition };
  }
}

const OpenClawWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: "bot" | "user"; text: string; timestamp?: Date }[]
  >([{ role: "bot", text: "Ready for commands.", timestamp: new Date() }]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Voice Recognition Handler
  const startListening = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(
        "Your browser does not support Voice Recognition (Try Chrome/Edge/Safari).",
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        // Optional: If you want it to send automatically after you stop talking, uncomment the next line:
        // setTimeout(() => document.getElementById("send-btn")?.click(), 100);
      };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Voice recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();

    // Add user message
    setMessages((prev) => [
      ...prev,
      { role: "user", text: userMessage, timestamp: new Date() },
    ]);
    setInput("");
    setIsLoading(true);

    // Get bot response via Backend API
    const botReply = await sendMessageToOpenClaw(userMessage);

    // Add bot message
    setMessages((prev) => [
      ...prev,
      { role: "bot", text: botReply, timestamp: new Date() },
    ]);
    setIsLoading(false);
  }, [input, isLoading]);

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {isOpen && (
        <div className="mb-4 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden h-[600px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">
                  OpenClaw Assistant
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  <p className="text-xs text-green-400">Online</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-slate-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 text-sm shadow-sm ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-2xl rounded-tr-none"
                      : msg.text.startsWith("⚠️")
                        ? "bg-red-50 text-red-800 rounded-2xl border border-red-200"
                        : "bg-white text-slate-800 rounded-2xl rounded-tl-none border border-gray-100"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                  {msg.timestamp && (
                    <p
                      className={`text-[10px] mt-1 ${
                        msg.role === "user" ? "text-blue-200" : "text-slate-400"
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-slate-800 rounded-2xl rounded-tl-none px-4 py-2 border border-gray-100">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100">
            <div className="flex gap-2">
              {/* Voice Button */}
              <button
                onClick={startListening}
                disabled={isLoading || !localStorage.getItem("openClawToken")}
                className={`p-3 rounded-xl transition-all shadow-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${
                  isListening
                    ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
                title="Speak your command"
              >
                {isListening ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>

              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={
                  !localStorage.getItem("openClawToken")
                    ? "Please log in first..."
                    : isListening
                      ? "Listening..."
                      : isLoading
                        ? "Thinking..."
                        : "Type or speak..."
                }
                disabled={isLoading || !localStorage.getItem("openClawToken")}
                className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50 disabled:bg-slate-100"
              />

              <button
                id="send-btn"
                onClick={handleSend}
                disabled={
                  !input.trim() ||
                  isLoading ||
                  !localStorage.getItem("openClawToken")
                }
                className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 shadow-sm flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 hover:bg-blue-700 transition-all duration-200 relative"
        >
          <Bot className="w-7 h-7 group-hover:rotate-12 transition-transform" />
          {!localStorage.getItem("openClawToken") && (
            <span
              className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full"
              title="Not logged in"
            />
          )}
        </button>
      )}
    </div>
  );
};

export default OpenClawWidget;
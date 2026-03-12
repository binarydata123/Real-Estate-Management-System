"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface OpenClawConfig {
  url?: string;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  token?: string; // Optional - will use env if not provided
}

export const useOpenClaw = (config: OpenClawConfig = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = config.maxReconnectAttempts || 3;
  const connectionTimeoutRef = useRef<NodeJS.Timeout>();

  // Get token from env (Next.js exposes env vars with NEXT_PUBLIC_ prefix)
  const getToken = useCallback(() => {
    // Priority: 1. config.token, 2. env var, 3. localStorage
    return (
      config.token || 
      process.env.NEXT_PUBLIC_OPENCLAW_TOKEN || 
      localStorage.getItem("openClawToken") || 
      ""
    );
  }, [config.token]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || connecting) {
      return;
    }

    setConnecting(true);
    setError(null);

    const endpoint = config.url || "ws://127.0.0.1:18789";
    const token = getToken();

    console.log(`Connecting to OpenClaw at ${endpoint}...`);
    console.log("Token available:", token ? "✅ Yes" : "❌ No");

    try {
      const ws = new WebSocket(endpoint);

      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }

      connectionTimeoutRef.current = setTimeout(() => {
        if (!isConnected && connecting) {
          console.log("Connection timeout");
          setError("Connection timeout");
          ws.close();
          setConnecting(false);
        }
      }, 10000);

      ws.onopen = () => {
        console.log("WebSocket connection established");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Received:", data);

          if (data.type === "event" && data.event === "connect.challenge") {
            console.log("Challenge received, sending auth request...");
            
            // CORRECT FORMAT with token from env
            const authRequest = {
              type: "req",
              id: `connect-${Date.now()}`,
              method: "connect",
              params: {
                minProtocol: 3,
                maxProtocol: 3,
                client: {
                  id: "gateway-client",
                  version: "dev",
                  platform: navigator?.platform?.toLowerCase() || "web",
                  mode: "backend",
                  instanceId: `web-client-${Date.now()}`
                },
                role: "operator",
                scopes: ["operator.admin"],
                caps: [],
                auth: {
                  token: token // 👈 Using token from env!
                }
              }
            };

            console.log("Sending auth request with token");
            ws.send(JSON.stringify(authRequest));
            return;
          }

          if (data.type === "res" && data.id?.startsWith("connect-")) {
            console.log("Response:", data);  console.log("❌ ERROR RESPONSE:");
            console.log("Error code:", data.error?.code);
            console.log("Error message:", data.error?.message);
            console.log("Full error:", JSON.stringify(data.error, null, 2));
            if (data.ok === true) {
              console.log("✅ Authentication successful!");
              setIsConnected(true);
              setConnecting(false);
              setError(null);
              reconnectAttempts.current = 0;
            } else {
             console.error("Full error details:", JSON.stringify(data.error, null, 2));       
              setLastMessage(
                        `Error: ${data.error?.message || JSON.stringify(data.error)}`,
                      );
            setError(data.error?.message || "Authentication failed");
              setIsConnected(false);
              setConnecting(false);
            }
            
            if (connectionTimeoutRef.current) {
              clearTimeout(connectionTimeoutRef.current);
            }
            return;
          }

          // Handle regular messages after auth
          if (isConnected) {
            if (data.content || data.text || data.message) {
              setLastMessage(data.content || data.text || data.message);
            } else if (typeof data === "string") {
              setLastMessage(data);
            }
          }
        } catch {
          if (isConnected) {
            setLastMessage(event.data);
          }
        }
      };

      ws.onerror = () => {
        setError("Connection error");
      };

      ws.onclose = (event) => {
        console.log(`Disconnected: ${event.reason || "Connection closed"}`);
        setIsConnected(false);
        setConnecting(false);

        if (reconnectAttempts.current < maxReconnectAttempts && config.autoReconnect !== false) {
          reconnectAttempts.current++;
          console.log(`Reconnecting (${reconnectAttempts.current}/${maxReconnectAttempts})...`);
          setTimeout(() => connect(), 2000);
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error("Connection exception:", err);
      setError("Failed to connect");
      setConnecting(false);
    }
  }, [config.url, config.autoReconnect, connecting, getToken, isConnected, maxReconnectAttempts]);
const sendCommand = useCallback(
  (command: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && isConnected) {
      const token = getToken();

      // const message = {
      //   type: "req",
      //   id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      //   method: "call",
      //   params: {
      //     service: "llm", // Try "llm" instead of "ai"
      //     method: "chat",
      //     args: [
      //       {
      //         messages: [{ role: "user", content: command }],
      //       },
      //     ],
      //     auth: { token },
      //   },
      // };



      const message = {
        type: "req",
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        method: "call",
        params: {
          service: "completions",
          method: "create",
          args: [
            {
              model: "gpt-3.5-turbo", // Try adding model
              messages: [{ role: "user", content: command }],
            },
          ],
          auth: { token: token },
        },
      };
      wsRef.current.send(JSON.stringify(message));
    }
  },
  [isConnected, getToken],
);
  const disconnect = useCallback(() => {
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
      setConnecting(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    connecting,
    lastMessage,
    error,
    sendCommand,
    connect,
    disconnect,
  };
};
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/auth-context";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCommentDots } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "../hooks/use-translation";
import { Button } from "./base/Button";
import { TextField } from "./base/TextField";
import { Badge } from "./base/Badge";
import { Card } from "./base/Card";
import { cn } from "../lib/utils";

type ChatMessage = {
  sender: string;
  text: string;
  timestamp?: string;
};

export default function GlobalChatUI() {
  const { user, authloading } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [connected, setConnected] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<number | null>(null);
  const intentionalCloseRef = useRef<boolean>(false);
  const { t } = useTranslation();

  const wsUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}/api/chat/ws`;
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (authloading || !user || !wsUrl) return;

    let active = true;

    const connect = () => {
      intentionalCloseRef.current = false;
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        if (!active) return;
        setConnected(true);
      };

      socket.onclose = (event) => {
        if (!active) return;
        setConnected(false);

        // Only reconnect if close wasn't intentional and code indicates we should retry
        const shouldReconnect =
          !intentionalCloseRef.current &&
          event.code !== 1000 &&
          event.code !== 1001;

        if (shouldReconnect) {
          reconnectRef.current = window.setTimeout(connect, 2000);
        }
      };

      socket.onerror = () => {
        // Mark as intentional close to prevent reconnection
        if (!active) {
          intentionalCloseRef.current = true;
        }
        // Close with proper code to avoid browser error messages
        if (
          socket.readyState === WebSocket.OPEN ||
          socket.readyState === WebSocket.CONNECTING
        ) {
          socket.close(1000, "Connection error");
        }
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data as string) as ChatMessage;
          if (!data?.sender || !data?.text) return;
          setMessages((prev) => [...prev, data]);
        } catch {
          return;
        }
      };
    };

    connect();

    return () => {
      active = false;
      intentionalCloseRef.current = true;
      setConnected(false);
      if (reconnectRef.current) {
        window.clearTimeout(reconnectRef.current);
      }
      if (socketRef.current) {
        const socket = socketRef.current;
        socketRef.current = null;

        if (socket.readyState === WebSocket.OPEN) {
          socket.close(1000, "Component unmounting");
        } else if (socket.readyState === WebSocket.CONNECTING) {
          // Replace handlers with no-ops to prevent state updates and reconnection,
          // then close cleanly once the handshake completes. This avoids the browser
          // warning "WebSocket is closed before the connection is established."
          socket.onopen = () => socket.close(1000, "Component unmounting");
          socket.onerror = () => {};
          socket.onclose = () => {};
          socket.onmessage = () => {};
        }
      }
      setMessages([]);
    };
  }, [authloading, user, wsUrl]);

  if (authloading || !user) {
    return null;
  }

  const sendMessage = () => {
    const value = text.trim();
    if (
      !value ||
      !socketRef.current ||
      socketRef.current.readyState !== WebSocket.OPEN
    ) {
      return;
    }

    socketRef.current.send(JSON.stringify({ text: value }));
    setText("");
  };

  return (
    <section className="fixed right-4 bottom-4 z-30">
      {isMinimized ? (
        <Button
          variant="primary"
          size="md"
          font="display"
          onClick={() => setIsMinimized(false)}
          className={cn(
            "shadow-lg hover:shadow-xl transition-all duration-300",
            "gap-2",
          )}
          aria-label="Open global chat"
        >
          <FontAwesomeIcon icon={faCommentDots} />
          <span>Chat</span>
        </Button>
      ) : (
        <Card
          variant="elevated"
          padding="sm"
          className="w-[min(320px,calc(100vw-2rem))] shadow-2xl animate-fade-in"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCommentDots} className="text-primary" />
              <span className="font-display font-bold text-white">
                {t?.chat?.title || "Global Chat"}
              </span>
              <Badge
                variant={connected ? "success" : "neutral"}
                size="sm"
                shape="pill"
                className="animate-pulse"
              >
                {connected ? "●" : "○"}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(true)}
              className="h-8 w-8 p-0 hover:bg-slate-700/30 rounded-full"
              aria-label="Minimize global chat"
            >
              <span className="text-xl leading-none">−</span>
            </Button>
          </div>

          {/* Messages Container */}
          <div className="h-[220px] overflow-y-auto rounded-lg bg-transparent border border-slate-700 p-3 mb-3 scroll-smooth">
            {messages.length === 0 ? (
              <p className="text-sm text-slate-200 text-center py-4">
                {t?.chat?.noMessages ||
                  "No messages yet. Start the conversation!"}
              </p>
            ) : (
              <div className="space-y-2">
                {messages.map((message, index) => (
                  <div
                    key={`${message.timestamp || "no-ts"}-${index}`}
                    className={cn(
                      "pb-2 border-b border-slate-700 last:border-0",
                      "break-words text-sm",
                    )}
                  >
                    <span className="font-semibold text-primary">
                      {message.sender}:
                    </span>{" "}
                    <span className="text-slate-300">{message.text}</span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-2"
          >
            <TextField
              value={text}
              onChange={setText}
              placeholder={t?.chat?.placeholder || "Type message..."}
              variant="outlined"
              size="sm"
              className="flex-1"
              disabled={!connected}
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!connected || !text.trim()}
              className="shrink-0"
            >
              {t?.chat?.send || "Send"}
            </Button>
          </form>

          {/* Connection Status */}
          {!connected && (
            <p className="text-xs text-danger mt-2 text-center">
              {t?.chat?.disconnected || "Disconnected. Reconnecting..."}
            </p>
          )}
        </Card>
      )}
    </section>
  );
}

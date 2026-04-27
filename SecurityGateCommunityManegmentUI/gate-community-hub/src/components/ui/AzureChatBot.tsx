import { useEffect, useRef } from "react";

// Extend the Window interface to include WebChat
declare global {
  interface Window {
    WebChat?: Record<string, (...args: unknown[]) => unknown>;
  }
}

// Props: userId and username are now nullable
interface AzureChatBotProps {
  directLineSecret: string;
  userId?: string | null;
  username?: string | null;
  locale?: string;
  height?: number | string;
  width?: number | string;
}

export function AzureChatBot({
  directLineSecret,
  userId,
  username,
  locale = "en-US",
}: AzureChatBotProps) {
  const webchatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load the Web Chat script if not already loaded
    if (!window.WebChat) {
      const script = document.createElement("script");
      script.src = "https://cdn.botframework.com/botframework-webchat/latest/webchat.js";
      script.async = true;
      script.onload = renderWebChat;
      document.body.appendChild(script);
    } else {
      renderWebChat();
    }

    function renderWebChat() {
      if (window.WebChat && webchatRef.current) {
        window.WebChat.renderWebChat(
          {
            directLine: window.WebChat.createDirectLine({
              secret: directLineSecret,
            }),
            ...(userId ? { userID: userId } : {}),
            ...(username ? { username: username } : {}),
            locale: locale,
          },
          webchatRef.current
        );
      }
    }
    // Optionally, clean up on unmount
    const currentRef = webchatRef.current;
    return () => {
      if (currentRef) {
        currentRef.innerHTML = "";
      }
    };
  }, [directLineSecret, userId, username, locale]);

  return (
    // <div
    //   id="webchat"
    //   ref={webchatRef}
    //   role="main"
    //   style={{
    //     height: typeof height === "number" ? `${height}px` : height,
    //     width: typeof width === "number" ? `${width}px` : width,
    //     border: "1px solid #ccc",
    //     borderRadius: "0.5rem",
    //     overflow: "hidden",
    //     background: "var(--card, #fff)",
    //   }}
    // />
    <></>
  );
}

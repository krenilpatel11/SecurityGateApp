// src/components/layout/Layout.tsx
import type { ReactNode } from "react";
import { NavBar } from "./NavBar";
import { SideNav } from "./SideNav";
import ReactWebChat from 'botframework-webchat';
import { createDirectLine } from 'botframework-webchat';

export function Layout({ children }: { children: ReactNode }) {
  // Bot secret loaded from environment variable — never hardcode secrets
  const botSecret = import.meta.env.VITE_BOT_DIRECT_LINE_SECRET as string | undefined;
  const directLine = botSecret ? createDirectLine({ secret: botSecret }) : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Fixed top navbar */}
      <NavBar />

      {/* Body: sidebar + main content — fills remaining height */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — hidden on mobile, shown md+ */}
        <aside className="flex-shrink-0 hidden md:flex">
          <SideNav />
        </aside>

        {/* Main scrollable content area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Bot chat widget */}
      {directLine && (
        <div className="fixed bottom-6 right-6 z-[1000] w-[370px] max-w-[90vw] shadow-lg rounded-xl overflow-hidden bg-white">
          <ReactWebChat
            directLine={directLine}
            styleOptions={{
              rootHeight: 420,
              rootWidth: 370,
              backgroundColor: "#fff",
            }}
          />
        </div>
      )}
    </div>
  );
}

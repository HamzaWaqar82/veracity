"use client";

import dynamic from "next/dynamic";
import { DeferredMount } from "@/components/DeferredMount";

const ChatWidget = dynamic(() => import("@/components/chat/ChatWidget").then((m) => m.ChatWidget), {
  ssr: false,
  loading: () => null,
});

const CursorRing = dynamic(() => import("@/components/CursorRing").then((m) => m.CursorRing), {
  ssr: false,
  loading: () => null,
});

export function DeferredWidgets() {
  return (
    <>
      <DeferredMount>
        <ChatWidget />
      </DeferredMount>
      <DeferredMount>
        <CursorRing />
      </DeferredMount>
    </>
  );
}

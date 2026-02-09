"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: unknown[];
  }
}

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

async function sendInternalEvent(payload: {
  name: string;
  path?: string;
  source?: string;
  label?: string;
  value?: number;
  meta?: Record<string, unknown>;
}) {
  try {
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify(payload)
    });
  } catch {
    // Best-effort only.
  }
}

function sendGaEvent(name: string, payload: Record<string, unknown>) {
  if (!GA_ID || typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, payload);
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const search = useSearchParams();
  const queryString = search.toString();

  useEffect(() => {
    const path = queryString ? `${pathname}?${queryString}` : pathname;

    sendGaEvent("page_view", { page_path: path });
    sendInternalEvent({
      name: "page_view",
      path,
      source: "web"
    });
  }, [pathname, queryString]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const tracked = target.closest("[data-track]") as HTMLElement | null;
      if (!tracked) return;

      const name = tracked.getAttribute("data-track");
      if (!name) return;
      const label = tracked.getAttribute("data-track-label") || tracked.textContent?.trim() || undefined;
      const path = window.location.pathname + window.location.search;

      sendGaEvent(name, { event_label: label, page_path: path });
      sendInternalEvent({
        name,
        label,
        path,
        source: "click"
      });
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  if (!GA_ID) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { send_page_view: false });
        `}
      </Script>
    </>
  );
}

import { Suspense } from "react";
import { SiteHeader } from "@/components/sections/site-header";
import { SiteFooter } from "@/components/sections/site-footer";
import { CenterLoader } from "@/components/ui/center-loader";
import { AnalyticsTracker } from "@/components/analytics/analytics-tracker";

export default function MarketingLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-brand-navy text-white">
      <AnalyticsTracker />
      <SiteHeader />
      <Suspense
        fallback={
          <main className="px-4 py-10">
            <CenterLoader title="Loading" subtitle="Preparing G7 Provider Steel Works..." />
          </main>
        }
      >
        <main className="animate-[toastIn_220ms_ease-out]">{children}</main>
      </Suspense>
      <SiteFooter />
    </div>
  );
}

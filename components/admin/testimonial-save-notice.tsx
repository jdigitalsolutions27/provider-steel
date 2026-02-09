"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";

export function TestimonialSaveNotice() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const shownRef = useRef(false);

  useEffect(() => {
    if (shownRef.current) return;
    if (params.get("saved") !== "1") return;

    shownRef.current = true;
    toast.push({
      title: "Project saved",
      description: "Testimonial project updated successfully.",
      variant: "success"
    });
    router.replace(pathname);
  }, [params, pathname, router, toast]);

  return null;
}

"use client";

import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import { Hammer } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

type PasswordInputProps = InputHTMLAttributes<HTMLInputElement> & {
  containerClassName?: string;
};

export function PasswordInput({
  containerClassName,
  className,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={cn("relative", containerClassName)}>
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className={cn("pr-12", className)}
      />
      <button
        type="button"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        onClick={() => setVisible((prev) => !prev)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-white/5 p-2 text-white/70 transition hover:border-white/30 hover:text-white"
      >
        <Hammer
          className={cn(
            "h-4 w-4 transition",
            visible ? "hammer-tap text-brand-yellow" : "text-white/70"
          )}
        />
      </button>
    </div>
  );
}

import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

const styles = {
  base: "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
  primary: "bg-brand-red text-white shadow-soft hover:-translate-y-0.5 hover:bg-red-600",
  secondary: "border border-white/30 bg-white/[0.03] text-white hover:border-white hover:bg-white/[0.08]",
  ghost: "text-white/80 hover:bg-white/[0.06] hover:text-white",
  dark: "border border-white/10 bg-brand-navy text-white hover:border-white/40 hover:bg-white/[0.04]"
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof styles;
}) {
  return (
    <button
      className={cn(styles.base, styles[variant], className)}
      {...props}
    />
  );
}

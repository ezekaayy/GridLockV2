import { type ButtonHTMLAttributes } from "react";
import { type Variant, type Size } from "../types/button";
import type { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const variants = {
  primary: "bg-primary text-black shadow-brutal hover:bg-black hover:text-primary",
  black: "bg-black text-white shadow-brutal hover:bg-white hover:text-black",
  white: "bg-white text-black shadow-brutal hover:bg-black hover:text-white",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
  xl: "px-6 py-3 text-lg"
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth,
  className = "",
  ...props
}) => {
  return (
    <button
      type={props.type || "button"}
      className={cn(
        "font-display font-bold uppercase transition-all duration-300 ease-in border-2 border-black inline-flex items-center justify-center gap-2 active:shadow-none active:translate-x-0.5 active:translate-y-0.5",
        variants[variant],
        sizes[size],
        fullWidth ? "w-full" : "w-auto",
        className,
      )} {...props}
    >
      {children}
    </button>
  );
};

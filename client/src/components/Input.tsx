import { useId, type InputHTMLAttributes } from "react";
import { cn } from "./Button";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullwidth?: boolean;
}

interface TextAreaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullwidth?: boolean;
}

interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  fullwidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  fullwidth,
  className,
  id,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  return (
    <div className={cn("group block", fullwidth ? "w-full" : "")}>
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            "block font-mono text-xs font-bold m-2 uppercase tracking-wide transition-color",
            error ? "text-red-600" : "group-focus-within:text-black"
          )}
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        className={cn(
          "w-full border-2 p-2 bg-white font-bold font-mono text-sm focus:outline-none transition-all placeholder-gray-400",
          error
            ? "border-red-500 bg-red-50"
            : "border-black focus:shadow-brutal-sm focus:-translate-x-0.5 focus:-translate-y-0.5",
          className,
        )}
        {...props}
      />

      {error && (
        <span className="text-red-600 font-mono text-xs font-bold mt-1 block">
          ! {error}
        </span>
      )}
    </div>
  );
};

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  fullwidth = true,
  id,
  className,
  ...props
}) => {
  const generatedId = useId();
  const TextAreaId = id || generatedId;
  return (
    <div className={cn("group}", fullwidth ? "w-full" : "")}>
      {label && (
        <label
          htmlFor={TextAreaId}
          className={cn(
            "block font-mono text-xs font-bold m-2 uppercase tracking-wide group-focus-within:text-black transition-color",
          )}
        >
          {label}
        </label>
      )}

      <textarea
        id={TextAreaId}
        className={cn(
          "w-full border-2 border-black p-2 bg-white font-bold font-mono text-sm focus:outline-none focus:shadow-brutal-sm focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all placeholder-gray-400 min-h-30 resize-none",
          className,
        )}
        {...props}
      />
      {error && (
        <span className="text-red-600 font-mono text-xs font-bold mt-1 block">
          {error}
        </span>
      )}
    </div>
  );
};

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  fullwidth = true,
  children,
  className,
  id,
  ...props
}) => {
  const generatedId = useId();
  const selectId = id || generatedId;
  return (
    <div className={cn("group", fullwidth ? "w-full" : "")}>
      {label && (
        <label
          htmlFor={selectId}
          className={cn(
            "block font-mono text-xs font-bold m-2 uppercase tracking-wide group-focus-within:text-black transition-color",
          )}
        >
          {label}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          className={cn(
            "w-full border-2 p-2 bg-white font-bold font-mono text-sm focus:outline-none transition-all appearance-none",
            error
              ? "border-red-500 bg-red-50"
              : "border-black focus:shadow-brutal-sm focus:-translate-x-0.5 focus:-translate-y-0.5",
            className,
          )}
          {...props}
        >
          {children}
        </select>

        <span
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none material-symbols-outlined font-bold text-[10px]",
            error ? "text-red-400" : "text-gray-600",
          )}
        >
          expand
        </span>
      </div>
      {error && (
        <span className="text-red-600 font-mono text-xs font-bold mt-1 block">
          ! {error}
        </span>
      )}
    </div>
  );
};

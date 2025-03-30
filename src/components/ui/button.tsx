import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg";
  children: React.ReactNode;
}

export function Button({
  className = "",
  variant = "default",
  size = "default",
  children,
  ...props
}: ButtonProps) {
  // Base styles
  let variantClasses = "";
  let sizeClasses = "";

  // Variant styles
  switch (variant) {
    case "default":
      variantClasses = "bg-primary text-white hover:bg-primary-dark";
      break;
    case "outline":
      variantClasses = "bg-transparent border border-gray-300 hover:bg-gray-100";
      break;
    case "ghost":
      variantClasses = "bg-transparent hover:bg-gray-100";
      break;
    case "link":
      variantClasses = "bg-transparent underline hover:no-underline";
      break;
  }

  // Size styles
  switch (size) {
    case "default":
      sizeClasses = "px-4 py-2 text-sm";
      break;
    case "sm":
      sizeClasses = "px-3 py-1 text-xs";
      break;
    case "lg":
      sizeClasses = "px-6 py-3 text-base";
      break;
  }

  return (
    <button
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
} 
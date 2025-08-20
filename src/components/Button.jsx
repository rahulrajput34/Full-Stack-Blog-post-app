import React from "react";
import PropTypes from "prop-types";

/**
 * Reusable Button component with variants, sizes, loading state, and optional icons.
 * TailwindCSS classes are composed at runtime based on props.
 */
export default function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  isLoading = false,
  leadingIcon = null,
  trailingIcon = null,
  block = false,
  bgColor,
  textColor,
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center select-none rounded-md font-medium transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };

  const variants = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-400",
    secondary:
      "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 focus-visible:ring-indigo-400",
    outline:
      "bg-transparent text-slate-700 border border-slate-300 hover:bg-slate-50 focus-visible:ring-indigo-400",
    ghost:
      "bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-indigo-400",
    destructive:
      "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-400",
  };

  // Compose classes; legacy bgColor/textColor (if provided) will override variant colors
  const cls = [
    base,
    sizes[size] || sizes.md,
    variants[variant] || variants.primary,
    block ? "w-full" : "",
    bgColor || "",
    textColor || "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={cls}
      disabled={isLoading || props.disabled}
      aria-busy={isLoading ? "true" : undefined}
      {...props}
    >
      {isLoading && (
        <svg
          className="mr-2 h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}
      {leadingIcon ? <span className="mr-2">{leadingIcon}</span> : null}
      <span>{children}</span>
      {trailingIcon ? <span className="ml-2">{trailingIcon}</span> : null}
    </button>
  );
}

Button.propTypes = {
  /** Button label or custom content */
  children: PropTypes.node,
  /** Native button type */
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  /** Visual style preset */
  variant: PropTypes.oneOf([
    "primary",
    "secondary",
    "outline",
    "ghost",
    "destructive",
  ]),
  /** Size preset */
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  /** Shows spinner and disables the button */
  isLoading: PropTypes.bool,
  /** Optional icon element displayed before the label */
  leadingIcon: PropTypes.node,
  /** Optional icon element displayed after the label */
  trailingIcon: PropTypes.node,
  /** Make the button full-width */
  block: PropTypes.bool,
  /** Tailwind class to override background color */
  bgColor: PropTypes.string,
  /** Tailwind class to override text color */
  textColor: PropTypes.string,
  /** Additional class names */
  className: PropTypes.string,
};

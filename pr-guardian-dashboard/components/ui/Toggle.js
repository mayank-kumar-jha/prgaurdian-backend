"use client";

/**
 * Toggle — Styled switch component in emerald neon theme.
 *
 * @param {Object} props
 * @param {boolean} props.checked
 * @param {(checked: boolean) => void} props.onChange
 * @param {string} [props.id]
 * @param {boolean} [props.disabled]
 */
export default function Toggle({ checked, onChange, id, disabled = false }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070e0a] cursor-pointer ${
        checked
          ? "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_0_12px_-2px_rgba(16,185,129,0.4)]"
          : "bg-zinc-800 border border-zinc-700"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span
        className={`inline-block w-4.5 h-4.5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
          checked ? "translate-x-5.5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

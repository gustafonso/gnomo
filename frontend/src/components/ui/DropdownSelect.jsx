import { useState, useRef, useEffect } from "react";

export default function DropdownSelect({
  value,
  onChange,
  options = [],
  placeholder = "Selecione...",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find((o) => o.value === value)?.label || placeholder;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-52 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-200 hover:border-neutral-500 transition"
      >
        {selectedLabel}
        <svg
          className={`w-4 h-4 ml-2 transform transition-transform ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl z-[9999]">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`px-4 py-2 cursor-pointer hover:bg-neutral-800 text-neutral-200 ${
                opt.value === value ? "bg-neutral-800" : ""
              }`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
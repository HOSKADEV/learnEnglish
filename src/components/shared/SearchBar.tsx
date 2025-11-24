// components/SearchBar.tsx
import { X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ 
  value, 
  onChange, 
  placeholder = "ابحث...",
  className = "" 
}: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-4 pr-33 border-2 border-gray-300 rounded-xl text-lg focus:border-blue-500 outline-none transition"
      />
    
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
}
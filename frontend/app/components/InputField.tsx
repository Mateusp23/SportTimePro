"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputFieldProps {
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  isPassword?: boolean;
  validate?: (value: string) => string | null; // função de validação
}

export default function InputField({
  type = "text",
  placeholder,
  value,
  onChange,
  icon,
  isPassword = false,
  validate
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const handleBlur = () => {
    setTouched(true);
    if (validate) {
      const validation = validate(value);
      setError(validation);
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </span>
        )}
        <input
          type={isPassword && showPassword ? "text" : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          className={`pl-10 ${isPassword ? "pr-10" : ""} border rounded-lg w-full text-texts p-3 focus:ring-2 focus:outline-none transition ${touched && error
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-primary"
            }`}
          required
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {touched && error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

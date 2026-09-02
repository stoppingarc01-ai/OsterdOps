"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search, Check } from "lucide-react";

export interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

export const TOP_50_COUNTRIES: Country[] = [
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧" },
  { code: "IN", name: "India", dialCode: "+91", flag: "🇮🇳" },
  { code: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦" },
  { code: "DE", name: "Germany", dialCode: "+49", flag: "🇩🇪" },
  { code: "FR", name: "France", dialCode: "+33", flag: "🇫🇷" },
  { code: "AU", name: "Australia", dialCode: "+61", flag: "🇦🇺" },
  { code: "JP", name: "Japan", dialCode: "+81", flag: "🇯🇵" },
  { code: "SG", name: "Singapore", dialCode: "+65", flag: "🇸🇬" },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971", flag: "🇦🇪" },
  { code: "NL", name: "Netherlands", dialCode: "+31", flag: "🇳🇱" },
  { code: "CH", name: "Switzerland", dialCode: "+41", flag: "🇨🇭" },
  { code: "SE", name: "Sweden", dialCode: "+46", flag: "🇸🇪" },
  { code: "IE", name: "Ireland", dialCode: "+353", flag: "🇮🇪" },
  { code: "IL", name: "Israel", dialCode: "+972", flag: "🇮🇱" },
  { code: "BR", name: "Brazil", dialCode: "+55", flag: "🇧🇷" },
  { code: "MX", name: "Mexico", dialCode: "+52", flag: "🇲🇽" },
  { code: "ES", name: "Spain", dialCode: "+34", flag: "🇪🇸" },
  { code: "IT", name: "Italy", dialCode: "+39", flag: "🇮🇹" },
  { code: "KR", name: "South Korea", dialCode: "+82", flag: "🇰🇷" },
  { code: "PL", name: "Poland", dialCode: "+48", flag: "🇵🇱" },
  { code: "BE", name: "Belgium", dialCode: "+32", flag: "🇧🇪" },
  { code: "NO", name: "Norway", dialCode: "+47", flag: "🇳🇴" },
  { code: "DK", name: "Denmark", dialCode: "+45", flag: "🇩🇰" },
  { code: "FI", name: "Finland", dialCode: "+358", flag: "🇫🇮" },
  { code: "AT", name: "Austria", dialCode: "+43", flag: "🇦🇹" },
  { code: "NZ", name: "New Zealand", dialCode: "+64", flag: "🇳🇿" },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966", flag: "🇸🇦" },
  { code: "ZA", name: "South Africa", dialCode: "+27", flag: "🇿🇦" },
  { code: "AR", name: "Argentina", dialCode: "+54", flag: "🇦🇷" },
  { code: "CL", name: "Chile", dialCode: "+56", flag: "🇨🇱" },
  { code: "CO", name: "Colombia", dialCode: "+57", flag: "🇨🇴" },
  { code: "PT", name: "Portugal", dialCode: "+351", flag: "🇵🇹" },
  { code: "GR", name: "Greece", dialCode: "+30", flag: "🇬🇷" },
  { code: "CZ", name: "Czech Republic", dialCode: "+420", flag: "🇨🇿" },
  { code: "RO", name: "Romania", dialCode: "+40", flag: "🇷🇴" },
  { code: "HU", name: "Hungary", dialCode: "+36", flag: "🇭🇺" },
  { code: "TR", name: "Turkey", dialCode: "+90", flag: "🇹🇷" },
  { code: "ID", name: "Indonesia", dialCode: "+62", flag: "🇮🇩" },
  { code: "MY", name: "Malaysia", dialCode: "+60", flag: "🇲🇾" },
  { code: "PH", name: "Philippines", dialCode: "+63", flag: "🇵🇭" },
  { code: "VN", name: "Vietnam", dialCode: "+84", flag: "🇻🇳" },
  { code: "TH", name: "Thailand", dialCode: "+66", flag: "🇹🇭" },
  { code: "TW", name: "Taiwan", dialCode: "+886", flag: "🇹🇼" },
  { code: "HK", name: "Hong Kong", dialCode: "+852", flag: "🇭🇰" },
  { code: "EG", name: "Egypt", dialCode: "+20", flag: "🇪🇬" },
  { code: "NG", name: "Nigeria", dialCode: "+234", flag: "🇳🇬" },
  { code: "KE", name: "Kenya", dialCode: "+254", flag: "🇰🇪" },
  { code: "QA", name: "Qatar", dialCode: "+974", flag: "🇶🇦" },
  { code: "LU", name: "Luxembourg", dialCode: "+352", flag: "🇱🇺" },
];

export interface CountryCodeSelectorProps {
  selected: Country;
  onSelect: (country: Country) => void;
  disabled?: boolean;
  className?: string;
}

export function CountryCodeSelector({
  selected,
  onSelect,
  disabled = false,
  className = "",
}: CountryCodeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      // Auto-focus search input when opened
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const filteredCountries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return TOP_50_COUNTRIES;

    return TOP_50_COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.dialCode.includes(query) ||
        c.code.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <div ref={dropdownRef} className={`relative shrink-0 ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            setSearchQuery("");
          }
        }}
        className={`h-[42px] px-3 flex items-center gap-1.5 bg-white border border-[#e1dcd0] rounded-xl text-[13px] font-mono text-[#1a1c24] hover:border-[#dfba82] focus:outline-none focus:border-[#dfba82] focus:ring-2 focus:ring-[#dfba82]/30 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] cursor-pointer select-none ${
          disabled ? "opacity-50 cursor-not-allowed bg-[#f8f6f0]" : ""
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="text-base leading-none">{selected.flag}</span>
        <span className="font-semibold text-xs text-[#2d313f]">{selected.dialCode}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-[#989cb0] transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#b8860b]" : ""
          }`}
        />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-64 max-h-64 bg-white border border-[#dfd7c7] rounded-xl shadow-[0_12px_36px_rgba(0,0,0,0.22)] z-50 p-1.5 text-xs text-[#1a1c24] animate-in fade-in zoom-in-95 duration-150 flex flex-col">
          {/* Search Header */}
          <div className="relative mb-1.5 px-1">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#989cb0]" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search country or code..."
              className="w-full pl-8 pr-2.5 py-1.5 bg-[#f8f5ee] border border-[#e5ded0] rounded-lg text-xs text-[#1a1c24] placeholder-[#989cb0] focus:outline-none focus:border-[#dfba82] focus:bg-white transition-all"
            />
          </div>

          {/* List of Countries */}
          <div className="overflow-y-auto max-h-48 divide-y divide-[#f5f1e8] space-y-0.5 pr-0.5">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => {
                const isSelected = country.code === selected.code;
                return (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => {
                      onSelect(country);
                      setIsOpen(false);
                    }}
                    className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[#f3ede0] text-[#14161f] font-semibold"
                        : "hover:bg-[#faf7f0] text-[#494e60]"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="text-sm">{country.flag}</span>
                      <span className="truncate">{country.name}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 font-mono text-[11px] text-[#b8860b]">
                      <span>{country.dialCode}</span>
                      {isSelected && <Check className="h-3 w-3 text-[#b8860b]" />}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="py-4 text-center text-[11.5px] text-[#8e93a6]">
                No country found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CountryCodeSelector;

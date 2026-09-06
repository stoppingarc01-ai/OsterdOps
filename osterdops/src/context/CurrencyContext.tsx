"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

export type CurrencyCode = "USD" | "EUR" | "GBP" | "INR" | "JPY" | "CAD" | "AUD";

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  label: string;
  name: string;
  rate: number; // Institutional pegged exchange rate relative to 1 USD
  flag: string;
  decimalPlaces: number;
}

export const CURRENCY_REGISTRY: Record<CurrencyCode, CurrencyConfig> = {
  USD: {
    code: "USD",
    symbol: "$",
    label: "USD ($)",
    name: "US Dollar",
    rate: 1.0,
    flag: "🇺🇸",
    decimalPlaces: 2,
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    label: "EUR (€)",
    name: "Euro",
    rate: 0.92,
    flag: "🇪🇺",
    decimalPlaces: 2,
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    label: "GBP (£)",
    name: "British Pound",
    rate: 0.78,
    flag: "🇬🇧",
    decimalPlaces: 2,
  },
  INR: {
    code: "INR",
    symbol: "₹",
    label: "INR (₹)",
    name: "Indian Rupee",
    rate: 86.5,
    flag: "🇮🇳",
    decimalPlaces: 2,
  },
  JPY: {
    code: "JPY",
    symbol: "¥",
    label: "JPY (¥)",
    name: "Japanese Yen",
    rate: 154.2,
    flag: "🇯🇵",
    decimalPlaces: 0,
  },
  CAD: {
    code: "CAD",
    symbol: "CA$",
    label: "CAD (CA$)",
    name: "Canadian Dollar",
    rate: 1.38,
    flag: "🇨🇦",
    decimalPlaces: 2,
  },
  AUD: {
    code: "AUD",
    symbol: "AU$",
    label: "AUD (AU$)",
    name: "Australian Dollar",
    rate: 1.52,
    flag: "🇦🇺",
    decimalPlaces: 2,
  },
};

export const ALL_CURRENCIES = Object.values(CURRENCY_REGISTRY);

interface FormatCurrencyOptions {
  decimals?: number;
  compact?: boolean;
  showCode?: boolean;
}

interface CurrencyContextType {
  currency: CurrencyCode;
  currencyConfig: CurrencyConfig;
  symbol: string;
  rate: number;
  setCurrency: (code: CurrencyCode) => void;
  convertUsd: (usdAmount: number) => number;
  formatCurrency: (usdAmount: number, options?: FormatCurrencyOptions) => string;
  formatNanodollars: (nanos: number, options?: { decimals?: number }) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY = "osterdops_currency";

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("USD");

  // Hydrate currency from localStorage and cookie
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as CurrencyCode | null;
      if (saved && CURRENCY_REGISTRY[saved]) {
        setCurrencyState(saved);
        return;
      }

      // Check cookie fallback
      const match = document.cookie.match(new RegExp("(^| )" + STORAGE_KEY + "=([^;]+)"));
      if (match && match[2] && CURRENCY_REGISTRY[match[2] as CurrencyCode]) {
        setCurrencyState(match[2] as CurrencyCode);
      }
    } catch {
      // Ignore storage read errors
    }
  }, []);

  const setCurrency = useCallback((code: CurrencyCode) => {
    if (!CURRENCY_REGISTRY[code]) return;
    setCurrencyState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
      document.cookie = `${STORAGE_KEY}=${code}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // Ignore storage write errors
    }
  }, []);

  const currencyConfig = useMemo(() => CURRENCY_REGISTRY[currency] || CURRENCY_REGISTRY.USD, [currency]);

  const convertUsd = useCallback(
    (usdAmount: number): number => {
      const val = Number(usdAmount) || 0;
      return val * currencyConfig.rate;
    },
    [currencyConfig.rate]
  );

  const formatCurrency = useCallback(
    (usdAmount: number, options?: FormatCurrencyOptions): string => {
      const val = Number(usdAmount) || 0;
      const converted = val * currencyConfig.rate;
      const decimals =
        options?.decimals !== undefined
          ? options.decimals
          : currencyConfig.decimalPlaces;

      let formattedNumber: string;
      if (options?.compact && Math.abs(converted) >= 1_000_000) {
        formattedNumber = `${(converted / 1_000_000).toFixed(1)}M`;
      } else if (options?.compact && Math.abs(converted) >= 1_000) {
        formattedNumber = `${(converted / 1_000).toFixed(1)}k`;
      } else {
        formattedNumber = converted.toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
      }

      const suffix = options?.showCode ? ` ${currencyConfig.code}` : "";
      return `${currencyConfig.symbol}${formattedNumber}${suffix}`;
    },
    [currencyConfig]
  );

  const formatNanodollars = useCallback(
    (nanos: number, options?: { decimals?: number }): string => {
      const usd = (Number(nanos) || 0) / 1_000_000_000;
      return formatCurrency(usd, { decimals: options?.decimals ?? 6 });
    },
    [formatCurrency]
  );

  const value = useMemo(
    () => ({
      currency,
      currencyConfig,
      symbol: currencyConfig.symbol,
      rate: currencyConfig.rate,
      setCurrency,
      convertUsd,
      formatCurrency,
      formatNanodollars,
    }),
    [currency, currencyConfig, setCurrency, convertUsd, formatCurrency, formatNanodollars]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextType {
  const context = useContext(CurrencyContext);
  if (!context) {
    // Fallback safe dummy context if rendered outside provider
    const config = CURRENCY_REGISTRY.USD;
    return {
      currency: "USD",
      currencyConfig: config,
      symbol: "$",
      rate: 1.0,
      setCurrency: () => {},
      convertUsd: (usd) => usd,
      formatCurrency: (usd, opts) => `$${(usd || 0).toFixed(opts?.decimals ?? 2)}`,
      formatNanodollars: (nanos, opts) => `$${((nanos || 0) / 1e9).toFixed(opts?.decimals ?? 6)}`,
    };
  }
  return context;
}

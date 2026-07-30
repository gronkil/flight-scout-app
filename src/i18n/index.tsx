// Kontekst i18n — trzyma język i walutę, zapamiętuje wybór i udostępnia formatery.
// Domyślny język/waluta zgadywane z ustawień urządzenia (Intl), bez natywnych zależności.
// WAŻNE: waluta to tylko preferencja wysyłana do API — klient NIE przelicza kursów.
import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import { CURRENCIES, formatMoney, type Currency } from "../lib/money";
import {
  changesLabel,
  type Lang,
  localeOf,
  messages,
  pluralNights,
  tripLabel,
} from "./messages";

const LANG_KEY = "fs.pref.lang";
const CUR_KEY = "fs.pref.currency";

function guessDefaults(): { lang: Lang; currency: Currency } {
  let locale = "en-US";
  try {
    locale = Intl.DateTimeFormat().resolvedOptions().locale || locale;
  } catch {
    // brak ICU — zostaje en-US
  }
  const lc = locale.toLowerCase();
  if (lc.startsWith("pl")) return { lang: "pl", currency: "PLN" };
  const region = lc.split("-")[1] ?? "";
  const currency: Currency = region === "gb" ? "GBP" : region === "us" ? "USD" : "EUR";
  return { lang: "en", currency };
}

const DEFAULTS = guessDefaults();

async function secureGet(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}
async function secureSet(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    // brak bezpiecznego magazynu (np. web) — preferencja zadziała do restartu
  }
}

export interface I18nValue {
  lang: Lang;
  currency: Currency;
  locale: string;
  t: (typeof messages)["pl"];
  setLang: (lang: Lang) => void;
  setCurrency: (currency: Currency) => void;
  money: (amount: number, currency?: string) => string;
  nights: (n: number | null) => string;
  trip: (tripType: string) => string;
  changes: (changes: number | null) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [lang, setLangState] = useState<Lang>(DEFAULTS.lang);
  const [currency, setCurrencyState] = useState<Currency>(DEFAULTS.currency);

  // Odtworzenie zapamiętanego wyboru przy starcie.
  useEffect(() => {
    let alive = true;
    void (async () => {
      const [l, c] = await Promise.all([secureGet(LANG_KEY), secureGet(CUR_KEY)]);
      if (!alive) return;
      if (l === "pl" || l === "en") setLangState(l);
      if (c && (CURRENCIES as string[]).includes(c)) setCurrencyState(c as Currency);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const value = useMemo<I18nValue>(() => {
    const locale = localeOf[lang];
    const t = messages[lang];
    return {
      lang,
      currency,
      locale,
      t,
      setLang: (l) => {
        setLangState(l);
        void secureSet(LANG_KEY, l);
      },
      setCurrency: (c) => {
        setCurrencyState(c);
        void secureSet(CUR_KEY, c);
      },
      money: (amount, cur) => formatMoney(amount, cur ?? currency, locale),
      nights: (n) => pluralNights(n, lang),
      trip: (tripType) => tripLabel(tripType, lang),
      changes: (c) => changesLabel(c, lang),
    };
  }, [lang, currency]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n musi być wewnątrz <I18nProvider>");
  return ctx;
}

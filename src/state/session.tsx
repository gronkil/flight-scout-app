// Kontekst sesji — trzyma baseUrl + token (z logowania) i buduje ApiClient.
// Token NIE jest zaszyty; wpisuje go użytkownik (logowanie / kod). Zero sekretów w kodzie.
import React, { createContext, useContext, useMemo, useState } from "react";

import { ApiClient } from "../api/client";
import { resolveBaseUrl } from "../config";

interface SessionValue {
  baseUrl: string;
  token: string | null;
  isAuthed: boolean;
  setBaseUrl: (url: string) => void;
  setToken: (token: string | null) => void;
  client: ApiClient;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [baseUrl, setBaseUrl] = useState<string>(resolveBaseUrl());
  const [token, setToken] = useState<string | null>(null);

  const client = useMemo(
    () => new ApiClient({ baseUrl, getAuth: () => token }),
    [baseUrl, token],
  );

  const value: SessionValue = {
    baseUrl,
    token,
    isAuthed: token !== null && token !== "",
    setBaseUrl,
    setToken,
    client,
  };
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession musi być wewnątrz <SessionProvider>");
  return ctx;
}

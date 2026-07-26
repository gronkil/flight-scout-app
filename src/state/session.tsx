// Kontekst sesji — trzyma baseUrl + token sesji (z logowania) i buduje ApiClient.
// Token pochodzi z logowania (e-mail+hasło lub Google), NIE jest zaszyty w kodzie.
// Zapamiętujemy go bezpiecznie (expo-secure-store), więc po restarcie apki nie trzeba
// logować się od nowa. Zero sekretów w repo.
import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import { ApiClient } from "../api/client";
import { configuredBaseUrl } from "../config";

const TOKEN_KEY = "fs.session.token";
const USER_KEY = "fs.session.user";
const EMAIL_KEY = "fs.session.email";

interface SessionValue {
  baseUrl: string;
  token: string | null;
  userId: string | null;
  email: string | null;
  isAuthed: boolean;
  restoring: boolean;
  setBaseUrl: (url: string) => void;
  client: ApiClient;
  registerWithPassword: (email: string, password: string) => Promise<void>;
  loginWithPassword: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionValue | null>(null);

async function secureGet(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function secureSet(key: string, value: string | null): Promise<void> {
  try {
    if (value === null) await SecureStore.deleteItemAsync(key);
    else await SecureStore.setItemAsync(key, value);
  } catch {
    // Brak bezpiecznego magazynu (np. web) — sesja zadziała tylko do restartu.
  }
}

export function SessionProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [baseUrl, setBaseUrl] = useState<string>(configuredBaseUrl());
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [restoring, setRestoring] = useState<boolean>(true);

  // Odtworzenie sesji z bezpiecznego magazynu przy starcie aplikacji.
  useEffect(() => {
    let alive = true;
    void (async () => {
      const [t, u, e] = await Promise.all([
        secureGet(TOKEN_KEY),
        secureGet(USER_KEY),
        secureGet(EMAIL_KEY),
      ]);
      if (!alive) return;
      setToken(t);
      setUserId(u);
      setEmail(e);
      setRestoring(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const client = useMemo(
    () => new ApiClient({ baseUrl, getAuth: () => token }),
    [baseUrl, token],
  );

  async function persist(t: string, u: string, e: string | null): Promise<void> {
    setToken(t);
    setUserId(u);
    setEmail(e);
    await Promise.all([
      secureSet(TOKEN_KEY, t),
      secureSet(USER_KEY, u),
      secureSet(EMAIL_KEY, e),
    ]);
  }

  async function registerWithPassword(emailArg: string, password: string): Promise<void> {
    const res = await client.register(emailArg, password);
    await persist(res.token, res.user_id, res.email);
  }

  async function loginWithPassword(emailArg: string, password: string): Promise<void> {
    const res = await client.login(emailArg, password);
    await persist(res.token, res.user_id, res.email);
  }

  async function loginWithGoogle(idToken: string): Promise<void> {
    const res = await client.loginWithGoogle(idToken);
    await persist(res.token, res.user_id, res.email);
  }

  async function signOut(): Promise<void> {
    try {
      await client.logout();
    } catch {
      // ignorujemy błąd sieci przy wylogowaniu — i tak czyścimy lokalnie
    }
    setToken(null);
    setUserId(null);
    setEmail(null);
    await Promise.all([
      secureSet(TOKEN_KEY, null),
      secureSet(USER_KEY, null),
      secureSet(EMAIL_KEY, null),
    ]);
  }

  const value: SessionValue = {
    baseUrl,
    token,
    userId,
    email,
    isAuthed: token !== null && token !== "",
    restoring,
    setBaseUrl,
    client,
    registerWithPassword,
    loginWithPassword,
    loginWithGoogle,
    signOut,
  };
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession musi być wewnątrz <SessionProvider>");
  return ctx;
}

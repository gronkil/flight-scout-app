// Prosty hook ładowania asynchronicznego z jawnym stanem (loading/error/empty).
// Obsługuje ponawianie: gdy próba padnie, po krótkiej przerwie uruchamiamy kolejną
// (numer próby dostaje loader — może np. wydłużyć timeout dla wybudzanego serwera).
import { useCallback, useEffect, useState } from "react";

export type AsyncState<T> =
  | { status: "loading"; attempt: number }
  | { status: "error"; error: string }
  | { status: "ready"; data: T };

export interface AsyncOptions {
  // Ile prób łącznie (domyślnie 1 — bez ponawiania).
  maxAttempts?: number;
  // Odstęp między próbami (ms).
  retryDelayMs?: number;
}

export function useAsync<T>(
  loader: (attempt: number) => Promise<T>,
  deps: unknown[] = [],
  opts: AsyncOptions = {},
): {
  state: AsyncState<T>;
  reload: () => void;
} {
  const { maxAttempts = 1, retryDelayMs = 400 } = opts;
  const [state, setState] = useState<AsyncState<T>>({ status: "loading", attempt: 0 });

  const run = useCallback(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const tryAttempt = (n: number): void => {
      if (!alive) return;
      setState({ status: "loading", attempt: n });
      loader(n)
        .then((data) => {
          if (alive) setState({ status: "ready", data });
        })
        .catch((e: unknown) => {
          if (!alive) return;
          if (n + 1 < maxAttempts) {
            timer = setTimeout(() => tryAttempt(n + 1), retryDelayMs);
          } else {
            setState({ status: "error", error: e instanceof Error ? e.message : String(e) });
          }
        });
    };

    tryAttempt(0);

    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(run, [run]);
  return { state, reload: run };
}

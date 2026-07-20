// Prosty hook ładowania asynchronicznego z jawnym stanem (loading/error/empty).
import { useCallback, useEffect, useState } from "react";

export type AsyncState<T> =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "ready"; data: T };

export function useAsync<T>(loader: () => Promise<T>, deps: unknown[] = []): {
  state: AsyncState<T>;
  reload: () => void;
} {
  const [state, setState] = useState<AsyncState<T>>({ status: "loading" });

  const run = useCallback(() => {
    let alive = true;
    setState({ status: "loading" });
    loader()
      .then((data) => alive && setState({ status: "ready", data }))
      .catch((e: unknown) =>
        alive && setState({ status: "error", error: e instanceof Error ? e.message : String(e) }),
      );
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(run, [run]);
  return { state, reload: run };
}

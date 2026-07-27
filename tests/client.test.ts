import { describe, expect, it, vi } from "vitest";

import { ApiClient, ApiError } from "../src/api/client";

function fakeFetch(status: number, body: unknown) {
  return vi.fn(async (_url: string, _init?: RequestInit) => {
    return {
      ok: status >= 200 && status < 300,
      status,
      statusText: "x",
      text: async () => (body === undefined ? "" : JSON.stringify(body)),
    } as Response;
  });
}

describe("ApiClient", () => {
  it("dołącza Authorization: Bearer gdy token obecny", async () => {
    const fetchFn = fakeFetch(200, []);
    const client = new ApiClient({
      baseUrl: "http://api",
      getAuth: () => "sess-tok",
      fetchFn: fetchFn as unknown as typeof fetch,
    });
    await client.listProfiles();
    const init = fetchFn.mock.calls[0][1] as RequestInit;
    expect((init.headers as Record<string, string>)["Authorization"]).toBe("Bearer sess-tok");
  });

  it("nie dołącza nagłówka auth gdy brak tokenu (zero sekretów)", async () => {
    const fetchFn = fakeFetch(200, []);
    const client = new ApiClient({ baseUrl: "http://api", fetchFn: fetchFn as unknown as typeof fetch });
    await client.listProfiles();
    const init = fetchFn.mock.calls[0][1] as RequestInit;
    expect((init.headers as Record<string, string>)["Authorization"]).toBeUndefined();
  });

  it("login/register/google wołają właściwe endpointy i zwracają token", async () => {
    const fetchFn = fakeFetch(200, { token: "T", user_id: "u1", email: "a@b.com" });
    const client = new ApiClient({ baseUrl: "http://api", fetchFn: fetchFn as unknown as typeof fetch });

    const reg = await client.register("a@b.com", "supersecret");
    expect(reg.token).toBe("T");
    expect(fetchFn.mock.calls[0][0]).toBe("http://api/auth/register");

    await client.login("a@b.com", "supersecret");
    expect(fetchFn.mock.calls[1][0]).toBe("http://api/auth/login");

    await client.loginWithGoogle("idtok");
    expect(fetchFn.mock.calls[2][0]).toBe("http://api/auth/google");
    const body = JSON.parse((fetchFn.mock.calls[2][1] as RequestInit).body as string);
    expect(body).toEqual({ id_token: "idtok" });
  });

  it("buduje query dla wyszukiwania", async () => {
    const fetchFn = fakeFetch(200, []);
    const client = new ApiClient({ baseUrl: "http://api/", fetchFn: fetchFn as unknown as typeof fetch });
    await client.searchProfile("p1", "2026-09");
    expect(fetchFn.mock.calls[0][0]).toBe("http://api/profiles/p1/search?month=2026-09");
  });

  it("204 zwraca undefined (DELETE)", async () => {
    const fetchFn = fakeFetch(204, undefined);
    const client = new ApiClient({ baseUrl: "http://api", fetchFn: fetchFn as unknown as typeof fetch });
    await expect(client.deleteProfile("p1")).resolves.toBeUndefined();
  });

  it("rzuca ApiError z detail na błąd", async () => {
    const fetchFn = fakeFetch(422, { detail: "zły IATA" });
    const client = new ApiClient({ baseUrl: "http://api", fetchFn: fetchFn as unknown as typeof fetch });
    await expect(client.createProfile({ origins: ["WAWA"], scope: "x" })).rejects.toMatchObject({
      name: "ApiError",
      status: 422,
      message: "zły IATA",
    });
    expect(new ApiError(500, "x")).toBeInstanceOf(Error);
  });

  it("diagnose woła /diag/search z origin i month", async () => {
    const body = {
      origin: "WAW",
      month: "2026-09",
      raw_count: 0,
      kept_ab: 0,
      grade_counts: {},
      samples: [],
      error: null,
    };
    const fetchFn = fakeFetch(200, body);
    const client = new ApiClient({ baseUrl: "http://api", fetchFn: fetchFn as unknown as typeof fetch });
    const d = await client.diagnose("WAW", "2026-09");
    expect(fetchFn.mock.calls[0][0]).toBe("http://api/diag/search?origin=WAW&month=2026-09");
    expect(d.raw_count).toBe(0);
    expect(d.error).toBeNull();
  });
});

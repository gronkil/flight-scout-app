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
  it("dołącza X-API-Key gdy token obecny", async () => {
    const fetchFn = fakeFetch(200, []);
    const client = new ApiClient({
      baseUrl: "http://api",
      getAuth: () => "secret",
      fetchFn: fetchFn as unknown as typeof fetch,
    });
    await client.listProfiles();
    const init = fetchFn.mock.calls[0][1] as RequestInit;
    expect((init.headers as Record<string, string>)["X-API-Key"]).toBe("secret");
  });

  it("nie dołącza klucza gdy brak tokenu (zero sekretów)", async () => {
    const fetchFn = fakeFetch(200, []);
    const client = new ApiClient({ baseUrl: "http://api", fetchFn: fetchFn as unknown as typeof fetch });
    await client.listProfiles();
    const init = fetchFn.mock.calls[0][1] as RequestInit;
    expect((init.headers as Record<string, string>)["X-API-Key"]).toBeUndefined();
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
});

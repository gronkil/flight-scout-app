// Klient naszego REST API. Czysty TypeScript (testowalny bez React Native).
// Zero sekretów w kodzie: baseUrl i token wstrzykiwane (token z logowania, nie zaszyty).

import type {
  AlertIn,
  AlertOut,
  OfferOut,
  Platform,
  ProfileIn,
  ProfileOut,
} from "../model/types";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ApiConfig {
  baseUrl: string;
  // Dostawca tokenu/klucza — może być null (niezalogowany). NIE trzymamy sekretu w kodzie.
  getAuth?: () => string | null;
  // Wstrzykiwalny fetch (testy podają atrapę); domyślnie globalny.
  fetchFn?: typeof fetch;
}

export interface OfferFilters {
  min_grade?: string;
  trip_type?: string;
  max_price?: number;
  currency?: string;
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly getAuth: () => string | null;
  private readonly fetchFn: typeof fetch;

  constructor(config: ApiConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.getAuth = config.getAuth ?? (() => null);
    this.fetchFn = config.fetchFn ?? fetch;
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const auth = this.getAuth();
    if (auth) headers["X-API-Key"] = auth;

    const resp = await this.fetchFn(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (resp.status === 204) return undefined as T;
    const text = await resp.text();
    const data = text ? JSON.parse(text) : undefined;
    if (!resp.ok) {
      const detail =
        data && typeof data === "object" && "detail" in data ? String(data.detail) : resp.statusText;
      throw new ApiError(resp.status, detail);
    }
    return data as T;
  }

  private query(params: Record<string, string | number | undefined>): string {
    const q = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join("&");
    return q ? `?${q}` : "";
  }

  // --- Profile ---
  listProfiles(): Promise<ProfileOut[]> {
    return this.request("GET", "/profiles");
  }
  createProfile(body: ProfileIn): Promise<ProfileOut> {
    return this.request("POST", "/profiles", body);
  }
  getProfile(id: string): Promise<ProfileOut> {
    return this.request("GET", `/profiles/${id}`);
  }
  deleteProfile(id: string): Promise<void> {
    return this.request("DELETE", `/profiles/${id}`);
  }
  searchProfile(id: string, month: string): Promise<OfferOut[]> {
    return this.request("POST", `/profiles/${id}/search${this.query({ month })}`);
  }

  // --- Feed ---
  listOffers(filters: OfferFilters = {}): Promise<OfferOut[]> {
    return this.request("GET", `/offers${this.query({ ...filters })}`);
  }

  // --- Alerty ---
  listAlerts(profileId: string): Promise<AlertOut[]> {
    return this.request("GET", `/profiles/${profileId}/alerts`);
  }
  createAlert(profileId: string, body: AlertIn): Promise<AlertOut> {
    return this.request("POST", `/profiles/${profileId}/alerts`, body);
  }
  deleteAlert(alertId: string): Promise<void> {
    return this.request("DELETE", `/alerts/${alertId}`);
  }

  // --- Urządzenia (push) ---
  registerDevice(userId: string, platform: Platform, pushToken: string): Promise<unknown> {
    return this.request("POST", "/devices", {
      user_id: userId,
      platform,
      push_token: pushToken,
    });
  }

  // --- RODO ---
  exportUserData(userId: string): Promise<Record<string, unknown>> {
    return this.request("GET", `/users/${userId}/data`);
  }
  eraseUser(userId: string): Promise<Record<string, number>> {
    return this.request("DELETE", `/users/${userId}`);
  }
}

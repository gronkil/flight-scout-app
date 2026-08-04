// Klient naszego REST API. Czysty TypeScript (testowalny bez React Native).
// Zero sekretów w kodzie: baseUrl i token wstrzykiwane (token z logowania, nie zaszyty).

import type {
  AlertIn,
  AlertOut,
  AuthOut,
  DepartCalendarOut,
  MeOut,
  OfferOut,
  Platform,
  ProfileIn,
  ProfileOut,
  ReturnCalendarOut,
  SearchDiagnostics,
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
  // Górny limit czasu pojedynczego żądania (ms). RN-owy fetch NIE ma domyślnego timeoutu —
  // bez tego zawieszony backend trzyma użytkownika na spinnerze w nieskończoność.
  timeoutMs?: number;
}

// Domyślny timeout żądania. Wystarczająco długi na wolne wyszukiwania, ale skończony —
// użytkownik dostaje czytelny błąd zamiast czekać minutami.
export const DEFAULT_TIMEOUT_MS = 15000;

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
  private readonly timeoutMs: number;

  constructor(config: ApiConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.getAuth = config.getAuth ?? (() => null);
    this.fetchFn = config.fetchFn ?? fetch;
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    timeoutMs: number = this.timeoutMs,
  ): Promise<T> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const auth = this.getAuth();
    // Token sesji (z logowania) w standardowym nagłówku Bearer. Brak tokenu = żądanie
    // anonimowe (np. samo logowanie/rejestracja). Zero sekretów zaszytych w kodzie.
    if (auth) headers["Authorization"] = `Bearer ${auth}`;

    // Twardy limit czasu: po timeoutMs przerywamy żądanie (AbortController) zamiast
    // trzymać użytkownika na spinnerze bez końca, gdy backend/sieć są zawieszone.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const resp = await this.fetchFn(`${this.baseUrl}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });

      if (resp.status === 204) return undefined as T;
      const text = await resp.text();
      // Odpowiedź nie zawsze jest JSON-em (np. serwer zwraca zwykły tekst "Internal Server
      // Error" przy 500). Parsujemy defensywnie, żeby nie wywalić się na JSON.parse.
      let data: unknown = undefined;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = undefined;
        }
      }
      if (!resp.ok) {
        const detail =
          data && typeof data === "object" && data !== null && "detail" in data
            ? String((data as { detail: unknown }).detail)
            : resp.status >= 500
              ? `Błąd serwera (${resp.status}). Spróbuj ponownie za chwilę.`
              : resp.statusText || `Błąd ${resp.status}`;
        throw new ApiError(resp.status, detail);
      }
      return data as T;
    } catch (e) {
      if (e instanceof ApiError) throw e;
      // Timeout: żądanie przerwane przez AbortController po przekroczeniu limitu.
      if (controller.signal.aborted) {
        throw new ApiError(
          0,
          `Serwer nie odpowiada (${this.baseUrl}, przekroczono ${Math.round(timeoutMs / 1000)} s). Spróbuj ponownie.`,
        );
      }
      // Pozostałe błędy sieci (brak internetu, DNS, TLS, CORS, mixed-content) — pokazujemy
      // adres ORAZ surowy powód z przeglądarki (name: message), żeby dało się zdiagnozować
      // dokładną przyczynę zamiast zgadywać spod ogólnego komunikatu.
      const reason = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
      throw new ApiError(
        0,
        `Brak połączenia z serwerem (${this.baseUrl}) [${reason}]. Sprawdź internet i spróbuj ponownie.`,
      );
    } finally {
      clearTimeout(timer);
    }
  }

  private query(params: Record<string, string | number | undefined>): string {
    const q = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join("&");
    return q ? `?${q}` : "";
  }

  // --- Logowanie (konto własne e-mail+hasło oraz Google) ---
  register(email: string, password: string): Promise<AuthOut> {
    return this.request("POST", "/auth/register", { email, password });
  }
  login(email: string, password: string): Promise<AuthOut> {
    return this.request("POST", "/auth/login", { email, password });
  }
  loginWithGoogle(idToken: string): Promise<AuthOut> {
    return this.request("POST", "/auth/google", { id_token: idToken });
  }
  me(): Promise<MeOut> {
    return this.request("GET", "/auth/me");
  }
  logout(): Promise<void> {
    return this.request("POST", "/auth/logout");
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
  // timeoutMs pozwala ekranowi feedu użyć szybkiej pierwszej próby (serwer czuwa → oferty
  // od ręki) i osobnej, cierpliwej próby wybudzenia (Render usypia usługę przy bezczynności).
  listOffers(filters: OfferFilters = {}, timeoutMs?: number): Promise<OfferOut[]> {
    return this.request("GET", `/offers${this.query({ ...filters })}`, undefined, timeoutMs);
  }

  // Kalendarz wylotów: te same oferty co feed, pogrupowane po dacie wylotu („kiedy chcę
  // lecieć → tanie loty tego dnia"). Zasila ekran wyboru dnia.
  departCalendar(filters: OfferFilters = {}, timeoutMs?: number): Promise<DepartCalendarOut> {
    return this.request(
      "GET",
      `/offers/calendar${this.query({ ...filters })}`,
      undefined,
      timeoutMs,
    );
  }

  // Kalendarz powrotów DEST→origin dla wybranego lotu tam („kiedy można wrócić").
  returnCalendar(
    origin: string,
    dest: string,
    depart: string,
    minNights = 1,
    maxNights = 30,
  ): Promise<ReturnCalendarOut> {
    return this.request(
      "GET",
      `/offers/returns${this.query({
        origin,
        dest,
        depart,
        min_nights: minNights,
        max_nights: maxNights,
      })}`,
    );
  }

  // --- Diagnostyka „czemu brak ofert" (panel developera) ---
  diagnose(origin: string, month: string): Promise<SearchDiagnostics> {
    return this.request("GET", `/diag/search${this.query({ origin, month })}`);
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

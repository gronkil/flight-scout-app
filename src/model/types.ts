// Typy DTO — lustro kontraktu naszego REST API (backend/adapters/inbound/api/schemas.py).
// Klient rozmawia WYŁĄCZNIE z naszym API (nigdy wprost z Travelpayouts) i nie trzyma sekretów.

export type Grade = "A" | "B" | "C" | "D";
export type TripType = "one-way" | "round-trip";
export type Channel = "push" | "mail" | "both";
export type AlertType = "PRICE_BELOW" | "NEW_TOP_DEAL";
export type Platform = "ios" | "android" | "expo";

export interface AuthOut {
  token: string;
  user_id: string;
  email: string | null;
}

export interface MeOut {
  user_id: string;
  email: string | null;
}

export interface ProfileIn {
  origins: string[];
  scope: string;
  trip_type?: TripType;
  max_price?: number | null;
  currency?: string;
  stay_min?: number | null;
  stay_max?: number | null;
  min_grade?: Grade;
}

export interface ProfileOut {
  id: string;
  origins: string[];
  scope: string;
  trip_type: string;
  max_price: number | null;
  currency: string | null;
  stay_min: number | null;
  stay_max: number | null;
  min_grade: string;
  active: boolean;
}

export interface ReturnOut {
  return_date: string;
  price: number;
  nights: number | null;
  changes: number | null;
  link: string | null;
  total: number;
}

export interface FlexOut {
  orig_date: string;
  best_date: string;
  saved: number;
}

export interface OfferOut {
  city: string;
  dest: string;
  origin: string;
  price: number;
  currency: string;
  trip_type: string;
  depart_date: string | null;
  return_date: string | null;
  changes: number | null;
  grade: Grade | null;
  score: number;
  link: string | null;
  ret: ReturnOut | null;
  flex: FlexOut | null;
}

export interface AlertIn {
  type: AlertType;
  price?: number | null;
  currency?: string;
  min_grade?: Grade | null;
  quiet_from?: string | null;
  quiet_to?: string | null;
  max_per_day?: number;
  channel?: Channel;
}

export interface AlertOut {
  id: string;
  profile_id: string;
  type: string;
  params: Record<string, unknown>;
  quiet_from: string | null;
  quiet_to: string | null;
  max_per_day: number;
  channel: string;
}

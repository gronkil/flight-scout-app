import type { OfferOut } from "./model/types";

export type RootStackParamList = {
  Login: undefined;
  Feed: undefined;
  OfferDetail: { offer: OfferOut };
  Profiles: undefined;
  Settings: undefined;
  Alerts: { profileId: string; profileName: string };
  Developer: undefined;
};

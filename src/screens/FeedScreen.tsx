import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useMemo } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { OfferCard } from "../components/OfferCard";
import { EmptyView, ErrorView, Loading } from "../components/StateViews";
import { DEFAULT_USER_ID } from "../config";
import { useI18n } from "../i18n";
import { sortOffersByScore } from "../lib/feed";
import { registerForPushToken } from "../lib/push";
import { useAsync } from "../lib/useAsync";
import type { OfferOut } from "../model/types";
import type { RootStackParamList } from "../navigation";
import { BRAND, colors } from "../theme";
import { useSession } from "../state/session";

const MARK = require("../../assets/notification-icon.png");

type Props = NativeStackScreenProps<RootStackParamList, "Feed">;

export function FeedScreen({ navigation }: Props): React.ReactElement {
  const { client, userId, signOut } = useSession();
  const { t, currency } = useI18n();
  const insets = useSafeAreaInsets();
  // Feed dwustopniowo: 1. próba szybka (~2 s) — gdy serwer czuwa, oferty są od ręki.
  // Jeśli padnie (Render usypia usługę przy bezczynności), 2. próba jest cierpliwa i
  // pozwala cold-startowi się dokończyć — ekran sam się załaduje, bez klikania.
  // Walutę przekazujemy do API — backend wycenia po swoim kursie. Zmiana waluty
  // (deps) automatycznie odświeża feed.
  const { state, reload } = useAsync<OfferOut[]>(
    (attempt) =>
      client.listOffers({ min_grade: "B", currency }, attempt === 0 ? 2000 : 45000),
    [client, currency],
    { maxAttempts: 2, retryDelayMs: 200 },
  );

  // Sortujemy raz na zmianę danych, a nie przy każdym renderze (spinner push, nawigacja itp.).
  const offers = useMemo(
    () => (state.status === "ready" ? sortOffersByScore(state.data) : []),
    [state],
  );

  // Auto-rejestracja urządzenia do push (raz, po wejściu). Przypisujemy do zalogowanego
  // użytkownika (userId z sesji); gdy brak — fallback do domyślnego. Cicho pomija błędy.
  useEffect(() => {
    let alive = true;
    void registerForPushToken().then((token) => {
      if (alive && token) {
        void client.registerDevice(userId ?? DEFAULT_USER_ID, "expo", token).catch(() => {});
      }
    });
    return () => {
      alive = false;
    };
  }, [client, userId]);

  async function handleSignOut(): Promise<void> {
    await signOut();
    navigation.replace("Login");
  }

  return (
    <View style={styles.container}>
      <View style={[styles.appbar, { paddingTop: insets.top + 10 }]}>
        <View style={styles.brand}>
          <Image source={MARK} style={styles.mark} accessibilityIgnoresInvertColors />
          <Text style={styles.wordmark}>{BRAND.name}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Profiles")}
            accessibilityRole="button"
            accessibilityLabel={t.feed.profiles}
          >
            <Text style={styles.link}>{t.feed.profiles}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("Settings")}
            accessibilityRole="button"
            accessibilityLabel={t.settings.title}
          >
            <Text style={styles.icon}>⚙</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("Developer")}
            accessibilityRole="button"
            accessibilityLabel={t.nav.developer}
          >
            <Text style={styles.icon}>🛠</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSignOut}
            accessibilityRole="button"
            accessibilityLabel={t.feed.signOut}
          >
            <Text style={styles.signout}>{t.feed.signOut}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.h1}>{t.feed.title}</Text>

      {state.status === "loading" ? (
        <Loading label={state.attempt > 0 ? t.feed.waking : undefined} />
      ) : null}
      {state.status === "error" ? <ErrorView message={state.error} onRetry={reload} /> : null}
      {state.status === "ready" ? (
        state.data.length === 0 ? (
          <EmptyView message={t.feed.empty} />
        ) : (
          <FlatList
            data={offers}
            keyExtractor={(o, i) => `${o.dest}-${o.depart_date}-${i}`}
            renderItem={({ item }) => (
              <OfferCard offer={item} onPress={(offer) => navigation.navigate("OfferDetail", { offer })} />
            )}
            contentContainerStyle={styles.list}
            initialNumToRender={8}
            windowSize={7}
            removeClippedSubviews
          />
        )
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  appbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.brand,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 8 },
  mark: { width: 20, height: 20, resizeMode: "contain" },
  wordmark: { fontSize: 18, fontWeight: "800", color: "#fff", letterSpacing: -0.3 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 14 },
  link: { color: "#fff", fontWeight: "700", fontSize: 13 },
  icon: { color: "#fff", fontSize: 15 },
  signout: { color: "rgba(255,255,255,0.85)", fontWeight: "700", fontSize: 13 },
  h1: { fontSize: 22, fontWeight: "800", color: colors.text, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4, letterSpacing: -0.4 },
  list: { padding: 16, paddingTop: 12 },
});

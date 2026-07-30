import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  Alert as RNAlert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { EmptyView, ErrorView, Loading } from "../components/StateViews";
import { useI18n } from "../i18n";
import { deleteProfileBody, searchFoundBody } from "../i18n/messages";
import { cityLabel, POLISH_CITIES } from "../lib/cities";
import { upcomingMonths } from "../lib/format";
import { useAsync } from "../lib/useAsync";
import type { ProfileOut } from "../model/types";
import type { RootStackParamList } from "../navigation";
import { useSession } from "../state/session";

type Props = NativeStackScreenProps<RootStackParamList, "Profiles">;

export function ProfilesScreen({ navigation }: Props): React.ReactElement {
  const { client } = useSession();
  const { t, lang, trip } = useI18n();
  const { state, reload } = useAsync<ProfileOut[]>(() => client.listProfiles(), []);
  const [origins, setOrigins] = useState<string[]>(["WAW"]);
  const [scope, setScope] = useState("europa");
  const [busy, setBusy] = useState(false);
  const [searchingId, setSearchingId] = useState<string | null>(null);

  // Przełącznik na stałej liście: dotknięcie dodaje lub usuwa miasto.
  // Kolejność się nie zmienia (lista nie „skacze"), a duplikaty są niemożliwe.
  function toggleOrigin(code: string): void {
    setOrigins((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  }

  async function create(): Promise<void> {
    if (origins.length === 0) {
      RNAlert.alert(t.profiles.pickCityTitle, t.profiles.pickCityBody);
      return;
    }
    setBusy(true);
    try {
      await client.createProfile({
        origins,
        scope,
        min_grade: "B",
      });
      setOrigins(["WAW"]);
      reload();
    } catch (e) {
      RNAlert.alert(t.common.fail, e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string, name: string): Promise<void> {
    RNAlert.alert(t.profiles.deleteTitle, deleteProfileBody(name, lang), [
      { text: t.common.cancel, style: "cancel" },
      {
        text: t.common.delete,
        style: "destructive",
        onPress: () => {
          void (async () => {
            try {
              await client.deleteProfile(id);
              reload();
            } catch (e) {
              RNAlert.alert(t.profiles.deleteFailTitle, e instanceof Error ? e.message : String(e));
            }
          })();
        },
      },
    ]);
  }

  async function search(id: string): Promise<void> {
    // Szukaj w oknie najbliższych miesięcy (bieżący + 2), inaczej pod koniec miesiąca
    // znajdujemy głównie loty z przeszłymi datami, które feed ukrywa → pusta strona główna.
    // Każdy miesiąc to ciężkie zapytanie do backendu — puszczamy je RÓWNOLEGLE (Promise.all),
    // żeby całość trwała ~jedno zapytanie zamiast sumy trzech (wcześniej pętla sekwencyjna).
    const months = upcomingMonths(3);
    setSearchingId(id);
    try {
      const results = await Promise.all(
        months.map((m) =>
          client.searchProfile(id, m).then(
            (offers) => ({ ok: true as const, count: offers.length }),
            (e: unknown) => ({ ok: false as const, error: e instanceof Error ? e.message : String(e) }),
          ),
        ),
      );
      const total = results.reduce((sum, r) => (r.ok ? sum + r.count : sum), 0);
      const errors = results.flatMap((r) => (r.ok ? [] : [r.error]));
      if (total > 0) {
        RNAlert.alert(t.profiles.searchedTitle, searchFoundBody(total, lang));
      } else if (errors.length === months.length) {
        RNAlert.alert(t.profiles.searchErrTitle, errors[0]);
      } else {
        RNAlert.alert(t.profiles.searchedTitle, t.profiles.noneFound);
      }
    } finally {
      setSearchingId(null);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>{t.profiles.from}</Text>
        <View style={styles.chips}>
          {POLISH_CITIES.map((city) => {
            const selected = origins.includes(city.code);
            return (
              <TouchableOpacity
                key={city.code}
                style={selected ? styles.chipSelected : styles.chip}
                onPress={() => toggleOrigin(city.code)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`${city.name}${selected ? ` (${t.profiles.selected})` : ""}`}
              >
                <Text style={selected ? styles.chipSelectedText : styles.chipText}>
                  {selected ? `✓ ${city.name}` : city.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={styles.label}>{t.profiles.scope}</Text>
        <TextInput style={styles.input} value={scope} onChangeText={setScope} autoCapitalize="none" />
        <TouchableOpacity
          style={[styles.button, busy && styles.disabled]}
          onPress={create}
          disabled={busy}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>{t.profiles.add}</Text>
        </TouchableOpacity>
      </View>

      {state.status === "loading" ? <Loading /> : null}
      {state.status === "error" ? <ErrorView message={state.error} onRetry={reload} /> : null}
      {state.status === "ready" ? (
        state.data.length === 0 ? (
          <EmptyView message={t.profiles.empty} />
        ) : (
          <FlatList
            data={state.data}
            keyExtractor={(p) => p.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  {item.origins.map(cityLabel).join(", ")} · {item.scope}
                </Text>
                <Text style={styles.cardMeta}>
                  {t.profiles.minGrade} {item.min_grade} · {trip(item.trip_type)}
                </Text>
                <View style={styles.actions}>
                  <TouchableOpacity
                    onPress={() => search(item.id)}
                    disabled={searchingId !== null}
                    accessibilityRole="button"
                  >
                    <Text style={[styles.action, searchingId !== null && styles.actionMuted]}>
                      {searchingId === item.id ? t.profiles.searching : t.profiles.searchNow}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("Alerts", {
                        profileId: item.id,
                        profileName: item.origins.map(cityLabel).join(", "),
                      })
                    }
                    accessibilityRole="button"
                  >
                    <Text style={styles.action}>{t.profiles.alertsLink}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => remove(item.id, `${item.origins.map(cityLabel).join(", ")} · ${item.scope}`)}
                    accessibilityRole="button"
                  >
                    <Text style={styles.actionDanger}>{t.common.delete}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  form: { padding: 16, gap: 6, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  label: { fontSize: 13, color: "#334155" },
  input: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, padding: 10, fontSize: 15 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#f8fafc",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  chipText: { color: "#334155", fontSize: 14 },
  chipSelected: {
    backgroundColor: "#FF5A5F",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  chipSelectedText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  button: { backgroundColor: "#FF5A5F", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 8 },
  disabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "700" },
  list: { padding: 16 },
  card: { backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb", padding: 14, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#23272E" },
  cardMeta: { fontSize: 13, color: "#64748b", marginTop: 2 },
  actions: { flexDirection: "row", gap: 20, marginTop: 10 },
  action: { color: "#FF5A5F", fontWeight: "600" },
  actionMuted: { opacity: 0.5 },
  actionDanger: { color: "#b91c1c", fontWeight: "600" },
});

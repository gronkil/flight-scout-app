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
import { upcomingMonths } from "../lib/format";
import { useAsync } from "../lib/useAsync";
import type { ProfileOut } from "../model/types";
import type { RootStackParamList } from "../navigation";
import { useSession } from "../state/session";

type Props = NativeStackScreenProps<RootStackParamList, "Profiles">;

export function ProfilesScreen({ navigation }: Props): React.ReactElement {
  const { client } = useSession();
  const { state, reload } = useAsync<ProfileOut[]>(() => client.listProfiles(), []);
  const [origins, setOrigins] = useState("WAW");
  const [scope, setScope] = useState("europa");
  const [busy, setBusy] = useState(false);

  async function create(): Promise<void> {
    setBusy(true);
    try {
      await client.createProfile({
        origins: origins.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean),
        scope,
        min_grade: "B",
      });
      setOrigins("WAW");
      reload();
    } catch (e) {
      RNAlert.alert("Nie udało się", e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function search(id: string): Promise<void> {
    // Szukaj w oknie najbliższych miesięcy (bieżący + 2), inaczej pod koniec miesiąca
    // znajdujemy głównie loty z przeszłymi datami, które feed ukrywa → pusta strona główna.
    const months = upcomingMonths(3);
    let total = 0;
    const errors: string[] = [];
    for (const m of months) {
      try {
        const offers = await client.searchProfile(id, m);
        total += offers.length;
      } catch (e) {
        errors.push(e instanceof Error ? e.message : String(e));
      }
    }
    if (total > 0) {
      RNAlert.alert("Wyszukano", `Znaleziono ${total} ofert A/B (najbliższe miesiące). Zobacz w feedzie.`);
    } else if (errors.length === months.length) {
      RNAlert.alert("Błąd wyszukiwania", errors[0]);
    } else {
      RNAlert.alert("Wyszukano", "Brak ofert A/B w najbliższych miesiącach dla tego profilu.");
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Skąd (kody IATA, po przecinku)</Text>
        <TextInput style={styles.input} value={origins} onChangeText={setOrigins} autoCapitalize="characters" />
        <Text style={styles.label}>Zakres</Text>
        <TextInput style={styles.input} value={scope} onChangeText={setScope} autoCapitalize="none" />
        <TouchableOpacity
          style={[styles.button, busy && styles.disabled]}
          onPress={create}
          disabled={busy}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Dodaj profil</Text>
        </TouchableOpacity>
      </View>

      {state.status === "loading" ? <Loading /> : null}
      {state.status === "error" ? <ErrorView message={state.error} onRetry={reload} /> : null}
      {state.status === "ready" ? (
        state.data.length === 0 ? (
          <EmptyView message="Brak profili — dodaj pierwszy powyżej." />
        ) : (
          <FlatList
            data={state.data}
            keyExtractor={(p) => p.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  {item.origins.join(", ")} · {item.scope}
                </Text>
                <Text style={styles.cardMeta}>min. ocena {item.min_grade} · {item.trip_type}</Text>
                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => search(item.id)} accessibilityRole="button">
                    <Text style={styles.action}>Szukaj teraz</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("Alerts", {
                        profileId: item.id,
                        profileName: item.origins.join(", "),
                      })
                    }
                    accessibilityRole="button"
                  >
                    <Text style={styles.action}>Alerty</Text>
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
  button: { backgroundColor: "#2563eb", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 8 },
  disabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "700" },
  list: { padding: 16 },
  card: { backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb", padding: 14, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  cardMeta: { fontSize: 13, color: "#64748b", marginTop: 2 },
  actions: { flexDirection: "row", gap: 20, marginTop: 10 },
  action: { color: "#2563eb", fontWeight: "600" },
});

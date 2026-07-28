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
import { useAsync } from "../lib/useAsync";
import type { AlertOut } from "../model/types";
import type { RootStackParamList } from "../navigation";
import { useSession } from "../state/session";

type Props = NativeStackScreenProps<RootStackParamList, "Alerts">;

export function AlertsScreen({ route }: Props): React.ReactElement {
  const { profileId } = route.params;
  const { client } = useSession();
  const { state, reload } = useAsync<AlertOut[]>(() => client.listAlerts(profileId), [profileId]);
  const [price, setPrice] = useState("500");

  async function addPriceBelow(): Promise<void> {
    const value = Number(price);
    if (!Number.isFinite(value) || value <= 0) {
      RNAlert.alert("Zła cena", "Podaj dodatnią kwotę progu.");
      return;
    }
    try {
      await client.createAlert(profileId, { type: "PRICE_BELOW", price: value, channel: "push" });
      reload();
    } catch (e) {
      RNAlert.alert("Nie udało się", e instanceof Error ? e.message : String(e));
    }
  }

  async function addTopDeal(): Promise<void> {
    try {
      await client.createAlert(profileId, { type: "NEW_TOP_DEAL", min_grade: "A", channel: "push" });
      reload();
    } catch (e) {
      RNAlert.alert("Nie udało się", e instanceof Error ? e.message : String(e));
    }
  }

  async function remove(id: string): Promise<void> {
    try {
      await client.deleteAlert(id);
      reload();
    } catch (e) {
      RNAlert.alert("Nie udało się", e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Powiadom, gdy cena ≤</Text>
        <View style={styles.rowForm}>
          <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" />
          <TouchableOpacity style={styles.button} onPress={addPriceBelow} accessibilityRole="button">
            <Text style={styles.buttonText}>Dodaj</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.ghost} onPress={addTopDeal} accessibilityRole="button">
          <Text style={styles.ghostText}>+ Alert: nowa okazja z oceną A</Text>
        </TouchableOpacity>
      </View>

      {state.status === "loading" ? <Loading /> : null}
      {state.status === "error" ? <ErrorView message={state.error} onRetry={reload} /> : null}
      {state.status === "ready" ? (
        state.data.length === 0 ? (
          <EmptyView message="Brak alertów. Dodaj pierwszy powyżej." />
        ) : (
          <FlatList
            data={state.data}
            keyExtractor={(a) => a.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.type}</Text>
                  <Text style={styles.cardMeta}>
                    kanał {item.channel} · max {item.max_per_day}/dzień
                  </Text>
                </View>
                <TouchableOpacity onPress={() => remove(item.id)} accessibilityRole="button" accessibilityLabel="Usuń alert">
                  <Text style={styles.delete}>Usuń</Text>
                </TouchableOpacity>
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
  form: { padding: 16, gap: 8, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  label: { fontSize: 13, color: "#334155" },
  rowForm: { flexDirection: "row", gap: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, padding: 10, fontSize: 15 },
  button: { backgroundColor: "#FF5C5C", paddingHorizontal: 18, justifyContent: "center", borderRadius: 8 },
  buttonText: { color: "#fff", fontWeight: "700" },
  ghost: { paddingVertical: 6 },
  ghostText: { color: "#FF5C5C", fontWeight: "600" },
  list: { padding: 16 },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb", padding: 14, marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#23272E" },
  cardMeta: { fontSize: 13, color: "#64748b", marginTop: 2 },
  delete: { color: "#b91c1c", fontWeight: "600" },
});

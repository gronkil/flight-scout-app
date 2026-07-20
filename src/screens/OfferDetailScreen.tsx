import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { GradeBadge } from "../components/GradeBadge";
import { formatPrice, offerDates, pluralNights, tripLabel } from "../lib/format";
import type { RootStackParamList } from "../navigation";

type Props = NativeStackScreenProps<RootStackParamList, "OfferDetail">;

export function OfferDetailScreen({ route }: Props): React.ReactElement {
  const { offer } = route.params;

  function open(url: string | null): void {
    if (url) void Linking.openURL(url);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.city}>
        {offer.city} <Text style={styles.code}>({offer.origin} → {offer.dest})</Text>
      </Text>
      <GradeBadge grade={offer.grade} />

      <View style={styles.box}>
        <Row label="Cena" value={formatPrice(offer.price, offer.currency)} />
        <Row label="Typ" value={tripLabel(offer.trip_type)} />
        <Row label="Daty" value={offerDates(offer)} />
        <Row
          label="Przesiadki"
          value={offer.changes === 0 ? "bezpośredni" : String(offer.changes ?? "—")}
        />
      </View>

      {offer.ret ? (
        <View style={styles.box}>
          <Text style={styles.section}>↩ Powrót</Text>
          <Row label="Data" value={offer.ret.return_date} />
          <Row label="Cena" value={formatPrice(offer.ret.price, offer.currency)} />
          <Row label="Pobyt" value={pluralNights(offer.ret.nights)} />
          <Row label="Razem" value={`~${formatPrice(offer.ret.total, offer.currency)}`} />
        </View>
      ) : null}

      {offer.link ? (
        <TouchableOpacity
          style={styles.button}
          onPress={() => open(offer.link)}
          accessibilityRole="button"
          accessibilityLabel="Otwórz lot tam na Aviasales"
        >
          <Text style={styles.buttonText}>Lot tam →</Text>
        </TouchableOpacity>
      ) : null}
      {offer.ret?.link ? (
        <TouchableOpacity
          style={[styles.button, styles.secondary]}
          onPress={() => open(offer.ret?.link ?? null)}
          accessibilityRole="button"
          accessibilityLabel="Otwórz powrót na Aviasales"
        >
          <Text style={styles.buttonText}>Powrót →</Text>
        </TouchableOpacity>
      ) : null}

      <Text style={styles.note}>Ceny z cache — potwierdź klikając w link.</Text>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }): React.ReactElement {
  return (
    <View style={styles.rowLine}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 14, backgroundColor: "#f8fafc" },
  city: { fontSize: 24, fontWeight: "800", color: "#0f172a" },
  code: { fontSize: 15, color: "#94a3b8", fontWeight: "500" },
  box: { backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb", padding: 14, gap: 6 },
  section: { fontSize: 15, fontWeight: "700", color: "#16a34a", marginBottom: 4 },
  rowLine: { flexDirection: "row", justifyContent: "space-between" },
  rowLabel: { color: "#64748b", fontSize: 14 },
  rowValue: { color: "#0f172a", fontSize: 14, fontWeight: "600" },
  button: { backgroundColor: "#2563eb", padding: 14, borderRadius: 8, alignItems: "center" },
  secondary: { backgroundColor: "#0ea5e9" },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  note: { color: "#94a3b8", fontSize: 12, textAlign: "center", marginTop: 8 },
});

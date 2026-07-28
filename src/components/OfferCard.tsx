import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { formatPrice, offerDates, pluralNights, tripLabel } from "../lib/format";
import type { OfferOut } from "../model/types";
import { GradeBadge } from "./GradeBadge";

export function OfferCard({
  offer,
  onPress,
}: {
  offer: OfferOut;
  onPress: (offer: OfferOut) => void;
}): React.ReactElement {
  const changes =
    offer.changes === 0 ? "bezpośredni" : offer.changes === null ? "" : `${offer.changes} przes.`;
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(offer)}
      accessibilityRole="button"
      accessibilityLabel={`${offer.city}, ${formatPrice(offer.price, offer.currency)}, ocena ${
        offer.grade ?? "brak"
      }`}
    >
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={styles.city}>
            {offer.city} <Text style={styles.code}>({offer.dest})</Text>
          </Text>
          <Text style={styles.meta}>
            {tripLabel(offer.trip_type)} · {offerDates(offer)}
            {changes ? ` · ${changes}` : ""}
          </Text>
          {offer.flex ? (
            <Text style={styles.flex}>
              💡 taniej o {Math.round(offer.flex.saved)} {offer.currency} niż {offer.flex.orig_date}
            </Text>
          ) : null}
          {offer.ret ? (
            <Text style={styles.ret}>
              ↩ powrót {offer.ret.return_date} · {formatPrice(offer.ret.price, offer.currency)} (pobyt{" "}
              {pluralNights(offer.ret.nights)}) · razem ~{formatPrice(offer.ret.total, offer.currency)}
            </Text>
          ) : null}
        </View>
        <View style={styles.right}>
          <Text style={styles.price}>{formatPrice(offer.price, offer.currency)}</Text>
          <GradeBadge grade={offer.grade} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16,
    marginBottom: 12,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  left: { flex: 1, paddingRight: 12, gap: 4 },
  right: { alignItems: "flex-end", gap: 8 },
  city: { fontSize: 17, fontWeight: "700", color: "#23272E" },
  code: { fontSize: 13, color: "#94a3b8", fontWeight: "500" },
  meta: { fontSize: 13, color: "#64748b" },
  flex: { fontSize: 12, color: "#b45309" },
  ret: { fontSize: 12, color: "#23272E" },
  price: { fontSize: 20, fontWeight: "800", color: "#23272E" },
});

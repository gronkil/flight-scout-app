import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useI18n } from "../i18n";
import { offerDates } from "../lib/format";
import type { OfferOut } from "../model/types";
import { cardShadow, colors } from "../theme";
import { GradeBadge } from "./GradeBadge";

export function OfferCard({
  offer,
  onPress,
}: {
  offer: OfferOut;
  onPress: (offer: OfferOut) => void;
}): React.ReactElement {
  const { t, money, trip, changes, nights } = useI18n();
  const changesText = changes(offer.changes);
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(offer)}
      accessibilityRole="button"
      accessibilityLabel={`${offer.city}, ${money(offer.price, offer.currency)}, ${offer.grade ?? "?"}`}
    >
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={styles.city}>
            {offer.city} <Text style={styles.code}>({offer.dest})</Text>
          </Text>
          <Text style={styles.meta}>
            {trip(offer.trip_type)} · {offerDates(offer)}
            {changesText ? ` · ${changesText}` : ""}
          </Text>
          {offer.flex ? (
            <Text style={styles.flex}>
              {t.offer.flexPrefix} {money(offer.flex.saved, offer.currency)} {t.offer.flexThan}{" "}
              {offer.flex.orig_date}
            </Text>
          ) : null}
          {offer.ret ? (
            <Text style={styles.ret}>
              {t.offer.retPrefix} {offer.ret.return_date} · {money(offer.ret.price, offer.currency)} (
              {t.offer.stay} {nights(offer.ret.nights)}) · {t.offer.total}
              {money(offer.ret.total, offer.currency)}
            </Text>
          ) : null}
        </View>
        <View style={styles.right}>
          <Text style={styles.price}>{money(offer.price, offer.currency)}</Text>
          <GradeBadge grade={offer.grade} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
    ...cardShadow,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  left: { flex: 1, paddingRight: 12, gap: 4 },
  right: { alignItems: "flex-end", gap: 8 },
  city: { fontSize: 17, fontWeight: "700", color: colors.text },
  code: { fontSize: 13, color: colors.textFaint, fontWeight: "500" },
  meta: { fontSize: 13, color: colors.textMuted },
  flex: { fontSize: 12, color: "#B45309", fontWeight: "600" },
  ret: { fontSize: 12, color: colors.text },
  price: { fontSize: 20, fontWeight: "800", color: colors.text },
});

import React from "react";
import { StyleSheet, Text, View } from "react-native";

import type { Grade } from "../model/types";
import { gradeBadge } from "../theme";

// Odznaka oceny: żywy „pill" z etykietą „ocena X" — jak w makiecie „Odlot".
// `tone="onColor"` = wariant na kolorowym tle (hero) — półprzezroczysta biel.
export function GradeBadge({
  grade,
  tone = "default",
}: {
  grade: Grade | null;
  tone?: "default" | "onColor";
}): React.ReactElement {
  const label = grade ?? "?";
  const bg = tone === "onColor" ? "rgba(255,255,255,0.22)" : colorFor(grade);
  return (
    <View
      style={[styles.badge, { backgroundColor: bg }]}
      accessibilityLabel={`Ocena ${label}`}
    >
      <Text style={styles.text}>ocena {label}</Text>
    </View>
  );
}

function colorFor(grade: Grade | null): string {
  switch (grade) {
    case "A":
      return gradeBadge.A;
    case "B":
      return gradeBadge.B;
    case "C":
      return gradeBadge.C;
    case "D":
      return gradeBadge.D;
    default:
      return gradeBadge.unknown;
  }
}

const styles = StyleSheet.create({
  badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999, alignSelf: "flex-start" },
  text: { color: "#fff", fontSize: 11, fontWeight: "800", letterSpacing: 0.2 },
});

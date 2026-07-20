import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { gradeColor } from "../lib/format";
import type { Grade } from "../model/types";

export function GradeBadge({ grade }: { grade: Grade | null }): React.ReactElement {
  const label = grade ?? "?";
  return (
    <View
      style={[styles.badge, { backgroundColor: gradeColor(grade) }]}
      accessibilityLabel={`Ocena ${label}`}
    >
      <Text style={styles.text}>ocena {label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 999, alignSelf: "flex-start" },
  text: { color: "#fff", fontSize: 11, fontWeight: "700" },
});

// Widoki stanów: ładowanie / błąd / pustka — spójne, z etykietami dostępności (G4).
import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useI18n } from "../i18n";

export function Loading({ label }: { label?: string } = {}): React.ReactElement {
  const { t } = useI18n();
  return (
    <View style={styles.center} accessibilityLabel={label ?? t.states.loading}>
      <ActivityIndicator size="large" color="#FF5A5F" />
      {label ? <Text style={styles.sub}>{label}</Text> : null}
    </View>
  );
}

export function ErrorView({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}): React.ReactElement {
  const { t } = useI18n();
  return (
    <View style={styles.center}>
      <Text style={styles.title} accessibilityRole="alert">
        {t.states.error}
      </Text>
      <Text style={styles.sub}>{message}</Text>
      {onRetry ? (
        <TouchableOpacity
          style={styles.button}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel={t.states.retry}
        >
          <Text style={styles.buttonText}>{t.states.retry}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function EmptyView({ message }: { message: string }): React.ReactElement {
  return (
    <View style={styles.center}>
      <Text style={styles.sub}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 10 },
  title: { fontSize: 18, fontWeight: "700", color: "#23272E" },
  sub: { fontSize: 14, color: "#64748b", textAlign: "center" },
  button: { backgroundColor: "#FF5A5F", paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8 },
  buttonText: { color: "#fff", fontWeight: "600" },
});

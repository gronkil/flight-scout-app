// Widoki stanów: ładowanie / błąd / pustka — spójne, z etykietami dostępności (G4).
import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function Loading(): React.ReactElement {
  return (
    <View style={styles.center} accessibilityLabel="Ładowanie">
      <ActivityIndicator size="large" color="#FF5C5C" />
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
  return (
    <View style={styles.center}>
      <Text style={styles.title} accessibilityRole="alert">
        Coś poszło nie tak
      </Text>
      <Text style={styles.sub}>{message}</Text>
      {onRetry ? (
        <TouchableOpacity
          style={styles.button}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Spróbuj ponownie"
        >
          <Text style={styles.buttonText}>Spróbuj ponownie</Text>
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
  button: { backgroundColor: "#FF5C5C", paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8 },
  buttonText: { color: "#fff", fontWeight: "600" },
});

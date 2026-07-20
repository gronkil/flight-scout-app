import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { useSession } from "../state/session";
import type { RootStackParamList } from "../navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export function LoginScreen({ navigation }: Props): React.ReactElement {
  const { baseUrl, setBaseUrl, setToken } = useSession();
  const [url, setUrl] = useState(baseUrl);
  const [key, setKey] = useState("");

  function signIn(): void {
    setBaseUrl(url);
    setToken(key || null);
    navigation.replace("Feed");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>✈️ flight-scout</Text>
      <Text style={styles.sub}>Zaloguj się do swojego API. Sekret nie jest zaszyty w aplikacji.</Text>

      <Text style={styles.label}>Adres API</Text>
      <TextInput
        style={styles.input}
        value={url}
        onChangeText={setUrl}
        autoCapitalize="none"
        keyboardType="url"
        accessibilityLabel="Adres API"
      />

      <Text style={styles.label}>Klucz / token</Text>
      <TextInput
        style={styles.input}
        value={key}
        onChangeText={setKey}
        autoCapitalize="none"
        secureTextEntry
        accessibilityLabel="Klucz lub token dostępu"
      />

      <TouchableOpacity style={styles.button} onPress={signIn} accessibilityRole="button">
        <Text style={styles.buttonText}>Wejdź</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center", gap: 8, backgroundColor: "#f8fafc" },
  title: { fontSize: 28, fontWeight: "800", color: "#0f172a" },
  sub: { fontSize: 14, color: "#64748b", marginBottom: 12 },
  label: { fontSize: 13, color: "#334155", marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    fontSize: 15,
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 18,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});

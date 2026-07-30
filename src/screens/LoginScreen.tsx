import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { GoogleSignInButton } from "../components/GoogleSignInButton";
import { isGoogleConfigured } from "../config";
import type { RootStackParamList } from "../navigation";
import { BRAND } from "../theme";
import { useSession } from "../state/session";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;
type Mode = "login" | "register";

export function LoginScreen({ navigation }: Props): React.ReactElement {
  const {
    baseUrl,
    setBaseUrl,
    isAuthed,
    restoring,
    loginWithPassword,
    registerWithPassword,
    loginWithGoogle,
  } = useSession();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [url, setUrl] = useState(baseUrl);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Już zalogowany (sesja odtworzona z pamięci) → od razu do listy ofert.
  useEffect(() => {
    if (!restoring && isAuthed) navigation.replace("Feed");
  }, [restoring, isAuthed, navigation]);

  // Token z logowania Google → wyślij do naszego API.
  const onGoogleToken = useCallback(
    (idToken: string) => {
      setBusy(true);
      setError(null);
      loginWithGoogle(idToken)
        .then(() => navigation.replace("Feed"))
        .catch((e: unknown) => setError(messageOf(e)))
        .finally(() => setBusy(false));
    },
    [loginWithGoogle, navigation],
  );

  async function submit(): Promise<void> {
    if (!email.trim() || !password) {
      setError("Podaj e-mail i hasło.");
      return;
    }
    setBusy(true);
    setError(null);
    setBaseUrl(url);
    try {
      if (mode === "register") await registerWithPassword(email.trim(), password);
      else await loginWithPassword(email.trim(), password);
      navigation.replace("Feed");
    } catch (e: unknown) {
      setError(messageOf(e));
    } finally {
      setBusy(false);
    }
  }

  if (restoring) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#FF5C5C" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{BRAND.name}</Text>
      <Text style={styles.brandTagline}>{BRAND.tagline}</Text>
      <Text style={styles.sub}>
        {mode === "login" ? "Zaloguj się na swoje konto." : "Załóż konto (e-mail i hasło)."}
      </Text>

      <Text style={styles.label}>E-mail</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        placeholder="ty@example.com"
        accessibilityLabel="E-mail"
      />

      <Text style={styles.label}>Hasło</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        secureTextEntry
        placeholder={mode === "register" ? "min. 8 znaków" : "hasło"}
        accessibilityLabel="Hasło"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.button, busy && styles.buttonDisabled]}
        onPress={submit}
        disabled={busy}
        accessibilityRole="button"
      >
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{mode === "login" ? "Zaloguj" : "Zarejestruj"}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          setMode(mode === "login" ? "register" : "login");
          setError(null);
        }}
        accessibilityRole="button"
      >
        <Text style={styles.switchText}>
          {mode === "login" ? "Nie masz konta? Zarejestruj się" : "Masz już konto? Zaloguj się"}
        </Text>
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.or}>lub</Text>
        <View style={styles.line} />
      </View>

      {isGoogleConfigured() ? (
        <GoogleSignInButton disabled={busy} onToken={onGoogleToken} onError={setError} />
      ) : (
        <Text style={styles.hint}>
          Logowanie Google wymaga konfiguracji (app.json → extra.google). Patrz docs/DEPLOY.md.
        </Text>
      )}

      <TouchableOpacity onPress={() => setShowAdvanced((v) => !v)} accessibilityRole="button">
        <Text style={styles.advanced}>{showAdvanced ? "Ukryj ustawienia" : "Zaawansowane"}</Text>
      </TouchableOpacity>
      {showAdvanced ? (
        <>
          <Text style={styles.label}>Adres API</Text>
          <TextInput
            style={styles.input}
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            keyboardType="url"
            accessibilityLabel="Adres API"
          />
        </>
      ) : null}
    </ScrollView>
  );
}

function messageOf(e: unknown): string {
  if (e && typeof e === "object" && "message" in e) return String((e as { message: unknown }).message);
  return "Coś poszło nie tak. Spróbuj ponownie.";
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 8, backgroundColor: "#f8fafc", flexGrow: 1, justifyContent: "center" },
  center: { alignItems: "center", justifyContent: "center" },
  title: { fontSize: 34, fontWeight: "800", color: "#23272E", letterSpacing: -1 },
  brandTagline: { fontSize: 15, fontWeight: "600", color: "#FF5A5F", marginBottom: 20 },
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
  error: { color: "#dc2626", fontSize: 14, marginTop: 8 },
  button: {
    backgroundColor: "#FF5C5C",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 18,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  switchText: { color: "#FF5C5C", textAlign: "center", marginTop: 14, fontWeight: "600" },
  divider: { flexDirection: "row", alignItems: "center", marginVertical: 18, gap: 10 },
  line: { flex: 1, height: 1, backgroundColor: "#e2e8f0" },
  or: { color: "#94a3b8", fontSize: 13 },
  googleButton: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  googleText: { color: "#23272E", fontWeight: "700", fontSize: 16 },
  hint: { color: "#94a3b8", fontSize: 12, marginTop: 6, textAlign: "center" },
  advanced: { color: "#64748b", textAlign: "center", marginTop: 22, fontSize: 13 },
});

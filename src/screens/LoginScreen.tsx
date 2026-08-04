import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GoogleSignInButton } from "../components/GoogleSignInButton";
import { isGoogleConfigured } from "../config";
import { useI18n } from "../i18n";
import type { RootStackParamList } from "../navigation";
import { BRAND, colors } from "../theme";
import { useSession } from "../state/session";

const MARK = require("../../assets/notification-icon.png");

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
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

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
        .catch((e: unknown) => setError(messageOf(e, t.login.genericError)))
        .finally(() => setBusy(false));
    },
    [loginWithGoogle, navigation, t],
  );

  async function submit(): Promise<void> {
    if (!email.trim() || !password) {
      setError(t.login.needCredentials);
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
      setError(messageOf(e, t.login.genericError));
    } finally {
      setBusy(false);
    }
  }

  if (restoring) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#FF5A5F" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={[styles.top, { paddingTop: insets.top + 28 }]}>
        <Image source={MARK} style={styles.mark} accessibilityIgnoresInvertColors />
        <Text style={styles.title}>{BRAND.name}</Text>
        <Text style={styles.brandTagline}>{t.login.tagline}</Text>
      </View>

      <View style={styles.body}>
      <Text style={styles.sub}>
        {mode === "login" ? t.login.subLogin : t.login.subRegister}
      </Text>

      <Text style={styles.label}>{t.login.email}</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        keyboardType="email-address"
        placeholder={t.login.emailPlaceholder}
        accessibilityLabel={t.login.email}
      />

      <Text style={styles.label}>{t.login.password}</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        secureTextEntry
        autoComplete={mode === "register" ? "password-new" : "current-password"}
        textContentType={mode === "register" ? "newPassword" : "password"}
        placeholder={mode === "register" ? t.login.passwordPlaceholderRegister : t.login.passwordPlaceholderLogin}
        accessibilityLabel={t.login.password}
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
          <Text style={styles.buttonText}>{mode === "login" ? t.login.login : t.login.register}</Text>
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
          {mode === "login" ? t.login.toRegister : t.login.toLogin}
        </Text>
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.or}>{t.login.or}</Text>
        <View style={styles.line} />
      </View>

      {isGoogleConfigured() ? (
        <GoogleSignInButton disabled={busy} onToken={onGoogleToken} onError={setError} />
      ) : (
        <Text style={styles.hint}>{t.login.googleHint}</Text>
      )}

      <TouchableOpacity onPress={() => setShowAdvanced((v) => !v)} accessibilityRole="button">
        <Text style={styles.advanced}>{showAdvanced ? t.login.advancedHide : t.login.advancedShow}</Text>
      </TouchableOpacity>
      {showAdvanced ? (
        <>
          <Text style={styles.label}>{t.login.apiUrl}</Text>
          <TextInput
            style={styles.input}
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            keyboardType="url"
            accessibilityLabel={t.login.apiUrl}
          />
        </>
      ) : null}
      </View>
    </ScrollView>
  );
}

function messageOf(e: unknown, fallback: string): string {
  if (e && typeof e === "object" && "message" in e) return String((e as { message: unknown }).message);
  return fallback;
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#f8fafc", flexGrow: 1 },
  top: {
    backgroundColor: colors.ink,
    alignItems: "center",
    paddingBottom: 28,
    paddingHorizontal: 24,
  },
  mark: { width: 44, height: 44, resizeMode: "contain", marginBottom: 8 },
  body: { padding: 24, gap: 8 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 34, fontWeight: "800", color: "#fff", letterSpacing: -1 },
  brandTagline: { fontSize: 14, fontWeight: "600", color: "#FFB9AE", marginTop: 2 },
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
    backgroundColor: "#FF5A5F",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 18,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  switchText: { color: "#FF5A5F", textAlign: "center", marginTop: 14, fontWeight: "600" },
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

// Przycisk logowania Google. WAŻNE: hook `useIdTokenAuthRequest` rzuca wyjątek, gdy nie
// ma clientId — dlatego ten komponent renderujemy WYŁĄCZNIE gdy Google jest skonfigurowany
// (patrz LoginScreen). Bez konfiguracji komponent się nie montuje → hook się nie wywołuje.
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

import { googleConfig } from "../config";

WebBrowser.maybeCompleteAuthSession();

interface Props {
  disabled?: boolean;
  onToken: (idToken: string) => void;
  onError: (message: string) => void;
}

export function GoogleSignInButton({ disabled, onToken, onError }: Props): React.ReactElement {
  const gcfg = googleConfig();
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    androidClientId: gcfg.androidClientId,
    webClientId: gcfg.webClientId,
  });

  useEffect(() => {
    if (response?.type === "success" && response.params?.id_token) {
      onToken(response.params.id_token);
    } else if (response?.type === "error") {
      onError("Logowanie Google nie powiodło się.");
    }
  }, [response, onToken, onError]);

  return (
    <TouchableOpacity
      style={[styles.button, (!request || disabled) && styles.disabled]}
      onPress={() => void promptAsync()}
      disabled={!request || disabled}
      accessibilityRole="button"
    >
      <Text style={styles.text}>Zaloguj przez Google</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  disabled: { opacity: 0.5 },
  text: { color: "#0f172a", fontWeight: "700", fontSize: 16 },
});

// Ekran developera w apce: diagnostyka „czemu brak ofert", token sesji do skopiowania
// oraz skrót do pełnego panelu /console w przeglądarce. Diagnostyka wymaga tylko
// zalogowania (endpoint /diag/search nie potrzebuje ADMIN_EMAIL).
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { currentMonth } from "../lib/format";
import type { SearchDiagnostics } from "../model/types";
import { useSession } from "../state/session";

function verdict(d: SearchDiagnostics): string {
  if (d.error) {
    return `❌ Dostawca danych niedostępny: ${d.error}\nNajczęściej zły/wygasły TP_TOKEN na Render albo limit zapytań.`;
  }
  if (d.raw_count === 0) {
    return `⚠️ Travelpayouts nie zwrócił ofert dla ${d.origin} / ${d.month}.\nCache dostawcy pusty/rzadki — spróbuj inny miesiąc w przód.`;
  }
  if (d.kept_ab === 0) {
    return `⚠️ Dane są (${d.raw_count} ofert), ale żadna nie ma oceny A/B — za drogie.\nRozkład ocen: ${JSON.stringify(d.grade_counts)}.`;
  }
  return `✅ OK — ${d.raw_count} ofert z dostawcy, w tym ${d.kept_ab} z oceną A/B.`;
}

export function DeveloperScreen(): React.ReactElement {
  const { client, token, baseUrl } = useSession();
  const [origin, setOrigin] = useState("WAW");
  const [month, setMonth] = useState(currentMonth());
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runDiagnose(): Promise<void> {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const d = await client.diagnose(origin.trim().toUpperCase() || "WAW", month.trim() || currentMonth());
      setResult(`${verdict(d)}\n\n${JSON.stringify(d, null, 2)}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function openConsole(): Promise<void> {
    await WebBrowser.openBrowserAsync(`${baseUrl.replace(/\/+$/, "")}/console`);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.h2}>🔎 Diagnostyka „czemu brak ofert?”</Text>
      <Text style={styles.hint}>
        Sprawdza, ile ofert daje Travelpayouts i jak wyglądają oceny — powie, czy problem to
        token, brak danych, czy za drogie loty.
      </Text>
      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>origin (IATA)</Text>
          <TextInput
            style={styles.input}
            value={origin}
            onChangeText={setOrigin}
            autoCapitalize="characters"
            accessibilityLabel="Lotnisko wylotu"
          />
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>miesiąc (YYYY-MM)</Text>
          <TextInput
            style={styles.input}
            value={month}
            onChangeText={setMonth}
            accessibilityLabel="Miesiąc"
          />
        </View>
      </View>
      <TouchableOpacity
        style={[styles.btn, busy ? styles.btnDisabled : null]}
        onPress={runDiagnose}
        disabled={busy}
        accessibilityRole="button"
      >
        <Text style={styles.btnText}>{busy ? "Sprawdzam…" : "Diagnozuj wyszukiwanie"}</Text>
      </TouchableOpacity>
      {error ? <Text style={styles.err}>{error}</Text> : null}
      {result ? (
        <Text style={styles.mono} selectable>
          {result}
        </Text>
      ) : null}

      <Text style={styles.h2}>🔑 Token sesji</Text>
      <Text style={styles.hint}>Dotknij pole, aby zaznaczyć i skopiować token.</Text>
      <TextInput
        style={styles.mono}
        value={token ?? "(niezalogowany)"}
        editable={false}
        selectTextOnFocus
        multiline
        accessibilityLabel="Token sesji"
      />

      <Text style={styles.h2}>🛠 Pełny panel</Text>
      <TouchableOpacity
        style={[styles.btn, styles.alt]}
        onPress={openConsole}
        accessibilityRole="button"
      >
        <Text style={styles.btnText}>Otwórz pełny panel (/console) w przeglądarce</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  content: { padding: 16, gap: 6 },
  h2: { fontSize: 16, fontWeight: "800", color: "#0f172a", marginTop: 14 },
  hint: { fontSize: 13, color: "#475569", lineHeight: 19 },
  row: { flexDirection: "row", gap: 10, marginTop: 6 },
  col: { flex: 1 },
  label: { fontSize: 12, color: "#64748b", marginBottom: 2 },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#fff",
    color: "#0f172a",
  },
  btn: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  btnDisabled: { opacity: 0.6 },
  alt: { backgroundColor: "#334155" },
  btnText: { color: "#fff", fontWeight: "700" },
  err: { color: "#b91c1c", marginTop: 8, fontWeight: "600" },
  mono: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#0f172a",
    backgroundColor: "#e2e8f0",
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
});

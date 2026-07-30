import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useI18n } from "../i18n";
import { LANGS, langLabel, type Lang } from "../i18n/messages";
import { CURRENCIES, type Currency } from "../lib/money";
import { colors, radius, space } from "../theme";

export function SettingsScreen(): React.ReactElement {
  const { t, lang, setLang, currency, setCurrency, money } = useI18n();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Język */}
      <Text style={styles.label}>{t.settings.language}</Text>
      <View style={styles.group}>
        {LANGS.map((l: Lang) => (
          <Option
            key={l}
            active={l === lang}
            label={langLabel[l]}
            onPress={() => setLang(l)}
          />
        ))}
      </View>
      <Text style={styles.note}>{t.settings.languageNote}</Text>

      {/* Waluta */}
      <Text style={[styles.label, { marginTop: space.xl }]}>{t.settings.currency}</Text>
      <View style={styles.group}>
        {CURRENCIES.map((c: Currency) => (
          <Option
            key={c}
            active={c === currency}
            label={c}
            onPress={() => setCurrency(c)}
          />
        ))}
      </View>
      <Text style={styles.note}>{t.settings.currencyNote}</Text>

      {/* Podgląd formatu ceny w wybranym języku/walucie */}
      <View style={styles.preview}>
        <Text style={styles.previewLabel}>{t.offer.price}</Text>
        <Text style={styles.previewValue}>{money(189)}</Text>
      </View>
    </ScrollView>
  );
}

function Option({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}): React.ReactElement {
  return (
    <TouchableOpacity
      style={[styles.option, active && styles.optionActive]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
    >
      <Text style={[styles.optionText, active && styles.optionTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { padding: space.xl, backgroundColor: colors.bg, gap: space.sm, flexGrow: 1 },
  label: { fontSize: 13, fontWeight: "700", color: colors.textMuted, letterSpacing: 0.4, textTransform: "uppercase" },
  group: { flexDirection: "row", flexWrap: "wrap", gap: space.sm, marginTop: space.sm },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  optionText: { fontSize: 15, fontWeight: "700", color: colors.text },
  optionTextActive: { color: "#fff" },
  note: { fontSize: 12, color: colors.textFaint, marginTop: space.sm, lineHeight: 17 },
  preview: {
    marginTop: space.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  previewLabel: { fontSize: 14, color: colors.textMuted },
  previewValue: { fontSize: 22, fontWeight: "800", color: colors.text },
});

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { OfferCard } from "../components/OfferCard";
import { EmptyView, ErrorView, Loading } from "../components/StateViews";
import { useI18n } from "../i18n";
import { buildDepartCalendar, offersForDate, type DepartCell } from "../lib/departCalendar";
import { useAsync } from "../lib/useAsync";
import type { DepartCalendarOut } from "../model/types";
import type { RootStackParamList } from "../navigation";
import { colors } from "../theme";
import { useSession } from "../state/session";

type Props = NativeStackScreenProps<RootStackParamList, "Calendar">;

type Money = (amount: number, currency?: string) => string;

// „Dziś" jako YYYY-MM-DD w czasie lokalnym — wyznacza dni przeszłe (już nie polecisz).
function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function CalendarScreen({ navigation }: Props): React.ReactElement {
  const { client } = useSession();
  const { t, currency, money } = useI18n();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string | null>(null);

  // Kalendarz wylotów z API: te same oferty co feed, pogrupowane po dacie wylotu.
  // Dwustopniowo (szybka próba + cierpliwa) — tak jak feed budzi uśpiony backend.
  const { state, reload } = useAsync<DepartCalendarOut>(
    (attempt) => client.departCalendar({ currency }, attempt === 0 ? 2000 : 45000),
    [client, currency],
    { maxAttempts: 2, retryDelayMs: 200 },
  );

  const days = state.status === "ready" ? state.data.days : [];
  const today = todayISO();
  const months = useMemo(
    () => buildDepartCalendar(days, today, [...t.cal.months]),
    [days, today, t.cal.months],
  );
  const dayOffers = useMemo(
    () => (selected ? offersForDate(days, selected) : []),
    [days, selected],
  );

  return (
    <View style={styles.screen}>
      <View style={[styles.hero, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel={t.depart.back}
        >
          <Text style={styles.back}>‹ {t.depart.back}</Text>
        </TouchableOpacity>
        <Text style={styles.heroTitle}>{t.depart.title}</Text>
        <Text style={styles.heroSub}>{t.depart.subtitle}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {state.status === "loading" ? (
          <Loading label={state.attempt > 0 ? t.feed.waking : undefined} />
        ) : null}
        {state.status === "error" ? <ErrorView message={state.error} onRetry={reload} /> : null}
        {state.status === "ready" ? (
          months.length === 0 ? (
            <EmptyView message={t.depart.empty} />
          ) : (
            <>
              <View style={styles.calWrap}>
                {months.map((m) => (
                  <View key={`${m.year}-${m.month}`} style={styles.month}>
                    <Text style={styles.monthLabel}>{m.label}</Text>
                    <View style={styles.weekRow}>
                      {t.cal.weekdays.map((w) => (
                        <Text key={w} style={styles.weekday}>
                          {w}
                        </Text>
                      ))}
                    </View>
                    {m.weeks.map((week, wi) => (
                      <View key={wi} style={styles.weekRow}>
                        {week.map((cell, ci) => (
                          <Cell
                            key={cell.date ?? `blank-${wi}-${ci}`}
                            cell={cell}
                            currency={currency}
                            money={money}
                            selected={cell.date !== null && cell.date === selected}
                            onSelect={setSelected}
                          />
                        ))}
                      </View>
                    ))}
                  </View>
                ))}
                <Text style={styles.calHint}>{t.depart.hint}</Text>
              </View>

              {selected ? (
                <View style={styles.dayBlock}>
                  <Text style={styles.dayHeader}>
                    {t.depart.dayHeader} {selected}
                  </Text>
                  {dayOffers.length === 0 ? (
                    <Text style={styles.noneForDay}>{t.depart.noneForDay}</Text>
                  ) : (
                    dayOffers.map((offer, i) => (
                      <OfferCard
                        key={`${offer.dest}-${offer.return_date}-${i}`}
                        offer={offer}
                        onPress={(o) => navigation.navigate("OfferDetail", { offer: o })}
                      />
                    ))
                  )}
                </View>
              ) : (
                <Text style={styles.pickPrompt}>{t.depart.pickPrompt}</Text>
              )}
            </>
          )
        ) : null}
      </ScrollView>
    </View>
  );
}

function Cell({
  cell,
  currency,
  money,
  selected,
  onSelect,
}: {
  cell: DepartCell;
  currency: string;
  money: Money;
  selected: boolean;
  onSelect: (date: string) => void;
}): React.ReactElement {
  if (cell.date === null) return <View style={styles.cell} />;
  const active = cell.price !== null && !cell.past;
  const cellStyle = [
    styles.cell,
    styles.cellFilled,
    cell.past ? styles.cellPast : null,
    active && cell.cheapest ? styles.cellHot : active ? styles.cellHas : null,
    selected ? styles.cellSelected : null,
  ];
  const label =
    active && cell.price !== null
      ? `${cell.date} · ${money(cell.price, currency)}`
      : (cell.date ?? "");
  return (
    <TouchableOpacity
      style={cellStyle}
      disabled={!active}
      onPress={() => onSelect(cell.date as string)}
      accessibilityRole={active ? "button" : "text"}
      accessibilityLabel={label}
      accessibilityState={{ selected }}
    >
      <Text style={[styles.cellDay, cell.past ? styles.cellDayPast : null]}>{cell.day}</Text>
      <Text style={styles.cellPrice}>{cell.price !== null ? Math.round(cell.price) : "–"}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f8fafc" },
  hero: { backgroundColor: colors.brand, paddingHorizontal: 16, paddingBottom: 20 },
  back: { color: "rgba(255,255,255,0.92)", fontSize: 12, fontWeight: "600" },
  heroTitle: { color: "#fff", fontSize: 26, fontWeight: "800", letterSpacing: -0.5, marginTop: 6 },
  heroSub: { color: "rgba(255,255,255,0.92)", fontSize: 13, marginTop: 6, lineHeight: 18 },
  container: { padding: 20, gap: 14 },
  pickPrompt: { color: "#94a3b8", fontSize: 13, textAlign: "center", marginTop: 4 },
  // kalendarz (spójny z ekranem oferty)
  calWrap: { gap: 8 },
  month: { backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb", padding: 10, gap: 4 },
  monthLabel: { fontSize: 15, fontWeight: "800", color: "#23272E", marginBottom: 2 },
  weekRow: { flexDirection: "row", gap: 4 },
  weekday: { flex: 1, textAlign: "center", fontSize: 11, fontWeight: "700", color: "#94a3b8" },
  cell: { flex: 1, aspectRatio: 1, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  cellFilled: { backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#eef2f7" },
  cellPast: { backgroundColor: "#f1f5f9", borderStyle: "dashed", opacity: 0.5 },
  cellHas: { backgroundColor: "#FFE9E6", borderColor: "#ffd4cd" },
  cellHot: { backgroundColor: "#FFC24B", borderColor: "#f0b53a" },
  cellSelected: { borderWidth: 2, borderColor: colors.brand },
  cellDay: { fontSize: 11, fontWeight: "700", color: "#64748b", lineHeight: 13 },
  cellDayPast: { color: "#aeb6c0" },
  cellPrice: { fontSize: 12, fontWeight: "800", color: "#23272E", lineHeight: 14 },
  calHint: { color: "#94a3b8", fontSize: 12, marginTop: 2 },
  dayBlock: { gap: 0, marginTop: 4 },
  dayHeader: { fontSize: 16, fontWeight: "800", color: "#23272E", marginBottom: 10 },
  noneForDay: { color: "#94a3b8", fontSize: 13 },
});

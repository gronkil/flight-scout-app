import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { GradeBadge } from "../components/GradeBadge";
import { EmptyView, ErrorView, Loading } from "../components/StateViews";
import { useI18n } from "../i18n";
import { offerDates } from "../lib/format";
import { buildReturnCalendar, type CalCell } from "../lib/returnCalendar";
import { useAsync } from "../lib/useAsync";
import type { ReturnCalendarOut } from "../model/types";
import type { RootStackParamList } from "../navigation";
import { useSession } from "../state/session";

type Props = NativeStackScreenProps<RootStackParamList, "OfferDetail">;

type Money = (amount: number, currency?: string) => string;

export function OfferDetailScreen({ route }: Props): React.ReactElement {
  const { offer } = route.params;
  const { client } = useSession();
  const { t, money, trip } = useI18n();

  function open(url: string | null): void {
    if (url) void Linking.openURL(url);
  }

  // Kalendarz powrotów ma sens tylko dla lotu w jedną stronę z ustaloną datą wylotu.
  const canReturn = offer.trip_type === "one-way" && !!offer.depart_date;
  const { state, reload } = useAsync<ReturnCalendarOut | null>(
    () =>
      canReturn
        ? client.returnCalendar(offer.origin, offer.dest, offer.depart_date as string)
        : Promise.resolve(null),
    [offer.origin, offer.dest, offer.depart_date],
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.city}>
        {offer.city} <Text style={styles.code}>({offer.origin} → {offer.dest})</Text>
      </Text>
      <GradeBadge grade={offer.grade} />

      <View style={styles.box}>
        <Row label={t.offer.price} value={money(offer.price, offer.currency)} />
        <Row label={t.offer.type} value={trip(offer.trip_type)} />
        <Row label={t.offer.dates} value={offerDates(offer)} />
        <Row
          label={t.offer.changes}
          value={offer.changes === 0 ? t.offer.direct : String(offer.changes ?? "—")}
        />
      </View>

      {offer.link ? (
        <TouchableOpacity
          style={styles.button}
          onPress={() => open(offer.link)}
          accessibilityRole="button"
          accessibilityLabel={t.offer.outbound}
        >
          <Text style={styles.buttonText}>{t.offer.outbound}</Text>
        </TouchableOpacity>
      ) : null}

      {canReturn ? (
        <View>
          <Text style={styles.section}>{t.offer.whenReturn}</Text>
          {state.status === "loading" ? <Loading /> : null}
          {state.status === "error" ? <ErrorView message={state.error} onRetry={reload} /> : null}
          {state.status === "ready" && state.data ? (
            state.data.days.length === 0 ? (
              <EmptyView message={t.offer.noReturns} />
            ) : (
              <ReturnCalendar
                data={state.data}
                outboundPrice={offer.price}
                currency={offer.currency}
                money={money}
                weekdays={t.cal.weekdays}
                monthNames={t.cal.months}
                hint={t.offer.calHint}
                onPick={open}
              />
            )
          ) : null}
        </View>
      ) : null}

      <Text style={styles.note}>{t.offer.cacheNote}</Text>
    </ScrollView>
  );
}

function ReturnCalendar({
  data,
  outboundPrice,
  currency,
  money,
  weekdays,
  monthNames,
  hint,
  onPick,
}: {
  data: ReturnCalendarOut;
  outboundPrice: number;
  currency: string;
  money: Money;
  weekdays: readonly string[];
  monthNames: readonly string[];
  hint: string;
  onPick: (url: string | null) => void;
}): React.ReactElement {
  const months = buildReturnCalendar(data.days, data.depart_date, [...monthNames]);
  return (
    <View style={styles.calWrap}>
      {months.map((m) => (
        <View key={`${m.year}-${m.month}`} style={styles.month}>
          <Text style={styles.monthLabel}>{m.label}</Text>
          <View style={styles.weekRow}>
            {weekdays.map((w) => (
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
                  total={cell.price !== null ? outboundPrice + cell.price : null}
                  currency={currency}
                  money={money}
                  onPick={onPick}
                />
              ))}
            </View>
          ))}
        </View>
      ))}
      <Text style={styles.calHint}>{hint}</Text>
    </View>
  );
}

function Cell({
  cell,
  total,
  currency,
  money,
  onPick,
}: {
  cell: CalCell;
  total: number | null;
  currency: string;
  money: Money;
  onPick: (url: string | null) => void;
}): React.ReactElement {
  if (cell.date === null) return <View style={styles.cell} />;
  const active = cell.price !== null && !cell.past && !!cell.link;
  const cellStyle = [
    styles.cell,
    styles.cellFilled,
    cell.past ? styles.cellPast : null,
    active && cell.cheapest ? styles.cellHot : active ? styles.cellHas : null,
  ];
  const label = `${cell.date}${total !== null ? ` · ${money(total, currency)}` : ""}`;
  return (
    <TouchableOpacity
      style={cellStyle}
      disabled={!active}
      onPress={() => onPick(cell.link)}
      accessibilityRole={active ? "button" : "text"}
      accessibilityLabel={active ? label : (cell.date ?? "")}
    >
      <Text style={[styles.cellDay, cell.past ? styles.cellDayPast : null]}>{cell.day}</Text>
      <Text style={styles.cellPrice}>{cell.price !== null ? Math.round(cell.price) : "–"}</Text>
    </TouchableOpacity>
  );
}

function Row({ label, value }: { label: string; value: string }): React.ReactElement {
  return (
    <View style={styles.rowLine}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 14, backgroundColor: "#f8fafc" },
  city: { fontSize: 24, fontWeight: "800", color: "#23272E" },
  code: { fontSize: 15, color: "#94a3b8", fontWeight: "500" },
  box: { backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb", padding: 14, gap: 6 },
  section: { fontSize: 16, fontWeight: "800", color: "#23272E", marginTop: 6, marginBottom: 8 },
  rowLine: { flexDirection: "row", justifyContent: "space-between" },
  rowLabel: { color: "#64748b", fontSize: 14 },
  rowValue: { color: "#23272E", fontSize: 14, fontWeight: "600" },
  button: { backgroundColor: "#FF5A5F", padding: 14, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  note: { color: "#94a3b8", fontSize: 12, textAlign: "center", marginTop: 8 },
  // kalendarz
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
  cellDay: { fontSize: 11, fontWeight: "700", color: "#64748b", lineHeight: 13 },
  cellDayPast: { color: "#aeb6c0" },
  cellPrice: { fontSize: 12, fontWeight: "800", color: "#23272E", lineHeight: 14 },
  calHint: { color: "#94a3b8", fontSize: 12, marginTop: 2 },
});

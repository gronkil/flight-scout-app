import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { OfferCard } from "../components/OfferCard";
import { EmptyView, ErrorView, Loading } from "../components/StateViews";
import { DEFAULT_USER_ID } from "../config";
import { sortOffersByScore } from "../lib/feed";
import { registerForPushToken } from "../lib/push";
import { useAsync } from "../lib/useAsync";
import type { OfferOut } from "../model/types";
import type { RootStackParamList } from "../navigation";
import { useSession } from "../state/session";

type Props = NativeStackScreenProps<RootStackParamList, "Feed">;

export function FeedScreen({ navigation }: Props): React.ReactElement {
  const { client } = useSession();
  const { state, reload } = useAsync<OfferOut[]>(() => client.listOffers({ min_grade: "B" }), []);

  // Auto-rejestracja urządzenia do push (raz, po wejściu). Cicho pomija, gdy się nie uda.
  useEffect(() => {
    let alive = true;
    void registerForPushToken().then((token) => {
      if (alive && token) void client.registerDevice(DEFAULT_USER_ID, "expo", token).catch(() => {});
    });
    return () => {
      alive = false;
    };
  }, [client]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Najlepsze okazje</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("Profiles")}
          accessibilityRole="button"
          accessibilityLabel="Profile wyszukiwania"
        >
          <Text style={styles.link}>Profile</Text>
        </TouchableOpacity>
      </View>

      {state.status === "loading" ? <Loading /> : null}
      {state.status === "error" ? <ErrorView message={state.error} onRetry={reload} /> : null}
      {state.status === "ready" ? (
        state.data.length === 0 ? (
          <EmptyView message="Brak ofert w ocenie A/B. Dodaj profil i uruchom wyszukiwanie." />
        ) : (
          <FlatList
            data={sortOffersByScore(state.data)}
            keyExtractor={(o, i) => `${o.dest}-${o.depart_date}-${i}`}
            renderItem={({ item }) => (
              <OfferCard offer={item} onPress={(offer) => navigation.navigate("OfferDetail", { offer })} />
            )}
            contentContainerStyle={styles.list}
          />
        )
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  title: { fontSize: 22, fontWeight: "800", color: "#0f172a" },
  link: { color: "#2563eb", fontWeight: "600" },
  list: { padding: 16, paddingTop: 0 },
});

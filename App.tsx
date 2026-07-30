import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import React from "react";

import type { RootStackParamList } from "./src/navigation";
import { BRAND, colors } from "./src/theme";
import { AlertsScreen } from "./src/screens/AlertsScreen";
import { DeveloperScreen } from "./src/screens/DeveloperScreen";
import { FeedScreen } from "./src/screens/FeedScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { OfferDetailScreen } from "./src/screens/OfferDetailScreen";
import { ProfilesScreen } from "./src/screens/ProfilesScreen";
import { SessionProvider } from "./src/state/session";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App(): React.ReactElement {
  return (
    <SessionProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerStyle: { backgroundColor: colors.brand },
            headerTintColor: "#ffffff",
            headerTitleStyle: { fontWeight: "800" },
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Feed" component={FeedScreen} options={{ title: BRAND.name }} />
          <Stack.Screen
            name="OfferDetail"
            component={OfferDetailScreen}
            options={{ title: "Szczegóły oferty" }}
          />
          <Stack.Screen name="Profiles" component={ProfilesScreen} options={{ title: "Profile" }} />
          <Stack.Screen
            name="Developer"
            component={DeveloperScreen}
            options={{ title: "Developer" }}
          />
          <Stack.Screen
            name="Alerts"
            component={AlertsScreen}
            options={({ route }) => ({ title: `Alerty · ${route.params.profileName}` })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SessionProvider>
  );
}

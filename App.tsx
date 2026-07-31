import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import React from "react";

import { I18nProvider, useI18n } from "./src/i18n";
import type { RootStackParamList } from "./src/navigation";
import { AlertsScreen } from "./src/screens/AlertsScreen";
import { CalendarScreen } from "./src/screens/CalendarScreen";
import { DeveloperScreen } from "./src/screens/DeveloperScreen";
import { FeedScreen } from "./src/screens/FeedScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { OfferDetailScreen } from "./src/screens/OfferDetailScreen";
import { ProfilesScreen } from "./src/screens/ProfilesScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { SessionProvider } from "./src/state/session";
import { colors } from "./src/theme";

const Stack = createNativeStackNavigator<RootStackParamList>();

function Navigation(): React.ReactElement {
  const { t } = useI18n();
  return (
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
        <Stack.Screen name="Feed" component={FeedScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Calendar" component={CalendarScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="OfferDetail"
          component={OfferDetailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Profiles" component={ProfilesScreen} options={{ title: t.nav.profiles }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: t.nav.settings }} />
        <Stack.Screen name="Developer" component={DeveloperScreen} options={{ title: t.nav.developer }} />
        <Stack.Screen
          name="Alerts"
          component={AlertsScreen}
          options={({ route }) => ({ title: `${t.nav.alerts} · ${route.params.profileName}` })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App(): React.ReactElement {
  return (
    <I18nProvider>
      <SessionProvider>
        <StatusBar style="light" />
        <Navigation />
      </SessionProvider>
    </I18nProvider>
  );
}

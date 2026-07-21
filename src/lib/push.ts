// Rejestracja urządzenia do powiadomień push (Expo). Bezpieczne fallbacki:
// emulator / brak zgody / brak projektu → zwraca null (aplikacja działa dalej bez pushu).
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

export async function registerForPushToken(): Promise<string | null> {
  try {
    if (!Device.isDevice) return null; // emulatory nie dostają tokenu push

    let status = (await Notifications.getPermissionsAsync()).status;
    if (status !== "granted") {
      status = (await Notifications.requestPermissionsAsync()).status;
    }
    if (status !== "granted") return null;

    // projectId potrzebny w buildach EAS; w Expo Go zwykle zbędny.
    const projectId =
      (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas?.projectId;
    const token = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    return token.data;
  } catch {
    return null; // nie blokujemy aplikacji, gdy push się nie uda
  }
}

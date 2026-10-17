import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * On a physical device or emulator, "localhost" is the device — not your laptop.
 * When Expo provides a dev host, point API calls at the same machine on port 8080.
 */
export function resolveApiUrl() {
  const fromEnv = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080').replace(/\/$/, '');

  if (!fromEnv.includes('localhost') && !fromEnv.includes('127.0.0.1')) {
    return fromEnv;
  }

  if (Platform.OS === 'web') {
    return fromEnv;
  }

  const hostUri = Constants.expoConfig?.hostUri ?? Constants.linkingUri;
  const host = hostUri?.split(':')[0];
  if (host && host !== 'localhost' && host !== '127.0.0.1') {
    return `http://${host}:8080`;
  }

  return fromEnv;
}

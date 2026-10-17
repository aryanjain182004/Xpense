import { router } from 'expo-router';

/** Leave a stack form screen when history may be empty (e.g. deep link, refresh). */
export function leaveFormScreen() {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace('/(tabs)');
}

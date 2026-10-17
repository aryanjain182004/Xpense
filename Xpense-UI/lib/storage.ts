import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'xpense.jwt';
let memoryToken: string | null = null;

function localStore() {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

export async function saveToken(token: string) {
  memoryToken = token;
  const local = localStore();
  if (local) {
    local.setItem(TOKEN_KEY, token);
  }
  if (Platform.OS !== 'web' && (await SecureStore.isAvailableAsync())) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
}

export async function readToken() {
  if (Platform.OS === 'web') {
    const local = localStore();
    memoryToken = local?.getItem(TOKEN_KEY) ?? null;
    return memoryToken;
  }
  if (await SecureStore.isAvailableAsync()) {
    memoryToken = await SecureStore.getItemAsync(TOKEN_KEY);
    return memoryToken;
  }
  const local = localStore();
  if (local) {
    memoryToken = local.getItem(TOKEN_KEY);
    return memoryToken;
  }
  return memoryToken;
}

export async function clearToken() {
  memoryToken = null;
  const local = localStore();
  if (local) {
    local.removeItem(TOKEN_KEY);
  }
  if (Platform.OS !== 'web' && (await SecureStore.isAvailableAsync())) {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

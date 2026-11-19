import * as SecureStore from 'expo-secure-store';
import type { ProviderId } from '../ai/types';

/**
 * API keys live in the Android Keystore-backed secure store, never in
 * AsyncStorage, source code, or app config.
 *
 * Limitation: the key is still sent from the device to the provider, and a
 * rooted device or a modified build could read it. For anything beyond
 * personal use, proxy requests through your own backend.
 */
const keyName = (p: ProviderId) => `apikey_${p}`;

export async function getApiKey(provider: ProviderId): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(keyName(provider));
  } catch {
    return null;
  }
}

export async function setApiKey(provider: ProviderId, value: string): Promise<void> {
  await SecureStore.setItemAsync(keyName(provider), value.trim());
}

export async function deleteApiKey(provider: ProviderId): Promise<void> {
  await SecureStore.deleteItemAsync(keyName(provider));
}

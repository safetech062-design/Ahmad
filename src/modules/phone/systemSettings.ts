import * as IntentLauncher from 'expo-intent-launcher';

/**
 * Opens Android system settings screens. Android does not let normal apps
 * toggle Wi-Fi/Bluetooth silently (since Android 10), so the assistant opens
 * the right screen and the user flips the switch.
 */
export const SETTINGS_ACTIONS: Record<string, string> = {
  main: 'android.settings.SETTINGS',
  wifi: 'android.settings.WIFI_SETTINGS',
  bluetooth: 'android.settings.BLUETOOTH_SETTINGS',
  location: 'android.settings.LOCATION_SOURCE_SETTINGS',
  airplane: 'android.settings.AIRPLANE_MODE_SETTINGS',
  sound: 'android.settings.SOUND_SETTINGS',
  display: 'android.settings.DISPLAY_SETTINGS',
  battery: 'android.settings.BATTERY_SAVER_SETTINGS',
  apps: 'android.settings.APPLICATION_SETTINGS',
};

export function normalizeSettingsPage(raw: unknown): string {
  const s = String(raw ?? '').toLowerCase().replace(/[^a-z]/g, '');
  if (s.includes('wifi')) return 'wifi';
  if (s.includes('bluetooth')) return 'bluetooth';
  if (s.includes('location') || s.includes('gps')) return 'location';
  if (s.includes('airplane') || s.includes('flight')) return 'airplane';
  if (s.includes('sound') || s.includes('volume')) return 'sound';
  if (s.includes('display') || s.includes('brightness')) return 'display';
  if (s.includes('battery')) return 'battery';
  if (s.includes('app')) return 'apps';
  return 'main';
}

export async function openSystemSettings(page: string): Promise<boolean> {
  try {
    await IntentLauncher.startActivityAsync(SETTINGS_ACTIONS[page] ?? SETTINGS_ACTIONS.main);
    return true;
  } catch {
    return false;
  }
}

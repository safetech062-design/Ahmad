import * as IntentLauncher from 'expo-intent-launcher';
import { Linking } from 'react-native';

export type LaunchResult = 'launched' | 'store' | 'failed';

/**
 * Launch an installed app by package id using its launcher activity.
 * If it is not installed, open its Play Store page instead.
 */
export async function launchPackage(pkg: string): Promise<LaunchResult> {
  try {
    await IntentLauncher.startActivityAsync('android.intent.action.MAIN', {
      category: 'android.intent.category.LAUNCHER',
      packageName: pkg,
    });
    return 'launched';
  } catch {
    try {
      await Linking.openURL(`market://details?id=${pkg}`);
      return 'store';
    } catch {
      return 'failed';
    }
  }
}

export async function openUrl(url: string): Promise<boolean> {
  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}

/** Open Google Maps (or any maps app) on a search query. */
export async function openMaps(query: string): Promise<boolean> {
  if (await openUrl(`geo:0,0?q=${encodeURIComponent(query)}`)) return true;
  return openUrl(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`);
}

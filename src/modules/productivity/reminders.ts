import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { newId, useProductivity } from '../../state/productivityStore';

const CHANNEL = 'reminders';

/** Call once at app start: show notifications while the app is open + create the Android channel. */
export async function initNotifications(): Promise<void> {
  Notifications.setNotificationHandler({
    handleNotification: async () =>
      ({ shouldShowBanner: true, shouldShowList: true, shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false }) as any,
  });
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
}

/** Android 13 requires the POST_NOTIFICATIONS runtime permission. */
export async function ensureNotificationPermission(): Promise<boolean> {
  const cur = await Notifications.getPermissionsAsync();
  if (cur.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

export type ScheduleResult = 'ok' | 'denied' | 'past' | 'error';

export async function scheduleReminder(title: string, when: Date): Promise<ScheduleResult> {
  if (when.getTime() <= Date.now() + 5_000) return 'past';
  if (!(await ensureNotificationPermission())) return 'denied';
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: { title: 'Mera Dost', body: title, sound: true },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when, channelId: CHANNEL } as any,
    });
    useProductivity.getState().addReminder({ id: newId(), title, when: when.getTime(), notificationId });
    return 'ok';
  } catch {
    return 'error';
  }
}

export async function cancelReminder(id: string): Promise<void> {
  const r = useProductivity.getState().reminders.find((x) => x.id === id);
  if (r) {
    try {
      await Notifications.cancelScheduledNotificationAsync(r.notificationId);
    } catch {
      /* already fired or gone */
    }
  }
  useProductivity.getState().removeReminder(id);
}

import * as Battery from 'expo-battery';
import * as Device from 'expo-device';
import * as Network from 'expo-network';

/** Read-only, non-identifying device facts. No serial numbers, IMEI or accounts are read. */
export async function getDeviceSummary(): Promise<string> {
  const parts: string[] = [];
  const model = `${Device.brand ?? ''} ${Device.modelName ?? ''}`.trim();
  if (model) parts.push(model);
  if (Device.osVersion) parts.push(`Android ${Device.osVersion}`);
  try {
    const level = await Battery.getBatteryLevelAsync();
    if (level >= 0) parts.push(`battery ${Math.round(level * 100)}%`);
  } catch {
    /* ignore */
  }
  try {
    const net = await Network.getNetworkStateAsync();
    parts.push(net.isConnected ? `online (${String(net.type ?? 'unknown').toLowerCase()})` : 'offline');
  } catch {
    /* ignore */
  }
  return parts.join(' · ');
}

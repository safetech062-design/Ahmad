import * as Clipboard from 'expo-clipboard';
import { useSettings } from '../../state/settingsStore';
import { PROVIDERS } from '../ai';
import { resolveApp } from '../phone/apps';
import { launchPackage, openUrl } from '../phone/launcher';
import { getApiKey } from '../settings/secureKeys';
import { ExternalService, googleSearchUrl, SERVICE_LABEL, SERVICE_PROVIDER } from './services';

export * from './services';

/**
 * AI Integration Engine. Other AI apps cannot be remote-controlled, so we use
 * the supported route:
 *  1. API  - if you saved an API key for that service, the prompt is sent to its
 *            API and the answer comes back into the chat.
 *  2. App hand-off - otherwise the prompt is copied to the clipboard and the app
 *            is opened so you can paste it. (We cannot press send for you.)
 */
export interface ExternalAnswer {
  via: 'api' | 'app';
  text: string;
}

const ONE_SHOT_SYSTEM =
  'You are a helpful assistant. Answer clearly and completely in plain text suitable for a phone screen.';

export async function askExternalAI(service: ExternalService, prompt: string): Promise<ExternalAnswer> {
  const providerId = SERVICE_PROVIDER[service];
  const apiKey = await getApiKey(providerId);
  if (apiKey) {
    const provider = PROVIDERS[providerId];
    const model = useSettings.getState().models[providerId] || provider.defaultModel;
    const text = await provider.complete({
      apiKey,
      model,
      system: ONE_SHOT_SYSTEM,
      messages: [{ role: 'user', content: prompt }],
    });
    return { via: 'api', text };
  }

  await Clipboard.setStringAsync(prompt);
  const app = resolveApp(service);
  if (app) await launchPackage(app.pkg);
  return { via: 'app', text: `No ${SERVICE_LABEL[service]} API key saved. Your request was copied - paste it into ${SERVICE_LABEL[service]}.` };
}

/** Opens Google in the browser. We do not scrape or read results back. */
export async function openGoogleSearch(query: string): Promise<boolean> {
  return openUrl(googleSearchUrl(query));
}

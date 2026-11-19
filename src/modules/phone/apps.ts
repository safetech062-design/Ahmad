/**
 * Known-app catalog (pure). Android cannot list or search installed apps
 * without the restricted QUERY_ALL_PACKAGES permission, so the assistant only
 * launches apps in this catalog. Add entries here to teach it new apps.
 */
export interface AppEntry {
  id: string;
  label: string;
  pkg: string;
  aliases: string[];
}

export const APP_CATALOG: AppEntry[] = [
  { id: 'maps', label: 'Google Maps', pkg: 'com.google.android.apps.maps', aliases: ['google maps', 'maps', 'gmaps', 'گوگل میپس', 'گوگل میپ', 'نقشہ', 'خرائط جوجل', 'خرائط جوجل', 'خرائط', 'نقشه'] },
  { id: 'whatsapp', label: 'WhatsApp', pkg: 'com.whatsapp', aliases: ['whatsapp', 'whats app', 'واٹس ایپ', 'واٹس اپ', 'واتساب', 'واټساپ'] },
  { id: 'chatgpt', label: 'ChatGPT', pkg: 'com.openai.chatgpt', aliases: ['chatgpt', 'chat gpt', 'چیٹ جی پی ٹی', 'تشات جي بي تي'] },
  { id: 'claude', label: 'Claude', pkg: 'com.anthropic.claude', aliases: ['claude', 'کلاڈ', 'كلود'] },
  { id: 'gemini', label: 'Gemini', pkg: 'com.google.android.apps.bard', aliases: ['gemini', 'جیمنی', 'جيميني'] },
  { id: 'chrome', label: 'Chrome', pkg: 'com.android.chrome', aliases: ['chrome', 'browser', 'web browser', 'کروم', 'براؤزر', 'متصفح', 'كروم'] },
  { id: 'youtube', label: 'YouTube', pkg: 'com.google.android.youtube', aliases: ['youtube', 'یوٹیوب', 'يوتيوب'] },
  { id: 'gmail', label: 'Gmail', pkg: 'com.google.android.gm', aliases: ['gmail', 'email', 'mail', 'جی میل', 'جيميل'] },
  { id: 'calendar', label: 'Google Calendar', pkg: 'com.google.android.calendar', aliases: ['calendar', 'google calendar', 'کیلنڈر', 'التقويم'] },
  { id: 'drive', label: 'Google Drive', pkg: 'com.google.android.apps.docs', aliases: ['drive', 'google drive', 'گوگل ڈرائیو', 'جوجل درايف'] },
  { id: 'excel', label: 'Microsoft Excel', pkg: 'com.microsoft.office.excel', aliases: ['excel', 'microsoft excel', 'ایکسل', 'إكسل'] },
  { id: 'word', label: 'Microsoft Word', pkg: 'com.microsoft.office.word', aliases: ['word', 'microsoft word', 'ورڈ'] },
  { id: 'files', label: 'Files', pkg: 'com.google.android.documentsui', aliases: ['files', 'file manager', 'my files', 'فائلز', 'الملفات'] },
  { id: 'contacts', label: 'Contacts', pkg: 'com.google.android.contacts', aliases: ['contacts', 'رابطے', 'جهات الاتصال'] },
  { id: 'telegram', label: 'Telegram', pkg: 'org.telegram.messenger', aliases: ['telegram', 'ٹیلیگرام', 'تيليجرام'] },
  { id: 'settings', label: 'Settings', pkg: 'com.android.settings', aliases: ['settings', 'ترتیبات', 'سیٹنگز', 'الإعدادات'] },
];

export function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .replace(/[.,!?;:"'“”،؟۔]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function resolveApp(name: string): AppEntry | null {
  const n = normalizeName(name)
    .replace(/^(?:the|my)\s+/, '')
    .replace(/\s+app$/, '')
    .trim();
  if (!n) return null;
  for (const app of APP_CATALOG) {
    if (app.aliases.some((a) => normalizeName(a) === n)) return app;
  }
  for (const app of APP_CATALOG) {
    if (app.aliases.some((a) => a.length >= 4 && n.includes(normalizeName(a)))) return app;
  }
  return null;
}

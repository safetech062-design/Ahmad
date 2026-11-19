import { phase2Translations } from './translations.phase2';

export type LanguageCode = 'en' | 'ur' | 'ps' | 'ar';

export interface LanguageInfo {
  code: LanguageCode;
  name: string; // native name
  rtl: boolean;
  /** BCP-47 locale used for speech recognition / synthesis */
  speechLocale: string;
}

export const LANGUAGES: Record<LanguageCode, LanguageInfo> = {
  en: { code: 'en', name: 'English', rtl: false, speechLocale: 'en-US' },
  ur: { code: 'ur', name: 'اردو', rtl: true, speechLocale: 'ur-PK' },
  ps: { code: 'ps', name: 'پښتو', rtl: true, speechLocale: 'ps-AF' },
  ar: { code: 'ar', name: 'العربية', rtl: true, speechLocale: 'ar-SA' },
};

export const LANGUAGE_LIST = Object.values(LANGUAGES);

type Dict = Record<string, string>;

export const translations: Record<LanguageCode, Dict> = {
  en: {
    appName: 'MERA DOST',
    tabHome: 'Home',
    tabChat: 'Chat',
    tabSettings: 'Settings',
    statusIdle: 'Tap the mic to talk',
    statusListening: 'Listening…',
    statusProcessing: 'Thinking…',
    statusSpeaking: 'Speaking…',
    typeMessage: 'Type a message…',
    send: 'Send',
    greeting: 'Hello! I am Mera Dost. How can I help you?',
    settingsLanguage: 'Language',
    settingsAI: 'AI provider',
    settingsVoice: 'Voice',
    settingsSecurity: 'Security & privacy',
    provider: 'Provider',
    model: 'Model',
    apiKey: 'API key',
    apiKeyPlaceholder: 'Paste your API key',
    save: 'Save',
    saved: 'Saved',
    clear: 'Remove',
    keySet: 'Key stored on this device',
    keyNotSet: 'No key set',
    speakReplies: 'Speak replies aloud',
    micEnabled: 'Allow microphone',
    micDisabledNote: 'Microphone is disabled in settings.',
    clearChat: 'Clear conversation',
    noKeyError: 'Please add an API key for this provider in Settings.',
    voiceUnavailable:
      'Speech recognition is not available in this build. Use a development build (not Expo Go).',
    voiceLangUnsupported:
      'Voice input may not be supported for this language on your phone. You can still type.',
    ttsLangMissing:
      'No voice for this language is installed on your phone, so replies will be text only.',
    keyWarning:
      'Your API key is stored encrypted on this phone, but anyone with the app and your phone could use it. For a shared or production app, route requests through your own server instead.',
    wakeWordNote:
      'Always-listening wake word ("Hey Jarvis") is not implemented yet. Android restricts background microphone use; use the mic button for now.',
    errorPrefix: 'Error',
  },
  ur: {
    appName: 'میرا دوست',
    tabHome: 'ہوم',
    tabChat: 'چیٹ',
    tabSettings: 'سیٹنگز',
    statusIdle: 'بات کرنے کے لیے مائیک دبائیں',
    statusListening: 'سن رہا ہوں…',
    statusProcessing: 'سوچ رہا ہوں…',
    statusSpeaking: 'بول رہا ہوں…',
    typeMessage: 'پیغام لکھیں…',
    send: 'بھیجیں',
    greeting: 'السلام علیکم! میں میرا دوست ہوں۔ میں آپ کی کیا مدد کر سکتا ہوں؟',
    settingsLanguage: 'زبان',
    settingsAI: 'اے آئی فراہم کنندہ',
    settingsVoice: 'آواز',
    settingsSecurity: 'سیکیورٹی اور پرائیویسی',
    provider: 'فراہم کنندہ',
    model: 'ماڈل',
    apiKey: 'API کلید',
    apiKeyPlaceholder: 'اپنی API کلید پیسٹ کریں',
    save: 'محفوظ کریں',
    saved: 'محفوظ ہو گیا',
    clear: 'ہٹائیں',
    keySet: 'کلید اس فون پر محفوظ ہے',
    keyNotSet: 'کوئی کلید نہیں',
    speakReplies: 'جوابات بول کر سنائیں',
    micEnabled: 'مائیکروفون کی اجازت',
    micDisabledNote: 'سیٹنگز میں مائیکروفون بند ہے۔',
    clearChat: 'گفتگو صاف کریں',
    noKeyError: 'براہ کرم سیٹنگز میں اس فراہم کنندہ کی API کلید شامل کریں۔',
    voiceUnavailable:
      'اس بلڈ میں اسپیچ ریکگنیشن دستیاب نہیں۔ ڈویلپمنٹ بلڈ استعمال کریں (Expo Go نہیں)۔',
    voiceLangUnsupported:
      'ممکن ہے آپ کے فون پر اس زبان میں آواز کا ان پٹ سپورٹ نہ ہو۔ آپ لکھ سکتے ہیں۔',
    ttsLangMissing:
      'آپ کے فون پر اس زبان کی آواز انسٹال نہیں، اس لیے جوابات صرف متن میں ہوں گے۔',
    keyWarning:
      'آپ کی API کلید اس فون پر انکرپٹڈ محفوظ ہے، لیکن جس کے پاس ایپ اور آپ کا فون ہو وہ اسے استعمال کر سکتا ہے۔ مشترکہ یا پروڈکشن ایپ کے لیے اپنا سرور استعمال کریں۔',
    wakeWordNote:
      'ہمیشہ سننے والا ویک ورڈ ("ہے جارویس") ابھی نافذ نہیں۔ اینڈرائیڈ بیک گراؤنڈ مائیکروفون محدود کرتا ہے؛ فی الحال مائیک بٹن استعمال کریں۔',
    errorPrefix: 'خرابی',
  },
  ps: {
    appName: 'زما ملګری',
    tabHome: 'کور',
    tabChat: 'چیټ',
    tabSettings: 'تنظیمات',
    statusIdle: 'د خبرو لپاره مایک ټک کړئ',
    statusListening: 'اوري…',
    statusProcessing: 'فکر کوي…',
    statusSpeaking: 'خبرې کوي…',
    typeMessage: 'پیغام ولیکئ…',
    send: 'ولېږه',
    greeting: 'سلام! زه ستاسو ملګری یم. څنګه مرسته درسره وکړم؟',
    settingsLanguage: 'ژبه',
    settingsAI: 'د AI چمتو کوونکی',
    settingsVoice: 'غږ',
    settingsSecurity: 'امنیت او محرمیت',
    provider: 'چمتو کوونکی',
    model: 'ماډل',
    apiKey: 'API کیلي',
    apiKeyPlaceholder: 'خپله API کیلي پیسټ کړئ',
    save: 'خوندي کړه',
    saved: 'خوندي شو',
    clear: 'لرې کړه',
    keySet: 'کیلي په دې موبایل کې خوندي ده',
    keyNotSet: 'کومه کیلي نشته',
    speakReplies: 'ځوابونه په غږ ووايه',
    micEnabled: 'مایکروفون اجازه',
    micDisabledNote: 'په تنظیماتو کې مایکروفون بند دی.',
    clearChat: 'خبرې پاکې کړه',
    noKeyError: 'مهرباني وکړئ په تنظیماتو کې د دې چمتو کوونکي API کیلي اضافه کړئ.',
    voiceUnavailable:
      'په دې بلډ کې د غږ پېژندنه شتون نلري. د پرمختیا بلډ وکاروئ (Expo Go نه).',
    voiceLangUnsupported:
      'ښايي ستاسو په موبایل کې د دې ژبې لپاره د غږ ان‌پټ ملاتړ نشي. تاسو لیکلی شئ.',
    ttsLangMissing:
      'ستاسو په موبایل کې د دې ژبې غږ نصب نه دی، نو ځوابونه به یوازې متن وي.',
    keyWarning:
      'ستاسو API کیلي په دې موبایل کې کوډ شوې خوندي ده، خو هغه څوک چې اپ او موبایل ولري کولی شي وکاروي. د ګډ یا تولیدي اپ لپاره خپل سرور وکاروئ.',
    wakeWordNote:
      'تل اورېدونکی ویک ورډ ("هې جارویس") لا نه دی پلی شوی. اندروید د شاتني مایکروفون کارول محدودوي؛ اوس مهال د مایک تڼۍ وکاروئ.',
    errorPrefix: 'تېروتنه',
  },
  ar: {
    appName: 'صديقي',
    tabHome: 'الرئيسية',
    tabChat: 'المحادثة',
    tabSettings: 'الإعدادات',
    statusIdle: 'اضغط على الميكروفون للتحدث',
    statusListening: 'أستمع…',
    statusProcessing: 'أفكر…',
    statusSpeaking: 'أتحدث…',
    typeMessage: 'اكتب رسالة…',
    send: 'إرسال',
    greeting: 'مرحباً! أنا صديقي. كيف يمكنني مساعدتك؟',
    settingsLanguage: 'اللغة',
    settingsAI: 'مزود الذكاء الاصطناعي',
    settingsVoice: 'الصوت',
    settingsSecurity: 'الأمان والخصوصية',
    provider: 'المزود',
    model: 'النموذج',
    apiKey: 'مفتاح API',
    apiKeyPlaceholder: 'الصق مفتاح API',
    save: 'حفظ',
    saved: 'تم الحفظ',
    clear: 'إزالة',
    keySet: 'المفتاح محفوظ على هذا الهاتف',
    keyNotSet: 'لا يوجد مفتاح',
    speakReplies: 'قراءة الردود بصوت عال',
    micEnabled: 'السماح بالميكروفون',
    micDisabledNote: 'الميكروفون معطل في الإعدادات.',
    clearChat: 'مسح المحادثة',
    noKeyError: 'يرجى إضافة مفتاح API لهذا المزود في الإعدادات.',
    voiceUnavailable:
      'التعرف على الكلام غير متاح في هذا الإصدار. استخدم نسخة تطوير (وليس Expo Go).',
    voiceLangUnsupported:
      'قد لا يدعم هاتفك الإدخال الصوتي بهذه اللغة. يمكنك الكتابة.',
    ttsLangMissing:
      'لا يوجد صوت لهذه اللغة على هاتفك، لذا ستكون الردود نصية فقط.',
    keyWarning:
      'مفتاح API مخزن مشفراً على هذا الهاتف، لكن أي شخص لديه التطبيق وهاتفك يمكنه استخدامه. للتطبيقات المشتركة أو الإنتاجية استخدم خادمك الخاص.',
    wakeWordNote:
      'كلمة التنبيه ("هاي جارفيس") غير مفعلة بعد. يقيّد أندرويد استخدام الميكروفون في الخلفية؛ استخدم زر الميكروفون حالياً.',
    errorPrefix: 'خطأ',
  },
};

// Phase 2/3 strings are kept in their own file and merged here.
for (const code of Object.keys(phase2Translations) as LanguageCode[]) {
  Object.assign(translations[code], phase2Translations[code]);
}

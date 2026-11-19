# Android 13 restrictions and what they mean for Mera Dost

| Want | Android 13 reality | What Mera Dost does |
|---|---|---|
| "Hey Jarvis" always listening, even screen off | Background microphone access is restricted (foreground service with a visible notification is required; recognizers are throttled). No on-device wake-word engine in Expo. | Mic button today. `voice/wakeword.ts` + `voice/wakeMatch.ts` are ready for Phase 4: foreground-only phrase matching first, then a native keyword engine (e.g. Porcupine) in a foreground service. **Not built.** |
| Control any app / press buttons in other apps | Only via AccessibilityService, which Google Play restricts and which is risky. | Not done. Apps are opened, not operated. |
| Make a phone call directly | CALL_PHONE is a sensitive permission. | Opens the dialer with the number after you confirm; you press call. |
| Send WhatsApp automatically / read messages | WhatsApp has no API for this; reading needs notification-listener/accessibility hacks. | Opens the chat with text drafted; you press send. Reading: not supported. |
| Search all files | Scoped storage: apps only see folders the user picks. MANAGE_EXTERNAL_STORAGE is Play-restricted. | You choose one folder; search / create folder / delete work inside it. Rename/move needs a native module (planned). |
| Toggle Wi-Fi / Bluetooth silently | Blocked for normal apps since Android 10/13. | Opens the right settings screen. |
| List installed apps | Package visibility rules (Android 11+); QUERY_ALL_PACKAGES is Play-restricted. | Built-in catalog of known apps (`phone/apps.ts`). |
| Notifications / reminders | POST_NOTIFICATIONS runtime permission (Android 13). Exact alarms need extra permission. Infinix XOS battery managers may delay or kill background work. | Permission requested on first reminder; set battery to "Unrestricted" for this app for reliable timing. |
| Speech recognition / TTS in Urdu, Arabic, Pashto | Depends on Google speech/TTS packs installed. Pashto is often missing. | Tells you when unavailable; you can type. |

## What works immediately (once built)
Chat with your own API key, command parsing, open catalog apps, maps, Google search, dialer, WhatsApp drafts, settings screens, device info, reminders/tasks/notes, file search in a chosen folder, ask Claude/ChatGPT/Gemini.

## Needs native development later
Wake word + foreground service, file rename/move, accessibility-based automation (not recommended), Excel generation on-device.

## Needs a backend later
Safe API-key handling for shared use, QA/QC database and multi-user registers, scheduled reports, large Excel/PDF processing.

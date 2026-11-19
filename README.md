# Mera Dost AI (میرا دوست)

Personal Jarvis-style Android assistant. Expo (React Native) + TypeScript, modular.
Target: Android 13 (Infinix X670). **Delivered so far: Phases 1-3.** Phase 4 (wake word) and Phase 5 (QA/QC) are architecture only.

> **Honest status:** the code was written and its pure logic is unit-tested (language detection, command parser,
> reminder parser, planner, context, file/phone helpers, safety deny-list). It has **not been compiled against the
> real Expo packages or run on a phone** - I had no network/device. Expect to fix small things on first build.
> `docs/ANDROID13_LIMITS.md` explains what Android does not allow. Full change list: `CHANGELOG.md`.

## What works (once it builds) / what does not
See the in-app list: Settings > "What works today". Summary:

| Area | Status |
|---|---|
| UI, 4 languages, RTL, auto language detection per message | Built |
| Chat with OpenAI / Claude / Gemini (your API key) | Built |
| Command understanding (offline parser EN/UR/AR + AI planner), multi-step plans | Built |
| Open apps (catalog), maps, Google search, Wi-Fi/Bluetooth settings screens, device info | Built |
| Contacts + calls (opens dialer, you press call), WhatsApp drafts (you press send) | Built |
| File search / create folder / delete inside a folder you choose (delete always confirms) | Built |
| Reminders (notifications), tasks, notes, daily plan | Built |
| Ask ChatGPT/Claude/Gemini (API, or copy-and-open-app) | Built |
| User-approved memory | Built |
| Voice input / spoken replies | Experimental (needs speech packs; Pashto often unavailable) |
| Rename/organize files, calendar, report generation | Planned (interfaces only) |
| Wake word, hands-free, background listening | Planned (Phase 4) - not possible in Expo alone |
| QA/QC (NCR, WIR, MIR, dashboards) | Planned (Phase 5) - `qaqc_status` tool just says so |
| Reading WhatsApp messages | Not possible for normal apps |

## Build with only a phone

1. **GitHub**: create an account and a private repo `mera-dost-ai`.
2. **Codespaces**: on the repo page > Code > Codespaces > Create (use Chrome "Desktop site"). You get a terminal and editor.
3. **Add the files**: in the Codespaces file explorer, upload `mera-dost-ai.zip`, then in the terminal:
   `unzip -o mera-dost-ai.zip && cd mera-dost-ai` (move into the repo root if needed).
4. **One-time setup** (installs packages at the right Expo versions, type-checks, runs tests):
   ```
   bash scripts/setup.sh
   ```
   If the type check or tests complain, paste the error to Claude - small version fixes are expected.
5. **Commit and push**: `git add -A && git commit -m "Mera Dost Phase 1-3" && git push`
6. **Build the APK in the cloud**: GitHub repo > Actions > "Build Android APK" > Run workflow (~15-25 min).
   Download the `mera-dost-ai-apk` artifact, unzip on the phone, install the APK (allow "install unknown apps").
   No Expo account needed. Alternative: `npm i -g eas-cli && eas login && eas build -p android --profile preview`.
7. **Use it**: Settings > pick provider > paste API key > Save. Grant mic/contacts/notification permissions when asked.
   For reliable reminders set Android battery usage for the app to "Unrestricted".

Voice input uses a native module, so it will **not** work in Expo Go - use the built APK.

Later on Windows/Android Studio: `npm install && npx expo prebuild --platform android`, open the `android/` folder.

## Try these (after install)
- "Hey Jarvis, open Google Maps" / "call Ahmed" / "search Google for concrete mix design"
- "remind me tomorrow at 8 AM to submit the NCR report"
- "add task: update WIR register" / "plan my day"
- "ask Claude to create a professional NCR tracker" (needs a Claude key, else it copies the prompt and opens the app)
- "show me the open NCRs" -> honest "QA/QC module planned for Phase 5"
- Settings > Files > Choose folder, then "find my Excel file"

## Testing
- `npm test` - unit tests in `__tests__/` (pure logic).
- Manual device checklist: mic permission + speech in each language; TTS voice per language; each command above;
  confirm dialogs appear before call / WhatsApp / delete; deletion disabled until enabled in Settings; "open my bank app" is refused.

## Project layout
```
App.tsx                         navigation, providers, confirm modal
src/state/                      settings, chat, memory, productivity, confirm stores
src/components/ src/screens/    UI (Home orb, Chat, Tools, Settings)
src/modules/
  assistant.ts                  one user turn (detect -> plan -> execute -> speak)
  ai/ language/ voice/          AI engine, 4-language engine, voice engine
  commands/                     parser, tool registry, executor
  phone/ files/ productivity/ integrations/ qaqc/ settings/
docs/ARCHITECTURE.md  docs/ANDROID13_LIMITS.md
```

## API keys - security limits
Stored encrypted (Android Keystore) but still usable by anyone with your unlocked phone, and extractable from a modified/rooted build.
Use keys with spending limits; for shared use send requests through your own backend. Details in `docs/ARCHITECTURE.md`.

## Known limitations
- Pashto speech recognition/TTS usually missing on Android; typing always works. Pashto UI strings need native-speaker review.
- Roman Urdu is detected as English. Reminder times typed in the Tools tab must be English; spoken requests are understood in any language by the AI.
- If several contacts match a name, the first is offered in the confirm dialog (you can cancel).
- Package versions for newly added modules are resolved by `scripts/setup.sh`; Phase 1 pins (Expo 54) are unchanged.

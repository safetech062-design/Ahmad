# Architecture

```
            +-------------------- UI (screens, components) --------------------+
            | Home (orb)   Chat   Tools (tasks/notes/reminders)   Settings     |
            +------------------------------+----------------------------------+
                                           | handleUserText(text)
                              modules/assistant.ts  (one turn)
        detect language -> understand -> execute -> store -> speak
              |                |                |
        language/detect   commands/localParser   commands/executor ---> ToolDef (registry)
                          (offline, EN/UR/AR)          |                 | open_app, call_contact,
                          else ai/planner  <---- AI Engine (UI-free)     | whatsapp_message, find_files,
                          (OpenAI/Claude/Gemini)                         | set_reminder, ask_ai, ...
                                                              +----------+-----------+------------+
                                                         phone/        files/    productivity/  integrations/  qaqc/
```

## Modules (each independent; talks to others only through plain functions/types)
| Module | Folder | Notes |
|---|---|---|
| Voice Engine | `voice/` | STT, TTS, wakeword stub + `wakeMatch` |
| AI Engine | `ai/` | providers, context window, planner. No React imports |
| Language Engine | `language/` | 4 languages, RTL, script detection |
| Phone Automation | `phone/` | apps, contacts, dialer, settings, device |
| File Management | `files/` | SAF-based, folder-scoped |
| Productivity | `productivity/` | reminders, daily plan; Calendar/Report interfaces |
| AI Integration | `integrations/` | other AI services via API or app hand-off |
| QA/QC | `qaqc/` | architecture only (Phase 5) |
| Settings & Security | `settings/`, `state/confirmStore.ts` | secure key storage, deny-list policy, confirmation gate |

## How a command runs
1. Language for the turn: script detection if enabled (UI language is not changed).
2. `parseLocalIntent` handles common commands offline. Otherwise the AI gets the tool list and returns JSON `{reply, steps}`; `parsePlan` validates it against the registry (unknown tools dropped, max 6 steps).
3. `executePlan` runs steps in order and stops at the first non-OK result (cancel = stop).
4. Calls, WhatsApp drafts, file deletion and memory saves call `askConfirm()`.
5. Results are shown as action lines; replies are spoken if enabled.

## Add a capability
Write a `ToolDef` (name, description, args, run) and add it to `commands/registry.ts`. The AI prompt and allow-list update automatically. Add `res_*`/`confirm_*` strings in `translations.phase2.ts` if needed.

## Add the QA/QC module (Phase 5)
Implement `QaqcDataSource` (local Excel register or HTTP backend), add `ToolDef`s such as `qaqc_open_ncrs`, put them in `qaqcTools`. Nothing in the core changes.

## Security model
- API keys: `expo-secure-store` (Android Keystore-backed encryption at rest). **Limits:** a key lives in the app and in memory while used; a rooted phone, a modified APK or someone using your unlocked phone can use it. Use provider keys with spending limits. For shared or production use, route calls through your own backend (Phase 6) so keys never ship in the app.
- No tool can move money; banking/payment/wallet names and package ids are denied (`settings/policy.ts`) and the AI prompt forbids them.
- Calls, messages and deletions are always confirmed; messages are never sent by the app.
- Permissions are requested on first use (mic, contacts, notifications). Mic is used only after you tap the button.
- Persisted data: chat, tasks, notes, reminders, approved memory (AsyncStorage, unencrypted, on-device). Nothing is sent anywhere except your prompts to the AI provider you choose.

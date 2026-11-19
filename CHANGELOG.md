# Changelog

## Part 2 - Phases 2 & 3 (this delivery)
Added on top of the Phase 1 foundation. Phase 1 behaviour is unchanged except where listed.

### New modules
- `modules/commands/` - offline command parser (EN/UR/AR), tool registry, executor, reminder-time parser
- `modules/ai/planner.ts`, `modules/ai/context.ts` - command understanding, multi-step planning, context window
- `modules/phone/` - app catalog + launcher, contacts, number normalising, system settings, device info
- `modules/files/` - Storage Access Framework search / create folder / delete
- `modules/productivity/` - reminders (notifications), daily plan, Calendar/Report interfaces
- `modules/integrations/` - ask ChatGPT/Claude/Gemini via API or app hand-off, Google search
- `modules/qaqc/` - feature registry, data-source interface, `qaqc_status` tool (nothing else built)
- `modules/settings/policy.ts` - banking/payment deny-list
- `modules/language/detect.ts`, `translations.phase2.ts`
- `state/` confirmStore, memoryStore, productivityStore; `components/ConfirmModal`; `screens/ToolsScreen`
- `__tests__/`, `scripts/setup.sh`, `.github/workflows/build-apk.yml`, `docs/`

### Edits to Phase 1 files (nothing else was modified)
| File | Change |
|---|---|
| `modules/assistant.ts` | Rewritten: now detect language -> parse/plan -> execute tools -> speak. Same exported `handleUserText` signature. |
| `modules/ai/index.ts` | `askAI` accepts optional `system`; uses `buildContext`; exports `LANGUAGE_NAMES` and planner. Default behaviour unchanged. |
| `modules/language/index.ts` | `t()` / `translate()` accept optional `{param}` values; re-exports `detect`. |
| `modules/language/translations.ts` | Imports and merges `translations.phase2.ts` (+3 lines). |
| `state/settingsStore.ts` | New fields (autoDetectLanguage, allowCalls, allowMessages, allowFileDelete, memoryEnabled, defaultCountryCode, filesFolderUri) and `update()`. Old fields untouched; persisted settings migrate automatically. |
| `state/chatStore.ts` | Message role also allows `'action'`. |
| `components/ChatBubble.tsx` | Style for `'action'` lines. |
| `screens/HomeScreen.tsx` | "Last message" ignores action lines. |
| `screens/SettingsScreen.tsx` | Added auto-detect switch, Phone automation, Memory, "What works today" sections. |
| `App.tsx` | Tools tab, ConfirmModal, notification init. |
| `app.json` | Permissions READ_CONTACTS, POST_NOTIFICATIONS; plugins expo-contacts, expo-notifications. |
| `package.json` | Scripts `test`, `setup`, `prebuild:android`; jest preset. New packages are added by `scripts/setup.sh`. |
| `modules/phone|productivity|qaqc/index.ts` | Placeholders replaced by real exports (original interfaces kept). |

## Part 1 - Phase 1 foundation (previous delivery)

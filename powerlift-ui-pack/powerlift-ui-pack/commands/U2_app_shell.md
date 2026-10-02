# U2 — App shell & navigation. Read: docs-ui/U3_APP_LAYOUTS.md (Navigation), docs-ui/U4_RESPONSIVE_RULES.md
1. Add `code/AppShell.jsx` → `src/components/layout/AppShell.jsx`. Wire routes: `/today /program /progress /coach /me` inside the shell; `/workout/:id` OUTSIDE (full-screen).
2. Map existing screens to the 5 tabs (list the mapping in the PR). Anything not mapped → `Me → Labs` behind a feature flag. Do NOT delete old screens yet.
3. Retire `ModernTitanSidebar` and the searchable grouped menu for athletes. Rename jargon in athlete-facing UI ("Command Center" → "Today", "War Room" → "Meet", etc.).
4. Offline banner prop wired to the offline sync manager; unread/alert dots on Coach tab.
5. Coach users get a separate shell (Roster · Inbox · Programs · Library · Billing) using the same component with different tabs.
## Checklist
- [ ] 360 px: bottom tabs, content never hidden behind them; 1280 px: left rail
- [ ] Deep links and browser back work; active tab highlighted
- [ ] Keyboard nav works; focus visible

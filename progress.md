Original prompt: Build a production-quality 4-player trivia party game as a polished modern web app in React, Tailwind CSS, and Framer Motion. The app must be fully client-side, persist active sessions in LocalStorage, support exactly 4 players with names and uploaded photos, implement deterministic turn rotation and steal rules, follow the provided Trivia Game Assets design direction, and be branded as "The Brown Family Trivia Super Game."

2026-03-21
- Chosen implementation target: in-place rewrite of the existing `vocabvault` Vite workspace.
- Asset references inspected: `~/Desktop/Trivia game assets /DESIGN.md`, `code.html`, and `screen.png`.
- Parallel work split:
  - Core engine/session modules under `src/game` and `src/hooks`
  - UI/components/screens under `src/components`, `src/screens`, `src/index.css`
  - Main integration, config updates, cleanup, build, and QA in primary branch
- Key architectural decisions:
  - Single phase-driven app, no router
  - Reducer-driven game engine with persisted deterministic state
  - Round plan precomputed at new game start to prevent repeats and preserve refresh stability
  - Web Audio placeholder sound architecture with mute persistence
- Brown family customization:
  - Added preset player identities and portraits for Edwin, Dayanna, Ethan, and Valentino
  - Added Enzo as a non-player mascot in the top app chrome
  - Bundled the family portraits into `public/family/` so the build is self-contained
- Question bank integration:
  - Vendored the local `Trivia Questions Bank` JSON into `src/game/trivia_bank_300.json`
  - Switched the app from the temporary sample questions to the 300-question bank
  - Preserved the same typed schema and now surface question explanations on answer reveal
- Validation results:
  - `npm --workspaces=false test` passed
  - `npm --workspaces=false run build` passed
  - Browser smoke script `scripts/qa_smoke.mjs` passed against the local app on `127.0.0.1:3002`
  - Smoke run covered welcome, setup, a forced steal sequence, all three rounds, and the winner screen
  - Smoke run was repeated after the 300-question bank was integrated

2026-03-21 (arcade UI revision)
- New reference pack inspected from `~/Desktop/NEW UI `:
  - `active_question_screen`
  - `answer_reveal_screen`
  - `final_podium_screen`
- Design direction updated to match the new UI reference more closely:
  - Simpler arcade layout with a fixed left score rail
  - Big top timer track
  - Oversized question bubble and colorful answer pills
  - Cleaner podium with block placements and lighter confetti
- UX/system changes implemented:
  - Original timer increased to `40s`
  - Steal timer increased to `30s`
  - Added `turnStart` and `answerSelect` sound events
  - Added a persistent header reset button for active sessions
  - Enlarged Enzo in the top chrome and removed the visible text label
- QA harness updates:
  - `scripts/qa_smoke.mjs` now accepts `QA_BASE_URL`
  - Removed the stale text assertion for `Enzo Brown`
  - Added a reset-button assertion on setup
- Validation results after redesign:
  - `npm --workspaces=false test` passed
  - `npm --workspaces=false run build` passed
  - `QA_BASE_URL='http://127.0.0.1:3003' npm --workspaces=false exec -- node ./scripts/qa_smoke.mjs` passed
  - Reviewed updated screenshots in `tmp-qa/` for setup, gameplay, and winner flows

2026-03-21 (question randomization fix)
- Root causes confirmed:
  - The imported 300-question bank always placed the correct answer at index `0`
  - The bank contains only `5` questions tagged `hard`, which made final rounds feel repetitive across sessions
- Question engine updates:
  - `QuestionPlanItem` now persists a per-session `choiceOrder`
  - Answer order is shuffled once when the plan is built, then restored deterministically from LocalStorage
  - Session seeding now uses `crypto.getRandomValues` when available instead of relying on `Date.now()` alone
  - Final round now guarantees `2` hard questions and fills remaining slots from unused medium/hard questions to improve variety
- Persistence update:
  - Session storage bumped from `session:v1` to `session:v2` to invalidate old plans that did not store randomized answer order
- Validation results after randomization fix:
  - `npm --workspaces=false test` passed
  - `npm --workspaces=false run build` passed
  - `QA_BASE_URL='http://127.0.0.1:3003' npm --workspaces=false exec -- node ./scripts/qa_smoke.mjs` passed
  - Manual browser check confirmed fresh sessions now produce different question IDs
  - Direct session inspection confirmed correct answers no longer always land in slot `1`

2026-03-21 (desktop distractor workbook)
- Inspected `~/Desktop/NEW  with distractors Trivia Questions and Answers.xlsx`:
  - `300` rows
  - clean authored schema with `Correct Answer` plus `Wrong Answer 1-3`
  - no blank cells, no duplicate questions, and no duplicate choices within a row
- Updated `scripts/merge_question_bank.py` so the importer now:
  - detects authored distractor columns automatically
  - normalizes Excel numeric cells like `1989.0` into clean strings
  - updates matching questions in place instead of preserving placeholder distractors
- Re-imported the workbook into `src/game/trivia_bank_300.json`:
  - bank size stayed `587`
  - `300` existing questions were refreshed with the authored distractors
  - `0` new questions were added because the workbook questions were already present
- Validation results after the bank refresh:
  - JSON integrity check passed (`587` questions, `0` invalid entries, `0` float-style answers)
  - `npm --workspaces=false test` passed
  - `npm --workspaces=false run build` passed

2026-03-21 (variable player counts and clearer outcome audio)
- Reworked the game flow from fixed four-player sessions to selectable `1-4` player sessions:
  - added `playerCount` to reducer state and persistence
  - setup now exposes a count selector and only validates/renders the active seats
  - gameplay, steals, rankings, winner snapshot, and round staging now operate on the selected player subset only
- Session persistence bumped from `session:v3`:
  - older fixed-seat sessions are invalidated automatically
  - active player count now restores with the session
- UI copy updates:
  - welcome and setup screens now describe the game as `1 to 4 players`
  - winner standings heading now scales to the actual player count
  - podium layout now adapts cleanly for one- and two-player finishes
- Audio cue tuning:
  - `correctAnswer` now plays a brighter layered fanfare
  - `wrongAnswer` now plays a clearer descending negative sting
  - synth engine now supports per-cue note spacing so celebratory and negative cues feel more distinct
- Validation results after the flexible-seat update:
  - `npm --workspaces=false test` passed (`10` tests)
  - `npm --workspaces=false run build` passed
  - `QA_BASE_URL='http://127.0.0.1:3003' npm --workspaces=false exec -- node ./scripts/qa_smoke.mjs` passed
  - additional Playwright browser check passed for a `2`-player setup and gameplay flow
  - visually reviewed `tmp-qa/06-two-player-setup.png` and `tmp-qa/07-two-player-gameplay.png`

2026-03-22 (third question bank merge)
- Inspected `~/Desktop/third questions bank .json`:
  - `300` questions
  - full JSON schema with `choices`, `correctAnswer`, and `explanation`
  - no bad rows, duplicate choices, or missing correct answers
- Compared against the live `587`-question bank:
  - `16` overlaps by normalized question text
  - `284` new unique questions
- Updated `scripts/merge_question_bank.py` so it can import both spreadsheet and JSON source banks while preserving authored explanations.
- Merged the third bank into `src/game/trivia_bank_300.json`:
  - bank size increased from `587` to `871`
  - `16` overlapping rows were refreshed in place
  - `284` new rows were added
- Refreshed the desktop export at `~/Desktop/Brown Family Trivia Bank.json`.
- Validation results after the merge:
  - integrity check passed (`871` questions, `0` invalid rows)
  - `npm --workspaces=false test` passed
  - `npm --workspaces=false run build` passed

2026-03-22 (custom family lineup, pause control, and clearer outcome audio)
- Reworked player selection so lineup choice is explicit instead of auto-filling the first family members:
  - `selectedPlayerIds` now starts empty on a fresh session
  - changing the player count trims invalid selections but does not silently add Edwin/Dayanna back in
  - setup now blocks over-selection and makes the user bench someone before adding another player
- Added gameplay pause/resume with persisted timer state:
  - `QuestionState` now stores `pausedRemainingMs`
  - pausing freezes countdown display, disables answer submission, and prevents timeout processing
  - resuming restores the remaining time cleanly without restarting the turn
- Retuned outcome sounds to be more obviously different:
  - correct answers now use a brighter major-key arcade fanfare
  - wrong answers now use a descending three-hit `wah-wah-wah` sting
- QA harness updates:
  - `scripts/qa_smoke.mjs` now selects a custom three-player lineup (`Edwin`, `Ethan`, `Valentino`)
  - added a pause/resume assertion during live gameplay
  - final standings check now verifies inactive players do not leak into gameplay results
- Persistence update:
  - session storage bumped to `session:v5` to invalidate older auto-selected sessions and add pause-state compatibility
- Validation results after the lineup/pause/audio update:
  - `npm --workspaces=false test` passed (`14` tests)
  - `npm --workspaces=false run build` passed
  - `QA_BASE_URL='http://127.0.0.1:3003' npm --workspaces=false exec -- node ./scripts/qa_smoke.mjs` passed

2026-03-22 (bigger winner finale)
- Rebuilt the winner screen so the champion is the visual focus before the podium:
  - added a large champion hero card with oversized portrait, score, and badges
  - increased the winner celebration layer density and added spotlight/ring pulses
  - kept the podium and full standings as secondary supporting sections
- Elevated the podium styling:
  - first place block is taller and scaled larger
  - center winner card now has a stronger glow, larger portrait, and bigger crown treatment
- Retuned the `winnerCelebration` cue into a larger layered fanfare so the ending lands more like a finale than a normal state change
- Validation results after the winner-finale update:
  - `npm --workspaces=false test` passed
  - `npm --workspaces=false run build` passed
  - `QA_BASE_URL='http://127.0.0.1:3003' npm --workspaces=false exec -- node ./scripts/qa_smoke.mjs` passed
  - visually reviewed `tmp-qa/05-winner.png` to confirm the winner hero dominates the screen

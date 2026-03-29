import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const outDir = new URL('../tmp-qa/', import.meta.url);
fs.mkdirSync(outDir, { recursive: true });
const baseUrl = process.env.QA_BASE_URL ?? 'http://127.0.0.1:3002';

const answerMap = JSON.parse(
  fs.readFileSync(new URL('../src/game/trivia_bank_300.json', import.meta.url), 'utf8'),
).map((question) => [
  question.question,
  question.correctAnswer,
  question.choices.find((choice) => choice !== question.correctAnswer),
]);

function readTimerSeconds(text) {
  const match = text.match(/(?:Time Remaining|Tiempo restante)\s*(\d{2})/i);
  return match?.[1] ?? null;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function answerButtonPattern(answer) {
  return new RegExp(`^(?:[1-4]\\s+)?${escapeRegex(answer)}$`, 'i');
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1280 } });
await page.addInitScript(() => {
  window.localStorage.clear();
});

await page.goto(baseUrl, { waitUntil: 'networkidle' });
await page.screenshot({ path: fileURLToPath(new URL('01-welcome.png', outDir)), fullPage: true });
await page.locator('body').click({ position: { x: 24, y: 24 } });

const welcomeText = (await page.textContent('body')) ?? '';
if (!welcomeText.includes('The Brown Family Trivia Super Game')) {
  throw new Error('Welcome screen missing expected branding.');
}

await page.keyboard.press('KeyM');
await page.waitForFunction(() => document.body.innerText.includes('SOUND OFF'), null, { timeout: 1500 });
const mutedWelcomeText = (await page.textContent('body')) ?? '';
if (!/SOUND OFF/i.test(mutedWelcomeText)) {
  throw new Error('Keyboard shortcut M did not mute sound on the welcome screen.');
}

await page.keyboard.press('KeyM');
await page.waitForFunction(() => document.body.innerText.includes('SOUND ON'), null, { timeout: 1500 });
const unmutedWelcomeText = (await page.textContent('body')) ?? '';
if (!/SOUND ON/i.test(unmutedWelcomeText)) {
  throw new Error('Keyboard shortcut M did not restore sound on the welcome screen.');
}

await page.keyboard.press('KeyL');
await page.waitForTimeout(500);
const spanishWelcomeText = (await page.textContent('body')) ?? '';
if (!spanishWelcomeText.includes('Ir a la selección')) {
  throw new Error('Spanish welcome copy did not appear after toggling languages.');
}

await page.getByRole('button', { name: 'Cambiar a inglés' }).click();
await page.waitForTimeout(500);
const restoredEnglishText = (await page.textContent('body')) ?? '';
if (!restoredEnglishText.includes('Start player setup')) {
  throw new Error('English copy did not return after toggling languages back.');
}

await page.getByRole('button', { name: /Start player setup/i }).click();
await page.waitForTimeout(300);
await page.screenshot({ path: fileURLToPath(new URL('02-setup.png', outDir)), fullPage: true });

const setupText = (await page.textContent('body')) ?? '';
if (!setupText.includes('Reset')) {
  throw new Error('Reset button missing from setup screen.');
}
for (const name of ['Edwin Brown', 'Dayanna Brown', 'Ethan Brown', 'Valentino Brown']) {
  if (!setupText.includes(name)) {
    throw new Error(`Missing preset player ${name}.`);
  }
}

await page.getByRole('button', { name: /3\s+players/i }).click();
const joinButtons = page.getByRole('button', { name: /^Join game$/i });
await joinButtons.nth(0).click();
await joinButtons.nth(0).click();
await joinButtons.nth(0).click();
await page.getByLabel(/Player name/i).nth(0).fill('Captain Edwin');

const selectedSetupText = (await page.textContent('body')) ?? '';
if (!selectedSetupText.includes('Currently selected: 3.')) {
  throw new Error('Custom three-player lineup was not selected.');
}
if (!selectedSetupText.includes('Captain Edwin')) {
  throw new Error('Updated player name did not render during setup.');
}

await page.getByRole('button', { name: /Launch round one/i }).click();
await page.waitForTimeout(250);
await page.screenshot({ path: fileURLToPath(new URL('03-round-start.png', outDir)), fullPage: true });

await page.getByRole('button', { name: /Enter the arena/i }).click();
await page.waitForTimeout(450);
await page.screenshot({ path: fileURLToPath(new URL('04-gameplay.png', outDir)), fullPage: true });

const gameplayTextBeforePause = (await page.textContent('body')) ?? '';
if (!readTimerSeconds(gameplayTextBeforePause)) {
  throw new Error('Could not read the live timer before pausing.');
}

await page.getByRole('button', { name: /^Pause$/i }).click();
await page.waitForTimeout(250);

const pausedSnapshotA = (await page.textContent('body')) ?? '';
const pausedSecondsA = readTimerSeconds(pausedSnapshotA);
await page.waitForTimeout(1200);
const pausedSnapshotB = (await page.textContent('body')) ?? '';
const pausedSecondsB = readTimerSeconds(pausedSnapshotB);
if (!pausedSecondsA || pausedSecondsA !== pausedSecondsB || !pausedSnapshotB.includes('Paused')) {
  throw new Error('Pause mode did not freeze the timer display.');
}

await page.getByRole('button', { name: /^Resume$/i }).click();
await page.waitForTimeout(300);

await page.keyboard.press('KeyL');
await page.waitForTimeout(500);
const spanishGameplayText = (await page.textContent('body')) ?? '';
if (!spanishGameplayText.includes('Tiempo restante')) {
  throw new Error('Dynamic gameplay language switch did not update the timer copy.');
}

await page.locator('body').click({ position: { x: 24, y: 24 } });
await page.keyboard.press('KeyL');
await page.waitForTimeout(500);
const restoredGameplayText = (await page.textContent('body')) ?? '';
if (!restoredGameplayText.includes('Time Remaining')) {
  throw new Error('Gameplay language did not switch back to English.');
}

await page.getByRole('button', { name: /^Reset$/i }).click();
await page.waitForTimeout(300);
const afterResetWelcomeText = (await page.textContent('body')) ?? '';
if (!afterResetWelcomeText.includes('Start player setup')) {
  throw new Error('Reset did not return the game to the welcome screen.');
}

await page.getByRole('button', { name: /Start player setup/i }).click();
await page.waitForTimeout(250);
const restoredSetupText = (await page.textContent('body')) ?? '';
if (!restoredSetupText.includes('Captain Edwin')) {
  throw new Error('Reset did not preserve the customized player name.');
}
if (!restoredSetupText.includes('Currently selected: 3.')) {
  throw new Error('Reset did not preserve the selected player lineup.');
}

await page.getByRole('button', { name: /Launch round one/i }).click();
await page.waitForTimeout(250);
await page.getByRole('button', { name: /Enter the arena/i }).click();
await page.waitForTimeout(450);

let didStealDemo = false;

for (let step = 0; step < 90; step += 1) {
  await page.waitForTimeout(220);
  const text = (await page.textContent('body')) ?? '';

  if (/Final rankings/i.test(text) && /Start a new game/i.test(text)) {
    break;
  }

  if (/(Start|Iniciar)\s+(Round|Ronda)/i.test(text)) {
    await page.getByRole('button', { name: /^(Start|Iniciar)\s+(Round|Ronda)/i }).click();
    continue;
  }

  if (/Continue/i.test(text) && /(Correct answer locked|All four players missed it)/i.test(text)) {
    await page.getByRole('button', { name: /^Continue$/i }).click();
    continue;
  }

  const match = answerMap.find(([question]) => text.includes(question));
  if (!match) {
    continue;
  }

  const [question, correct, wrong] = match;
  if (!didStealDemo) {
    console.log(`QA step ${step}: forcing steal on "${question}"`);
    await page.getByRole('button', { name: answerButtonPattern(wrong) }).click();
    didStealDemo = true;
  } else {
    console.log(`QA step ${step}: answering "${question}" with "${correct}"`);
    await page.getByRole('button', { name: answerButtonPattern(correct) }).click();
  }
}

await page.waitForTimeout(400);
await page.screenshot({ path: fileURLToPath(new URL('05-winner.png', outDir)), fullPage: true });

const finalText = (await page.textContent('body')) ?? '';
if (!/Final rankings/i.test(finalText) || !/Start a new game/i.test(finalText)) {
  throw new Error('Winner screen not reached.');
}

if (finalText.includes('Valentino Brown')) {
  throw new Error('Inactive player leaked into the final standings.');
}

if (!didStealDemo) {
  throw new Error('Steal demo did not execute.');
}

await browser.close();
console.log('QA smoke passed');

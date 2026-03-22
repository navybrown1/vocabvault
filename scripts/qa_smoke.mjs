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

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function answerButtonPattern(answer) {
  return new RegExp(`^(?:[1-4]\\s+)?${escapeRegex(answer)}$`, 'i');
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1280 } });

await page.goto(baseUrl, { waitUntil: 'networkidle' });
await page.screenshot({ path: fileURLToPath(new URL('01-welcome.png', outDir)), fullPage: true });

const welcomeText = (await page.textContent('body')) ?? '';
if (!welcomeText.includes('The Brown Family Trivia Super Game')) {
  throw new Error('Welcome screen missing expected branding.');
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

await page.getByRole('button', { name: /Launch round one/i }).click();
await page.waitForTimeout(250);
await page.screenshot({ path: fileURLToPath(new URL('03-round-start.png', outDir)), fullPage: true });

await page.getByRole('button', { name: /Enter the arena/i }).click();
await page.waitForTimeout(450);
await page.screenshot({ path: fileURLToPath(new URL('04-gameplay.png', outDir)), fullPage: true });

let didStealDemo = false;

for (let step = 0; step < 60; step += 1) {
  await page.waitForTimeout(220);
  const text = (await page.textContent('body')) ?? '';

  if (/Final rankings/i.test(text) && /Start a new game/i.test(text)) {
    break;
  }

  if (/Start round 2/i.test(text)) {
    await page.getByRole('button', { name: /Start round 2/i }).click();
    continue;
  }

  if (/Start round 3/i.test(text)) {
    await page.getByRole('button', { name: /Start round 3/i }).click();
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

if (!didStealDemo) {
  throw new Error('Steal demo did not execute.');
}

await browser.close();
console.log('QA smoke passed');

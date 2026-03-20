import { QuizQuestion, VocabWord } from '../types';
import { vocabularyData } from '../data/vocabulary';

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getRandomItems<T>(array: T[], count: number): T[] {
  return shuffle(array).slice(0, count);
}

export function generateMultipleChoiceQuestion(word: VocabWord): QuizQuestion {
  // Get 3 wrong definitions from other words
  const otherWords = vocabularyData.filter(w => w.id !== word.id);
  const wrongOptions = getRandomItems(otherWords, 3).map(w => w.simpleDefinition);
  const options = shuffle([word.simpleDefinition, ...wrongOptions]);

  return {
    type: 'multiple-choice',
    wordId: word.id,
    question: `What does "${word.word}" mean?`,
    options,
    correctAnswer: word.simpleDefinition,
    hint: word.memoryTip,
  };
}

export function generateFillBlankQuestion(word: VocabWord): QuizQuestion {
  // Replace the word in the example sentence with a blank
  const blank = '________';
  const regex = new RegExp(word.word, 'gi');
  const questionSentence = word.exampleSentence.replace(regex, blank);

  // If the word wasn't found literally, create a simpler question
  const question = questionSentence.includes(blank)
    ? `Fill in the blank: "${questionSentence}"`
    : `Which word means: "${word.simpleDefinition}"?`;

  const otherWords = vocabularyData.filter(w => w.id !== word.id);
  const wrongOptions = getRandomItems(otherWords, 3).map(w => w.word);
  const options = shuffle([word.word, ...wrongOptions]);

  return {
    type: 'fill-blank',
    wordId: word.id,
    question,
    options,
    correctAnswer: word.word,
    hint: `Part of speech: ${word.partOfSpeech}`,
  };
}

export function generateContextQuestion(word: VocabWord): QuizQuestion {
  // Ask which sentence uses the word correctly
  const correctSentence = word.exampleSentence;

  // Generate plausible but incorrect usages
  const otherWords = getRandomItems(
    vocabularyData.filter(w => w.id !== word.id),
    3
  );
  const wrongSentences = otherWords.map(w =>
    w.exampleSentence.replace(new RegExp(w.word, 'gi'), word.word)
  );

  const options = shuffle([correctSentence, ...wrongSentences.slice(0, 3)]);

  return {
    type: 'context',
    wordId: word.id,
    question: `Which sentence uses "${word.word}" correctly?`,
    options,
    correctAnswer: correctSentence,
    hint: word.simpleDefinition,
  };
}

export function generateSynonymQuestion(word: VocabWord): QuizQuestion {
  if (word.synonyms.length === 0) return generateMultipleChoiceQuestion(word);

  const correctSynonym = word.synonyms[Math.floor(Math.random() * word.synonyms.length)];

  // Get wrong options from antonyms and random other word synonyms
  const wrongPool = [
    ...word.antonyms,
    ...vocabularyData
      .filter(w => w.id !== word.id)
      .flatMap(w => w.synonyms)
      .filter(s => !word.synonyms.includes(s))
  ];
  const wrongOptions = getRandomItems(wrongPool, 3);
  const options = shuffle([correctSynonym, ...wrongOptions]);

  return {
    type: 'matching',
    wordId: word.id,
    question: `Which word is a synonym of "${word.word}"?`,
    options,
    correctAnswer: correctSynonym,
    hint: word.simpleDefinition,
  };
}

export function generateQuizSet(words: VocabWord[], questionsPerWord: number = 1): QuizQuestion[] {
  const generators = [
    generateMultipleChoiceQuestion,
    generateFillBlankQuestion,
    generateContextQuestion,
    generateSynonymQuestion,
  ];

  const questions: QuizQuestion[] = [];
  for (const word of words) {
    const selectedGenerators = getRandomItems(generators, questionsPerWord);
    for (const gen of selectedGenerators) {
      questions.push(gen(word));
    }
  }
  return shuffle(questions);
}

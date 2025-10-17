import {
  LetterPosition,
  WordPosition,
  ShieldPowerUp,
  GameStats,
  GameDimensions,
} from "../types/game";
import {
  ALPHABET,
  LETTER_COLORS,
  HOME_ROW_LETTERS,
  GAME_CONFIG,
  LEVEL_THRESHOLDS,
  WORD_SCORES,
} from "../constants/gameConfig";
import { getRandomWord, WORD_COLORS } from "../constants/wordList";

export const generateRandomLetter = (
  existingLetters: LetterPosition[],
  letterIdCounter: number,
  dimensions: GameDimensions
): LetterPosition => {
  const getRandomX = (): number => {
    const attempts = 50;
    for (let i = 0; i < attempts; i++) {
      const x = Math.random() * (dimensions.width - dimensions.letterSize);
      const overlaps = existingLetters.some(
        (letter) =>
          Math.abs(letter.x - x) < dimensions.letterSize &&
          letter.y < dimensions.letterSize
      );
      if (!overlaps) return x;
    }
    return Math.random() * (dimensions.width - dimensions.letterSize);
  };

  const letter = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  const color = LETTER_COLORS[Math.floor(Math.random() * LETTER_COLORS.length)];

  return {
    letter,
    x: getRandomX(),
    y: 0,
    color,
    id: letterIdCounter,
  };
};

export const generateRandomWord = (
  existingWords: WordPosition[],
  wordIdCounter: number,
  dimensions: GameDimensions
): WordPosition => {
  const getRandomX = (): number => {
    const wordWidth = dimensions.letterSize * 10;
    const attempts = 50;
    for (let i = 0; i < attempts; i++) {
      const x = Math.random() * (dimensions.width - wordWidth);
      const overlaps = existingWords.some(
        (word) =>
          Math.abs(word.x - x) < wordWidth && word.y < dimensions.letterSize
      );
      if (!overlaps) return x;
    }
    return Math.random() * (dimensions.width - wordWidth);
  };

  const word = getRandomWord();
  const color = WORD_COLORS[Math.floor(Math.random() * WORD_COLORS.length)];

  return {
    word,
    x: getRandomX(),
    y: 0,
    color,
    id: wordIdCounter,
    typedProgress: 0,
  };
};

export const generateShieldPowerUp = (
  shieldIdCounter: number,
  dimensions: GameDimensions
): ShieldPowerUp => {
  const shieldSize = dimensions.letterSize * 2;
  const x = Math.random() * (dimensions.width - shieldSize);

  return {
    x,
    y: 0,
    id: shieldIdCounter,
  };
};

export const getLetterScore = (letter: string): number => {
  return HOME_ROW_LETTERS.has(letter) ? 1 : 2;
};

export const getWordScore = (word: string): number => {
  const length = Math.min(word.length, 10);
  return WORD_SCORES[length] || word.length * 2;
};

export const getLevelMessage = (lettersCorrect: number): string => {
  if (lettersCorrect >= LEVEL_THRESHOLDS.MAX_LEVEL)
    return "Level 10: GOD MODE!";
  if (lettersCorrect >= LEVEL_THRESHOLDS.LEVEL_9)
    return "Level 9: Lightning Fingers!";
  if (lettersCorrect >= LEVEL_THRESHOLDS.LEVEL_8)
    return "Level 8: Master of Speed!";
  if (lettersCorrect >= LEVEL_THRESHOLDS.LEVEL_7)
    return "Level 7: Precision Expert!";
  if (lettersCorrect >= LEVEL_THRESHOLDS.LEVEL_6)
    return "Level 6: Typing Virtuoso!";
  if (lettersCorrect >= LEVEL_THRESHOLDS.LEVEL_5)
    return "Level 5: Word Warrior!";
  if (lettersCorrect >= LEVEL_THRESHOLDS.LEVEL_4)
    return "Level 4: Master Typist!";
  if (lettersCorrect >= LEVEL_THRESHOLDS.LEVEL_3)
    return "Level 3: Expert Mode!";
  if (lettersCorrect >= LEVEL_THRESHOLDS.LEVEL_2)
    return "Level 2: Getting Better!";
  if (lettersCorrect >= 0) return "Level 1: Beginner Mode!";
  return "";
};

export const getLevel = (lettersCorrect: number): number => {
  if (lettersCorrect >= LEVEL_THRESHOLDS.MAX_LEVEL) return 10;
  if (lettersCorrect >= LEVEL_THRESHOLDS.LEVEL_9) return 9;
  if (lettersCorrect >= LEVEL_THRESHOLDS.LEVEL_8) return 8;
  if (lettersCorrect >= LEVEL_THRESHOLDS.LEVEL_7) return 7;
  if (lettersCorrect >= LEVEL_THRESHOLDS.LEVEL_6) return 6;
  if (lettersCorrect >= LEVEL_THRESHOLDS.LEVEL_5) return 5;
  if (lettersCorrect >= LEVEL_THRESHOLDS.LEVEL_4) return 4;
  if (lettersCorrect >= LEVEL_THRESHOLDS.LEVEL_3) return 3;
  if (lettersCorrect >= LEVEL_THRESHOLDS.LEVEL_2) return 2;
  return 1;
};

export const calculateGameStats = (
  time: number,
  lettersCorrect: number,
  keysPressed: number
): GameStats => {
  const timeInSeconds = Math.floor(time / GAME_CONFIG.FRAME_RATE);
  const successPercentage =
    keysPressed === 0 ? 0 : Math.round((lettersCorrect / keysPressed) * 100);

  return {
    timeInSeconds,
    successPercentage,
    accuracy: successPercentage,
  };
};

import { LetterPosition, GameStats } from "../types/game";
import {
  ALPHABET,
  LETTER_COLORS,
  HOME_ROW_LETTERS,
  GAME_CONFIG,
  LEVEL_THRESHOLDS,
} from "../constants/gameConfig";

export const generateRandomLetter = (
  existingLetters: LetterPosition[],
  letterIdCounter: number
): LetterPosition => {
  const getRandomX = (): number => {
    const attempts = 50;
    for (let i = 0; i < attempts; i++) {
      const x =
        Math.random() * (GAME_CONFIG.SCREEN_WIDTH - GAME_CONFIG.LETTER_SIZE);
      const overlaps = existingLetters.some(
        (letter) =>
          Math.abs(letter.x - x) < GAME_CONFIG.LETTER_SIZE &&
          letter.y < GAME_CONFIG.LETTER_SIZE
      );
      if (!overlaps) return x;
    }
    return Math.random() * (GAME_CONFIG.SCREEN_WIDTH - GAME_CONFIG.LETTER_SIZE);
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

export const getLetterScore = (letter: string): number => {
  return HOME_ROW_LETTERS.has(letter) ? 1 : 3;
};

export const getLevelMessage = (lettersCorrect: number): string => {
  if (lettersCorrect >= LEVEL_THRESHOLDS.MAX_LEVEL)
    return "MAX LEVEL ACHIEVED!";
  if (lettersCorrect >= LEVEL_THRESHOLDS.LEVEL_4)
    return "Level 4: Master Typist!";
  if (lettersCorrect >= LEVEL_THRESHOLDS.LEVEL_3)
    return "Level 3: Expert Mode!";
  if (lettersCorrect >= LEVEL_THRESHOLDS.LEVEL_2)
    return "Level 2: Getting Better!";
  if (lettersCorrect >= 0) return "Level 1: Let's do this! Goodluck!";
  return "";
};

export const getLevel = (lettersCorrect: number): number => {
  if (lettersCorrect >= LEVEL_THRESHOLDS.MAX_LEVEL) return 5;
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

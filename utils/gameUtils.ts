import {
  LetterPosition,
  WordPosition,
  ShieldPowerUp,
  GameStats,
  GameDimensions,
  LifePowerUp,
  MultiplierPowerUp,
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
  const getRandomX = (wordLength: number): number => {
    const wordWidth = dimensions.letterSize * Math.max(wordLength, 5);
    const minVerticalSpacing = dimensions.letterSize * 3;
    const attempts = 50;

    for (let i = 0; i < attempts; i++) {
      const x = Math.random() * (dimensions.width - wordWidth);
      const overlaps = existingWords.some((word) => {
        const horizontalOverlap = Math.abs(word.x - x) < wordWidth;
        const verticalOverlap = word.y < minVerticalSpacing;
        return horizontalOverlap && verticalOverlap;
      });
      if (!overlaps) return x;
    }
    return Math.random() * (dimensions.width - wordWidth);
  };

  const word = getRandomWord();
  const color = WORD_COLORS[Math.floor(Math.random() * WORD_COLORS.length)];

  return {
    word,
    x: getRandomX(word.length),
    y: 0,
    color,
    id: wordIdCounter,
    typedProgress: 0,
  };
};

export const generateStoryWord = (
  word: string,
  existingWords: WordPosition[],
  wordIdCounter: number,
  dimensions: GameDimensions
): WordPosition => {
  const getRandomX = (wordLength: number): number => {
    const wordWidth = dimensions.letterSize * Math.max(wordLength, 5);
    const minVerticalSpacing = dimensions.letterSize * 3;
    const attempts = 50;

    for (let i = 0; i < attempts; i++) {
      const x = Math.random() * (dimensions.width - wordWidth);
      const overlaps = existingWords.some((w) => {
        const horizontalOverlap = Math.abs(w.x - x) < wordWidth;
        const verticalOverlap = w.y < minVerticalSpacing;
        return horizontalOverlap && verticalOverlap;
      });
      if (!overlaps) return x;
    }
    return Math.random() * (dimensions.width - wordWidth);
  };

  const color = WORD_COLORS[Math.floor(Math.random() * WORD_COLORS.length)];

  return {
    word: word.toUpperCase(),
    x: getRandomX(word.length),
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

export const generateLifePowerUp = (
  lifeIdCounter: number,
  dimensions: GameDimensions
): LifePowerUp => {
  const lifeSize = dimensions.letterSize * 2;
  const x = Math.random() * (dimensions.width - lifeSize);

  return {
    x,
    y: 0,
    id: lifeIdCounter,
  };
};

export const generateMultiplierPowerUp = (
  multiplierIdCounter: number,
  dimensions: GameDimensions
): MultiplierPowerUp => {
  const multiplierSize = dimensions.letterSize * 2;
  const x = Math.random() * (dimensions.width - multiplierSize);

  return {
    x,
    y: 0,
    id: multiplierIdCounter,
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
    return "FINAL LEVEL: GOD MODE";
  if (lettersCorrect >= LEVEL_THRESHOLDS.LEVEL_9)
    return "Level 9: Digital Deity";
  if (lettersCorrect >= LEVEL_THRESHOLDS.LEVEL_8)
    return "Level 8: Cyber Samurai";
  if (lettersCorrect >= LEVEL_THRESHOLDS.LEVEL_7)
    return "Level 7: Lightning Typist";
  if (lettersCorrect >= LEVEL_THRESHOLDS.LEVEL_6)
    return "Level 6: Keystorm Commander";
  if (lettersCorrect >= LEVEL_THRESHOLDS.LEVEL_5)
    return "Level 5: Rapid Reactor";
  if (lettersCorrect >= LEVEL_THRESHOLDS.LEVEL_4) return "Level 4: Word Slicer";
  if (lettersCorrect >= LEVEL_THRESHOLDS.LEVEL_3)
    return "Level 3: Rising Challenger";
  if (lettersCorrect >= LEVEL_THRESHOLDS.LEVEL_2)
    return "Level 2: Typing Trainee";
  if (lettersCorrect >= 0) return "Level 1: Initiate";
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

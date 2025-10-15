export interface GameDimensions {
  width: number;
  height: number;
  letterSize: number;
}

export type GameMode = "letter" | "word";

export interface LetterPosition {
  letter: string;
  x: number;
  y: number;
  color: string;
  id: number;
}

export interface WordPosition {
  word: string;
  x: number;
  y: number;
  color: string;
  id: number;
  typedProgress: number;
}

export interface GameState {
  letters: LetterPosition[];
  words: WordPosition[];
  time: number;
  lettersCorrect: number;
  score: number;
  speed: number;
  keysPressed: number;
  gameOver: boolean;
  level: number;
  lastKeyPressed: string | null;
  lastKeyCorrect: boolean;
  lives: number;
  dimensions: GameDimensions;
  gameMode: GameMode;
  currentTypingWordId: number | null;
}

export interface GameStats {
  timeInSeconds: number;
  successPercentage: number;
  accuracy: number;
}

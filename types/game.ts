export interface LetterPosition {
  letter: string;
  x: number;
  y: number;
  color: string;
  id: number;
}

export interface GameState {
  letters: LetterPosition[];
  time: number;
  lettersCorrect: number;
  score: number;
  speed: number;
  keysPressed: number;
  gameOver: boolean;
  level: number;
}

export interface GameStats {
  timeInSeconds: number;
  successPercentage: number;
  accuracy: number;
}

export type GameMode = "letter" | "word" | "story";

export interface HighScore {
  id: number;
  nickname: string;
  score: number;
  lettersCorrect: number;
  accuracy: number;
  timePlayed: number;
  gameMode: GameMode;
  createdAt: Date;
}

export interface CreateHighScoreDto {
  nickname: string;
  score: number;
  lettersCorrect: number;
  accuracy: number;
  timePlayed: number;
  gameMode: GameMode;
}

export interface HighScore {
  id: number;
  nickname: string;
  score: number;
  lettersCorrect: number;
  accuracy: number;
  timePlayed: number;
  createdAt: Date;
}

export interface CreateHighScoreDto {
  nickname: string;
  score: number;
  lettersCorrect: number;
  accuracy: number;
  timePlayed: number;
}

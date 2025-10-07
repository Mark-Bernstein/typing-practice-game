export const GAME_CONFIG = {
  LETTER_SIZE: 50,
  SCREEN_WIDTH: 1200,
  SCREEN_HEIGHT: 1000,
  COUNTER_SIZE: 18,
  START_LETTER_SPEED: 1.5,
  FRAME_RATE: 60,
  MAX_LETTERS: 10,
  MAX_SPEED: 50,
} as const;

export const LETTER_COLORS: readonly string[] = [
  "#ff6b6b",
  "#ffa726",
  "#ffee58",
  "#66bb6a",
  "#f06292",
  "#ab47bc",
] as const;

export const ALPHABET: readonly string[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(
  ""
);

export const HOME_ROW_LETTERS: ReadonlySet<string> = new Set([
  "A",
  "S",
  "D",
  "F",
  "J",
  "K",
  "L",
]);

export const LEVEL_THRESHOLDS = {
  LEVEL_2: 10,
  LEVEL_3: 30,
  LEVEL_4: 70,
  MAX_LEVEL: 130,
} as const;

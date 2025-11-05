export const GAME_CONFIG = {
  // Game settings
  COUNTER_SIZE: 18,
  START_LETTER_SPEED: 1,
  FRAME_RATE: 60,
  MAX_LETTERS: 1,
  MAX_WORDS: 5,
  MAX_SPEED: 50,

  // Word mode settings
  WORD_SPEED_MULTIPLIER: 0.8,
  WORD_MIN_LENGTH: 3,
  WORD_MAX_LENGTH: 6,

  // Shield power-up settings
  SHIELD_SPAWN_INTERVAL: 800,
  SHIELD_CHARGES: 3,
  MAX_SHIELD_STACKS: 3,
  SHIELD_SPEED_MULTIPLIER: 2,

  // Life power-up settings
  LIFE_SPAWN_INTERVAL: 600,
  LIFE_SPEED_MULTIPLIER: 2,

  // Multiplier power-up settings
  MULTIPLIER_SPAWN_INTERVAL: 800,
  MULTIPLIER_SPEED_MULTIPLIER: 1.5,
  MULTIPLIER_BOOST: 50, // Adds +2.5x to multiplier
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
  LEVEL_2: 20,
  LEVEL_3: 50,
  LEVEL_4: 100,
  LEVEL_5: 180,
  LEVEL_6: 300,
  LEVEL_7: 450,
  LEVEL_8: 650,
  LEVEL_9: 1000,
  MAX_LEVEL: 1500,
} as const;

export const WORD_SCORES: Record<number, number> = {
  3: 3,
  4: 4,
  5: 5,
  6: 7,
  7: 9,
  8: 11,
  9: 13,
  10: 15,
};

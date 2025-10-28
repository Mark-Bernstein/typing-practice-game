import { useState, useEffect, useCallback, useRef } from "react";
import { GameState, GameDimensions, GameMode } from "../types/game";
import { GAME_CONFIG, ALPHABET } from "../constants/gameConfig";
import { SoundEffect } from "./useAudio";
import {
  generateRandomLetter,
  generateRandomWord,
  generateStoryWord,
  generateShieldPowerUp,
  generateLifePowerUp,
  getLetterScore,
  getWordScore,
  getLevel,
} from "../utils/gameUtils";
import { getStory } from "../constants/wordList";

// Helper function to calculate multiplier based on combo count
const getComboMultiplier = (comboCount: number): number => {
  return 1 + Math.floor(comboCount / 10) * 0.5;
};

export const useTypingGame = (
  playSFX: (effect: SoundEffect) => void,
  dimensions: GameDimensions,
  initialGameMode: GameMode = "letter"
) => {
  const getInitialState = useCallback((): GameState => {
    const baseState: GameState = {
      letters: [],
      words: [],
      shields: [],
      lives_powerups: [],
      time: 0,
      lettersCorrect: 0,
      score: 0,
      speed: GAME_CONFIG.START_LETTER_SPEED,
      keysPressed: 0,
      gameOver: false,
      level: 1,
      lastKeyPressed: null,
      lastKeyCorrect: true,
      lives: 5,
      maxLives: 5,
      dimensions,
      gameMode: initialGameMode,
      currentTypingWordId: null,
      shieldState: {
        active: false,
        charges: 0,
        maxCharges: GAME_CONFIG.SHIELD_CHARGES * GAME_CONFIG.MAX_SHIELD_STACKS,
      },
      combo: {
        count: 0,
        multiplier: 1,
        lastCorrectTime: 0,
      },
    };

    // Initialize story state with single string
    if (initialGameMode === "story") {
      const story = getStory();
      const allWords = story.story.split(" ");

      baseState.storyState = {
        currentStoryId: story.id,
        currentSentenceIndex: 0,
        totalSentences: allWords.length,
        storyTitle: story.title,
        currentSentence: allWords,
        sentenceWordIndex: 0,
      };
    }

    return baseState;
  }, [dimensions, initialGameMode]);

  const [gameState, setGameState] = useState<GameState>(getInitialState);
  const gameLoopRef = useRef<number | undefined>(undefined);
  const letterIdCounter = useRef(0);
  const wordIdCounter = useRef(0);
  const shieldIdCounter = useRef(0);
  const lifeIdCounter = useRef(0);
  const prevLivesRef = useRef(5);
  const lastShieldSpawnTime = useRef(0);
  const lastLifeSpawnTime = useRef(0);

  useEffect(() => {
    setGameState((prev) => ({ ...prev, dimensions }));
  }, [dimensions]);

  const gameLoop = useCallback(() => {
    setGameState((prevState) => {
      if (prevState.gameOver) return prevState;

      const newState = { ...prevState };
      newState.time += 1;

      const effectiveSpeed =
        prevState.gameMode === "word" || prevState.gameMode === "story"
          ? prevState.speed * GAME_CONFIG.WORD_SPEED_MULTIPLIER
          : prevState.speed;

      // ===== MOVE SHIELDS =====
      const shieldSpeed = effectiveSpeed * GAME_CONFIG.SHIELD_SPEED_MULTIPLIER;

      newState.shields = newState.shields.map((shield) => ({
        id: shield.id,
        x: shield.x,
        y: shield.y + shieldSpeed,
      }));

      const shieldsReachedBottom = newState.shields.filter(
        (shield) =>
          shield.y + newState.dimensions.letterSize * 2 >=
          newState.dimensions.height
      );

      if (shieldsReachedBottom.length > 0) {
        playSFX("shield-despawn");
      }

      newState.shields = newState.shields.filter(
        (shield) =>
          shield.y + newState.dimensions.letterSize * 2 <
          newState.dimensions.height
      );

      // ===== MOVE LIFE POWER-UPS =====
      const lifeSpeed = effectiveSpeed * GAME_CONFIG.LIFE_SPEED_MULTIPLIER;

      newState.lives_powerups = newState.lives_powerups.map((life) => ({
        id: life.id,
        x: life.x,
        y: life.y + lifeSpeed,
      }));

      // Remove life power-ups that reach bottom
      const livesReachedBottom = newState.lives_powerups.filter(
        (life) =>
          life.y + newState.dimensions.letterSize * 2 >=
          newState.dimensions.height
      );

      if (livesReachedBottom.length > 0) {
        playSFX("shield-despawn"); // Reuse shield despawn sound
      }

      newState.lives_powerups = newState.lives_powerups.filter(
        (life) =>
          life.y + newState.dimensions.letterSize * 2 <
          newState.dimensions.height
      );

      // ===== LETTER MODE =====
      if (prevState.gameMode === "letter") {
        newState.letters = newState.letters.map((letter) => ({
          ...letter,
          y: letter.y + effectiveSpeed,
        }));

        const lettersReachedBottom = newState.letters.filter(
          (l) =>
            l.y + newState.dimensions.letterSize >= newState.dimensions.height
        );

        const remainingLetters = newState.letters.filter(
          (l) =>
            l.y + newState.dimensions.letterSize < newState.dimensions.height
        );

        let livesCost = lettersReachedBottom.length;
        let shieldChargesUsed = 0;

        if (newState.shieldState.active && livesCost > 0) {
          const chargesAvailable = newState.shieldState.charges;
          shieldChargesUsed = Math.min(livesCost, chargesAvailable);

          if (shieldChargesUsed > 0) {
            playSFX("shield-lost");
          }

          livesCost -= shieldChargesUsed;

          newState.shieldState = {
            ...newState.shieldState,
            charges: chargesAvailable - shieldChargesUsed,
            active: chargesAvailable - shieldChargesUsed > 0,
          };
        }

        const newLives = newState.lives - livesCost;

        if (livesCost > 0 && newLives < prevState.lives) {
          playSFX("life-lost");
          prevLivesRef.current = newLives;
        }

        if (newLives <= 0) {
          playSFX("game-over");
          return {
            ...newState,
            gameOver: true,
            lives: 0,
            letters: remainingLetters,
          };
        }

        newState.letters = remainingLetters;
        newState.lives = newLives;

        if (
          newState.letters.length === 0 ||
          (newState.time % 60 === 0 &&
            newState.letters.length < GAME_CONFIG.MAX_LETTERS)
        ) {
          const spawnCount = Math.min(
            newState.level,
            12 - newState.letters.length
          );

          for (let i = 0; i < spawnCount; i++) {
            const newLetter = generateRandomLetter(
              newState.letters,
              letterIdCounter.current++,
              newState.dimensions
            );
            newState.letters = [...newState.letters, newLetter];
          }
        }
      }

      // ===== WORD MODE & STORY MODE =====
      else if (
        prevState.gameMode === "word" ||
        prevState.gameMode === "story"
      ) {
        newState.words = newState.words.map((word) => ({
          ...word,
          y: word.y + effectiveSpeed,
        }));

        const wordsReachedBottom = newState.words.filter(
          (w) =>
            w.y + newState.dimensions.letterSize >= newState.dimensions.height
        );

        const remainingWords = newState.words.filter(
          (w) =>
            w.y + newState.dimensions.letterSize < newState.dimensions.height
        );

        if (
          newState.currentTypingWordId &&
          wordsReachedBottom.some((w) => w.id === newState.currentTypingWordId)
        ) {
          newState.currentTypingWordId = null;
        }

        let livesCost = wordsReachedBottom.length;
        let shieldChargesUsed = 0;

        if (newState.shieldState.active && livesCost > 0) {
          const chargesAvailable = newState.shieldState.charges;
          shieldChargesUsed = Math.min(livesCost, chargesAvailable);

          if (shieldChargesUsed > 0) playSFX("shield-lost");

          livesCost -= shieldChargesUsed;

          newState.shieldState = {
            ...newState.shieldState,
            charges: chargesAvailable - shieldChargesUsed,
            active: chargesAvailable - shieldChargesUsed > 0,
          };
        }

        const newLives = newState.lives - livesCost;

        if (livesCost > 0 && newLives < prevState.lives) {
          playSFX("life-lost");
          prevLivesRef.current = newLives;

          // Cancel typing if the active word hit bottom
          if (newState.currentTypingWordId !== null) {
            const hitBottom = wordsReachedBottom.some(
              (w) => w.id === newState.currentTypingWordId
            );
            if (hitBottom) {
              newState.currentTypingWordId = null;
            }
          }
        }

        if (newLives <= 0) {
          playSFX("game-over");
          return {
            ...newState,
            gameOver: true,
            lives: 0,
            words: remainingWords,
          };
        }

        newState.words = remainingWords;
        newState.lives = newLives;

        // WORD MODE spawn logic
        if (prevState.gameMode === "word") {
          if (
            newState.words.length === 0 ||
            (newState.time % 90 === 0 &&
              newState.words.length < GAME_CONFIG.MAX_WORDS)
          ) {
            const newWord = generateRandomWord(
              newState.words,
              wordIdCounter.current++,
              newState.dimensions
            );
            newState.words = [...newState.words, newWord];
          }
        }

        // STORY MODE spawn logic
        if (prevState.gameMode === "story" && newState.storyState) {
          const { currentSentence, sentenceWordIndex } = newState.storyState;

          // Check if we've reached the end of the story
          if (sentenceWordIndex >= currentSentence.length) {
            // Story complete - prevent further spawning
            return newState;
          }

          // Spawn next word from story
          if (
            newState.words.length === 0 ||
            (newState.time % 90 === 0 &&
              newState.words.length < GAME_CONFIG.MAX_WORDS)
          ) {
            const nextWord = currentSentence[sentenceWordIndex];
            if (nextWord) {
              const newWord = generateStoryWord(
                nextWord,
                newState.words,
                wordIdCounter.current++,
                newState.dimensions
              );
              newState.words = [...newState.words, newWord];
              newState.storyState = {
                ...newState.storyState,
                sentenceWordIndex: sentenceWordIndex + 1,
              };
            }
          }
        }
      }

      // ===== SHIELD SPAWN =====
      const timeSinceLastShield = newState.time - lastShieldSpawnTime.current;
      const shouldSpawnShield =
        timeSinceLastShield >= GAME_CONFIG.SHIELD_SPAWN_INTERVAL &&
        Math.random() < 0.02;

      if (shouldSpawnShield) {
        const newShield = generateShieldPowerUp(
          shieldIdCounter.current++,
          newState.dimensions
        );

        newState.shields = [...newState.shields, newShield];
        lastShieldSpawnTime.current = newState.time;
      }

      const newLevel = getLevel(newState.lettersCorrect);

      if (newLevel > prevState.level) {
        if (newLevel % 2 === 0) {
          newState.maxLives = prevState.maxLives + 1;
        } else {
          newState.maxLives = prevState.maxLives;
        }

        newState.lives = Math.min(prevState.lives + 1, newState.maxLives);
      } else {
        newState.maxLives = prevState.maxLives;
      }

      // ===== LIFE POWER-UP SPAWN =====
      const timeSinceLastLife = newState.time - lastLifeSpawnTime.current;
      const shouldSpawnLife =
        timeSinceLastLife >= GAME_CONFIG.LIFE_SPAWN_INTERVAL &&
        Math.random() < 0.015 && // ~1.5% chance each frame after interval
        newState.lives < newState.maxLives; // Only spawn if player is missing lives

      if (shouldSpawnLife) {
        const newLife = generateLifePowerUp(
          lifeIdCounter.current++,
          newState.dimensions
        );

        newState.lives_powerups = [...newState.lives_powerups, newLife];
        lastLifeSpawnTime.current = newState.time;
      }

      newState.level = getLevel(newState.lettersCorrect);
      return newState;
    });
  }, [playSFX]);

  const handleKeyPress = useCallback(
    (key: string) => {
      // ===== SHIELD PICKUP ("!" key) =====
      if (key === "!") {
        setGameState((prevState) => {
          if (prevState.gameOver || prevState.shields.length === 0)
            return prevState;

          const newState = { ...prevState };
          newState.shields = [];

          const currentCharges = newState.shieldState.charges;
          const maxCharges =
            GAME_CONFIG.SHIELD_CHARGES * GAME_CONFIG.MAX_SHIELD_STACKS;
          const newCharges = Math.min(
            currentCharges + GAME_CONFIG.SHIELD_CHARGES,
            maxCharges
          );

          newState.shieldState = {
            active: true,
            charges: newCharges,
            maxCharges,
          };

          playSFX("shield-gain");
          newState.lastKeyCorrect = true;

          return newState;
        });
        return;
      }

      // ===== LIFE PICKUP ("$" key) =====
      if (key === "$") {
        setGameState((prevState) => {
          if (prevState.gameOver || prevState.lives_powerups.length === 0)
            return prevState;

          // Only pick up if player is missing lives
          if (prevState.lives >= prevState.maxLives) {
            return prevState;
          }

          const newState = { ...prevState };
          newState.lives_powerups = [];
          newState.lives = Math.min(prevState.lives + 1, prevState.maxLives);

          playSFX("extra-life"); // Reuse shield gain sound or add new sound
          newState.lastKeyCorrect = true;

          return newState;
        });
        return;
      }

      const upperKey = key.toUpperCase();

      // Accept letters, numbers, space, and punctuation
      if (!/^[A-Za-z0-9 .,'";:?-]$/.test(key)) {
        return;
      }

      setGameState((prevState) => {
        if (prevState.gameOver) return prevState;

        const newState = {
          ...prevState,
          keysPressed: prevState.keysPressed + 1,
          lastKeyPressed: upperKey,
          lastKeyCorrect: false,
          score: prevState.score,
        };

        // ===== LETTER MODE =====
        if (prevState.gameMode === "letter") {
          const index = newState.letters.findIndex(
            (l) => l.letter === upperKey
          );

          if (index !== -1) {
            playSFX("correct");
            const updatedLetters = [...newState.letters];
            updatedLetters.splice(index, 1);
            newState.letters = updatedLetters;
            newState.lettersCorrect += 1;

            newState.combo = {
              count: prevState.combo.count + 1,
              multiplier: getComboMultiplier(prevState.combo.count + 1),
              lastCorrectTime: newState.time,
            };

            const baseScore = getLetterScore(upperKey);
            newState.score += Math.floor(baseScore * newState.combo.multiplier);

            newState.speed = Math.min(
              GAME_CONFIG.MAX_SPEED,
              newState.speed * 1.01
            );
            newState.lastKeyCorrect = true;
          } else {
            playSFX("wrong");
            newState.score = Math.max(0, newState.score - 3);
            newState.combo = {
              count: 0,
              multiplier: 1,
              lastCorrectTime: 0,
            };
          }
        }

        // ===== WORD MODE & STORY MODE =====
        else if (
          prevState.gameMode === "word" ||
          prevState.gameMode === "story"
        ) {
          if (newState.currentTypingWordId === null) {
            // Find word that starts with the typed key (case-insensitive for letters)
            const wordIndex = newState.words.findIndex((w) => {
              if (w.typedProgress !== 0) return false;
              const firstChar = w.word[0];
              // For letters, match case-insensitive. For punctuation, match exact
              if (/[A-Za-z]/.test(firstChar)) {
                return firstChar.toUpperCase() === upperKey;
              } else {
                return firstChar === key;
              }
            });

            if (wordIndex !== -1) {
              playSFX("correct");
              const updatedWords = [...newState.words];
              const currentWord = updatedWords[wordIndex];

              if (currentWord.word.length === 1) {
                updatedWords.splice(wordIndex, 1);
                newState.words = updatedWords;
                newState.lettersCorrect += currentWord.word.length;

                newState.combo = {
                  count: prevState.combo.count + 1,
                  multiplier: getComboMultiplier(prevState.combo.count + 1),
                  lastCorrectTime: newState.time,
                };

                const baseScore = getWordScore(currentWord.word);
                newState.score += Math.floor(
                  baseScore * newState.combo.multiplier
                );

                newState.speed = Math.min(
                  GAME_CONFIG.MAX_SPEED,
                  newState.speed * 1.007
                );
                playSFX("correct-word");
              } else {
                updatedWords[wordIndex] = {
                  ...updatedWords[wordIndex],
                  typedProgress: 1,
                };
                newState.words = updatedWords;
                newState.currentTypingWordId = updatedWords[wordIndex].id;
              }

              newState.lastKeyCorrect = true;
            } else {
              playSFX("wrong");
              newState.score = Math.max(0, newState.score - 3);
              newState.combo = {
                count: 0,
                multiplier: 1,
                lastCorrectTime: 0,
              };
            }
          } else {
            const wordIndex = newState.words.findIndex(
              (w) => w.id === newState.currentTypingWordId
            );

            if (wordIndex !== -1) {
              const currentWord = newState.words[wordIndex];
              const nextLetterIndex = currentWord.typedProgress;
              const expectedChar = currentWord.word[nextLetterIndex];

              // For letters, match case-insensitive. For punctuation, match exact
              let isMatch = false;
              if (/[A-Za-z]/.test(expectedChar)) {
                isMatch = upperKey === expectedChar.toUpperCase();
              } else {
                isMatch = key === expectedChar;
              }

              if (isMatch) {
                playSFX("correct");
                const updatedWords = [...newState.words];
                updatedWords[wordIndex] = {
                  ...updatedWords[wordIndex],
                  typedProgress: nextLetterIndex + 1,
                };

                if (
                  updatedWords[wordIndex].typedProgress >=
                  currentWord.word.length
                ) {
                  updatedWords.splice(wordIndex, 1);
                  newState.lettersCorrect += currentWord.word.length;

                  newState.combo = {
                    count: prevState.combo.count + 1,
                    multiplier: getComboMultiplier(prevState.combo.count + 1),
                    lastCorrectTime: newState.time,
                  };

                  const baseScore = getWordScore(currentWord.word);
                  newState.score += Math.floor(
                    baseScore * newState.combo.multiplier
                  );

                  newState.speed = Math.min(
                    GAME_CONFIG.MAX_SPEED,
                    newState.speed * 1.007
                  );
                  newState.currentTypingWordId = null;
                  playSFX("correct-word");
                }

                newState.words = updatedWords;
                newState.lastKeyCorrect = true;
              } else {
                playSFX("wrong");
                const updatedWords = [...newState.words];
                updatedWords[wordIndex] = {
                  ...updatedWords[wordIndex],
                  typedProgress: 0,
                };
                newState.words = updatedWords;
                newState.currentTypingWordId = null;
                newState.score = Math.max(0, newState.score - 5);

                newState.combo = {
                  count: 0,
                  multiplier: 1,
                  lastCorrectTime: 0,
                };
              }
            }
          }
        }

        return newState;
      });
    },
    [playSFX]
  );

  const resetGame = useCallback(() => {
    setGameState(getInitialState());
    letterIdCounter.current = 0;
    wordIdCounter.current = 0;
    shieldIdCounter.current = 0;
    lifeIdCounter.current = 0;
    prevLivesRef.current = 5;
    lastShieldSpawnTime.current = 0;
    lastLifeSpawnTime.current = 0;
  }, [getInitialState]);

  useEffect(() => {
    if (!gameState.gameOver) {
      gameLoopRef.current = window.setInterval(
        gameLoop,
        1000 / GAME_CONFIG.FRAME_RATE
      );
    }

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameLoop, gameState.gameOver]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => handleKeyPress(event.key);
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyPress]);

  return { gameState, resetGame };
};

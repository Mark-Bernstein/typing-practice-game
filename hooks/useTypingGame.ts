import { useState, useEffect, useCallback, useRef } from "react";
import { GameState, GameDimensions, GameMode } from "../types/game";
import { GAME_CONFIG, ALPHABET } from "../constants/gameConfig";
import { SoundEffect } from "./useAudio";
import {
  generateRandomLetter,
  generateRandomWord,
  generateShieldPowerUp,
  getLetterScore,
  getWordScore,
  getLevel,
} from "../utils/gameUtils";

// Helper function to calculate multiplier based on combo count
const getComboMultiplier = (comboCount: number): number => {
  return 1 + Math.floor(comboCount / 10) * 0.5;
};

export const useTypingGame = (
  playSFX: (effect: SoundEffect) => void,
  dimensions: GameDimensions,
  initialGameMode: GameMode = "letter"
) => {
  const getInitialState = useCallback(
    (): GameState => ({
      letters: [],
      words: [],
      shields: [],
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
    }),
    [dimensions, initialGameMode]
  );

  const [gameState, setGameState] = useState<GameState>(getInitialState);
  const gameLoopRef = useRef<number | undefined>(undefined);
  const letterIdCounter = useRef(0);
  const wordIdCounter = useRef(0);
  const shieldIdCounter = useRef(0);
  const prevLivesRef = useRef(5);
  const lastShieldSpawnTime = useRef(0);

  useEffect(() => {
    setGameState((prev) => ({ ...prev, dimensions }));
  }, [dimensions]);

  const gameLoop = useCallback(() => {
    setGameState((prevState) => {
      if (prevState.gameOver) return prevState;

      const newState = { ...prevState };
      newState.time += 1;

      const effectiveSpeed =
        prevState.gameMode === "word"
          ? prevState.speed * GAME_CONFIG.WORD_SPEED_MULTIPLIER
          : prevState.speed;

      // ===== MOVE SHIELDS =====
      const shieldSpeed = effectiveSpeed * GAME_CONFIG.SHIELD_SPEED_MULTIPLIER;

      // Move shields downward
      newState.shields = newState.shields.map((shield) => ({
        id: shield.id,
        x: shield.x,
        y: shield.y + shieldSpeed,
      }));

      // Remove shields that reach bottom of screen
      const shieldsReachedBottom = newState.shields.filter(
        (shield) =>
          shield.y + newState.dimensions.letterSize * 2 >=
          newState.dimensions.height
      );

      if (shieldsReachedBottom.length > 0) {
        playSFX("shield-despawn");
      }

      // Keep only shields that are still visible
      newState.shields = newState.shields.filter(
        (shield) =>
          shield.y + newState.dimensions.letterSize * 2 <
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

        // Shield protection logic
        let livesCost = lettersReachedBottom.length;
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

        if (livesCost > 0 && newLives < prevLivesRef.current) {
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

        // Spawn new letters
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

      // ===== WORD MODE =====
      else {
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

        // Shield protection logic
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

        if (livesCost > 0 && newLives < prevLivesRef.current) {
          playSFX("life-lost");
          prevLivesRef.current = newLives;

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

        // Spawn logic
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

      // ===== SHIELD SPAWN =====
      const timeSinceLastShield = newState.time - lastShieldSpawnTime.current;
      const shouldSpawnShield =
        timeSinceLastShield >= GAME_CONFIG.SHIELD_SPAWN_INTERVAL &&
        Math.random() < 0.02; // ~2% chance each frame after interval

      if (shouldSpawnShield) {
        const newShield = generateShieldPowerUp(
          shieldIdCounter.current++,
          newState.dimensions
        );

        // Append new shield instead of replacing existing ones
        newState.shields = [...newState.shields, newShield];
        lastShieldSpawnTime.current = newState.time;
      }

      // Calculate new level
      const newLevel = getLevel(newState.lettersCorrect);

      // Check if level increased and add life + max life every 2 levels
      if (newLevel > prevState.level) {
        // Only add a max life every 2 levels (2, 4, 6, etc.)
        if (newLevel % 2 === 0) {
          newState.maxLives = prevState.maxLives + 1;
        } else {
          newState.maxLives = prevState.maxLives;
        }

        // Always restore one life on level up, up to the current max
        newState.lives = Math.min(prevState.lives + 1, newState.maxLives);
      } else {
        // Keep existing maxLives if no level up
        newState.maxLives = prevState.maxLives;
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

      const upperKey = key.toUpperCase();
      if (!ALPHABET.includes(upperKey)) return;

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

            // Update combo
            newState.combo = {
              count: prevState.combo.count + 1,
              multiplier: getComboMultiplier(prevState.combo.count + 1),
              lastCorrectTime: newState.time,
            };

            // Apply multiplier to score
            const baseScore = getLetterScore(upperKey);
            newState.score += Math.floor(baseScore * newState.combo.multiplier);

            newState.score += getLetterScore(upperKey);
            newState.speed = Math.min(
              GAME_CONFIG.MAX_SPEED,
              newState.speed * 1.01
            );
            newState.lastKeyCorrect = true;
          } else {
            playSFX("wrong");
            newState.score = Math.max(0, newState.score - 3);

            // Break combo on wrong key
            newState.combo = {
              count: 0,
              multiplier: 1,
              lastCorrectTime: 0,
            };
          }
        }

        // ===== WORD MODE =====
        else {
          if (newState.currentTypingWordId === null) {
            const wordIndex = newState.words.findIndex(
              (w) => w.typedProgress === 0 && w.word[0] === upperKey
            );

            if (wordIndex !== -1) {
              playSFX("correct");
              const updatedWords = [...newState.words];
              updatedWords[wordIndex] = {
                ...updatedWords[wordIndex],
                typedProgress: 1,
              };
              newState.words = updatedWords;
              newState.currentTypingWordId = updatedWords[wordIndex].id;
              newState.lastKeyCorrect = true;
            } else {
              playSFX("wrong");
              newState.score = Math.max(0, newState.score - 3);

              // Break combo
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
              const expectedLetter = currentWord.word[nextLetterIndex];

              if (upperKey === expectedLetter) {
                playSFX("correct");
                const updatedWords = [...newState.words];
                updatedWords[wordIndex] = {
                  ...updatedWords[wordIndex],
                  typedProgress: nextLetterIndex + 1,
                };

                if (nextLetterIndex + 1 === currentWord.word.length) {
                  updatedWords.splice(wordIndex, 1);
                  newState.lettersCorrect += currentWord.word.length;

                  // Update combo (count words, not letters)
                  newState.combo = {
                    count: prevState.combo.count + 1,
                    multiplier: getComboMultiplier(prevState.combo.count + 1),
                    lastCorrectTime: newState.time,
                  };

                  // Apply multiplier to score
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

                // Break combo
                newState.combo = {
                  count: 0,
                  multiplier: 1,
                  lastCorrectTime: 0,
                };
              }
            } else {
              newState.currentTypingWordId = null;

              const newWordIndex = newState.words.findIndex(
                (w) => w.typedProgress === 0 && w.word[0] === upperKey
              );

              if (newWordIndex !== -1) {
                playSFX("correct");
                const updatedWords = [...newState.words];
                updatedWords[newWordIndex] = {
                  ...updatedWords[newWordIndex],
                  typedProgress: 1,
                };
                newState.words = updatedWords;
                newState.currentTypingWordId = updatedWords[newWordIndex].id;
                newState.lastKeyCorrect = true;
              } else {
                playSFX("wrong");
                newState.score = Math.max(0, newState.score - 3);

                // Break combo
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
    prevLivesRef.current = 5;
    lastShieldSpawnTime.current = 0;
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

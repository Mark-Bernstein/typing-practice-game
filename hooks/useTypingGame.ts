import { useState, useEffect, useCallback, useRef } from "react";
import { GameState, GameDimensions, GameMode } from "../types/game";
import { GAME_CONFIG, ALPHABET } from "../constants/gameConfig";
import { SoundEffect } from "./useAudio";
import {
  generateRandomLetter,
  generateRandomWord,
  getLetterScore,
  getWordScore,
  getLevel,
} from "../utils/gameUtils";

export const useTypingGame = (
  playSFX: (effect: SoundEffect) => void,
  dimensions: GameDimensions,
  initialGameMode: GameMode = "letter" // ✅ Accept game mode
) => {
  const getInitialState = useCallback(
    (): GameState => ({
      letters: [],
      words: [], // ✅ Added
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
      dimensions,
      gameMode: initialGameMode, // ✅ Added
      currentTypingWordId: null, // ✅ Added
    }),
    [dimensions, initialGameMode]
  );

  const [gameState, setGameState] = useState<GameState>(getInitialState);
  const gameLoopRef = useRef<number | undefined>(undefined);
  const letterIdCounter = useRef(0);
  const wordIdCounter = useRef(0); // ✅ Added
  const prevLivesRef = useRef(5);

  useEffect(() => {
    setGameState((prev) => ({
      ...prev,
      dimensions,
    }));
  }, [dimensions]);

  const gameLoop = useCallback(() => {
    setGameState((prevState) => {
      if (prevState.gameOver) return prevState;

      const newState = { ...prevState };
      newState.time += 1;

      // Determine speed based on mode
      const effectiveSpeed =
        prevState.gameMode === "word"
          ? prevState.speed * GAME_CONFIG.WORD_SPEED_MULTIPLIER
          : prevState.speed;

      if (prevState.gameMode === "letter") {
        // ===== LETTER MODE LOGIC =====
        newState.letters = newState.letters.map((letter) => ({
          ...letter,
          y: letter.y + effectiveSpeed,
        }));

        const lettersReachedBottom = newState.letters.filter(
          (letter) =>
            letter.y + newState.dimensions.letterSize >=
            newState.dimensions.height
        );

        const remainingLetters = newState.letters.filter(
          (letter) =>
            letter.y + newState.dimensions.letterSize <
            newState.dimensions.height
        );

        const newLives = newState.lives - lettersReachedBottom.length;

        if (newLives < prevLivesRef.current) {
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
            4 - newState.letters.length
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
      } else {
        // ===== WORD MODE LOGIC =====
        newState.words = newState.words.map((word) => ({
          ...word,
          y: word.y + effectiveSpeed,
        }));

        const wordsReachedBottom = newState.words.filter(
          (word) =>
            word.y + newState.dimensions.letterSize >=
            newState.dimensions.height
        );

        const remainingWords = newState.words.filter(
          (word) =>
            word.y + newState.dimensions.letterSize < newState.dimensions.height
        );

        const newLives = newState.lives - wordsReachedBottom.length;

        if (newLives < prevLivesRef.current) {
          playSFX("life-lost");
          prevLivesRef.current = newLives;
          // Reset typing progress for any word that hit bottom
          if (newState.currentTypingWordId !== null) {
            const hitBottom = wordsReachedBottom.find(
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

        // Spawn new words
        if (
          newState.words.length === 0 ||
          (newState.time % 90 === 0 &&
            newState.words.length < GAME_CONFIG.MAX_WORDS)
        ) {
          const spawnCount = Math.min(
            Math.ceil(newState.level / 2),
            GAME_CONFIG.MAX_WORDS - newState.words.length
          );

          for (let i = 0; i < spawnCount; i++) {
            const newWord = generateRandomWord(
              newState.words,
              wordIdCounter.current++,
              newState.dimensions
            );
            newState.words = [...newState.words, newWord];
          }
        }
      }

      newState.level = getLevel(newState.lettersCorrect);
      return newState;
    });
  }, [playSFX]);

  const handleKeyPress = useCallback(
    (key: string) => {
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

        if (prevState.gameMode === "letter") {
          // ===== LETTER MODE KEY HANDLING =====
          const index = newState.letters.findIndex(
            (l) => l.letter === upperKey
          );
          if (index !== -1) {
            playSFX("correct");
            const updatedLetters = [...newState.letters];
            updatedLetters.splice(index, 1);
            newState.letters = updatedLetters;
            newState.lettersCorrect += 1;
            newState.score += getLetterScore(upperKey);
            newState.speed = Math.min(
              GAME_CONFIG.MAX_SPEED,
              newState.speed * 1.0075
            );
            newState.lastKeyCorrect = true;
          } else {
            playSFX("wrong");
            newState.score = Math.max(0, newState.score - 3);
            newState.lastKeyCorrect = false;
          }
        } else {
          // ===== WORD MODE KEY HANDLING =====
          // If not currently typing a word, find one that starts with this letter
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
              newState.lastKeyCorrect = false;
            }
          } else {
            // Continue typing the current word
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

                // Check if word is complete
                if (nextLetterIndex + 1 === currentWord.word.length) {
                  // Word completed!
                  updatedWords.splice(wordIndex, 1);
                  newState.lettersCorrect += currentWord.word.length;
                  newState.score += getWordScore(currentWord.word);
                  newState.speed = Math.min(
                    GAME_CONFIG.MAX_SPEED,
                    newState.speed * 1.005
                  );
                  newState.currentTypingWordId = null;
                  playSFX("level-up"); // Extra satisfaction for completing word
                }

                newState.words = updatedWords;
                newState.lastKeyCorrect = true;
              } else {
                playSFX("wrong");
                // Reset word progress on wrong key
                const updatedWords = [...newState.words];
                updatedWords[wordIndex] = {
                  ...updatedWords[wordIndex],
                  typedProgress: 0,
                };
                newState.words = updatedWords;
                newState.currentTypingWordId = null;
                newState.score = Math.max(0, newState.score - 5);
                newState.lastKeyCorrect = false;
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
    prevLivesRef.current = 5;
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

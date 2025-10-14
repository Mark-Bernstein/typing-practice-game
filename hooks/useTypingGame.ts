import { useState, useEffect, useCallback, useRef } from "react";
import { GameState } from "../types/game";
import { GAME_CONFIG, ALPHABET } from "../constants/gameConfig";
import {
  generateRandomLetter,
  getLetterScore,
  getLevel,
} from "../utils/gameUtils";

// Import will be used in component that uses this hook
let playSFXCallback: ((effect: string) => void) | null = null;

export const setSFXCallback = (callback: (effect: string) => void) => {
  playSFXCallback = callback;
};

const initialGameState: GameState = {
  letters: [],
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
};

export const useTypingGame = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const gameLoopRef = useRef<number | undefined>(undefined);
  const letterIdCounter = useRef(0);
  const prevLivesRef = useRef(5);

  const gameLoop = useCallback(() => {
    setGameState((prevState) => {
      if (prevState.gameOver) return prevState;

      const newState = { ...prevState };
      newState.time += 1;

      // Move letters down
      newState.letters = newState.letters.map((letter) => ({
        ...letter,
        y: letter.y + newState.speed,
      }));

      // Check for letters that reached the bottom
      const lettersReachedBottom = newState.letters.filter(
        (letter) =>
          letter.y + GAME_CONFIG.LETTER_SIZE >= GAME_CONFIG.SCREEN_HEIGHT
      );

      // Remove letters that reached the bottom
      const remainingLetters = newState.letters.filter(
        (letter) =>
          letter.y + GAME_CONFIG.LETTER_SIZE < GAME_CONFIG.SCREEN_HEIGHT
      );

      // Decrease lives for each letter that reached the bottom
      const newLives = newState.lives - lettersReachedBottom.length;

      // Play life lost sound if lives decreased
      if (newLives < prevLivesRef.current && playSFXCallback) {
        playSFXCallback("life-lost");
        prevLivesRef.current = newLives;
      }

      // Check for game over (no lives left)
      if (newLives <= 0) {
        if (playSFXCallback) {
          playSFXCallback("game-over");
        }
        return {
          ...newState,
          gameOver: true,
          lives: 0,
          letters: remainingLetters,
        };
      }

      // Update letters and lives
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
            letterIdCounter.current++
          );
          newState.letters = [...newState.letters, newLetter];
        }
      }

      newState.level = getLevel(newState.lettersCorrect);

      return newState;
    });
  }, []);

  const handleKeyPress = useCallback((key: string) => {
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

      const index = newState.letters.findIndex((l) => l.letter === upperKey);
      if (index !== -1) {
        if (playSFXCallback) {
          playSFXCallback("correct");
        }

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
        if (playSFXCallback) {
          playSFXCallback("wrong");
        }
        newState.score = Math.max(0, newState.score - 3);
        newState.lastKeyCorrect = false;
      }

      return newState;
    });
  }, []);

  const resetGame = useCallback(() => {
    setGameState(initialGameState);
    letterIdCounter.current = 0;
    prevLivesRef.current = 5;
  }, []);

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

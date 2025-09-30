import { useState, useEffect, useCallback, useRef } from "react";
import { GameState } from "../types/game";
import { GAME_CONFIG, ALPHABET } from "../constants/gameConfig";
import {
  generateRandomLetter,
  getLetterScore,
  getLevel,
} from "../utils/gameUtils";

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
};

export const useTypingGame = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const gameLoopRef = useRef<number | undefined>(undefined);
  const letterIdCounter = useRef(0);

  const gameLoop = useCallback(() => {
    setGameState((prevState) => {
      if (prevState.gameOver) return prevState;

      // eslint-disable-next-line prefer-const
      let newState = { ...prevState };
      newState.time += 1;

      // Move letters down
      newState.letters = newState.letters.map((letter) => ({
        ...letter,
        y: letter.y + newState.speed,
      }));

      // Check for game over
      if (
        newState.letters.some(
          (letter) =>
            letter.y + GAME_CONFIG.LETTER_SIZE >= GAME_CONFIG.SCREEN_HEIGHT
        )
      ) {
        return { ...newState, gameOver: true };
      }

      // Spawn new letters
      if (
        newState.letters.length === 0 ||
        (newState.time % 60 === 0 &&
          newState.letters.length < GAME_CONFIG.MAX_LETTERS)
      ) {
        const newLetter = generateRandomLetter(
          newState.letters,
          letterIdCounter.current++
        );
        newState.letters = [...newState.letters, newLetter];
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
        lastKeyCorrect: false, // default to false
      };

      const index = newState.letters.findIndex((l) => l.letter === upperKey);
      if (index !== -1) {
        // Correct key
        const updatedLetters = [...newState.letters];
        updatedLetters.splice(index, 1);
        newState.letters = updatedLetters;
        newState.lettersCorrect += 1;
        newState.score += getLetterScore(upperKey);
        newState.speed = Math.min(GAME_CONFIG.MAX_SPEED, newState.speed * 1.01);
        newState.lastKeyCorrect = true;
      }

      return newState;
    });
  }, []);

  const resetGame = useCallback(() => {
    setGameState(initialGameState);
    letterIdCounter.current = 0;
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

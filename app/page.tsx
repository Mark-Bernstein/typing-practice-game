"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";

// Types
interface LetterPosition {
  letter: string;
  x: number;
  y: number;
  color: string;
  id: number;
}

interface GameState {
  letters: LetterPosition[];
  time: number;
  lettersCorrect: number;
  score: number;
  speed: number;
  keysPressed: number;
  gameOver: boolean;
  level: number;
}

// Constants
const LETTER_SIZE = 30;
const SCREEN_WIDTH = 960;
const SCREEN_HEIGHT = 540;
const COUNTER_SIZE = 25;
const START_LETTER_SPEED = 2;
const FRAME_RATE = 60; // FPS
const MAX_LETTERS = 3;
const MAX_SPEED = 5;

const LETTER_COLORS = [
  "#ff0000",
  "#ffa500",
  "#ffff00",
  "#008000",
  "#ffc0cb",
  "#8a2be2",
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Home row letters worth 1 point, others worth 3
const HOME_ROW_LETTERS = new Set(["A", "S", "D", "F", "J", "K", "L"]);

const TypingGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    letters: [],
    time: 0,
    lettersCorrect: 0,
    score: 0,
    speed: START_LETTER_SPEED,
    keysPressed: 0,
    gameOver: false,
    level: 1,
  });

  const gameLoopRef = useRef<number>();
  const letterIdCounter = useRef(0);

  // Generate random letter that doesn't overlap with existing letters
  const generateRandomLetter = useCallback(
    (existingLetters: LetterPosition[]): LetterPosition => {
      const getRandomX = (): number => {
        const attempts = 50;
        for (let i = 0; i < attempts; i++) {
          const x = Math.random() * (SCREEN_WIDTH - LETTER_SIZE);
          const overlaps = existingLetters.some(
            (letter) =>
              Math.abs(letter.x - x) < LETTER_SIZE && letter.y < LETTER_SIZE
          );
          if (!overlaps) return x;
        }
        return Math.random() * (SCREEN_WIDTH - LETTER_SIZE);
      };

      const randomLetter =
        ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
      const randomColor =
        LETTER_COLORS[Math.floor(Math.random() * LETTER_COLORS.length)];

      return {
        letter: randomLetter,
        x: getRandomX(),
        y: 0,
        color: randomColor,
        id: letterIdCounter.current++,
      };
    },
    []
  );

  const getLetterScore = (letter: string): number => {
    return HOME_ROW_LETTERS.has(letter) ? 1 : 3;
  };

  const getLevelMessage = (lettersCorrect: number): string => {
    if (lettersCorrect >= 40) return "MAX LEVEL";
    if (lettersCorrect >= 30) return "level 4 AWWW YEAHHH";
    if (lettersCorrect >= 20) return "level 3 YEEEEE";
    if (lettersCorrect >= 10) return "level 2...";
    return "";
  };

  const getLevel = (lettersCorrect: number): number => {
    if (lettersCorrect >= 40) return 5;
    if (lettersCorrect >= 30) return 4;
    if (lettersCorrect >= 20) return 3;
    if (lettersCorrect >= 10) return 2;
    return 1;
  };

  // Game loop
  const gameLoop = useCallback(() => {
    setGameState((prevState) => {
      if (prevState.gameOver) return prevState;

      let newState = { ...prevState };
      newState.time += 1;

      // Move letters down
      newState.letters = newState.letters.map((letter) => ({
        ...letter,
        y: letter.y + newState.speed,
      }));

      // Check for game over (letter reached bottom)
      const gameOver = newState.letters.some(
        (letter) => letter.y + LETTER_SIZE >= SCREEN_HEIGHT
      );

      if (gameOver) {
        newState.gameOver = true;
        return newState;
      }

      // Add new letters periodically
      if (
        newState.letters.length === 0 ||
        (newState.time % 60 === 0 && newState.letters.length < MAX_LETTERS)
      ) {
        const newLetter = generateRandomLetter(newState.letters);
        newState.letters.push(newLetter);
      }

      newState.level = getLevel(newState.lettersCorrect);

      return newState;
    });
  }, [generateRandomLetter]);

  // Handle key press
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    const key = event.key.toUpperCase();

    if (!ALPHABET.includes(key)) return;

    setGameState((prevState) => {
      if (prevState.gameOver) return prevState;

      const newState = { ...prevState };
      newState.keysPressed += 1;

      // Find matching letter
      const matchingLetterIndex = newState.letters.findIndex(
        (letter) => letter.letter === key
      );

      if (matchingLetterIndex !== -1) {
        // Correct key pressed
        const matchedLetter = newState.letters[matchingLetterIndex];
        newState.letters.splice(matchingLetterIndex, 1);
        newState.lettersCorrect += 1;
        newState.score += getLetterScore(key);
        newState.speed = Math.min(MAX_SPEED, newState.speed * 1.01);
      } else {
        // Wrong key pressed
        newState.speed *= 0.95;
      }

      return newState;
    });
  }, []);

  const resetGame = () => {
    setGameState({
      letters: [],
      time: 0,
      lettersCorrect: 0,
      score: 0,
      speed: START_LETTER_SPEED,
      keysPressed: 0,
      gameOver: false,
      level: 1,
    });
    letterIdCounter.current = 0;
  };

  // Game loop effect
  useEffect(() => {
    if (!gameState.gameOver) {
      gameLoopRef.current = setInterval(gameLoop, 1000 / FRAME_RATE);
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameLoop, gameState.gameOver]);

  // Keyboard event listener
  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  const timeInSeconds = Math.floor(gameState.time / FRAME_RATE);
  const successPercentage =
    gameState.keysPressed === 0
      ? 0
      : Math.round((gameState.lettersCorrect / gameState.keysPressed) * 100);

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-blue-400 to-blue-600 overflow-hidden">
      {/* Game Area */}
      <div
        className="relative w-full h-full"
        style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT, margin: "0 auto" }}
      >
        {/* UI Elements */}
        <div
          className="absolute top-4 left-4 text-gray-800 font-bold"
          style={{ fontSize: COUNTER_SIZE }}
        >
          {timeInSeconds}s
        </div>
        <div
          className="absolute top-4 right-4 text-gray-800 font-bold"
          style={{ fontSize: COUNTER_SIZE }}
        >
          Correct: {gameState.lettersCorrect}
        </div>
        <div
          className="absolute top-4 left-1/2 transform -translate-x-1/2 text-gray-800 font-bold"
          style={{ fontSize: COUNTER_SIZE }}
        >
          Score: {gameState.score}
        </div>

        {/* Level Message */}
        {getLevelMessage(gameState.lettersCorrect) && (
          <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 text-cyan-300 font-bold text-5xl animate-pulse">
            {getLevelMessage(gameState.lettersCorrect)}
          </div>
        )}

        {/* Falling Letters */}
        {gameState.letters.map((letter) => (
          <div
            key={letter.id}
            className="absolute font-bold select-none"
            style={{
              left: letter.x,
              top: letter.y,
              fontSize: LETTER_SIZE,
              color: letter.color,
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            {letter.letter}
          </div>
        ))}

        {/* Game Over Screen */}
        {gameState.gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-cyan-200 bg-opacity-90 p-8 rounded-lg text-center">
              <h1 className="text-6xl text-red-600 font-bold mb-6">
                GAME OVER
              </h1>
              <div
                className="space-y-2 text-black"
                style={{ fontSize: COUNTER_SIZE }}
              >
                <p>Time played: {timeInSeconds} seconds</p>
                <p>Score: {gameState.score}</p>
                <p>Correct letters typed: {gameState.lettersCorrect}</p>
                <p>Keys pressed: {gameState.keysPressed}</p>
                <p>Success Percentage: {successPercentage}%</p>
              </div>
              <button
                onClick={resetGame}
                className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-bold"
              >
                Play Again
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        {gameState.time < 180 && !gameState.gameOver && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center">
            <p className="text-lg font-semibold">Type the falling letters!</p>
            <p className="text-sm">
              Home row letters (A,S,D,F,J,K,L) = 1 point • Others = 3 points
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TypingGame;

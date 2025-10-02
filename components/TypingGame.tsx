"use client";

import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { useTypingGame } from "../hooks/useTypingGame";
import { calculateGameStats, getLevelMessage } from "../utils/gameUtils";
import { LEVEL_THRESHOLDS } from "../constants/gameConfig";
import { GameArea } from "./game/GameArea";
import { GameOver } from "./ui/GameOver";
import { Instructions } from "./ui/Instructions";
import { GameStats } from "./ui/GameStats";

const pulse = keyframes`
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.2); }
`;

const gridMove = keyframes`
  0% { transform: translate3d(0, 0, 0); }
  100% { transform: translate3d(50px, 50px, 0); }
`;

const GameWrapper = styled.div<{ level: number }>`
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  transition: all 0.5s ease;

  ${({ level }) => {
    const gradients: Record<number, string> = {
      1: "linear-gradient(to bottom right, #312e81, #581c87, #9d174d)",
      2: "linear-gradient(to bottom right, #581c87, #1e3a8a, #3730a3)",
      3: "linear-gradient(to bottom right, #1e3a8a, #164e63, #115e59)",
      4: "linear-gradient(to bottom right, #164e63, #065f46, #166534)",
      5: "linear-gradient(to bottom right, #7c2d12, #991b1b, #9d174d)",
    };
    const clampedLevel = Math.min(Math.max(level, 1), 5);
    return `background: ${gradients[clampedLevel]};`;
  }}
`;

const ParticleDot = styled.div<{ left: number; top: number; delay: number }>`
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: white;
  opacity: 0.3;
  left: ${({ left }) => `${left}%`};
  top: ${({ top }) => `${top}%`};
  animation-name: ${pulse};
  animation-iteration-count: infinite;
  animation-timing-function: linear;
  animation-delay: ${({ delay }) => `${delay}s`};
`;

const ParticleLayer = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
`;

const GridBackground = styled.div`
  position: absolute;
  inset: 0;
  opacity: 0.05;
  background-image: linear-gradient(
      rgba(255, 255, 255, 0.1) 1px,
      transparent 1px
    ),
    linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: ${gridMove} 20s linear infinite;
`;

const GlowingOrb = styled.div<{
  size: number;
  color: string;
  top?: string;
  left?: string;
  bottom?: string;
  right?: string;
  delay?: string;
}>`
  position: absolute;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-radius: 50%;
  background: ${({ color }) => color};
  opacity: 0.2;
  filter: blur(40px);
  animation: ${pulse} 4s infinite;
  top: ${({ top }) => top || "auto"};
  left: ${({ left }) => left || "auto"};
  bottom: ${({ bottom }) => bottom || "auto"};
  right: ${({ right }) => right || "auto"};
  animation-delay: ${({ delay }) => delay || "0s"};
`;

// GameContainer: keeps layout flow but centers the canvas
const GameContainer = styled.div`
  position: relative;
  z-index: 10;
  width: 100%;
  min-height: 100vh; /* IMPORTANT: fill viewport if parent has no fixed height */
  display: flex;
  justify-content: center; /* center horizontally */
  align-items: center; /* center vertically */
  backdrop-filter: blur(4px);
`;

const LevelIndicator = styled.div`
  position: absolute;
  top: 0.5vh;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 24px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  z-index: 1000;

  span {
    color: white;
    font-weight: bold;
    font-size: 18px;
  }
`;

const ProgressWrapper = styled.div`
  position: absolute;
  bottom: 3%;
  left: 50%;
  transform: translateX(-50%);
  width: 500px;
  height: 100px;
  z-index: 1000;
`;

const ProgressBar = styled.div<{ progress: number }>`
  height: 50px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  overflow: hidden;

  div {
    height: 100%;
    width: ${({ progress }) => `${progress}%`};
    background: linear-gradient(to right, #22d3ee, #a855f7);
    border-radius: 16px;
    transition: width 0.5s ease;
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
  }
`;

const ProgressText = styled.div`
  text-align: center;
  color: cyan;
  font-size: 16px;
  margin-top: 4px;
  z-index: 1000;
`;

const StartScreen = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start; /* push content toward the top */
  align-items: center;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  z-index: 1000;
  text-align: center;
  padding: 16px;
  padding-top: 50px;

  h1 {
    font-size: 48px;
    margin-bottom: 100px;
  }
`;

const LevelMessage = styled.div`
  position: absolute;
  top: 50vh;
  left: 50%;
  transform: translateX(-50%);
  color: #22d3ee;
  font-size: 24px;
  font-weight: bold;
  text-shadow: 0 0 8px rgba(34, 211, 238, 0.7);
  z-index: 1000;
  opacity: 0;
  animation: fadeInOut 3s ease-in-out forwards;

  @keyframes fadeInOut {
    0% {
      opacity: 0;
      transform: translateX(-50%) scale(0.9);
    }
    10% {
      opacity: 1;
      transform: translateX(-50%) scale(1);
    }
    80% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
`;

const fadeInFromTop = keyframes`
  0% {
    transform: translateY(-1000px);
    opacity: 0;
  }
  25% {
    opacity: 0.1;
  }
  50% {
    opacity: 0.2;
  }
  75% {
    opacity: 0.5;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
`;

const StartButton = styled.button`
  position: absolute;
  top: 740px;
  padding: 100px 15px;
  font-size: 48px;
  font-weight: bold;
  color: #000000;
  letter-spacing: 3px;
  border-radius: 50%;
  cursor: pointer;
  background: linear-gradient(135deg, #91ff00, #8400ff, #ff0000);
  background-size: 100% 150%;
  z-index: 1;
  overflow: visible;
  box-shadow: 0 0 30px rgba(147, 51, 234, 0.9), 0 0 60px rgba(34, 211, 238, 0.8);
  transition: all 0.5s ease;
  animation: ${fadeInFromTop} 2s ease-in-out forwards;

  &:hover {
    color: #ffffff;
    letter-spacing: 15px;
    transform: scale(1.1);
    text-shadow: 5px 5px 10px #22d3ee, 0 0 20px #a855f7, 0 0 30px #ec4899;
    background: cyan;
  }

  /* Cosmic glowing orbs */
  &::after,
  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 800%;
    height: 100%;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    filter: blur(250px);
    z-index: -1;
    pointer-events: none;
  }

  &::after {
    background: radial-gradient(
      circle,
      rgba(147, 51, 234, 0.6) 65%,
      rgba(34, 211, 238, 0.5) 70%,
      rgba(236, 72, 153, 0.3) 75%,
      transparent 100%
    );
    animation: orbPulse 5s ease-in-out infinite;
  }

  &::before {
    background: radial-gradient(
      circle,
      rgba(250, 204, 21, 0.8) 0%,
      rgba(236, 72, 153, 0.8) 70%,
      rgba(0, 221, 255, 0.8) 100%,
      transparent 100%
    );
    animation: orbRotate 8s linear infinite;
  }

  /* Shooting star streaks */
  & > span {
    position: absolute;
    width: 2px;
    height: 40px;
    background: linear-gradient(transparent, #866bff);
    top: -10px;
    left: 50%;
    opacity: 0.8;
    animation: shootingStar 3s linear infinite;
    pointer-events: none;
  }

  @keyframes cosmicShift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.15);
    }
  }

  @keyframes orbPulse {
    0%,
    100% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }
    50% {
      transform: translate(-50%, -50%) scale(0.5);
      opacity: 0.5;
    }
  }

  @keyframes orbRotate {
    0% {
      transform: translate(-50%, -50%) rotate(0deg);
    }
    100% {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }

  @keyframes shootingStar {
    0% {
      transform: translateX(0) translateY(0) rotate(45deg);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    50% {
      transform: translateX(200px) translateY(-200px) rotate(45deg);
      opacity: 0.8;
    }
    100% {
      transform: translateX(400px) translateY(-400px) rotate(45deg);
      opacity: 0;
    }
  }
`;

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

interface ParticleProps {
  index: number;
  delay: number;
  lettersCorrect: number;
}

const Particle: React.FC<ParticleProps> = React.memo(
  ({ index, delay }) => {
    const left = +(seededRandom(index * 2) * 100).toFixed(3);
    const top = +(seededRandom(index * 3) * 100).toFixed(3);

    return <ParticleDot left={left} top={top} delay={delay} />;
  },
  (prevProps, nextProps) =>
    prevProps.lettersCorrect === nextProps.lettersCorrect &&
    prevProps.index === nextProps.index &&
    prevProps.delay === nextProps.delay
);

Particle.displayName = "Particle";

/**
 * Child component that actually mounts the game hook.
 * It's mounted only after the user clicks PLAY.
 */
const GamePlay: React.FC<{
  onExit: () => void;
  onLevelChange?: (level: number) => void;
}> = ({ onExit, onLevelChange }) => {
  const { gameState, resetGame } = useTypingGame();
  const [particles] = useState(() => Array.from({ length: 50 }, (_, i) => i));
  const [levelMessage, setLevelMessage] = useState(getLevelMessage(0));

  const gameStats = calculateGameStats(
    gameState.time,
    gameState.lettersCorrect,
    gameState.keysPressed
  );

  // Progress relative to current level
  const getProgress = () => {
    const currentLevel = Math.min(gameState.level, 5); // Cap at level 5
    const thresholds = [
      0,
      LEVEL_THRESHOLDS.LEVEL_2,
      LEVEL_THRESHOLDS.LEVEL_3,
      LEVEL_THRESHOLDS.LEVEL_4,
      LEVEL_THRESHOLDS.MAX_LEVEL,
    ];

    if (currentLevel >= 5) return 100;

    const minThreshold = thresholds[currentLevel - 1];
    const maxThreshold = thresholds[currentLevel];

    const progress =
      ((gameState.lettersCorrect - minThreshold) /
        (maxThreshold - minThreshold)) *
      100;

    return Math.min(100, Math.max(0, progress));
  };

  useEffect(() => {
    const newMessage = getLevelMessage(gameState.lettersCorrect);
    setLevelMessage(newMessage);

    onLevelChange?.(gameState.level);
  }, [gameState.lettersCorrect, gameState.level, onLevelChange]);

  return (
    <>
      <ParticleLayer>
        {particles.map((i) => (
          <Particle
            key={i}
            index={i}
            delay={i * 0.1}
            lettersCorrect={gameState.lettersCorrect}
          />
        ))}
      </ParticleLayer>

      <GridBackground />
      <GlowingOrb size={128} color="#06b6d4" top="40px" left="40px" />
      <GlowingOrb
        size={96}
        color="#9333ea"
        bottom="40px"
        right="40px"
        delay="1s"
      />
      <GlowingOrb size={64} color="#ec4899" top="50%" left="25%" delay="2s" />

      <GameContainer>
        <GameStats
          time={gameState.time}
          lettersCorrect={gameState.lettersCorrect}
          score={gameState.score}
          speed={gameState.speed}
        />

        <GameArea gameState={gameState} />
      </GameContainer>

      {gameState.gameOver && (
        <GameOver
          gameStats={gameStats}
          score={gameState.score}
          lettersCorrect={gameState.lettersCorrect}
          keysPressed={gameState.keysPressed}
          onRestart={() => {
            resetGame();
            onExit();
          }}
        />
      )}

      <Instructions show={gameState.gameOver} />

      {!gameState.gameOver && (
        <>
          <LevelIndicator>
            <span>Level {gameState.level}</span>
          </LevelIndicator>

          {levelMessage && (
            <LevelMessage key={levelMessage}>{levelMessage}</LevelMessage>
          )}
          <ProgressWrapper>
            <ProgressBar progress={getProgress()}>
              <div />
            </ProgressBar>
            <ProgressText>Progress to next level</ProgressText>
          </ProgressWrapper>
        </>
      )}
    </>
  );
};

// TypingGame with dynamic level
export const TypingGame: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);

  return (
    <GameWrapper level={currentLevel}>
      {!hasStarted && (
        <StartScreen>
          <h1>Typing Challenge</h1>
          <Instructions show={!hasStarted} />
          <StartButton onClick={() => setHasStarted(true)}>START</StartButton>
        </StartScreen>
      )}

      {hasStarted && (
        <GamePlay
          onExit={() => setHasStarted(false)}
          onLevelChange={(level) => setCurrentLevel(level)}
        />
      )}
    </GameWrapper>
  );
};

"use client";

import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { useTypingGame } from "../hooks/useTypingGame";
import { calculateGameStats } from "../utils/gameUtils";
import { LEVEL_THRESHOLDS } from "../constants/gameConfig";
import { GameArea } from "./game/GameArea";
import { GameOver } from "./ui/GameOver";
import { Instructions } from "./ui/Instructions";

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
  width: 100%;
  height: 100vh;
  overflow: hidden;
  transition: all 2s ease;

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

const ParticleDot = styled.div<{
  left: number;
  top: number;
  delay: number;
}>`
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

const GameContainer = styled.div`
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(4px);
`;

const LevelIndicator = styled.div`
  position: absolute;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 24px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);

  span {
    color: white;
    font-weight: bold;
    font-size: 18px;
  }
`;

const ProgressWrapper = styled.div`
  position: absolute;
  bottom: 13%;
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
  (prevProps: ParticleProps, nextProps: ParticleProps) =>
    prevProps.lettersCorrect === nextProps.lettersCorrect &&
    prevProps.index === nextProps.index &&
    prevProps.delay === nextProps.delay
);

Particle.displayName = "Particle";

Particle.displayName = "Particle";

export const TypingGame: React.FC = () => {
  const { gameState, resetGame } = useTypingGame();
  const [particles] = useState(() => Array.from({ length: 50 }, (_, i) => i));
  const [hasStarted, setHasStarted] = useState(false);

  const gameStats = calculateGameStats(
    gameState.time,
    gameState.lettersCorrect,
    gameState.keysPressed
  );

  const showInstructions = !hasStarted;

  useEffect(() => {
    if (!hasStarted && gameState.keysPressed > 0) {
      setHasStarted(true);
    }
  }, [gameState.keysPressed, hasStarted]);

  // Progress relative to current level thresholds
  const getProgress = () => {
    const currentLevel = gameState.level;
    let minThreshold = 0;
    let maxThreshold = LEVEL_THRESHOLDS.LEVEL_2;
    if (currentLevel === 2) maxThreshold = LEVEL_THRESHOLDS.LEVEL_3;
    if (currentLevel === 3) maxThreshold = LEVEL_THRESHOLDS.LEVEL_4;
    if (currentLevel === 4) maxThreshold = LEVEL_THRESHOLDS.MAX_LEVEL;
    if (currentLevel >= 5) return 100;

    const progress =
      ((gameState.lettersCorrect - minThreshold) /
        (maxThreshold - minThreshold)) *
      100;
    return Math.min(100, Math.max(0, progress));
  };

  return (
    <GameWrapper level={gameState.level}>
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
        <GameArea gameState={gameState} />
      </GameContainer>

      {gameState.gameOver && (
        <GameOver
          gameStats={gameStats}
          score={gameState.score}
          lettersCorrect={gameState.lettersCorrect}
          keysPressed={gameState.keysPressed}
          onRestart={resetGame}
        />
      )}

      <Instructions show={showInstructions} />

      {!gameState.gameOver && (
        <>
          <LevelIndicator>
            <span>Level {gameState.level}</span>
          </LevelIndicator>

          <ProgressWrapper>
            <ProgressBar progress={getProgress()}>
              <div />
            </ProgressBar>
            <ProgressText>Progress to next level</ProgressText>
          </ProgressWrapper>
        </>
      )}
    </GameWrapper>
  );
};

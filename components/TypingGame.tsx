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
import { Leaderboard } from "./ui/Leaderboard";
import { AudioControls } from "./ui/AudioControls";
import { useAudioContext } from "../app/contexts/AudioContext";
import { useGameDimensions } from "@/hooks/useGameDimensions";
import { GameMode } from "../types/game";
import { motion } from "framer-motion";

const pulse = keyframes`
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.2); }
`;

const gridMove = keyframes`
  0% { transform: translate3d(0, 0, 0); }
  100% { transform: translate3d(50px, 50px, 0); }
`;

const GameWrapper = styled.div<{ $level: number }>`
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  transition: all 0.5s ease;

  ${({ $level }) => {
    const gradients: Record<number, string> = {
      1: "linear-gradient(to bottom right, #312e81, #581c87, #9d174d)", // deep violet
      2: "linear-gradient(to bottom right, #581c87, #1e3a8a, #3730a3)", // indigo blend
      3: "linear-gradient(to bottom right, #1e3a8a, #164e63, #115e59)", // blue-green oceanic
      4: "linear-gradient(to bottom right, #164e63, #065f46, #166534)", // emerald depth
      5: "linear-gradient(to bottom right, #7c2d12, #991b1b, #9d174d)", // crimson energy
      6: "linear-gradient(to bottom right, #9d174d, #b91c1c, #c2410c)", // fiery red-orange
      7: "linear-gradient(to bottom right, #c2410c, #ca8a04, #a16207)", // molten gold
      8: "linear-gradient(to bottom right, #a16207, #3f6212, #15803d)", // forest vitality
      9: "linear-gradient(to bottom right, #15803d, #065f46, #0e7490)", // deep aqua-teal
      10: "linear-gradient(to bottom right, #0e7490, #2563eb, #7e22ce)", // radiant blue-violet finale
    };
    const clampedLevel = Math.min(Math.max($level, 1), 10);
    return `background: ${gradients[clampedLevel]};`;
  }}
`;

const ParticleDot = styled.div<{ $left: number; $top: number; $delay: number }>`
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: white;
  opacity: 0.3;
  left: ${({ $left }) => `${$left}%`};
  top: ${({ $top }) => `${$top}%`};
  animation-name: ${pulse};
  animation-iteration-count: infinite;
  animation-timing-function: linear;
  animation-delay: ${({ $delay }) => `${$delay}s`};
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
  $size: number;
  $color: string;
  $top?: string;
  $left?: string;
  $bottom?: string;
  $right?: string;
  $delay?: string;
}>`
  position: absolute;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  opacity: 0.2;
  filter: blur(30px);
  animation: ${pulse} 4s infinite;
  top: ${({ $top }) => $top || "auto"};
  left: ${({ $left }) => $left || "auto"};
  bottom: ${({ $bottom }) => $bottom || "auto"};
  right: ${({ $right }) => $right || "auto"};
  animation-delay: ${({ $delay }) => $delay || "0s"};
`;

const GameContainer = styled.div`
  position: relative;
  z-index: 10;
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
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
  bottom: 2.5%;
  left: 50%;
  transform: translateX(-50%);
  width: 500px;
  height: 100px;
  z-index: 1000;
`;

const ProgressBar = styled.div<{ $progress: number }>`
  height: 50px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  overflow: hidden;

  div {
    height: 100%;
    width: ${({ $progress }) => `${$progress}%`};
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
  justify-content: flex-start;
  align-items: center;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  z-index: 1000;
  text-align: center;
  padding: 16px;
  padding-top: 50px;
`;

const TitleMainMenu = styled.span`
  font-size: 40px;
  font-weight: bold;
  margin-bottom: 100px;
  text-shadow: 0 0 20px cyan;
  display: inline-block;
  opacity: 0;
  transform: scale(0.8);
  animation: titleReveal 4s ease-in-out forwards;

  @keyframes titleReveal {
    0% {
      opacity: 0;
      transform: scale(0.1) rotate(-2deg);
      text-shadow: 0 0 5px cyan, 0 0 10px #00ffff;
      letter-spacing: -2px;
    }
    40% {
      opacity: 0.6;
      transform: scale(2) rotate(1deg);
      text-shadow: 0 0 15px cyan, 0 0 25px #00ffff;
      letter-spacing: 2px;
    }
    70% {
      opacity: 1;
      transform: scale(2) rotate(0deg);
      text-shadow: 0 0 25px #00ffff, 0 0 40px #00e5ff;
      letter-spacing: 1px;
    }
    100% {
      opacity: 1;
      transform: scale(1.5);
      text-shadow: 0 0 20px cyan, 0 0 40px #00e5ff, 0 0 60px #d400ff;
      letter-spacing: normal;
    }
  }

  @media (max-width: 1440px) {
    font-size: 36px;
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
  font-family: "Orbitron", sans-serif;
  top: 710px;
  padding: 100px 25px;
  font-size: 48px;
  font-weight: bold;
  color: #000;
  letter-spacing: 3px;
  border-radius: 50%;
  cursor: pointer;
  background: linear-gradient(135deg, #000000, #8400ff, #ff0000);
  background-size: 100% 150%;
  z-index: 1;
  overflow: visible;
  box-shadow: 0 0 30px rgba(147, 51, 234, 0.9), 0 0 60px rgba(34, 211, 238, 0.8);
  transition: all 0.4s ease;
  animation: ${fadeInFromTop} 2s ease-in-out forwards,
    moveUp 2s ease-in-out 2s forwards;
  transform-style: preserve-3d;
  perspective: 800px;

  &:hover {
    color: #fff;
    letter-spacing: 10px;
    box-shadow: 0 15px 30px rgba(147, 51, 234, 1),
      0 0 40px rgba(34, 211, 238, 0.9), inset 0 0 25px rgba(236, 72, 153, 0.6);
    text-shadow: 0 0 20px #22d3ee, 0 0 40px #a855f7, 0 0 60px #ec4899;
    background: linear-gradient(135deg, #8400ff, #ff0000, #22d3ee);
    padding: 100px 8px;
  }

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

  @keyframes moveUp {
    from {
      top: 710px;
    }
    to {
      top: 450px;
    }
  }
`;

const TotalPlaysDisplay = styled.div`
  position: absolute;
  font-size: 28px;
  left: 40px;
  top: 40px;
  width: 420px;
  max-height: 70vh;
  background: #000000;
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  animation: slideInRight 2s ease-in-out;

  @keyframes slideInRight {
    0% {
      transform: translateX(500px);
      opacity: 0;
    }
    60% {
      transform: translateX(-20px);
      opacity: 1;
    }
    80% {
      transform: translateX(10px);
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @media screen and (max-width: 1440px) {
    font-size: 20px;
    width: 300px;
    left: 16px;
    top: 30px;
    padding: 16px;
    border-radius: 16px;
    box-shadow: 0 6px 30px rgba(0, 0, 0, 0.4);
  }
`;

const HighlightedNumberOfPlays = styled.div`
  font-size: 32px;
  color: cyan;
  background-color: rgba(0, 4, 255, 0.3);
  border-radius: 10px;
  margin-top: 20px;
`;

export const ModeSelector = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      style={{
        display: "flex",
        gap: "30px",
        justifyContent: "center",
        marginBottom: "80px",
        zIndex: 1001,
      }}
      initial={{ opacity: 0, scale: 0.1, rotate: -45 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 15,
        mass: 1,
        delay: 3,
      }}
    >
      {children}
    </motion.div>
  );
};

const ModeButton = styled.button<{ $active: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 18px 12px;
  width: 300px;
  border-radius: 24px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  cursor: pointer;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(20px);
  transition: all 0.5s ease;
  box-shadow: ${(props) =>
    props.$active
      ? "0 0 30px rgba(34,211,238,0.7), 0 0 60px rgba(147,51,234,0.5)"
      : "0 0 10px rgba(255,255,255,0.1)"};

  &:hover {
    transform: translateY(-8px) scale(1.05);
    box-shadow: 0 0 40px rgba(0, 255, 247, 0.8),
      0 0 80px rgba(147, 51, 234, 0.6), 0 0 120px rgba(236, 72, 153, 0.4);
  }

  &::before {
    content: "";
    position: absolute;
    inset: -2px;
    border-radius: 26px;
    background: linear-gradient(60deg, #22d3ee, #9333ea, #800000, #22d3ee);
    background-size: 400% 400%;
    opacity: ${(props) => (props.$active ? 1 : 0)};
    animation: ${(props) =>
      props.$active ? "gradientShift 5s ease infinite" : "none"};
    z-index: 0;
    pointer-events: none;
  }

  /* ⚡ Energy Line */
  &::after {
    content: "";
    position: absolute;
    width: 100%;
    height: 18px;
    bottom: 0;
    background: linear-gradient(180deg, #00fff2, #9000f0, #ff0000);
    background-size: 200% 200%;
    opacity: ${(props) => (props.$active ? 1 : 0)};
    filter: blur(4px);
    animation: ${(props) =>
      props.$active
        ? "energyFlow 1s linear infinite, flicker 3s ease-in-out infinite"
        : "none"};
    pointer-events: none;
    z-index: 0;
  }

  /* 💥 Glowing Pulse Ring */
  &::before,
  &::after {
    transition: opacity 0.5s ease;
  }

  ${(props) =>
    props.$active &&
    `
    &::before {
      box-shadow: 0 0 30px rgba(34,211,238,0.7),
                  0 0 60px rgba(147,51,234,0.5),
                  inset 0 0 15px rgba(34,211,238,0.5);
    }
  `}

  @keyframes gradientShift {
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

  @keyframes energyFlow {
    0% {
      background-position: 0% 0%;
    }
    50% {
      background-position: 100% 100%;
    }
    100% {
      background-position: 0% 0%;
    }
  }

  @keyframes flicker {
    0%,
    19%,
    21%,
    23%,
    25%,
    54%,
    56%,
    100% {
      opacity: 1;
    }
    20%,
    24%,
    55% {
      opacity: 0.4;
    }
  }

  & > * {
    position: relative;
    z-index: 1;
  }
`;

const ModeIcon = styled.div`
  font-size: 60px;
  margin-top: 8px;
  border-radius: 50px;
  box-shadow: 0 0 20px #a200ff, 0 0 24px #9333ea, 0 0 36px #ec4899;
`;

const ModeLabel = styled.div`
  font-family: "Orbitron", sans-serif;
  color: #00fff7;
  font-size: 28px;
  font-weight: 900;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-shadow: 0 0 10px #00fff7, 0 0 20px #9333ea, 0 0 30px #ec4899;
`;

const ModeDescription = styled.div`
  font-family: "SF Mono", monospace;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 18px;
  text-align: center;
  line-height: 1.4;
  text-shadow: 0 0 6px rgba(0, 255, 247, 0.4), 0 0 12px rgba(147, 51, 234, 0.3);
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

    return <ParticleDot $left={left} $top={top} $delay={delay} />;
  },
  (prevProps, nextProps) =>
    prevProps.lettersCorrect === nextProps.lettersCorrect &&
    prevProps.index === nextProps.index &&
    prevProps.delay === nextProps.delay
);

Particle.displayName = "Particle";

const GamePlay: React.FC<{
  onExit: () => void;
  onLevelChange?: (level: number) => void;
  gameMode: GameMode;
}> = ({ onExit, onLevelChange, gameMode }) => {
  const dimensions = useGameDimensions();
  const { playSFX } = useAudioContext();
  const { gameState, resetGame } = useTypingGame(playSFX, dimensions, gameMode);

  const [particles] = useState(() => Array.from({ length: 50 }, (_, i) => i));
  const [levelMessage, setLevelMessage] = useState(getLevelMessage(0));
  const prevLevelRef = React.useRef(gameState.level);

  const gameStats = calculateGameStats(
    gameState.time,
    gameState.lettersCorrect,
    gameState.keysPressed
  );

  const getProgress = () => {
    const currentLevel = Math.min(gameState.level, 10);
    const thresholds = [
      0,
      LEVEL_THRESHOLDS.LEVEL_2,
      LEVEL_THRESHOLDS.LEVEL_3,
      LEVEL_THRESHOLDS.LEVEL_4,
      LEVEL_THRESHOLDS.LEVEL_5,
      LEVEL_THRESHOLDS.LEVEL_6,
      LEVEL_THRESHOLDS.LEVEL_7,
      LEVEL_THRESHOLDS.LEVEL_8,
      LEVEL_THRESHOLDS.LEVEL_9,
      LEVEL_THRESHOLDS.MAX_LEVEL,
    ];

    if (currentLevel >= 10) return 100;

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

    if (gameState.level > prevLevelRef.current) {
      playSFX("level-up");
    }
    prevLevelRef.current = gameState.level;

    onLevelChange?.(gameState.level);
  }, [gameState.lettersCorrect, gameState.level, onLevelChange, playSFX]);

  const onTryAgain = () => {
    resetGame();
  };

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
      <GlowingOrb $size={128} $color="#06b6d4" $top="40px" $left="40px" />
      <GlowingOrb
        $size={96}
        $color="#9333ea"
        $bottom="40px"
        $right="40px"
        $delay="1s"
      />
      <GlowingOrb
        $size={64}
        $color="#ec4899"
        $top="50%"
        $left="25%"
        $delay="2s"
      />

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
          onTryAgain={onTryAgain}
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
            <ProgressBar $progress={getProgress()}>
              <div />
            </ProgressBar>
            <ProgressText>Progress to next level</ProgressText>
          </ProgressWrapper>
        </>
      )}
    </>
  );
};

export const TypingGame: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [totalPlays, setTotalPlays] = useState<number | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>("letter");

  const {
    playMusic,
    stopMusic,
    toggleMusic,
    musicEnabled,
    sfxEnabled,
    toggleSFX,
    playSFX,
  } = useAudioContext();

  useEffect(() => {
    fetchTotalPlays();
  }, []);

  useEffect(() => {
    if (musicEnabled) {
      if (hasStarted) {
        playMusic("gameplay");
      } else {
        playMusic("menu");
      }
    } else stopMusic();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [musicEnabled, hasStarted]);

  const handleStart = () => {
    incrementTotalPlays();
    stopMusic();
    playMusic("gameplay");
    playSFX("start");
    setHasStarted(true);
  };

  const fetchTotalPlays = async () => {
    try {
      const res = await fetch("/api/play-count");
      const data = await res.json();
      setTotalPlays(data.totalPlays);
    } catch (err) {
      console.error("Failed to fetch total plays:", err);
    }
  };

  const incrementTotalPlays = async () => {
    try {
      await fetch("/api/game-played", { method: "POST" });
      await fetchTotalPlays();
    } catch (err) {
      console.error("Failed to increment total plays:", err);
    }
  };

  return (
    <GameWrapper $level={currentLevel}>
      <AudioControls
        musicEnabled={musicEnabled}
        sfxEnabled={sfxEnabled}
        onToggleMusic={toggleMusic}
        onToggleSFX={toggleSFX}
      />

      {!hasStarted && (
        <StartScreen>
          <TitleMainMenu>Typing Challenge</TitleMainMenu>

          <ModeSelector>
            <ModeButton
              $active={gameMode === "letter"}
              onClick={() => setGameMode("letter")}
            >
              <ModeIcon>⚡</ModeIcon>
              <ModeLabel>Letter Mode</ModeLabel>
              <ModeDescription>Type individual letters</ModeDescription>
            </ModeButton>

            <ModeButton
              $active={gameMode === "word"}
              onClick={() => setGameMode("word")}
            >
              <ModeIcon>🏹</ModeIcon>
              <ModeLabel>Word Mode</ModeLabel>
              <ModeDescription>Type complete words</ModeDescription>
            </ModeButton>
          </ModeSelector>

          <Instructions show={!hasStarted} />
          <StartButton onClick={handleStart}>START</StartButton>
          <Leaderboard />
          {totalPlays !== null && (
            <TotalPlaysDisplay>
              Total Plays Worldwide:{" "}
              <HighlightedNumberOfPlays>{totalPlays}</HighlightedNumberOfPlays>
            </TotalPlaysDisplay>
          )}
        </StartScreen>
      )}

      {hasStarted && (
        <GamePlay
          onExit={() => setHasStarted(false)}
          onLevelChange={(level) => setCurrentLevel(level)}
          gameMode={gameMode}
        />
      )}
    </GameWrapper>
  );
};

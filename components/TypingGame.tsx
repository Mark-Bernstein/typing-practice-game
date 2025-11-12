"use client";

import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { useTypingGame } from "../hooks/useTypingGame";
import { calculateGameStats, getLevelMessage } from "../utils/gameUtils";
import { LEVEL_THRESHOLDS } from "../constants/gameConfig";
import { GameArea } from "./game/GameArea";
import { LevelUpVortex } from "./game/LevelUpVortex";
import { GameOver } from "./ui/GameOver";
import { Instructions } from "./ui/Instructions";
import { GameStats } from "./ui/GameStats";
import { Leaderboard } from "./ui/Leaderboard";
import { AudioControls } from "./ui/AudioControls";
import { useAudioContext } from "../app/contexts/AudioContext";
import { useGameDimensions } from "@/hooks/useGameDimensions";
import { GameMode } from "../types/game";
import { motion, AnimatePresence } from "framer-motion";
import { BackgroundParticles } from "./ui/BackgroundParticles";

const GameWrapper = styled.div<{ $level: number }>`
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  transition: all 0.5s ease;

  ${({ $level }) => {
    const gradients: Record<number, string> = {
      1: "linear-gradient(to bottom right, #000000, #000000, #000000)", // deep black
      2: "linear-gradient(to bottom right, #380062, #001b66, #3730a3)", // indigo blend
      3: "linear-gradient(to bottom right, #0039d6, #0093c8, #115e59)", // blue-green oceanic
      4: "linear-gradient(to bottom right, #00729b, #00bc87, #166534)", // emerald depth
      5: "linear-gradient(to bottom right, #481200, #680000, #ff00ae)", // crimson energy
      6: "linear-gradient(to bottom right, #ff00c8, #00eaff, #aeaeae)", // fiery red-orange
      7: "linear-gradient(to bottom right, #c2410c, #ca8a04, #3f2500)", // molten gold
      8: "linear-gradient(to bottom right, #a16207, #3f6212, #8b8b8b)", // forest vitality
      9: "linear-gradient(to bottom right, #15803d, #065f46, #0e7490)", // deep aqua-teal
      10: "linear-gradient(to bottom right, #0e7490, #2563eb, #7e22ce)", // radiant blue-violet finale
    };
    const clampedLevel = Math.min(Math.max($level, 1), 10);
    return `background: ${gradients[clampedLevel]};`;
  }}
`;

const GameContainer = styled.div`
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.01);
  backdrop-filter: blur(10px);
  pointer-events: auto;
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
  position: relative;
  display: inline-block;
  font-size: 40px;
  font-weight: bold;
  margin-bottom: 60px;
  text-shadow: 0 0 20px cyan;
  color: #e0ffff;
  opacity: 0;
  transform: scale(0.8);
  animation: titleReveal 4s ease-in-out forwards;

  /* ⚡ Animated Underline */
  &::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -8px;
    height: 5px;
    width: 0%;
    background: linear-gradient(90deg, cyan, #00e5ff, #e100ff);
    box-shadow: 0 0 10px cyan, 0 0 20px #00e5ff, 0 0 30px #d400ff;
    border-radius: 2px;
    animation: underlineGrow 1.5s ease-in-out 2.5s forwards;
  }

  @keyframes underlineGrow {
    0% {
      width: 0%;
      opacity: 0;
      transform: scaleX(0.2);
    }
    40% {
      opacity: 1;
      width: 60%;
    }
    100% {
      width: 100%;
      opacity: 1;
      transform: scaleX(1);
    }
  }

  @keyframes titleReveal {
    0% {
      opacity: 0;
      transform: scale(0.1);
      text-shadow: 0 0 5px cyan, 0 0 10px #00ffff;
      letter-spacing: -2px;
      color: black;
    }
    30% {
      opacity: 0.6;
      transform: scale(1.5);
      text-shadow: 0 0 15px cyan, 0 0 25px #00ffff;
      letter-spacing: 2px;
    }
    70% {
      opacity: 1;
      transform: scale(1.5);
      text-shadow: 0 0 25px #00ffff, 0 0 40px #00e5ff;
      letter-spacing: 1px;
    }
    90% {
      color: black;
    }
    91% {
      color: white;
    }
    92% {
      color: black;
    }
    93% {
      color: white;
    }
    94% {
      color: black;
    }
    95% {
      color: white;
    }
    96% {
      color: black;
    }
    97% {
      color: white;
    }
    98% {
      color: black;
    }
    99% {
      color: white;
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
  color: cyan;
  font-size: 32px;
  font-weight: bold;
  text-shadow: 0 0 8px #000000;
  z-index: 9999;
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
    opacity: 1;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
`;

const StartButton = styled.button`
  position: absolute;
  top: 750px;
  padding: 120px 35px;
  font-size: 64px;
  font-weight: bold;
  font-family: "Orbitron", sans-serif;
  letter-spacing: 3px;
  color: #000;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  z-index: 1;
  overflow: visible;
  box-shadow: 0 0 30px rgba(147, 51, 234, 0.9), 0 0 60px rgba(34, 211, 238, 0.8);
  background-size: 200% 200%;
  transform-style: preserve-3d;
  perspective: 1200px;
  transition: all 0.4s ease;

  /* Run initial animations once */
  animation: ${fadeInFromTop} 2s ease-in-out forwards,
    moveUp ease-in-out 2s forwards, jump 1.5s linear 0s 1 both;

  @keyframes jump {
    90% {
      transform: rotateY(360deg) rotateX(45deg) scale(1);
    }
    100% {
      transform: scale(1);
    }
  }

  &:hover {
    color: #fff;
    letter-spacing: 20px;
    background: linear-gradient(135deg, #22d3ee, #9333ea, #ff007f, #00fff2);
    background-size: 300% 300%;
    box-shadow: 0 0 30px rgba(0, 255, 255, 0.9),
      0 0 60px rgba(147, 51, 234, 0.9), 0 0 100px rgba(236, 72, 153, 0.8),
      inset 0 0 30px rgba(255, 255, 255, 0.6);
    text-shadow: 0 0 25px #22d3ee, 0 0 45px #9333ea, 0 0 65px #ec4899,
      0 0 85px #00fff2;
  }

  @keyframes hoverWarp {
    0% {
      background-position: 0% 50%;
      filter: hue-rotate(0deg);
    }
    50% {
      background-position: 100% 50%;
      filter: hue-rotate(180deg);
    }
    100% {
      background-position: 0% 50%;
      filter: hue-rotate(360deg);
    }
  }

  @keyframes hoverPulse {
    0%,
    100% {
      box-shadow: 0 0 30px rgba(0, 255, 255, 0.9),
        0 0 60px rgba(147, 51, 234, 0.9);
    }
    50% {
      box-shadow: 0 0 80px rgba(236, 72, 153, 1), 0 0 150px rgba(0, 255, 255, 1);
    }
  }

  &::before,
  &::after {
    content: "";
    position: absolute;
    inset: -2px;
    border-radius: 50%;
    z-index: -1;
    pointer-events: none;
  }

  &::before {
    background: radial-gradient(
      circle,
      rgba(102, 0, 255, 0.8) 0%,
      rgba(200, 255, 0, 0.8) 80%,
      rgba(255, 0, 0, 0.8) 100%
    );
    animation: orbRotate 7s linear infinite;
    filter: blur(50px);
  }

  &::after {
    background: radial-gradient(
      circle,
      rgba(147, 51, 234, 0.6) 60%,
      rgba(0, 255, 238, 0.5) 80%,
      transparent 100%
    );
    animation: orbPulse 2.5s ease-in-out infinite;
    filter: blur(20px);
  }

  @keyframes orbRotate {
    0% {
      transform: rotate(0deg) scale(1);
    }
    50% {
      transform: rotate(180deg) scale(2.5);
    }
    100% {
      transform: rotate(360deg) scale(1);
    }
  }

  @keyframes orbPulse {
    0%,
    100% {
      transform: scale(1);
      opacity: 0.9;
    }
    50% {
      transform: scale(0.8);
      opacity: 0.5;
    }
  }

  @keyframes moveUp {
    from {
      top: 800px;
    }
    to {
      top: 500px;
    }
  }
`;

const StartButtonModeText = styled.span`
  display: block;
  font-size: 24px;
  color: #00fffb;
`;

const TotalPlaysDisplay = styled.div`
  position: absolute;
  font-size: 24px;
  left: 16px;
  top: 16px;
  width: 370px;
  background: #000000;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  backdrop-filter: blur(12px);
  z-index: 1000;
  animation: slideInLeft 2s ease-in-out;

  @keyframes slideInLeft {
    0% {
      transform: translateX(-500px);
      opacity: 0;
    }
    60% {
      transform: translateX(20px);
      opacity: 1;
    }
    80% {
      transform: translateX(-10px);
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @media screen and (max-width: 1440px) {
    font-size: 18px;
    width: 320px;
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
  margin-top: 8px;
`;

const ModeSelectorTitle = styled.h2`
  font-family: "Orbitron", sans-serif;
  display: block;
  font-size: clamp(24px, 3vw, 32px);
  font-weight: 800;
  text-align: center;
  letter-spacing: 3px;
  margin-bottom: 16px;
  background: linear-gradient(90deg, #ffffff, #ffff00, #9e88ff, #00ffff);
  background-size: 300% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 6s linear infinite;

  @keyframes shimmer {
    0% {
      background-position: 0% 50%;
    }
    100% {
      background-position: 300% 50%;
    }
  }

  @media (max-width: 768px) {
    letter-spacing: 1.5px;
    margin-bottom: 30px;
  }
`;

export const ModeSelector = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      style={{
        display: "block",
        gap: "30px",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: "80px",
        zIndex: 1001,
        perspective: 1000,
      }}
      initial={{
        opacity: 0,
        scale: 0.1,
        rotateX: 75,
        rotateY: -45,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        rotateX: 0,
        rotateY: 0,
      }}
      transition={{
        duration: 1.2,
        ease: [0.25, 0.1, 0.25, 1],
        delay: 0.6,
      }}
    >
      <ModeSelectorTitle>Select a Mode</ModeSelectorTitle>
      <div
        style={{
          display: "flex",
          gap: "30px",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {children}
      </div>
    </motion.div>
  );
};

const ModeButton = styled.button<{ $active: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 0 18px 12px;
  width: 190px;
  border-radius: 24px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  cursor: pointer;
  overflow: hidden;
  background: #7b7b7b;
  backdrop-filter: blur(20px);
  transition: all 0.5s ease;
  transform: ${(props) =>
    props.$active ? "translateY(-4px) scale(1.05)" : "scale(1)"};
  box-shadow: ${(props) =>
    props.$active
      ? "0 0 30px rgba(34,211,238,1), 0 0 60px #3a0070"
      : "0 0 10px rgba(255,255,255,0.1)"};

  @media (max-width: 1440px) {
    width: 140px;
  }

  &:hover {
    transform: ${(props) =>
      props.$active
        ? "translateY(-8px) scale(1.05)" // keep same scale while adding a subtle lift
        : "translateY(-8px) scale(1.05)"};
    box-shadow: 0 0 40px rgba(0, 255, 247, 0.8),
      0 0 80px rgba(147, 51, 234, 0.6), 0 0 120px rgba(236, 72, 153, 0.4);
  }

  &::before {
    content: "";
    position: absolute;
    inset: -2px;
    border-radius: 26px;
    background: linear-gradient(
      60deg,
      #22d3ee,
      #9400e3,
      #000000,
      #0600b0,
      #22d3ee
    );
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
    background: linear-gradient(180deg, #00fff2, #9900ff, #ff0000);
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
      box-shadow: 0 0 30px rgba(34,211,238,1),
                  0 0 60px rgba(147,51,234,1),
                  inset 0 0 15px rgba(34,211,238,1);
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

  @media (max-width: 1440px) {
    font-size: 40px;
  }
`;

const ModeLabel = styled.div`
  font-family: "Orbitron", sans-serif;
  color: #00fff7;
  font-size: 28px;
  font-weight: 900;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-shadow: 0 0 10px #00fff7, 0 0 20px #9333ea, 0 0 30px #ec4899;

  @media (max-width: 1440px) {
    font-size: 20px;
  }
`;

const ModeDescription = styled.div`
  font-family: "SF Mono", monospace;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 18px;
  text-align: center;
  line-height: 1.4;
  text-shadow: 0 0 6px rgba(0, 255, 247, 0.4), 0 0 12px rgba(147, 51, 234, 0.3);

  @media (max-width: 1440px) {
    font-size: 16px;
  }
`;

const MaxLevelText = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  text-align: center;

  font-size: 30px;
  font-weight: bold;
  color: cyan;
  text-shadow: 0 0 20px #000000, 0 0 40px #ff00ff;
  animation: pulse 1s infinite alternate;

  @keyframes pulse {
    from {
      opacity: 0.7;
      transform: scale(1);
    }
    to {
      opacity: 1;
      transform: scale(1.5);
    }
  }
`;

const GamePlay: React.FC<{
  onExit: () => void;
  onLevelChange?: (level: number) => void;
  gameMode: GameMode;
}> = ({ onExit, onLevelChange, gameMode }) => {
  const dimensions = useGameDimensions();
  const { playSFX } = useAudioContext();
  const { gameState, resetGame } = useTypingGame(playSFX, dimensions, gameMode);
  const [levelMessage, setLevelMessage] = useState(getLevelMessage(0));
  const prevLevelRef = React.useRef(gameState.level);
  const [showLevelUpVortex, setShowLevelUpVortex] = useState(false);
  const [vortexLevel, setVortexLevel] = useState(1);

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
      setVortexLevel(gameState.level);
      setShowLevelUpVortex(true);
    }
    prevLevelRef.current = gameState.level;

    onLevelChange?.(gameState.level);
  }, [gameState.lettersCorrect, gameState.level, onLevelChange, playSFX]);

  const onTryAgain = () => {
    resetGame();
  };

  return (
    <>
      <GameContainer>
        <GameStats
          time={gameState.time}
          lettersCorrect={gameState.lettersCorrect}
          score={gameState.score}
          speed={gameState.speed}
          comboCount={gameState.combo.count}
          comboMultiplier={gameState.combo.multiplier}
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
          gameMode={gameMode}
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
            {gameState.level >= 10 ? (
              <MaxLevelText>⚡ MAX LEVEL ⚡</MaxLevelText>
            ) : (
              <>
                {" "}
                <ProgressBar $progress={getProgress()}>
                  <div />
                </ProgressBar>
                <ProgressText>Progress to next level</ProgressText>
              </>
            )}
          </ProgressWrapper>
        </>
      )}
      <AnimatePresence>
        {showLevelUpVortex && (
          <LevelUpVortex
            key={gameState.level}
            level={vortexLevel}
            onComplete={() => setShowLevelUpVortex(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export const TypingGame: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [totalPlays, setTotalPlays] = useState<number | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>("letter");
  const [startClicked, setStartClicked] = useState(false);
  const [clickPosition, setClickPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

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

  // 🧹 Reset start animation state whenever returning to the main menu
  useEffect(() => {
    if (!hasStarted) {
      setStartClicked(false);
      setClickPosition(null);
    }
  }, [hasStarted]);

  const handleStart = () => {
    incrementTotalPlays();
    stopMusic();
    playMusic("gameplay");
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
      {/* // TODO - try to make this background only for outside of the GameArea */}
      <BackgroundParticles isActive={!hasStarted} />
      <AudioControls
        musicEnabled={musicEnabled}
        sfxEnabled={sfxEnabled}
        onToggleMusic={toggleMusic}
        onToggleSFX={toggleSFX}
      />

      {!hasStarted && (
        <StartScreen>
          <BackgroundParticles isActive={!hasStarted} />
          <TitleMainMenu>Typing Challenge</TitleMainMenu>
          <ModeSelector>
            <ModeButton
              $active={gameMode === "letter"}
              onClick={() => setGameMode("letter")}
            >
              <ModeIcon>🔤</ModeIcon>
              <ModeLabel>Letter Mode</ModeLabel>
              <ModeDescription>Type individual letters</ModeDescription>
            </ModeButton>

            <ModeButton
              $active={gameMode === "word"}
              onClick={() => setGameMode("word")}
            >
              <ModeIcon>📜</ModeIcon>
              <ModeLabel>Word Mode</ModeLabel>
              <ModeDescription>Type complete words</ModeDescription>
            </ModeButton>

            <ModeButton
              $active={gameMode === "story"}
              onClick={() => setGameMode("story")}
            >
              <ModeIcon>📖</ModeIcon>
              <ModeLabel>Story Mode</ModeLabel>
              <ModeDescription>Type through adventures</ModeDescription>
            </ModeButton>
          </ModeSelector>

          <Instructions show={!hasStarted} />

          {!hasStarted && (
            <>
              {!startClicked ? (
                <StartButton
                  onClick={(e) => {
                    const x = e.clientX;
                    const y = e.clientY;
                    setClickPosition({ x, y });
                    setStartClicked(true);
                    playSFX("start");
                  }}
                >
                  START
                  <StartButtonModeText>{gameMode} mode</StartButtonModeText>
                </StartButton>
              ) : (
                <motion.div
                  key="startAnimation"
                  initial={{
                    opacity: 1,
                    scale: 1,
                    rotateY: 0,
                    filter: "brightness(1)",
                  }}
                  animate={{
                    opacity: 0,
                    scale: 0,
                    rotateY: 0,
                    rotateX: 0,
                    filter: [
                      "brightness(1)",
                      "brightness(2) contrast(2)",
                      "brightness(4) contrast(3)",
                    ],
                    boxShadow: [
                      "0 0 60px #00fff2, 0 0 120px #9333ea",
                      "0 0 200px #ff00ff, 0 0 400px #22d3ee",
                      "0 0 800px #00fff2, 0 0 1600px #ec4899",
                    ],
                  }}
                  transition={{
                    duration: 1.5,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  onAnimationComplete={handleStart}
                  style={{ perspective: 2000 }}
                >
                  <StartButton>START</StartButton>
                </motion.div>
              )}

              {/* ⚡ Warp Burst at click location */}
              {startClicked && clickPosition && (
                <>
                  {/* Outer warp flash */}
                  <motion.div
                    key="warpFlashOuter"
                    initial={{
                      opacity: 0,
                      scale: 0,
                      x: clickPosition.x - window.innerWidth / 2,
                      y: clickPosition.y - window.innerHeight / 2,
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 2.5, 5],
                    }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    style={{
                      position: "relative",
                      width: "10%",
                      height: "10%",
                      background:
                        "radial-gradient(circle, #000000 0%, rgba(200, 255, 0, 0.6) 25%, rgba(4, 0, 255, 0.3) 50%, rgba(0, 195, 255, 0.9) 100%)",
                      zIndex: 9998,
                      filter: "blur(20px)",
                      pointerEvents: "none",
                      borderRadius: "50%",
                    }}
                  />

                  {/* Inner core burst */}
                  <motion.div
                    key="warpCore"
                    initial={{
                      opacity: 0,
                      scale: 0,
                      x: clickPosition.x - window.innerWidth / 2,
                      y: clickPosition.y - window.innerHeight / 2,
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 3, 8],
                    }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    style={{
                      position: "relative",
                      width: "400px",
                      height: "400px",
                      background:
                        "radial-gradient(circle, #ff0000 0%, rgba(170, 0, 255, 0.8) 40%, rgba(0,0,0,0.7) 100%)",
                      filter: "blur(20px)",
                      borderRadius: "50%",
                      zIndex: 9999,
                      pointerEvents: "none",
                    }}
                  />

                  {/* Energy rings expanding from click */}
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={`ring-${i}`}
                      initial={{
                        opacity: 0.8,
                        scale: 1,
                        x: clickPosition.x - window.innerWidth / 2,
                        y: clickPosition.y - window.innerHeight / 2,
                      }}
                      animate={{
                        opacity: [1, 0.5, 0],
                        scale: [0, 0.5 + i, 1 + i],
                      }}
                      transition={{
                        duration: 1,
                        ease: "easeOut",
                        delay: i * 0.08,
                      }}
                      style={{
                        position: "relative",
                        width: 200 + i * 20,
                        height: 200 + i * 20,
                        borderRadius: "50%",
                        border: "2px solid rgba(0,255,255,0.6)",
                        boxShadow:
                          "0 0 20px rgba(255, 0, 0, 0.6), 0 0 40px rgba(132, 0, 255, 0.4)",
                        transform: "translate(-50%, -50%)",
                        zIndex: 9997,
                        pointerEvents: "none",
                      }}
                    />
                  ))}
                </>
              )}
            </>
          )}

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

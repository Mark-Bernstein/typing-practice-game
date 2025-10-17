import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { GameState } from "../../types/game";
import { FallingLetter } from "./FallingLetter";
import { FallingWord } from "./FallingWord";
import { FallingShield } from "./FallingShield";
import { Lives } from "../ui/Lives";
import { ShieldIndicator } from "../ui/ShieldIndicator";
import { LetterMissEffect } from "../ui/LetterMissEffect";
import { AnimatePresence } from "framer-motion";
import { LavaFloor } from "./LavaFloor";
import { useGameDimensions } from "@/hooks/useGameDimensions";

const GameContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

const GameCanvasWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  z-index: 5;
`;

const GameCanvas = styled.div<{
  $width: number;
  $height: number;
  $shieldActive: boolean;
}>`
  position: relative;
  width: ${(props) => props.$width}px;
  height: ${(props) => props.$height}px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: ${(props) =>
    props.$shieldActive
      ? "0 0 60px rgba(255, 215, 0, 0.4), inset 0 0 80px rgba(255, 215, 0, 0.1)"
      : "0 0 60px rgba(0, 0, 0, 0.5), inset 0 0 80px rgba(0, 0, 0, 0.3)"};
  transition: box-shadow 0.3s ease;

  ${(props) =>
    props.$shieldActive &&
    `
    border-color: rgba(255, 215, 0, 1);
  `}
`;

const shake = keyframes`
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
  100% { transform: translateX(0); }
`;

const WrongKeyFeedback = styled.div`
  position: absolute;
  bottom: 0;
  left: 20px;
  color: #7e0000;
  font-size: clamp(18px, 1.5vw, 24px);
  font-weight: bold;
  animation: ${shake} 0.3s linear;
  pointer-events: none;
  z-index: 20;
  opacity: 0.8;
`;

const ModeIndicator = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 8px 16px;
  color: #22d3ee;
  font-size: 14px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  z-index: 20;
`;

const ShieldCatchEffect = styled.div`
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle,
    rgba(255, 215, 0, 0.3) 0%,
    transparent 70%
  );
  pointer-events: none;
  z-index: 100;
  animation: shieldPulse 0.6s ease-out;

  @keyframes shieldPulse {
    0% {
      opacity: 0;
      transform: scale(0.5);
    }
    50% {
      opacity: 1;
      transform: scale(1.2);
    }
    100% {
      opacity: 0;
      transform: scale(1.5);
    }
  }
`;

interface GameAreaProps {
  gameState: GameState;
}

export const GameArea: React.FC<GameAreaProps> = ({ gameState }) => {
  const [triggerMissEffect, setTriggerMissEffect] = useState(false);
  const [showShieldCatch, setShowShieldCatch] = useState(false);
  const prevLivesRef = useRef(gameState.lives);
  const prevShieldChargesRef = useRef(gameState.shieldState.charges);
  const { width } = useGameDimensions();

  useEffect(() => {
    if (gameState.lives < prevLivesRef.current) {
      setTriggerMissEffect(true);
      const timer = setTimeout(() => setTriggerMissEffect(false), 600);
      return () => clearTimeout(timer);
    }
    prevLivesRef.current = gameState.lives;
  }, [gameState.lives]);

  // ✅ Shield catch effect
  useEffect(() => {
    if (gameState.shieldState.charges > prevShieldChargesRef.current) {
      setShowShieldCatch(true);
      const timer = setTimeout(() => setShowShieldCatch(false), 600);
      return () => clearTimeout(timer);
    }
    prevShieldChargesRef.current = gameState.shieldState.charges;
  }, [gameState.shieldState.charges]);

  return (
    <GameContainer>
      <Lives lives={gameState.lives} />
      <ShieldIndicator shieldState={gameState.shieldState} />
      <LetterMissEffect triggerEffect={triggerMissEffect}>
        <GameCanvasWrapper>
          <GameCanvas
            $width={gameState.dimensions.width}
            $height={gameState.dimensions.height}
            $shieldActive={gameState.shieldState.active}
          >
            <ModeIndicator>
              {gameState.gameMode === "letter" ? "Letter Mode" : "Word Mode"}
            </ModeIndicator>

            <AnimatePresence>
              {gameState.shields.map((shield) => (
                <FallingShield
                  key={`shield-${shield.id}`}
                  shield={shield}
                  letterSize={gameState.dimensions.letterSize}
                />
              ))}

              {/* Render letters OR words based on mode */}
              {gameState.gameMode === "letter"
                ? gameState.letters.map((letter) => (
                    <FallingLetter
                      key={`letter-${letter.id}`}
                      letter={letter}
                      letterSize={gameState.dimensions.letterSize}
                    />
                  ))
                : gameState.words.map((word) => (
                    <FallingWord
                      key={`word-${word.id}`}
                      word={word}
                      letterSize={gameState.dimensions.letterSize}
                    />
                  ))}
            </AnimatePresence>

            {gameState.lastKeyPressed && gameState.lastKeyCorrect === false && (
              <WrongKeyFeedback>Wrong key</WrongKeyFeedback>
            )}

            {showShieldCatch && <ShieldCatchEffect />}
          </GameCanvas>
          <LavaFloor height={30} width={width} />
        </GameCanvasWrapper>
      </LetterMissEffect>
    </GameContainer>
  );
};

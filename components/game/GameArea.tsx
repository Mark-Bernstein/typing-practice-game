import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes, css } from "styled-components";
import { GameState } from "../../types/game";
import { FallingLetter } from "./FallingLetter";
import { FallingWord } from "./FallingWord";
import { FallingShield } from "./FallingShield";
import { FallingLife } from "./FallingLife";
import { FallingMultiplier } from "./FallingMultiplier";
import { Lives } from "../ui/Lives";
import { ShieldIndicator } from "../ui/ShieldIndicator";
import { ChargeIndicator } from "../ui/ChargeIndicator";
import { LetterMissEffect } from "../ui/LetterMissEffect";
import { PointsGainEffect } from "../ui/PointsGainEffect";
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

const flicker = keyframes`
  0%, 100% { opacity: 1; }
  45% { opacity: 0.8; }
  50% { opacity: 1; }
  55% { opacity: 0.7; }
  60% { opacity: 1; }
`;

const pulse = keyframes`
  0%,100% { box-shadow: 0 0 25px rgba(255,215,0,0.4), inset 0 0 25px rgba(255,215,0,0.2); }
  50% { box-shadow: 0 0 45px rgba(255,255,180,0.6), inset 0 0 45px rgba(255,215,0,0.3); }
`;

const arcFlash = keyframes`
  0% { opacity: 0; transform: scale(0.1) rotate(90deg); }
  10% { opacity: 1; transform: scale(1) rotate(30deg); }
  25% { opacity: 1; transform: scale(1.1) rotate(0deg); }
  100% { opacity: 0; }
`;

export const GameCanvas = styled.div<{
  $width: number;
  $height: number;
  $shieldActive: boolean;
}>`
  position: relative;
  width: ${(p) => p.$width}px;
  height: ${(p) => p.$height}px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 25px;
  overflow: hidden;
  transition: all 0.3s ease;

  ${(p) =>
    p.$shieldActive
      ? css`
          border: 2px solid rgba(255, 215, 0, 0.8);
          animation: ${pulse} 2s ease-in-out infinite;

          &::before {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: 16px;
            border: 5px solid rgba(255, 255, 200, 0.8);
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
            opacity: 0.4;
            animation: ${flicker} 1.6s ease-in-out infinite;
            pointer-events: none;
          }

          &::after {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: 16px;
            border: 20px dotted rgba(0, 204, 255, 0.8);
            opacity: 0;
            animation: ${arcFlash} 1.8s ease-out infinite;
            animation-delay: 0.3s;
            pointer-events: none;
          }
        `
      : css`
          border: 2px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 0 40px rgba(0, 0, 0, 0.5),
            inset 0 0 60px rgba(0, 0, 0, 0.3);
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
  background: rgba(0, 0, 0, 0.3);
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

const MultiplierCatchEffect = styled.div`
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle,
    rgba(153, 0, 255, 0.3) 0%,
    rgba(26, 255, 0, 0.2) 50%,
    transparent 70%
  );
  pointer-events: none;
  z-index: 100;
  animation: multiplierPulse 1s ease-out;

  @keyframes multiplierPulse {
    0% {
      opacity: 0;
      transform: scale(0.5) rotate(0deg);
    }
    50% {
      opacity: 1;
      transform: scale(1.2) rotate(180deg);
    }
    100% {
      opacity: 0;
      transform: scale(1.5) rotate(360deg);
    }
  }
`;

interface GameAreaProps {
  gameState: GameState;
}

export const GameArea: React.FC<GameAreaProps> = ({ gameState }) => {
  const [triggerMissEffect, setTriggerMissEffect] = useState(false);
  const [showShieldCatch, setShowShieldCatch] = useState(false);
  const [showMultiplierCatch, setShowMultiplierCatch] = useState(false);
  const prevLivesRef = useRef(gameState.lives);
  const prevShieldChargesRef = useRef(gameState.shieldState.charges);
  const { width } = useGameDimensions();
  const [pointsEffect, setPointsEffect] = useState<{
    x: number;
    y: number;
    points: number;
  } | null>(null);
  const prevScoreRef = useRef(gameState.score);

  useEffect(() => {
    const prevScore = prevScoreRef.current;

    // only trigger when score increases and a correct key was pressed
    if (gameState.score > prevScore && gameState.lastKeyCorrect) {
      const gain = gameState.score - prevScore;

      // ✅ Prefer exact saved position (captured before removal)
      if (gameState.lastTypedPosition) {
        setPointsEffect({
          x: gameState.lastTypedPosition.x,
          y: gameState.lastTypedPosition.y,
          points: gain,
        });
      } else {
        // fallback to approximate logic
        let x = gameState.dimensions.width / 2;
        let y = gameState.dimensions.height / 2;

        if (gameState.gameMode === "letter") {
          const nearestToBottom = [...gameState.letters].sort(
            (a, b) => b.y - a.y
          )[0];
          if (nearestToBottom) {
            x = nearestToBottom.x;
            y = nearestToBottom.y;
          }
        } else if (gameState.gameMode === "word") {
          const activeWord = gameState.words.find(
            (w) => w.id === gameState.currentTypingWordId
          );
          if (activeWord) {
            x =
              activeWord.x +
              (activeWord.word.length * gameState.dimensions.letterSize) / 2;
            y = activeWord.y - gameState.dimensions.letterSize / 2;
          }
        }

        setPointsEffect({ x, y, points: gain });
      }

      // clear after animation ends
      const timer = setTimeout(() => setPointsEffect(null), 1000);
      prevScoreRef.current = gameState.score;
      return () => clearTimeout(timer);
    }

    prevScoreRef.current = gameState.score;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.score, gameState.lastKeyCorrect, gameState.lastTypedPosition]);

  useEffect(() => {
    if (gameState.lives < prevLivesRef.current) {
      setTriggerMissEffect(true);
      const timer = setTimeout(() => setTriggerMissEffect(false), 600);
      return () => clearTimeout(timer);
    }
    prevLivesRef.current = gameState.lives;
  }, [gameState.lives]);

  // Shield catch effect
  useEffect(() => {
    if (gameState.shieldState.charges > prevShieldChargesRef.current) {
      setShowShieldCatch(true);
      const timer = setTimeout(() => setShowShieldCatch(false), 600);
      return () => clearTimeout(timer);
    }
    prevShieldChargesRef.current = gameState.shieldState.charges;
  }, [gameState.shieldState.charges]);

  // Multiplier catch effect — trigger only when a multiplier is collected
  const prevMultiplierCountRef = useRef(gameState.multiplier_powerups.length);

  useEffect(() => {
    const currentCount = gameState.multiplier_powerups.length;
    const prevCount = prevMultiplierCountRef.current;

    // ✅ Only trigger if a multiplier was collected (count decreased)
    if (currentCount < prevCount) {
      setShowMultiplierCatch(true);
      const timer = setTimeout(() => setShowMultiplierCatch(false), 600);
      prevMultiplierCountRef.current = currentCount; // update immediately
      return () => clearTimeout(timer);
    }

    // ❌ Do not trigger if a new multiplier spawned (count increased)
    if (currentCount > prevCount) {
      prevMultiplierCountRef.current = currentCount;
    }
  }, [gameState.multiplier_powerups.length]);

  return (
    <GameContainer>
      <Lives lives={gameState.lives} maxLives={gameState.maxLives} />
      <ShieldIndicator shieldState={gameState.shieldState} />
      <ChargeIndicator
        chargeState={gameState.chargeState}
        gameTime={gameState.time}
      />
      <LetterMissEffect triggerEffect={triggerMissEffect}>
        <GameCanvasWrapper>
          <GameCanvas
            $width={gameState.dimensions.width}
            $height={gameState.dimensions.height}
            $shieldActive={gameState.shieldState.active}
          >
            <ModeIndicator>
              {gameState.gameMode === "letter"
                ? "Letter Mode"
                : gameState.gameMode === "word"
                ? "Word Mode"
                : gameState.gameMode === "story"
                ? "Story Mode"
                : ""}
            </ModeIndicator>

            <AnimatePresence>
              {gameState.shields.map((shield) => (
                <FallingShield
                  key={`shield-${shield.id}`}
                  shield={shield}
                  letterSize={gameState.dimensions.letterSize}
                />
              ))}

              {gameState.lives_powerups.map((life) => (
                <FallingLife
                  key={`life-${life.id}`}
                  life={life}
                  letterSize={gameState.dimensions.letterSize}
                />
              ))}

              {gameState.multiplier_powerups.map((multiplier, index) => (
                <FallingMultiplier
                  key={`multiplier-${multiplier.id}-${index}`}
                  multiplier={multiplier}
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
            {showMultiplierCatch && <MultiplierCatchEffect />}
            {pointsEffect && (
              <PointsGainEffect
                x={pointsEffect.x}
                y={pointsEffect.y}
                points={pointsEffect.points}
              />
            )}
          </GameCanvas>
          <LavaFloor height={30} width={width} />
        </GameCanvasWrapper>
      </LetterMissEffect>
    </GameContainer>
  );
};

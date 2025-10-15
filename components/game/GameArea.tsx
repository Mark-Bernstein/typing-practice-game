import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { GameState } from "../../types/game";
import { FallingLetter } from "./FallingLetter";
import { Lives } from "../ui/Lives";
import { LetterMissEffect } from "../ui/LetterMissEffect";
import { AnimatePresence } from "framer-motion";
import { LavaFloor } from "./LavaFloor";
import { useAudioContext } from "../../app/contexts/AudioContext";

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

const GameCanvas = styled.div<{ $width: number; $height: number }>`
  position: relative;
  width: ${(props) => props.$width}px;
  height: ${(props) => props.$height}px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 0 60px rgba(0, 0, 0, 0.5), inset 0 0 80px rgba(0, 0, 0, 0.3);
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

interface GameAreaProps {
  gameState: GameState;
}

export const GameArea: React.FC<GameAreaProps> = ({ gameState }) => {
  const [triggerMissEffect, setTriggerMissEffect] = useState(false);
  const prevLivesRef = useRef(gameState.lives);

  useEffect(() => {
    if (gameState.lives < prevLivesRef.current) {
      setTriggerMissEffect(true);
      const timer = setTimeout(() => setTriggerMissEffect(false), 600);
      return () => clearTimeout(timer);
    }
    prevLivesRef.current = gameState.lives;
  }, [gameState.lives]);

  return (
    <GameContainer>
      <Lives lives={gameState.lives} />

      <LetterMissEffect triggerEffect={triggerMissEffect}>
        <GameCanvasWrapper>
          {/* ✅ Pass dynamic dimensions */}
          <GameCanvas
            $width={gameState.dimensions.width}
            $height={gameState.dimensions.height}
          >
            <AnimatePresence>
              {gameState.letters.map((letter) => (
                <FallingLetter
                  key={letter.id}
                  letter={letter}
                  letterSize={gameState.dimensions.letterSize}
                />
              ))}
            </AnimatePresence>

            {gameState.lastKeyPressed && gameState.lastKeyCorrect === false && (
              <WrongKeyFeedback>Wrong key</WrongKeyFeedback>
            )}
          </GameCanvas>
          <LavaFloor height={30} width={gameState.dimensions.width} />
        </GameCanvasWrapper>
      </LetterMissEffect>
    </GameContainer>
  );
};

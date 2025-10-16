import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { GameState } from "../../types/game";
import { FallingLetter } from "./FallingLetter";
import { FallingWord } from "./FallingWord"; // ✅ Import new component
import { Lives } from "../ui/Lives";
import { LetterMissEffect } from "../ui/LetterMissEffect";
import { AnimatePresence } from "framer-motion";
import { LavaFloor } from "./LavaFloor";
import { useAudioContext } from "../../app/contexts/AudioContext";
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

interface GameAreaProps {
  gameState: GameState;
}

export const GameArea: React.FC<GameAreaProps> = ({ gameState }) => {
  const [triggerMissEffect, setTriggerMissEffect] = useState(false);
  const prevLivesRef = useRef(gameState.lives);
  const { width } = useGameDimensions();

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
          <GameCanvas
            $width={gameState.dimensions.width}
            $height={gameState.dimensions.height}
          >
            {/* ✅ Mode indicator */}
            <ModeIndicator>
              {gameState.gameMode === "letter" ? "Letter Mode" : "Word Mode"}
            </ModeIndicator>

            <AnimatePresence>
              {/* ✅ Render letters OR words based on mode */}
              {gameState.gameMode === "letter"
                ? gameState.letters.map((letter) => (
                    <FallingLetter
                      key={letter.id}
                      letter={letter}
                      letterSize={gameState.dimensions.letterSize}
                    />
                  ))
                : gameState.words.map((word) => (
                    <FallingWord
                      key={word.id}
                      word={word}
                      letterSize={gameState.dimensions.letterSize}
                    />
                  ))}
            </AnimatePresence>

            {gameState.lastKeyPressed && gameState.lastKeyCorrect === false && (
              <WrongKeyFeedback>Wrong key</WrongKeyFeedback>
            )}
          </GameCanvas>
          <LavaFloor height={40} width={width} />
        </GameCanvasWrapper>
      </LetterMissEffect>
    </GameContainer>
  );
};

import React from "react";
import styled, { keyframes } from "styled-components";
import { GameState } from "../../types/game";
import { GAME_CONFIG } from "../../constants/gameConfig";
import { FallingLetter } from "./FallingLetter";
import { Lives } from "../ui/Lives";

// Wrapper to center and scale game proportionally
const GameContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

const GameCanvas = styled.div`
  position: relative;
  width: ${GAME_CONFIG.SCREEN_WIDTH}px;
  height: ${GAME_CONFIG.SCREEN_HEIGHT}px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 0 60px rgba(0, 0, 0, 0.5), inset 0 0 80px rgba(0, 0, 0, 0.3);

  /* Make canvas scale with viewport */
  transform-origin: top left;
  transform: scale(
    min(
      100vw / ${GAME_CONFIG.SCREEN_WIDTH},
      100vh / ${GAME_CONFIG.SCREEN_HEIGHT}
    )
  );
`;

// Animation for wrong key feedback
const shake = keyframes`
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
  100% { transform: translateX(0); }
`;

const WrongKeyFeedback = styled.div`
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: #ff4d4f;
  font-size: 24px;
  font-weight: bold;
  animation: ${shake} 0.3s linear;
  pointer-events: none;
  z-index: 20;
`;

interface GameAreaProps {
  gameState: GameState;
}

export const GameArea: React.FC<GameAreaProps> = ({ gameState }) => {
  return (
    <GameContainer>
      {/* Lives Display - Left Side */}
      <Lives lives={gameState.lives} />

      {/* Main Game Area */}
      <GameCanvas>
        {gameState.letters.map((letter) => (
          <FallingLetter key={letter.id} letter={letter} />
        ))}

        {/* Wrong key feedback */}
        {gameState.lastKeyPressed && gameState.lastKeyCorrect === false && (
          <WrongKeyFeedback>
            Wrong key: {gameState.lastKeyPressed}
          </WrongKeyFeedback>
        )}
      </GameCanvas>
    </GameContainer>
  );
};

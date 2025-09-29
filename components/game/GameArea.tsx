import React from "react";
import styled from "styled-components";
import { GameState } from "../../types/game";
import { GAME_CONFIG } from "../../constants/gameConfig";
import { FallingLetter } from "./FallingLetter";
import { LevelMessage } from "./LevelMessage";
import { GameStats } from "../ui/GameStats";

const GameContainer = styled.div`
  position: relative;
  height: 80%;
  width: 100%;
  overflow: hidden;
  margin: 6% auto 0;
`;

const GameCanvas = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 0 60px rgba(0, 0, 0, 0.5), inset 0 0 80px rgba(0, 0, 0, 0.3);
`;

interface GameAreaProps {
  gameState: GameState;
}

export const GameArea: React.FC<GameAreaProps> = ({ gameState }) => {
  return (
    <GameContainer>
      <GameCanvas>
        {/* Game Statistics HUD */}
        <GameStats
          time={gameState.time}
          lettersCorrect={gameState.lettersCorrect}
          score={gameState.score}
        />

        {/* Level Indicator */}
        <LevelMessage lettersCorrect={gameState.lettersCorrect} />

        {/* Falling Letters */}
        {gameState.letters.map((letter) => (
          <FallingLetter key={letter.id} letter={letter} />
        ))}
      </GameCanvas>
    </GameContainer>
  );
};

import React from "react";
import styled from "styled-components";
import { GAME_CONFIG } from "../../constants/gameConfig";

const StatsContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  z-index: 20;
`;

const StatPanel = styled.div`
  margin-top: 32px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 10px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  min-width: 120px;
`;

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
  text-align: center;
`;

const StatValue = styled.div`
  color: white;
  font-size: 24px;
  font-weight: 900;
  text-align: center;
  font-family: "SF Mono", monospace;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
`;

interface GameStatsProps {
  time: number;
  lettersCorrect: number;
  score: number;
}

export const GameStats: React.FC<GameStatsProps> = ({
  time,
  lettersCorrect,
  score,
}) => {
  const timeInSeconds = Math.floor(time / GAME_CONFIG.FRAME_RATE);

  return (
    <StatsContainer>
      <StatPanel>
        <StatLabel>Time</StatLabel>
        <StatValue>{timeInSeconds}s</StatValue>
      </StatPanel>

      <StatPanel>
        <StatLabel>Score</StatLabel>
        <StatValue>{score.toLocaleString()}</StatValue>
      </StatPanel>

      <StatPanel>
        <StatLabel>Correct</StatLabel>
        <StatValue>{lettersCorrect}</StatValue>
      </StatPanel>
    </StatsContainer>
  );
};

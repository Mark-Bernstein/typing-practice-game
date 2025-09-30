import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { GameStats } from "../../types/game";
import { GAME_CONFIG } from "../../constants/gameConfig";

interface GameOverProps {
  gameStats: GameStats;
  score: number;
  lettersCorrect: number;
  keysPressed: number;
  onRestart: () => void;
}

/* --- Animations --- */
const pulse = keyframes`
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
`;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;

const glow = keyframes`
  0%, 100% { text-shadow: 0 0 50px #ff0000, 0 0 50px #000000, 0 0 50px #ff0000; }
  20% { text-shadow: 0 0 50px #800080, 0 0 10px #000000, 0 0 10px #740074; }
`;

/* --- Styled Components --- */
const Overlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(12px);
  z-index: 100;
`;

const Container = styled.div`
  position: relative;
  max-width: 600px;
  width: 100%;
  margin: 0 16px;
`;

const Panel = styled.div`
  position: relative;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.08),
    rgba(255, 255, 255, 0.03)
  );
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  padding: 48px 32px;
  text-align: center;
  box-shadow: 0 8px 40px rgba(0, 255, 255, 0.15);

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 24px;
    background: linear-gradient(
      90deg,
      rgba(0, 255, 255, 0.2),
      rgba(128, 0, 255, 0.2),
      rgba(255, 0, 128, 0.2)
    );
    animation: ${pulse} 4s infinite;
    z-index: 0;
  }
`;

const Title = styled.h1`
  font-size: 64px;
  font-weight: 900;
  margin-bottom: 16px;
  background: linear-gradient(90deg, #ff004c, #ff00ff, #ff004c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${glow} 3s infinite;
  position: relative;
  z-index: 1;
`;

const Performance = styled.div<{ color: string }>`
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 32px;
  color: ${(props) => props.color};
  animation: ${bounce} 1.5s infinite;
  position: relative;
  z-index: 1;
`;

const ScoreBox = styled.div`
  margin-bottom: 40px;
  padding: 24px;
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 20px;
  background: rgba(0, 0, 0, 0.25);
  position: relative;
  z-index: 1;
`;

const ScoreLabel = styled.div`
  color: #00eaff;
  font-size: 14px;
  letter-spacing: 2px;
  margin-bottom: 8px;
`;

const ScoreValue = styled.div`
  font-size: 52px;
  font-weight: 900;
  color: #fff;
  text-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
`;

const StatsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 40px;
`;

// ✅ Use transient props ($show, $delay) so they don't leak into the DOM
const StatItemContainer = styled.div<{ $show: boolean; $delay: number }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  opacity: ${(props) => (props.$show ? 1 : 0)};
  transform: ${(props) => (props.$show ? "translateY(0)" : "translateY(10px)")};
  transition: all 0.5s ease;
  transition-delay: ${(props) => props.$delay}ms;
`;

const StatLabel = styled.span`
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
`;

const StatValue = styled.span`
  color: #00eaff;
  font-family: monospace;
  font-size: 20px;
  font-weight: 700;
`;

const PlayButton = styled.button`
  position: relative;
  padding: 16px 48px;
  font-size: 20px;
  font-weight: 800;
  color: white;
  border: none;
  border-radius: 16px;
  background: linear-gradient(90deg, #00eaff, #007bff);
  cursor: pointer;
  overflow: hidden;
  z-index: 1;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 25px rgba(0, 238, 255, 0.6);
  }

  &:active {
    transform: scale(0.95);
  }

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 16px;
    background: linear-gradient(90deg, #00f7ff, #007bff);
    filter: blur(12px);
    opacity: 0.7;
    transition: opacity 0.3s;
    z-index: -1;
  }
`;

/* --- Component --- */
export const GameOver: React.FC<GameOverProps> = ({
  gameStats,
  score,
  lettersCorrect,
  keysPressed,
  onRestart,
}) => {
  const [showStats, setShowStats] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setShowStats(true), 500);

    const scoreTimer = setInterval(() => {
      setAnimatedScore((prev) => {
        if (prev >= score) {
          clearInterval(scoreTimer);
          return score;
        }
        return prev + Math.ceil((score - prev) / 10);
      });
    }, 50);

    return () => {
      clearTimeout(timer);
      clearInterval(scoreTimer);
    };
  }, [score]);

  const getPerformanceMessage = (percentage: number) => {
    if (percentage >= 95)
      return { msg: `${percentage}% Correct! LEGENDARY!`, color: "#FFD700" };
    if (percentage >= 90)
      return { msg: `${percentage}% Correct! EXCELLENT!`, color: "#00FF7F" };
    if (percentage >= 80)
      return { msg: `${percentage}% Correct! GREAT JOB!`, color: "#00BFFF" };
    if (percentage >= 70)
      return { msg: `${percentage}% Correct! GOOD WORK!`, color: "#BA55D3" };
    if (percentage >= 60)
      return { msg: `${percentage}% Correct! NOT BAD!`, color: "#40E0D0" };
    return {
      msg: `${percentage}% Correct... KEEP PRACTICING!`,
      color: "red",
    };
  };

  const performance = getPerformanceMessage(gameStats.successPercentage);

  // ✅ Update usage
  const StatItem: React.FC<{ label: string; value: string; delay: number }> = ({
    label,
    value,
    delay,
  }) => (
    <StatItemContainer $show={showStats} $delay={delay}>
      <StatLabel>{label}</StatLabel>
      <StatValue>{value}</StatValue>
    </StatItemContainer>
  );

  return (
    <Overlay>
      <Container>
        <Panel>
          <Title>GAME OVER</Title>
          <Performance color={performance.color}>{performance.msg}</Performance>

          <ScoreBox>
            <ScoreLabel>FINAL SCORE</ScoreLabel>
            <ScoreValue>{animatedScore.toLocaleString()}</ScoreValue>
          </ScoreBox>

          <StatsGrid>
            <StatItem
              label="Time Played"
              value={`${gameStats.timeInSeconds}s`}
              delay={100}
            />
            <StatItem
              label="Letters Typed"
              value={lettersCorrect.toString()}
              delay={200}
            />
            <StatItem
              label="Total Keystrokes"
              value={keysPressed.toString()}
              delay={300}
            />
            <StatItem
              label="Accuracy"
              value={`${gameStats.successPercentage}%`}
              delay={400}
            />
          </StatsGrid>

          <PlayButton onClick={onRestart}>🚀 PLAY AGAIN</PlayButton>
        </Panel>
      </Container>
    </Overlay>
  );
};

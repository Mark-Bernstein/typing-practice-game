import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { GameStats } from "../../types/game";
import { NicknamePrompt } from "./NicknamePrompt";
import { CreateHighScoreDto } from "../../types/leaderboard";

interface GameOverProps {
  gameStats: GameStats;
  score: number;
  lettersCorrect: number;
  keysPressed: number;
  onRestart: () => void;
  onTryAgain: () => void;
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
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${glow} 3s infinite;
  position: relative;
  z-index: 1;
`;

const Performance = styled.div<{ color: string }>`
  font-size: 24px;
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
  font-size: 20px;
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

const StatItemContainer = styled.div<{ $show: boolean; $delay: number }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  color: white;
  opacity: ${(props) => (props.$show ? 1 : 0)};
  transform: ${(props) => (props.$show ? "translateY(0)" : "translateY(10px)")};
  transition: all 0.5s ease;
  transition-delay: ${(props) => props.$delay}ms;
  font-size: 18px;
  letter-spacing: 2px;
`;

const StatLabel = styled.span`
  color: #ffffff;
  font-weight: 500;
`;

const StatValue = styled.span`
  color: #00eaff;
  font-family: "Orbitron", sans-serif;
  font-size: 20px;
  font-weight: 700;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

const MainMenuButton = styled.button`
  position: relative;
  margin-bottom: 16px;
  padding: 16px 40px;
  font-family: "Orbitron", sans-serif;
  font-size: 20px;
  font-weight: 800;
  color: #ffffff;
  border: none;
  border-radius: 16px;
  background: linear-gradient(90deg, #3e6bff, #007bff);
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
    filter: blur(4px);
    opacity: 0.7;
    transition: opacity 0.3s;
    z-index: -1;
  }
`;

const SubmitScoreButton = styled(MainMenuButton)`
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #ff007a, #9333ea, #22d3ee);
  color: #fff;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  border: none;
  border-radius: 14px;
  padding: 16px 40px;
  font-size: 22px;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  box-shadow: 0 0 20px rgba(255, 0, 122, 0.6), 0 0 40px rgba(147, 51, 234, 0.3),
    inset 0 0 10px rgba(255, 255, 255, 0.2);
  animation: pulseGlow 3s ease-in-out infinite;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 30px rgba(255, 0, 122, 0.9),
      0 0 60px rgba(147, 51, 234, 0.7), inset 0 0 15px rgba(255, 255, 255, 0.4);
  }

  &::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.2) 0%,
      transparent 60%
    );
    transform: rotate(25deg);
    animation: shimmer 4s linear infinite;
    pointer-events: none;
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%) rotate(25deg);
    }
    100% {
      transform: translateX(100%) rotate(25deg);
    }
  }

  @keyframes pulseGlow {
    0%,
    100% {
      box-shadow: 0 0 15px rgba(255, 0, 122, 0.5),
        0 0 40px rgba(147, 51, 234, 0.3);
    }
    50% {
      box-shadow: 0 0 30px rgba(255, 0, 122, 0.9),
        0 0 60px rgba(147, 51, 234, 0.7);
    }
  }
`;

const ScoreSubmittedButton = styled.div`
  color: #00ff9f;
  margin-right: 12px;
  font-size: 22px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  text-shadow: 0 0 10px #00ff9f, 0 0 20px #00ffaa;
  animation: successGlow 1s ease-in-out infinite alternate;

  @keyframes successGlow {
    from {
      text-shadow: 0 0 10px #00ff9f, 0 0 20px #00ffaa;
    }
    to {
      text-shadow: 0 0 20px #00ffaa, 0 0 40px #00ffcc;
    }
  }
`;

const TryAgainButton = styled.button`
  background: black;
  background-color: black;
  position: relative;
  margin-bottom: 16px;
  padding: 16px 48px;
  font-family: "Orbitron", sans-serif;
  font-size: 20px;
  font-weight: 800;
  color: #ffffff;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  overflow: hidden;
  z-index: 1;
  transition: transform 0.2s ease;
  background: linear-gradient(90deg, #00570e, #00a7a7);

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
    filter: blur(4px);
    opacity: 0.7;
    transition: opacity 0.3s;
    z-index: -1;

    background: linear-gradient(90deg, #fbbf24, #f59e0b);
  }
`;
/* --- Component --- */
export const GameOver: React.FC<GameOverProps> = ({
  gameStats,
  score,
  lettersCorrect,
  keysPressed,
  onRestart,
  onTryAgain,
}) => {
  const [showStats, setShowStats] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showNicknamePrompt, setShowNicknamePrompt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);

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

  const handleSaveScore = async (nickname: string) => {
    setIsSubmitting(true);

    const scoreData: CreateHighScoreDto = {
      nickname,
      score,
      lettersCorrect,
      accuracy: gameStats.successPercentage,
      timePlayed: gameStats.timeInSeconds,
    };

    try {
      const response = await fetch("/api/scores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scoreData),
      });

      if (!response.ok) throw new Error("Failed to save score");

      setScoreSaved(true);
      setShowNicknamePrompt(false);
    } catch (error) {
      console.error("Failed to save score:", error);
      alert("Failed to save score. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
    <>
      <Overlay>
        <Container>
          <Panel>
            <Title>GAME OVER</Title>
            <Performance color={performance.color}>
              {performance.msg}
            </Performance>

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
                label="Correctly typed letters"
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

            {!scoreSaved && (
              <SubmitScoreButton onClick={() => setShowNicknamePrompt(true)}>
                💾 Submit Score
              </SubmitScoreButton>
            )}
            <ButtonGroup>
              <TryAgainButton onClick={onTryAgain}>🔁 Try Again</TryAgainButton>
              <MainMenuButton onClick={onRestart}>🚀 Main Menu</MainMenuButton>
            </ButtonGroup>
            {scoreSaved && (
              <ScoreSubmittedButton>✓ Score Submitted!</ScoreSubmittedButton>
            )}
          </Panel>
        </Container>
      </Overlay>

      {showNicknamePrompt && (
        <NicknamePrompt
          onSubmit={handleSaveScore}
          onSkip={() => setShowNicknamePrompt(false)}
          isSubmitting={isSubmitting}
        />
      )}
    </>
  );
};

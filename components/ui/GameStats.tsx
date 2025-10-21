import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { GAME_CONFIG } from "../../constants/gameConfig";

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(2); }
  100% { transform: scale(1); }
`;

const particleBurst = keyframes`
  0% { transform: scale(0) translate(0, 0); opacity: 1; }
  100% { transform: scale(2) translate(var(--x), var(--y)); opacity: 0; }
`;

const StatsContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 24px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 20px;
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

const StatValue = styled.div<{ $color?: string; $pulse?: boolean }>`
  color: ${({ $color }) => $color || "white"};
  font-size: 24px;
  font-weight: 900;
  text-align: center;
  font-family: "Orbitron", sans-serif;
  text-shadow: 0 0 10px ${({ $color }) => $color || "rgba(255, 255, 255, 0.3)"};
  animation: ${({ $pulse }) => ($pulse ? pulse : "none")} 0.5s ease-in-out;
`;

const Particle = styled.div`
  position: absolute;
  width: 6px;
  height: 6px;
  background: gold;
  border-radius: 50%;
  animation: ${particleBurst} 0.8s ease-out forwards;
`;

interface GameStatsProps {
  time: number;
  lettersCorrect: number;
  score: number;
  speed: number;
  comboCount: number;
  comboMultiplier: number;
}

export const GameStats: React.FC<GameStatsProps> = ({
  time,
  lettersCorrect,
  score,
  speed,
  comboCount,
  comboMultiplier,
}) => {
  const timeInSeconds = Math.floor(time / GAME_CONFIG.FRAME_RATE);
  const baseSpeed = GAME_CONFIG.START_LETTER_SPEED || 1;
  const speedPercent = speed ? ((speed / baseSpeed) * 100).toFixed(0) : null;

  const [prevMultiplier, setPrevMultiplier] = useState(comboMultiplier);
  const [pulseActive, setPulseActive] = useState(false);
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number }[]
  >([]);

  // Trigger pulse + particle burst when multiplier increases
  useEffect(() => {
    if (comboMultiplier > prevMultiplier) {
      setPulseActive(true);

      const newParticles = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 200,
        y: (Math.random() - 0.5) * 200,
      }));
      setParticles(newParticles);

      const timeout = setTimeout(() => {
        setPulseActive(false);
        setParticles([]);
      }, 800);

      return () => clearTimeout(timeout);
    }

    setPrevMultiplier(comboMultiplier);
  }, [comboMultiplier, prevMultiplier]);

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

      <StatPanel>
        <StatLabel>Speed</StatLabel>
        <StatValue>{speedPercent ? `${speedPercent}%` : "—"}</StatValue>
      </StatPanel>

      <StatPanel>
        <StatLabel>Combo ({comboCount})</StatLabel>
        <StatValue $color="gold" $pulse={pulseActive}>
          ×{comboMultiplier.toFixed(1)}
        </StatValue>

        {particles.map((p) => (
          <Particle
            key={p.id}
            style={
              {
                "--x": `${p.x}px`,
                "--y": `${p.y}px`,
              } as React.CSSProperties
            }
          />
        ))}
      </StatPanel>
    </StatsContainer>
  );
};

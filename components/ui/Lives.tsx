import React, { useEffect, useState } from "react";
import styled, { keyframes, css } from "styled-components";

const glowBurst = keyframes`
  0% { transform: scale(0.5); opacity: 0; filter: brightness(2) drop-shadow(0 0 15px gold); }
  40% { transform: scale(1.4); opacity: 1; filter: brightness(3) drop-shadow(0 0 30px gold); }
  100% { transform: scale(1); opacity: 1; filter: brightness(1) drop-shadow(0 0 10px gold); }
`;

const shimmerTrail = keyframes`
  0% { background-position: -200% 0; opacity: 0.6; }
  50% { opacity: 1; }
  100% { background-position: 200% 0; opacity: 0; }
`;

const expandContainer = keyframes`
  0% { transform: translateY(-50%) scale(1); box-shadow: 0 0 0 rgba(255,215,0,0); }
  40% { transform: translateY(-50%) scale(1.1); box-shadow: 0 0 25px rgba(255,215,0,0.6); }
  70% { transform: translateY(-50%) scale(0.97); }
  100% { transform: translateY(-50%) scale(1); box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
`;

const LivesContainer = styled.div<{ $animKey: number }>`
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  padding: 8px;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  animation: ${expandContainer} 0.8s ease-out;
  animation-play-state: paused;

  /* Trick to retrigger animation each time key changes */
  &.animate {
    animation-play-state: running;
  }
`;

const LivesLabel = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 20px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-align: center;
`;

const HeartsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const HeartWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ShimmerEffect = styled.div`
  position: absolute;
  width: 80%;
  height: 80%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 215, 0, 0.8),
    transparent
  );
  background-size: 200% 100%;
  animation: ${shimmerTrail} 1.5s ease-in-out forwards;
  border-radius: 50%;
  filter: blur(2px);
`;

const Heart = styled.div<{ $filled: boolean; $isNew?: boolean }>`
  font-size: 50px;
  transition: all 0.4s ease;
  filter: ${(p) => (p.$filled ? "none" : "grayscale(100%) brightness(0.5)")};
  opacity: ${(p) => (p.$filled ? "1" : "0.5")};
  display: flex;
  justify-content: center;
  align-items: center;

  ${(p) =>
    p.$filled &&
    css`
      animation: heartbeat 1.5s ease-in-out infinite;
    `}

  ${(p) =>
    p.$isNew &&
    css`
      animation: ${glowBurst} 1.2s ease-out;
    `}

  @keyframes heartbeat {
    0%,
    100% {
      transform: scale(1);
    }
    10%,
    30% {
      transform: scale(1.1);
    }
    20%,
    40% {
      transform: scale(1);
    }
  }
`;

interface LivesProps {
  lives: number;
  maxLives?: number;
}

export const Lives: React.FC<LivesProps> = ({ lives, maxLives = 5 }) => {
  const [prevMax, setPrevMax] = useState(maxLives);
  const [newHeartIndex, setNewHeartIndex] = useState<number | null>(null);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (maxLives > prevMax) {
      setNewHeartIndex(maxLives - 1);

      // bump animation key to retrigger
      setAnimKey((k) => k + 1);

      const timer = setTimeout(() => setNewHeartIndex(null), 1200);
      setPrevMax(maxLives);
      return () => clearTimeout(timer);
    }
  }, [maxLives, prevMax]);

  return (
    <LivesContainer key={animKey} className="animate" $animKey={animKey}>
      <LivesLabel>Lives</LivesLabel>
      <HeartsContainer>
        {Array.from({ length: maxLives }, (_, index) => (
          <HeartWrapper key={index}>
            {newHeartIndex === index && <ShimmerEffect />}
            <Heart $filled={index < lives} $isNew={index === newHeartIndex}>
              ❤️
            </Heart>
          </HeartWrapper>
        ))}
      </HeartsContainer>
    </LivesContainer>
  );
};

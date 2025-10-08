import React from "react";
import styled from "styled-components";

const LivesContainer = styled.div`
  position: absolute; /* remove from flow */
  top: 50%; /* center vertically */
  left: 0; /* stick to left */
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
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

const Heart = styled.div<{ $filled: boolean }>`
  font-size: 60px;
  transition: all 0.4s ease;
  filter: ${(props) =>
    props.$filled ? "none" : "grayscale(100%) brightness(0.5)"};
  opacity: ${(props) => (props.$filled ? "1" : "0.5")};

  ${(props) =>
    props.$filled &&
    `
    animation: heartbeat 1.5s ease-in-out infinite;
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
  return (
    <LivesContainer>
      <LivesLabel>Lives</LivesLabel>
      <HeartsContainer>
        {Array.from({ length: maxLives }, (_, index) => (
          <Heart key={index} $filled={index < lives}>
            ❤️
          </Heart>
        ))}
      </HeartsContainer>
    </LivesContainer>
  );
};

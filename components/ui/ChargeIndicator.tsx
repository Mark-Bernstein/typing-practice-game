import React, { useEffect, useRef, useState } from "react";
import styled, { keyframes, css } from "styled-components";
import { ChargeState } from "../../types/game";

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.6));
  }
  50% {
    transform: scale(1.05);
    filter: drop-shadow(0 0 20px rgba(255, 215, 0, 1));
  }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const overchargeGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 30px rgba(255, 215, 0, 0.8),
                0 0 60px rgba(255, 215, 0, 0.5),
                inset 0 0 20px rgba(255, 255, 255, 0.3);
  }
  50% {
    box-shadow: 0 0 50px rgba(255, 215, 0, 1),
                0 0 100px rgba(255, 215, 0, 0.8),
                inset 0 0 30px rgba(255, 255, 255, 0.5);
  }
`;

const ChargeContainer = styled.div`
  position: absolute;
  width: 190px;
  right: 0px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 1000;
`;

const CircularGauge = styled.div<{
  $percentage: number;
  $full: boolean;
  $overcharge: boolean;
}>`
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #00f2ff;
  overflow: hidden;
  transition: border-color 0.3s ease;

  ${(p) =>
    p.$full &&
    css`
      animation: ${pulse} 1.5s ease-in-out infinite;
      border-color: #76691e;
    `}

  ${(p) =>
    p.$overcharge &&
    css`
      animation: ${overchargeGlow} 1s ease-in-out infinite;
      border-color: #e100ff;
      background: linear-gradient(
        135deg,
        rgba(255, 215, 0, 0.3),
        rgba(255, 255, 255, 0.2)
      );
    `}

&::before {
    content: "";
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    background: conic-gradient(
      from 0deg,
      #ffd700 0%,
      #ffd700 ${(props) => props.$percentage}%,
      transparent ${(props) => props.$percentage}%,
      transparent 100%
    );
    mask: radial-gradient(
      circle,
      transparent 0%,
      transparent calc(50% - 6px),
      black calc(50% - 6px),
      black 50%
    );
    -webkit-mask: radial-gradient(
      circle,
      transparent 0%,
      transparent calc(50% - 6px),
      black calc(50% - 6px),
      black 50%
    );
    filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.8));
    transition: background 0.4s linear; /* 👈 smooth hardware-accelerated change */
    will-change: background;
  }

  ${(props) =>
    props.$full &&
    css`
      &::before {
        filter: drop-shadow(0 0 15px rgba(255, 215, 0, 1));
      }
    `}

  ${(props) =>
    props.$overcharge &&
    css`
      &::after {
        content: "";
        position: absolute;
        inset: -1px;
        border-radius: 50%;
        background: conic-gradient(
          from 0deg,
          transparent,
          #84ff00,
          transparent,
          #ffe600,
          transparent
        );
        animation: ${rotate} 0.5s linear infinite;
        opacity: 1;
      }
    `}
`;

const ChargeValue = styled.div<{ $full: boolean; $overcharge: boolean }>`
  font-size: 28px;
  font-weight: 900;
  color: ${(p) => (p.$full ? "#ff0000" : "rgba(255, 255, 255, 1)")};
  z-index: 1;
  transition: all 0.3s ease;
  font-family: "Orbitron", sans-serif;
`;

const ChargeLabel = styled.div<{ $full: boolean; $overcharge: boolean }>`
  color: ${(p) =>
    p.$full || p.$overcharge ? "#ffd700" : "rgba(255, 255, 255, 0.6)"};
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  text-shadow: ${(p) =>
    p.$full || p.$overcharge ? "0 0 8px rgba(255, 215, 0, 0.8)" : "none"};
  transition: all 0.3s ease;
`;

const SpacebarHint = styled.div<{ $show: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  line-height: 1;
  height: fit-content;
  margin-top: 4px;
  padding: 6px 12px;
  background: linear-gradient(
    90deg,
    rgba(255, 215, 0, 0.2),
    rgba(255, 255, 255, 0.2),
    rgba(255, 215, 0, 0.2)
  );
  background-size: 200% 100%;
  border: 1px solid rgba(255, 215, 0, 0.5);
  border-radius: 8px;
  color: #ffd700;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  opacity: ${(p) => (p.$show ? 1 : 0)};
  transform: translateY(${(p) => (p.$show ? 0 : "10px")});
  transition: all 0.3s ease;
  animation: ${shimmer} 2s linear infinite;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.8);
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
  margin: 0 16px;
`;

const OverchargeTimer = styled.div`
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  color: #ffd700;
  font-size: 20px;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 1);
  white-space: nowrap;
`;

interface ChargeIndicatorProps {
  chargeState: ChargeState;
  gameTime: number;
}

export const ChargeIndicator: React.FC<ChargeIndicatorProps> = ({
  chargeState,
  gameTime,
}) => {
  const percentageTarget = (chargeState.current / chargeState.max) * 100;
  const [displayPercentage, setDisplayPercentage] = useState(percentageTarget);
  const isFull = chargeState.current >= chargeState.max;
  const isOvercharge = chargeState.overchargeActive;
  const lastDisplayRef = useRef(displayPercentage);

  // Smooth interpolation of fill animation
  useEffect(() => {
    let frame: number;
    const duration = 200;
    const start = performance.now();
    const from = lastDisplayRef.current;
    const to = percentageTarget;

    const animate = (time: number) => {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * eased;
      setDisplayPercentage(current);
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        lastDisplayRef.current = to;
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [percentageTarget]);

  const remainingTime = isOvercharge
    ? Math.max(0, Math.ceil((chargeState.overchargeEndTime - gameTime) / 60))
    : 0;

  return (
    <ChargeContainer>
      <CircularGauge
        $percentage={displayPercentage}
        $full={isFull && !isOvercharge}
        $overcharge={isOvercharge}
      >
        <ChargeValue $full={isFull} $overcharge={isOvercharge}>
          {Math.floor(displayPercentage)}%
        </ChargeValue>
      </CircularGauge>

      <ChargeLabel $full={isFull} $overcharge={isOvercharge}>
        {isOvercharge ? "⚡ OVERCHARGE ⚡" : "Charge Meter"}
      </ChargeLabel>

      <SpacebarHint $show={isFull && !isOvercharge}>
        Press SPACE to activate!
      </SpacebarHint>

      {isOvercharge && remainingTime > 0 && (
        <OverchargeTimer>{remainingTime}s remaining</OverchargeTimer>
      )}
    </ChargeContainer>
  );
};

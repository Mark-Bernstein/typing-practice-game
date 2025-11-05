import React, { useEffect, useRef, useState, memo } from "react";
import styled, { keyframes, css } from "styled-components";
import { ChargeState } from "../../types/game";

/* === LIGHTWEIGHT ANIMATIONS === */
const pulse = keyframes`
  0%,100% { transform: scale(1); box-shadow: 0 0 8px #ffd700; }
  50% { transform: scale(1.05); box-shadow: 0 0 16px #ffd700; }
`;
const rotate = keyframes`from{transform:rotate(0deg);}to{transform:rotate(360deg);}`;
const shimmer = keyframes`
  0%{background-position:-200% 0;}100%{background-position:200% 0;}
`;
const overchargeGlow = keyframes`
  0%,100%{box-shadow:0 0 20px #ffd700,inset 0 0 15px rgba(255,255,255,.4);}
  50%{box-shadow:0 0 35px #ffd700,inset 0 0 25px rgba(255,255,255,.6);}
`;

const ChargeContainer = styled.div`
  position: absolute;
  width: 190px;
  right: 0;
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
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #00f2ff;
  overflow: hidden;
  transition: border-color 0.3s ease, background 0.3s ease;

  ${(p) =>
    p.$full &&
    css`
      animation: ${pulse} 2s ease-in-out infinite;
      border-color: #ffd700;
    `}
  ${(p) =>
    p.$overcharge &&
    css`
      animation: ${overchargeGlow} 1.5s ease-in-out infinite;
      border-color: #e100ff;
      background: radial-gradient(circle, rgba(255, 215, 0, 0.15), transparent);
    `}
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: conic-gradient(
      #ffd700 ${(props) => props.$percentage}%,
      rgba(255, 255, 255, 0.1) ${(props) => props.$percentage}% 100%
    );
    mask: radial-gradient(circle, transparent 60%, black 61%);
    transition: background 0.2s linear;
  }
  ${(props) =>
    props.$overcharge &&
    css`
      &::after {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.4);
        animation: ${rotate} 1s linear infinite;
      }
    `}
`;

const ChargeValue = styled.div<{ $full: boolean; $overcharge: boolean }>`
  font-size: 28px;
  font-weight: 900;
  color: ${(p) => (p.$overcharge ? "#ff00ff" : p.$full ? "#ffd700" : "#fff")};
  font-family: "Orbitron", sans-serif;
  z-index: 1;
  transition: color 0.3s ease;
`;

const ChargeLabel = styled.div<{ $full: boolean; $overcharge: boolean }>`
  color: ${(p) =>
    p.$overcharge ? "#ff00ff" : p.$full ? "#ffd700" : "rgba(255,255,255,0.7)"};
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  text-shadow: ${(p) =>
    p.$full || p.$overcharge ? "0 0 8px rgba(255,215,0,0.7)" : "none"};
  transition: all 0.3s ease;
`;

const SpacebarHint = styled.div<{ $show: boolean }>`
  opacity: ${(p) => (p.$show ? 1 : 0)};
  transform: translateY(${(p) => (p.$show ? 0 : "8px")});
  background: linear-gradient(
    90deg,
    rgba(255, 215, 0, 0.2),
    rgba(255, 255, 255, 0.2),
    rgba(255, 215, 0, 0.2)
  );
  border: 1px solid rgba(255, 215, 0, 0.4);
  border-radius: 8px;
  color: #ffd700;
  padding: 6px 10px;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  animation: ${shimmer} 3s linear infinite;
  transition: opacity 0.4s ease, transform 0.4s ease;
`;

const OverchargeTimer = styled.div`
  position: absolute;
  bottom: 0px;
  left: 50%;
  transform: translateX(-50%);
  color: #ffd700;
  font-size: 32px;
  font-weight: 700;
  text-shadow: 0 0 6px rgba(255, 215, 0, 0.8);
`;

interface ChargeIndicatorProps {
  chargeState: ChargeState;
  gameTime: number;
}

const ChargeIndicatorBase: React.FC<ChargeIndicatorProps> = ({
  chargeState,
  gameTime,
}) => {
  const rawTarget = (chargeState.current / chargeState.max) * 100;
  const percentageTarget = Math.min(100, Math.max(0, rawTarget)); // clamp 0–100
  const [displayPercentage, setDisplayPercentage] = useState(percentageTarget);
  const isFull = chargeState.current >= chargeState.max;
  const isOvercharge = chargeState.overchargeActive;
  const lastDisplayRef = useRef(displayPercentage);

  /* === Smooth, bounded interpolation === */
  useEffect(() => {
    if (Math.abs(lastDisplayRef.current - percentageTarget) < 0.1) {
      setDisplayPercentage(percentageTarget);
      return;
    }
    let frame: number;
    const start = performance.now();
    const from = lastDisplayRef.current;
    const to = percentageTarget;
    const duration = 180;

    const animate = (time: number) => {
      const progress = Math.min((time - start) / duration, 1);
      const eased = progress * (2 - progress);
      const current = from + (to - from) * eased;
      setDisplayPercentage(current);
      if (progress < 1) frame = requestAnimationFrame(animate);
      else {
        lastDisplayRef.current = to;
        setDisplayPercentage(to);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [percentageTarget]);

  const remainingTime = isOvercharge
    ? Math.max(0, Math.ceil((chargeState.overchargeEndTime - gameTime) / 60))
    : 0;

  const shownValue = Math.round(displayPercentage);

  return (
    <ChargeContainer>
      <CircularGauge
        $percentage={displayPercentage}
        $full={isFull && !isOvercharge}
        $overcharge={isOvercharge}
      >
        <ChargeValue $full={isFull} $overcharge={isOvercharge}>
          {shownValue}%
        </ChargeValue>
      </CircularGauge>

      <ChargeLabel $full={isFull} $overcharge={isOvercharge}>
        {isOvercharge ? "⚡ OVERCHARGE ⚡" : "Charge Meter"}
      </ChargeLabel>

      <SpacebarHint $show={isFull && !isOvercharge}>
        Press SPACE to activate!
      </SpacebarHint>
      {isOvercharge && remainingTime > 0 && (
        <OverchargeTimer>{remainingTime}s</OverchargeTimer>
      )}
    </ChargeContainer>
  );
};

export const ChargeIndicator = memo(ChargeIndicatorBase);

// src/components/ui/PointsGainEffect.tsx
import React from "react";
import styled, { keyframes } from "styled-components";

const floatUp = keyframes`
  0% { opacity: 0; transform: translateY(20px) scale(0.9); }
  20% { opacity: 1; transform: translateY(0) scale(1); }
  80% { opacity: 1; transform: translateY(-20px) scale(1.05); }
  100% { opacity: 0; transform: translateY(-40px) scale(0.9); }
`;

const FloatingText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: "Orbitron", sans-serif;
  font-weight: 900;
  font-size: 36px;
  color: #00ffff;
  text-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 40px #ff00ff;
  pointer-events: none;
  animation: ${floatUp} 1s ease-out forwards;
  z-index: 120;
`;

interface PointsGainEffectProps {
  points: number;
}

export const PointsGainEffect: React.FC<PointsGainEffectProps> = ({
  points,
}) => {
  return <FloatingText>{`+${points} points`}</FloatingText>;
};

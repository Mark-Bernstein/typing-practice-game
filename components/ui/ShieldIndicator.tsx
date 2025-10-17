import React from "react";
import styled, { keyframes, css } from "styled-components";
import { ShieldState } from "../../types/game";

const shimmer = keyframes`
  0% { background-position: -100% 0; }
  100% { background-position: 200% 0; }
`;

const ShieldContainer = styled.div<{ $active: boolean }>`
  position: absolute;
  top: 80px;
  right: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: ${(props) =>
    props.$active
      ? "linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 255, 0, 0.2))"
      : "rgba(0, 0, 0, 0.4)"};
  backdrop-filter: blur(10px);
  border: 2px solid
    ${(props) => (props.$active ? "#ffd700" : "rgba(255, 255, 255, 0.2)")};
  border-radius: 16px;
  box-shadow: ${(props) =>
    props.$active
      ? "0 0 20px rgba(255, 215, 0, 0.6), 0 0 40px rgba(255, 215, 0, 0.3)"
      : "0 4px 12px rgba(0, 0, 0, 0.3)"};
  transition: all 0.3s ease;
  z-index: 1000;

  ${(props) =>
    props.$active &&
    css`
      &::before {
        content: "";
        position: absolute;
        inset: -2px;
        border-radius: 16px;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 215, 0, 0.5),
          transparent
        );
        background-size: 200% 100%;
        animation: ${shimmer} 2s linear infinite;
        z-index: -1;
      }
    `}
`;

const ShieldIcon = styled.div<{ $active: boolean }>`
  font-size: 32px;
  filter: ${(props) =>
    props.$active
      ? "drop-shadow(0 0 10px #ffd700)"
      : "grayscale(100%) brightness(0.5)"};
  transition: all 0.3s ease;
`;

const ChargesContainer = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 100px;
`;

const ChargeIcon = styled.div<{ $filled: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${(props) =>
    props.$filled
      ? "linear-gradient(135deg, #ffd700, #ffed4e)"
      : "rgba(255, 255, 255, 0.2)"};
  box-shadow: ${(props) =>
    props.$filled ? "0 0 8px rgba(255, 215, 0, 0.8)" : "none"};
  transition: all 0.3s ease;
`;

const ChargeText = styled.div<{ $active: boolean }>`
  color: ${(props) => (props.$active ? "#ffd700" : "rgba(255, 255, 255, 0.5)")};
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 1px;
`;

interface ShieldIndicatorProps {
  shieldState: ShieldState;
}

export const ShieldIndicator: React.FC<ShieldIndicatorProps> = ({
  shieldState,
}) => {
  return (
    <ShieldContainer $active={shieldState.active}>
      <ShieldIcon $active={shieldState.active}>🛡️</ShieldIcon>
      <ChargesContainer>
        {Array.from({ length: shieldState.maxCharges }, (_, index) => (
          <ChargeIcon key={index} $filled={index < shieldState.charges} />
        ))}
      </ChargesContainer>
      <ChargeText $active={shieldState.active}>
        {shieldState.charges}/{shieldState.maxCharges}
      </ChargeText>
    </ShieldContainer>
  );
};

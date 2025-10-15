import React from "react";
import styled, { keyframes } from "styled-components";

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 10px rgba(34, 211, 238, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(34, 211, 238, 0.6), 0 0 30px rgba(34, 211, 238, 0.3);
  }
`;

const ControlsContainer = styled.div`
  position: fixed;
  bottom: 30px;
  left: 30px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 10000;
  animation: slideInLeft 0.6s ease-out;

  @keyframes slideInLeft {
    from {
      transform: translateX(-100px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 28px 40px;
  background: ${(props) =>
    props.$active
      ? "linear-gradient(135deg, rgba(34, 211, 238, 0.3) 0%, rgba(147, 51, 234, 0.3) 100%)"
      : "rgba(0, 0, 0, 0.6)"};
  backdrop-filter: blur(12px);
  border: 2px solid
    ${(props) => (props.$active ? "#22d3ee" : "rgba(255, 255, 255, 0.2)")};
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${(props) =>
    props.$active
      ? "0 0 20px rgba(34, 211, 238, 0.4)"
      : "0 4px 12px rgba(0, 0, 0, 0.3)"};
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateX(5px);
    border-color: #22d3ee;
    background: linear-gradient(
      135deg,
      rgba(34, 211, 238, 0.4) 0%,
      rgba(147, 51, 234, 0.4) 100%
    );
    animation: ${glow} 2s ease-in-out infinite;
  }

  &:active {
    transform: translateX(2px) scale(0.98);
  }

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      transparent 0%,
      rgba(255, 255, 255, 0.1) 50%,
      transparent 100%
    );
    transform: translateX(-100%);
    transition: transform 0.6s;
  }

  &:hover::before {
    transform: translateX(100%);
  }

  @media screen and (max-width: 1440px) {
    padding: 12px;
    max-width: 200px;
  }
`;

const IconWrapper = styled.div<{ $active: boolean }>`
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => (props.$active ? "#22d3ee" : "rgba(255, 255, 255, 0.6)")};
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;

  ${ToggleButton}:hover & {
    color: #22d3ee;
    transform: scale(1.1);
  }
`;

const Label = styled.span<{ $active: boolean }>`
  color: ${(props) => (props.$active ? "#ffffff" : "rgba(255, 255, 255, 0.7)")};
  font-weight: 700;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: "Orbitron", monospace;
  position: relative;
  z-index: 1;
  transition: color 0.3s ease;

  ${ToggleButton}:hover & {
    color: #ffffff;
  }
`;

const StatusIndicator = styled.div<{ $active: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(props) => (props.$active ? "#00ff88" : "#ff4444")};
  box-shadow: ${(props) =>
    props.$active ? "0 0 10px #00ff88" : "0 0 10px #ff4444"};
  position: relative;
  z-index: 1;
  animation: ${(props) =>
    props.$active ? "blink 2s ease-in-out infinite" : "none"};

  @keyframes blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
  }
`;

interface AudioControlsProps {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  onToggleMusic: () => void;
  onToggleSFX: () => void;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  musicEnabled,
  sfxEnabled,
  onToggleMusic,
  onToggleSFX,
}) => {
  return (
    <ControlsContainer>
      <ToggleButton $active={musicEnabled} onClick={onToggleMusic}>
        <IconWrapper $active={musicEnabled}>
          {musicEnabled ? "🔊" : "🔇"}
        </IconWrapper>

        <Label $active={musicEnabled}>
          Music {musicEnabled ? "ON" : "OFF"}
        </Label>
        <StatusIndicator $active={musicEnabled} />
      </ToggleButton>
      <ToggleButton $active={sfxEnabled} onClick={onToggleSFX}>
        <IconWrapper $active={sfxEnabled}>
          {sfxEnabled ? "🔊" : "🔇"}
        </IconWrapper>
        <Label $active={sfxEnabled}>SFX {sfxEnabled ? "ON" : "OFF"}</Label>
        <StatusIndicator $active={sfxEnabled} />
      </ToggleButton>
    </ControlsContainer>
  );
};

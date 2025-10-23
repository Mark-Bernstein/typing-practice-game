import React from "react";
import styled, { keyframes } from "styled-components";

const lavaBubble = keyframes`
  0%, 100% { transform: scaleY(1); opacity: 0.5; }
  50% { transform: scaleY(2); opacity: 1; }
`;

const lavaFlow = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const LavaLine = styled.div<{ height?: number; width?: number }>`
  position: absolute;
  bottom: 0;
  width: ${(props) => props.width}px;
  height: ${({ height }) => height || 30}px;
  border-radius: 0 0 12px 12px;
  background: linear-gradient(
    270deg,
    #ffffff,
    #ff8c00,
    #ff1a00,
    #ff6f00,
    #000000
  );
  background-size: 800% 400%;
  animation: ${lavaFlow} 6s ease-in-out infinite;

  &::before {
    content: "";
    position: absolute;
    top: -5px;
    left: 0;
    width: 100%;
    height: 10px;
    border-radius: 50%;
    background: radial-gradient(circle, #ff4500 0%, transparent 70%);
    opacity: 0.5;
    animation: ${lavaBubble} 2s ease-in-out infinite alternate;
  }

  box-shadow: 0 -4px 20px rgba(255, 72, 0, 0.5),
    0 -2px 10px rgba(255, 140, 0, 0.3);
`;

interface LavaFloorProps {
  height?: number;
  width?: number;
}

export const LavaFloor: React.FC<LavaFloorProps> = ({ height, width }) => {
  return <LavaLine height={height} width={width} />;
};

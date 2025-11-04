import React, { memo, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import { motion } from "framer-motion";
import { MultiplierPowerUp } from "../../types/game";

const glow = keyframes`
  0%, 100% { filter: drop-shadow(0 0 10px #ff00ff) drop-shadow(0 0 20px #00ffff); }
  50% { filter: drop-shadow(0 0 20px #ff00ff) drop-shadow(0 0 40px #00ffff); }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const StyledMultiplier = styled(motion.div)<{ $size: number }>`
  position: absolute;
  font-size: ${(props) => props.$size * 1.5}px;
  line-height: 1.6;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  cursor: default;
  z-index: 15;
  will-change: transform, opacity, filter;
`;

const KeyHint = styled.div<{ $size: number }>`
  position: absolute;
  top: 55%;
  left: 48%;
  transform: translate(-50%, -50%);
  font-size: ${(props) => props.$size * 0.8 + 16}px;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 0 5px #030003, 0 0 10px #00ffff;
  z-index: 1;
`;

const MultiplierIcon = styled.div<{ $size: number }>`
  font-size: ${(props) => props.$size * 2}px;
  animation: ${glow} 2s ease-in-out infinite;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RotatingRing = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top-color: #ff00ff;
  border-right-color: #00ffff;
  border-radius: 50%;
  animation: ${rotate} 0.5s linear infinite;
`;

interface FallingMultiplierProps {
  multiplier: MultiplierPowerUp;
  letterSize: number;
}

export const FallingMultiplier: React.FC<FallingMultiplierProps> = memo(
  ({ multiplier, letterSize }) => {
    const entryOffset = useMemo(() => {
      const randomX = Math.random() * 200 - 100;
      return { x: randomX, y: -100 };
    }, []);

    return (
      <StyledMultiplier
        $size={letterSize}
        initial={{
          opacity: 0,
          x: multiplier.x + entryOffset.x,
          y: multiplier.y + entryOffset.y,
          scale: 0.5,
        }}
        animate={{
          opacity: 1,
          x: multiplier.x,
          y: multiplier.y,
          scale: 1,
        }}
        exit={{
          opacity: 0,
          scale: 0.2,
          y: multiplier.y - 30,
          rotateZ: 360,
        }}
        transition={{
          duration: 0.5,
          ease: "easeOut",
        }}
      >
        <MultiplierIcon $size={letterSize}>
          <RotatingRing />⚡<KeyHint $size={letterSize}>^</KeyHint>
        </MultiplierIcon>
      </StyledMultiplier>
    );
  }
);

FallingMultiplier.displayName = "FallingMultiplier";

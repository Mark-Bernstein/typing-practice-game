import React, { memo, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import { motion } from "framer-motion";
import { ShieldPowerUp } from "../../types/game";

const glow = keyframes`
  0%, 100% { filter: drop-shadow(0 0 10px #ffd700) drop-shadow(0 0 20px #ffd700); }
  50% { filter: drop-shadow(0 0 20px #ffd700) drop-shadow(0 0 40px #ffd700); }
`;

const StyledShield = styled(motion.div)<{ $size: number }>`
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
  color: #ffd700;
`;

const KeyHint = styled.div<{ $size: number }>`
  position: absolute;
  top: 48%;
  left: 48%;
  transform: translate(-50%, -50%);
  font-size: ${(props) => props.$size}px;
  font-weight: bold;
  color: #000000;
  text-shadow: 0 0 5px #ffffff;
  z-index: 1;
`;

const ShieldIcon = styled.div<{ $size: number }>`
  font-size: ${(props) => props.$size * 1.5}px;
  animation: ${glow} 2s ease-in-out infinite;
  position: relative;
`;

interface FallingShieldProps {
  shield: ShieldPowerUp;
  letterSize: number;
}

export const FallingShield: React.FC<FallingShieldProps> = memo(
  ({ shield, letterSize }) => {
    const entryOffset = useMemo(() => {
      const randomX = Math.random() * 200 - 100;
      return { x: randomX, y: -100 };
    }, []);

    return (
      <StyledShield
        $size={letterSize}
        initial={{
          opacity: 0,
          x: shield.x + entryOffset.x,
          y: shield.y + entryOffset.y,
          scale: 0.5,
        }}
        animate={{
          opacity: 1,
          x: shield.x,
          y: shield.y,
          scale: 1,
        }}
        exit={{
          opacity: 0,
          scale: 0.2,
          y: shield.y - 30,
          rotateZ: 360,
        }}
        transition={{
          duration: 0.5,
          ease: "easeOut",
        }}
      >
        <ShieldIcon $size={letterSize}>
          🛡️
          <KeyHint $size={letterSize}>!</KeyHint>
        </ShieldIcon>
      </StyledShield>
    );
  }
);

FallingShield.displayName = "FallingShield";

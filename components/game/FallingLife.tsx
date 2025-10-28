import React, { memo, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import { motion } from "framer-motion";
import { LifePowerUp } from "../../types/game";

const glow = keyframes`
  0%, 100% { filter: drop-shadow(0 0 10px #ff1744) drop-shadow(0 0 20px #ff1744); }
  50% { filter: drop-shadow(0 0 20px #ff1744) drop-shadow(0 0 40px #ff1744); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
`;

const StyledLife = styled(motion.div)<{ $size: number }>`
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
  color: #ff1744;
`;

const KeyHint = styled.div<{ $size: number }>`
  position: absolute;
  top: 54%;
  left: 49%;
  transform: translate(-50%, -50%);
  font-size: ${(props) => props.$size * 0.8}px;
  font-weight: bold;
  color: limegreen;
  text-shadow: 0 0 5px #000000, 0 0 10px #020000;
  z-index: 1;
`;

const LifeIcon = styled.div<{ $size: number }>`
  font-size: ${(props) => props.$size * 1.5}px;
  animation: ${glow} 2s ease-in-out infinite, ${pulse} 1.5s ease-in-out infinite;
  position: relative;
`;

interface FallingLifeProps {
  life: LifePowerUp;
  letterSize: number;
}

export const FallingLife: React.FC<FallingLifeProps> = memo(
  ({ life, letterSize }) => {
    const entryOffset = useMemo(() => {
      const randomX = Math.random() * 200 - 100;
      return { x: randomX, y: -100 };
    }, []);

    return (
      <StyledLife
        $size={letterSize}
        initial={{
          opacity: 0,
          x: life.x + entryOffset.x,
          y: life.y + entryOffset.y,
          scale: 0.5,
        }}
        animate={{
          opacity: 1,
          x: life.x,
          y: life.y,
          scale: 1,
        }}
        exit={{
          opacity: 0,
          scale: 3,
          y: life.y - 30,
        }}
        transition={{
          duration: 0.5,
          ease: "easeOut",
        }}
      >
        <LifeIcon $size={letterSize}>
          ❤️
          <KeyHint $size={letterSize}>$</KeyHint>
        </LifeIcon>
      </StyledLife>
    );
  }
);

FallingLife.displayName = "FallingLife";

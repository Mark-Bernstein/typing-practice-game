import React, { memo, useMemo } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { LetterPosition } from "../../types/game";
import { GAME_CONFIG } from "../../constants/gameConfig";

const StyledLetter = styled(motion.div)<{ $color: string }>`
  position: absolute;
  font-size: ${GAME_CONFIG.LETTER_SIZE}px;
  font-weight: 900;
  font-family: "Quantico", "SF Mono", "Monaco", "Inconsolata", "Roboto Mono",
    monospace;
  color: ${(props) => props.$color};
  user-select: none;
  cursor: default;
  z-index: 10;
  text-shadow: 0 0 10px ${(props) => props.$color}CC,
    0 0 20px ${(props) => props.$color}80, 2px 2px 4px rgba(0, 0, 0, 0.8);
  will-change: transform, opacity, filter;
`;

interface FallingLetterProps {
  letter: LetterPosition;
}

export const FallingLetter: React.FC<FallingLetterProps> = memo(
  ({ letter }) => {
    const entryOffset = useMemo(() => {
      const randomX = Math.random() * 200 - 100; // -100 to +100
      const randomY = Math.random() * 200 - 100; // -100 to +100
      const randomRot = Math.random() * 60 - 30; // -30deg to +30deg
      return { x: randomX, y: randomY, rotate: randomRot };
    }, []);

    return (
      <StyledLetter
        $color={letter.color}
        initial={{
          opacity: 0,
          x: letter.x + entryOffset.x,
          y: letter.y + entryOffset.y,
          scale: 0.5,
          rotate: entryOffset.rotate,
          filter: "blur(8px)",
        }}
        animate={{
          opacity: 1,
          x: letter.x,
          y: letter.y,
          scale: 1,
          rotate: 0,
          filter: "blur(0px)",
        }}
        exit={{
          opacity: 0,
          scale: 0.2,
          y: letter.y - 30,
          rotate: entryOffset.rotate + 180,
          filter: "blur(6px) brightness(2)",
        }}
        transition={{
          duration: 0.5,
          ease: "easeOut",
        }}
      >
        {letter.letter}
      </StyledLetter>
    );
  }
);

FallingLetter.displayName = "FallingLetter";

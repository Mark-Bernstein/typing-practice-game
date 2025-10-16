import React, { memo } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { WordPosition } from "../../types/game";

const WordContainer = styled(motion.div)`
  position: absolute;
  display: flex;
  gap: 4px;
  align-items: flex-end; /* ensures letters align visually to bottom */
  user-select: none;
  cursor: default;
  z-index: 10;
  will-change: transform, opacity;
  line-height: 0.8;
`;

const Letter = styled.span<{ $color: string; $size: number; $typed: boolean }>`
  font-size: ${(props) => props.$size}px;
  font-weight: 900;
  line-height: 0.8;
  font-family: "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace;
  color: ${(props) => (props.$typed ? "#00ff88" : props.$color)};
  text-shadow: ${(props) =>
    props.$typed
      ? "0 0 15px #00ff88, 0 0 30px #00ff88, 2px 2px 4px rgba(0, 0, 0, 0.8)"
      : `0 0 10px ${props.$color}CC, 0 0 20px ${props.$color}80, 2px 2px 4px rgba(0, 0, 0, 0.8)`};
  transition: all 0.2s ease;
  transform: ${(props) => (props.$typed ? "scale(1.1)" : "scale(1)")};
`;

interface FallingWordProps {
  word: WordPosition;
  letterSize: number;
}

export const FallingWord: React.FC<FallingWordProps> = memo(
  ({ word, letterSize }) => {
    return (
      <WordContainer
        initial={{
          opacity: 0,
          x: word.x,
          y: word.y - 50,
          scale: 0.8,
        }}
        animate={{
          opacity: 1,
          x: word.x,
          y: word.y,
          scale: 1,
        }}
        exit={{
          opacity: 0,
          scale: 0.5,
          y: word.y - 30,
          rotate: 10,
        }}
        transition={{
          duration: 0.3,
          ease: "easeOut",
        }}
      >
        {word.word.split("").map((letter, index) => (
          <Letter
            key={`${word.id}-${index}`}
            $color={word.color}
            $size={letterSize}
            $typed={index < word.typedProgress}
          >
            {letter}
          </Letter>
        ))}
      </WordContainer>
    );
  }
);

FallingWord.displayName = "FallingWord";

import React, { memo } from "react";
import styled from "styled-components";
import { LetterPosition } from "../../types/game";
import { GAME_CONFIG } from "../../constants/gameConfig";

const StyledLetter = styled.div<{ $color: string }>`
  position: absolute;
  font-size: ${GAME_CONFIG.LETTER_SIZE}px;
  font-weight: 900;
  font-family: "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace;
  color: ${(props) => props.$color};
  user-select: none;
  cursor: default;
  z-index: 10;
  will-change: transform;
  text-shadow: 0 0 10px ${(props) => props.$color}CC,
    0 0 20px ${(props) => props.$color}80, 2px 2px 4px rgba(0, 0, 0, 0.8);
  transition: none;
`;

interface FallingLetterProps {
  letter: LetterPosition;
}

export const FallingLetter: React.FC<{ letter: LetterPosition }> = memo(
  ({ letter }) => {
    return (
      <StyledLetter
        $color={letter.color}
        style={{
          transform: `translate3d(${letter.x}px, ${letter.y}px, 0)`,
        }}
      >
        {letter.letter}
      </StyledLetter>
    );
  }
);

// Add display name to satisfy eslint react/display-name
FallingLetter.displayName = "FallingLetter";

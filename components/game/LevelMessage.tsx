import React from "react";
import styled from "styled-components";
import { getLevelMessage, getLevel } from "../../utils/gameUtils";

const LevelContainer = styled.div`
  position: absolute;
  top: 120px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 15;
`;

const LevelPanel = styled.div<{ $hasMessage: boolean }>`
  background: rgba(0, 0, 0, 0.6);
  font-size: 40px;
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: ${(props) => (props.$hasMessage ? "24px 32px" : "16px 24px")};
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5);
  text-align: center;
  animation: ${(props) =>
    props.$hasMessage ? "levelUp 0.6s ease-out" : "none"};

  @keyframes levelUp {
    0% {
      transform: scale(0.8) translateY(20px);
      opacity: 0;
    }
    50% {
      transform: scale(1.1) translateY(0);
    }
    100% {
      transform: scale(1) translateY(0);
      opacity: 1;
    }
  }
`;

const LevelNumber = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 4px;
`;

const LevelValue = styled.div`
  color: white;
  font-size: 20px;
  font-weight: 900;
  margin-bottom: 8px;
`;

const LevelMessageText = styled.div`
  color: #60a5fa;
  font-size: 18px;
  font-weight: 700;
  animation: bounce 1s ease-in-out infinite;

  @keyframes bounce {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-4px);
    }
  }
`;

interface LevelMessageProps {
  lettersCorrect: number;
}

export const LevelMessage: React.FC<LevelMessageProps> = ({
  lettersCorrect,
}) => {
  const message = getLevelMessage(lettersCorrect);
  const level = getLevel(lettersCorrect);

  return (
    <LevelContainer>
      <LevelPanel $hasMessage={!!message}>
        <LevelNumber>Level</LevelNumber>
        <LevelValue>{level}</LevelValue>
        {message && <LevelMessageText>{message}</LevelMessageText>}
      </LevelPanel>
    </LevelContainer>
  );
};

import React from "react";
import styled from "styled-components";

const InstructionsContainer = styled.div`
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
`;

const InstructionsPanel = styled.div`
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 20px 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  text-align: center;
  max-width: 600px;
  animation: fadeIn 1s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const MainText = styled.p`
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
`;

const SubText = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
  margin: 0;
  line-height: 1.5;
`;

const HighlightText = styled.span`
  color: #60a5fa;
  font-weight: 700;
`;

interface InstructionsProps {
  show: boolean;
}

export const Instructions: React.FC<InstructionsProps> = ({ show }) => {
  if (!show) return null;

  return (
    <InstructionsContainer>
      <InstructionsPanel>
        <MainText>Type the falling letters to score points!</MainText>
        <SubText>
          <HighlightText>Home row letters</HighlightText> (A, S, D, F, J, K, L)
          = 1 point • <HighlightText>All others</HighlightText> = 3 points
        </SubText>
      </InstructionsPanel>
    </InstructionsContainer>
  );
};

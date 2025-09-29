import React from "react";
import styled, { keyframes, css } from "styled-components";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-20px);
  }
`;

const InstructionsContainer = styled.div`
  position: absolute;
  top: 5%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
`;

const InstructionsPanel = styled.div<{ show: boolean }>`
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 16px 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  text-align: center;
  max-width: 800px;
  margin-bottom: 12px;
  animation: ${fadeIn} 1s ease-out forwards;

  ${({ show }) =>
    !show &&
    css`
      animation: ${fadeOut} 0.5s ease-out forwards;
    `}
`;

const CreatedBy = styled.div<{ show: boolean }>`
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  text-align: center;
  max-width: 800px;
  margin-top: 20px;
  animation: ${fadeIn} 2s ease-out forwards;

  ${({ show }) =>
    !show &&
    css`
      animation: ${fadeOut} 0.5s ease-out forwards;
    `}
`;

const MainText = styled.p`
  color: white;
  font-size: 32px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
`;

const SubText = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 24px;
  font-weight: 500;
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
  return (
    <InstructionsContainer>
      <InstructionsPanel show={show}>
        <SubText>
          <HighlightText>Home row letters</HighlightText> (A, S, D, F, J, K, L)
          = 1 point
        </SubText>
        <SubText>
          <HighlightText>All others</HighlightText> = 3 points
        </SubText>
      </InstructionsPanel>
      <InstructionsPanel show={show}>
        <SubText>
          Type the letters as they fall and reach the highest score!
        </SubText>
      </InstructionsPanel>
      <InstructionsPanel show={show}>
        <SubText>
          Correct letters increase your score. Incorrect letters give feedback.
        </SubText>
      </InstructionsPanel>
      <InstructionsPanel show={show}>
        <SubText>Progress through levels to increase difficulty.</SubText>
      </InstructionsPanel>
      <CreatedBy show={show}>
        <MainText>Created by: Mark Bernstein</MainText>
      </CreatedBy>
    </InstructionsContainer>
  );
};

import React from "react";
import styled, { keyframes, css } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeOut = keyframes`
  from { 
    opacity: 1; 
    transform: translateY(0); 
    filter: blur(5px);
  }
  to { 
    opacity: 0; 
    transform: translateX(1000px);
    filter: blur(50px); /* Adjust the blur intensity as desired */
  }
`;

const InstructionsContainer = styled.div`
  position: absolute;
  top: 180px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
`;

const InstructionsPanel = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "show" && prop !== "delay",
})<{ show: boolean; delay: number }>`
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 16px 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  text-align: center;
  max-width: 800px;
  margin-bottom: 12px;
  opacity: 0;

  ${({ show, delay }) =>
    show
      ? css`
          animation: ${fadeIn} 1s ${delay || 0}s ease-in-out forwards;
        `
      : css`
          animation: ${fadeOut} 0.5s ${delay / 2 || 0}s ease-in-out forwards;
        `}
`;

// Fade in/out + drop from top
const dropIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(-1000px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Fade in/out + up from bottom
const dropUp = keyframes`
  0% {
    opacity: 0;
    transform: translateY(500px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Floating & pulse aura
const float = keyframes`
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-8px) scale(1.03); }
`;

// Gradient text shimmer
const textShimmer = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

export const CreatedBy = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "show",
})<{ show: boolean }>`
  position: absolute;
  bottom: 40px;
  padding: 20px 200px;
  text-align: center;
  max-width: 800px;
  margin-top: 20px;
  overflow: visible;
  z-index: 20;
  font-size: 28px;

  /* Start off-screen and hidden */
  transform: translateY(-1000px);
  opacity: 0;

  /* Animate only if show is true */
  ${({ show }) =>
    show
      ? css`
          animation: ${dropIn} 2s ease-out forwards,
            ${float} 5s ease-in-out 2s infinite;
        `
      : css`
          animation: ${fadeOut} 1s ease-in-out forwards;
        `}

  &::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 25%;
    width: 50%;
    height: 50%;
    border-radius: 25%;
    background: radial-gradient(
      circle,
      rgba(34, 211, 238, 1) 0%,
      rgba(147, 51, 234, 1) 25%,
      rgba(236, 72, 153, 1) 50%,
      rgba(34, 211, 238, 1) 75%,
      transparent 100%
    );
    filter: blur(3px);
    z-index: -1;
    animation: ${dropUp} 1.5s ease-in-out;
    pointer-events: none;
  }

  span {
    display: inline-block;
    font-family: "Orbitron", sans-serif;
    font-size: 50px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    background: linear-gradient(90deg, #22d3ee, #9333ea, #ec4899);
    background-size: 300% 300%;
    animation: ${textShimmer} 6s ease infinite;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const MainText = styled.p<{ $reflected?: boolean }>`
  color: cyan;
  font-weight: 600;
  text-shadow: 0 2px 4px #d400ff;
  white-space: nowrap;

  ${({ $reflected }) =>
    $reflected &&
    `
      transform: scaleY(-1);
      opacity: 0;
      margin-top: -4px;
      mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1), rgba(0,0,0,0));
      -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1), rgba(0,0,0,0));
      animation: fadeIn 1s ease forwards;
      animation-delay: 1.2s;
  `}

  @keyframes fadeIn {
    to {
      opacity: 1;
    }
  }
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
  text-shadow: 0px 0px 20px cyan;
`;

const HighlightName = styled.span`
  color: cyan;
  font-weight: 700;
  text-shadow: 0px 0px 20px cyan;
`;

const CreatedByText = styled.span`
  display: inline-block;
  font-family: "Orbitron", sans-serif;
  font-size: 50px;
  font-weight: 700;
  letter-spacing: 4px;
  text-transform: uppercase;
  background: linear-gradient(90deg, #22d3ee, #9333ea, #ec4899);
  background-size: 300% 300%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${textShimmer} 6s ease infinite;
`;

export const CreatedByWrapper = styled.div<{ show: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  margin-top: 40px;
  z-index: 20;

  .original {
    ${CreatedByText}
  }

  .reflection {
    ${CreatedByText}
    transform: scaleY(-1);
    opacity: 0.3;
    margin-top: -4px;
    mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0));
    -webkit-mask-image: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 1),
      rgba(0, 0, 0, 0)
    );
  }
`;

interface InstructionsProps {
  show: boolean;
}

export const Instructions: React.FC<InstructionsProps> = ({ show }) => {
  return (
    <>
      <InstructionsContainer>
        <InstructionsPanel show={show} delay={0.2}>
          <SubText>Type the letters as they cascade downwards</SubText>
        </InstructionsPanel>
        <InstructionsPanel show={show} delay={0.4}>
          <SubText>Home row letters (A, S, D, F, J, K, L) = 1 point</SubText>
          <SubText>All others = 3 points</SubText>
        </InstructionsPanel>
        <InstructionsPanel show={show} delay={0.6}>
          <SubText>Incorrect keystrokes negatively affect your score!</SubText>
        </InstructionsPanel>
        <InstructionsPanel show={show} delay={0.8}>
          <SubText>Surviving each level increases difficulty.</SubText>
        </InstructionsPanel>
        <InstructionsPanel show={show} delay={1}>
          <SubText>
            Challenge yourself to beat{" "}
            <HighlightName>Mark Bernstein&apos;s</HighlightName> high score of{" "}
            <HighlightText>600</HighlightText>!
          </SubText>
        </InstructionsPanel>
      </InstructionsContainer>
      <CreatedBy show={show}>
        <MainText>Created by: Mark Bernstein</MainText>
        <MainText $reflected={true}>Created by: Mark Bernstein</MainText>
      </CreatedBy>
    </>
  );
};

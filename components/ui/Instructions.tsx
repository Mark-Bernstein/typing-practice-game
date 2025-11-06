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
    filter: blur(50px);
  }
`;

const InstructionTitle = styled.h3<{ $show: boolean }>`
  font-size: 28px;
  font-weight: bold;
  color: cyan;
  margin-bottom: 16px;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.6);
  opacity: 0;
  animation: ${({ $show }) =>
    $show
      ? "titleSlideIn 1s ease-in-out 0.5s forwards"
      : "titleFadeOut 0.5s ease-in-out forwards"};

  @keyframes titleSlideIn {
    0% {
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
      text-shadow: 0 0 5px rgba(0, 255, 255, 0.3);
      letter-spacing: -1px;
    }
    50% {
      opacity: 0.8;
      transform: translateY(2px) scale(1.05);
      text-shadow: 0 0 15px rgba(0, 255, 255, 0.7);
      letter-spacing: 0px;
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
      text-shadow: 0 0 20px cyan, 0 0 40px #00e5ff;
      letter-spacing: 2px;
    }
  }

  @keyframes titleFadeOut {
    from {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    to {
      opacity: 0;
      transform: translateX(-400px) scale(0.5);
    }
  }

  @media screen and (max-width: 1440px) {
    font-size: 24px;
  }
`;

const InstructionsContainer = styled.div<{ $show: boolean }>`
  position: absolute;
  min-width: 300px;
  top: 180px;
  left: 16px;
  z-index: 20;
  border: none;
  padding: 8px 8px 0;
  animation: ${({ $show }) =>
    $show
      ? "moveToLeft 1s ease-in-out 1s forwards"
      : "fadeOutContainer 0.8s ease-in-out forwards"};

  > :first-child {
    margin-bottom: 16px;
  }

  @keyframes moveToLeft {
    100% {
      left: 16px;
      top: 200px;
      transform: none;
      border: 2px solid rgba(255, 255, 255, 0.15);
      border-radius: 16px;
    }
  }

  @keyframes fadeOutContainer {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(20px);
      border: none;
    }
  }

  @media screen and (max-width: 1440px) {
    top: 130px;
  }
`;

const InstructionsPanel = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "show" && prop !== "delay",
})<{ show: boolean; delay: number }>`
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  width: 350px;
  margin-bottom: 8px;
  opacity: 0;

  ${({ show, delay }) =>
    show
      ? css`
          animation: ${fadeIn} 1s ${delay || 0}s ease-in-out forwards;
        `
      : css`
          animation: ${fadeOut} 0.5s ${delay / 2 || 0}s ease-in-out forwards;
        `}

  @media screen and (max-width: 1440px) {
    padding: 10px;
    width: 300px;
  }
`;

const dropIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(-1000px);
  }
  75% {
    opacity: 0;
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

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

const dropRight = keyframes`
  0% {
    opacity: 0;
    transform: translateX(1000px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
    transform: translateY(0);
  }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-8px) scale(1.03); }
`;

const textShimmer = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

export const CreatedBy = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "show",
})<{ show: boolean }>`
  position: absolute;
  bottom: 80px;
  text-align: center;
  margin-top: 20px;
  overflow: visible;
  z-index: 20;
  font-size: 32px;

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
    left: 0;
    width: 100%;
    height: 60%;
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
  margin: 0;

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

  @media screen and (max-width: 1440px) {
    font-size: 20px;
  }
`;

const SubText = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 18px;
  font-weight: 500;
  line-height: 1.5;

  @media screen and (max-width: 1440px) {
    line-height: 1.25;
  }
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

const StyledLink = styled.a`
  color: inherit;
  text-decoration: none;
  transition: color 0.3s ease, text-shadow 0.3s ease;

  &:hover,
  &:focus-visible {
    color: #ffffff;
    text-shadow: 0 0 8px #ff00ff;
    outline: none;
  }
`;

const SoundcloudLink = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "show",
})<{ show: boolean }>`
  position: absolute;
  color: #ff00ff;
  text-shadow: 0 0 30px purple;
  bottom: 30px;
  right: 16px;
  z-index: 15;
  font-size: 28px;
  font-weight: bold;
  text-align: right;
  transform: translateY(-2000px);
  opacity: 0;

  ${({ show }) =>
    show
      ? css`
          animation: ${dropRight} 2s ease-out forwards;
        `
      : css`
          animation: ${fadeOut} 1s ease-in-out forwards;
        `}
`;

interface InstructionsProps {
  show: boolean;
}

export const Instructions: React.FC<InstructionsProps> = ({ show }) => {
  return (
    <>
      <InstructionsContainer $show={show}>
        <InstructionTitle $show={show}>Instructions / Tips</InstructionTitle>
        <InstructionsPanel show={show} delay={0.4}>
          <SubText>Type the letters/words before they hit the bottom</SubText>
        </InstructionsPanel>
        <InstructionsPanel show={show} delay={0.6}>
          <SubText>Wrong keystrokes: -3 points</SubText>
        </InstructionsPanel>
        <InstructionsPanel show={show} delay={0.8}>
          <SubText>Difficulty increases nonstop</SubText>
        </InstructionsPanel>
        <InstructionsPanel show={show} delay={1}>
          <SubText>Challenge yourself to beat the high score!</SubText>
        </InstructionsPanel>
        <InstructionsPanel show={show} delay={1.2}>
          <SubText>Watch for special symbols for power ups!</SubText>
          <br></br>
          <SubText style={{ textAlign: "left", color: "cyan" }}>
            {`🛡️"!" ➡️ +3 Shields`}{" "}
          </SubText>
          <SubText style={{ textAlign: "left", color: "cyan" }}>
            {`❤️"$" ➡️ +1 Life`}{" "}
          </SubText>
          <SubText style={{ textAlign: "left", color: "cyan" }}>
            {`⚡"^" ➡️ +2.5% pts multiplier`}{" "}
          </SubText>
          <br></br>
          <SubText
            style={{
              textAlign: "left",
              color: "#c32bff",
              fontWeight: 800,
              textTransform: "uppercase",
            }}
          >
            100% charged meter:
          </SubText>
          <SubText style={{ textAlign: "left", color: "cyan" }}>
            {`Press Spacebar! ➡️ 10 second invincibility, full shields, & +10% multiplier`}{" "}
          </SubText>
        </InstructionsPanel>
      </InstructionsContainer>
      <CreatedBy show={show}>
        <MainText>
          <StyledLink
            href="https://www.linkedin.com/in/mark-b-bernstein/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit Mark Bernstein's LinkedIn profile"
          >
            Created by / Music by: Mark Bernstein
          </StyledLink>
        </MainText>
        <MainText $reflected={true}>
          Created by / Music by: Mark Bernstein
        </MainText>
      </CreatedBy>
      <SoundcloudLink show={show}>
        <StyledLink
          href="https://soundcloud.com/waydank"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit Mark Bernstein's Soundcloud profile"
        >
          🎵 My SoundCloud 🎵
        </StyledLink>
      </SoundcloudLink>
    </>
  );
};

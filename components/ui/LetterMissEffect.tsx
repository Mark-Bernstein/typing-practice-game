import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";

const shake = keyframes`
  0%, 100% { transform: translateX(0) translateY(0); }
  10% { transform: translateX(-10px) translateY(-5px); }
  20% { transform: translateX(10px) translateY(5px); }
  30% { transform: translateX(-10px) translateY(-5px); }
  40% { transform: translateX(10px) translateY(5px); }
  50% { transform: translateX(-10px) translateY(-5px); }
  60% { transform: translateX(10px) translateY(5px); }
  70% { transform: translateX(-5px) translateY(-2px); }
  80% { transform: translateX(5px) translateY(2px); }
  90% { transform: translateX(-2px) translateY(-1px); }
`;

const flashRed = keyframes`
  0% { opacity: 0; }
  25% { opacity: 0.6; }
  50% { opacity: 0.8; }
  75% { opacity: 0.4; }
  100% { opacity: 0; }
`;

const ShakeContainer = styled.div<{ $isShaking: boolean }>`
  position: relative;
  top: 10%;
  width: 100%;
  height: 100%;
  animation: ${(props) => (props.$isShaking ? shake : "none")} 0.5s ease-in-out;
`;

const RedFlash = styled.div<{ $isFlashing: boolean }>`
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at center,
    rgba(220, 38, 38, 0.8) 0%,
    rgba(220, 38, 38, 0.4) 40%,
    transparent 70%
  );
  pointer-events: none;
  z-index: 100;
  border-radius: 16px;
  opacity: 0;
  animation: ${(props) => (props.$isFlashing ? flashRed : "none")} 0.5s ease-out;
`;

const ImpactWave = styled.div<{ $isActive: boolean }>`
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  height: 100px;
  background: radial-gradient(
    ellipse at center bottom,
    rgba(220, 38, 38, 0.6) 0%,
    rgba(225, 2, 255, 0.575) 30%,
    transparent 70%
  );
  opacity: 0;
  animation: ${(props) =>
    props.$isActive ? "waveExpand 0.6s ease-out" : "none"};
  pointer-events: none;
  z-index: 99;

  @keyframes waveExpand {
    0% {
      opacity: 0;
      transform: translateX(-50%) scaleX(0.5) scaleY(0.5);
    }
    30% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translateX(-50%) scaleX(2) scaleY(1.5);
    }
  }
`;

interface LetterMissEffectProps {
  children: React.ReactNode;
  triggerEffect: boolean;
}

export const LetterMissEffect: React.FC<LetterMissEffectProps> = ({
  children,
  triggerEffect,
}) => {
  const [isShaking, setIsShaking] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [showWave, setShowWave] = useState(false);

  useEffect(() => {
    if (triggerEffect) {
      setIsShaking(true);
      setIsFlashing(true);
      setShowWave(true);

      // Reset shake after animation
      const shakeTimer = setTimeout(() => setIsShaking(false), 500);
      const flashTimer = setTimeout(() => setIsFlashing(false), 500);
      const waveTimer = setTimeout(() => setShowWave(false), 600);

      return () => {
        clearTimeout(shakeTimer);
        clearTimeout(flashTimer);
        clearTimeout(waveTimer);
      };
    }
  }, [triggerEffect]);

  return (
    <ShakeContainer $isShaking={isShaking}>
      {children}
      <RedFlash $isFlashing={isFlashing} />
      <ImpactWave $isActive={showWave} />
    </ShakeContainer>
  );
};

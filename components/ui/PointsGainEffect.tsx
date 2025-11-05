import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";

// === Animation for +X points ===
const floatUp = keyframes`
  0%   { opacity: 0; transform: translateY(0) scale(0.9); }
  15%  { opacity: 1; transform: translateY(-10px) scale(1.05); }
  85%  { opacity: 1; transform: translateY(-26px) scale(1.05); }
  100% { opacity: 0; transform: translateY(-40px) scale(0.92); }
`;

// === Styled floating text ===
const FloatingText = styled.div<{ $x: number; $y: number }>`
  position: absolute;
  left: ${(p) => p.$x}px;
  top: ${(p) => p.$y}px;
  font-family: "Orbitron", sans-serif;
  font-weight: 900;
  font-size: 32px;
  color: #00ffff;
  text-shadow: 0 0 10px #000000, 0 0 20px #00ffff, 0 0 40px #ff00ff;
  pointer-events: none;
  animation: ${floatUp} 1s ease-out forwards;
  z-index: 120;
  will-change: transform, opacity;
`;

interface PointsGainEffectProps {
  x: number; // same coord space as FallingLetter/FallingWord x
  y: number; // same coord space as FallingLetter/FallingWord y
  points: number;
}

interface FloatingItem {
  id: number;
  x: number;
  y: number;
  points: number;
}

// === Main Component ===
export const PointsGainEffect: React.FC<PointsGainEffectProps> = ({
  x,
  y,
  points,
}) => {
  const [items, setItems] = useState<FloatingItem[]>([]);
  const idCounter = useRef(0);

  // Add one floating text item per event
  useEffect(() => {
    idCounter.current += 1;
    const id = idCounter.current;

    setItems((prev) => [...prev, { id, x, y, points }]);

    const timeout = setTimeout(() => {
      setItems((prev) => prev.filter((it) => it.id !== id));
    }, 1000);

    return () => clearTimeout(timeout);
  }, [x, y, points]);

  return (
    <>
      {items.map((it) => (
        <FloatingText key={it.id} $x={it.x} $y={it.y}>
          +{it.points} {it.points === 1 ? "point" : "points"}
        </FloatingText>
      ))}
    </>
  );
};

import React, { useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { motion } from "framer-motion";

const vortexSpin = keyframes`
  0% { transform: translate(-50%, -50%) rotate(0deg) scale(0); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: translate(-50%, -50%) rotate(1080deg) scale(3); opacity: 0; }
`;

const energyRipple = keyframes`
  0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
`;

const globalRotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LevelUpContainer = styled(motion.div)`
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
  animation: ${globalRotate} 2s linear forwards;
`;

const portalPulseOnce = keyframes`
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0;
  }
  20% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.1);
  }
  60% {
    opacity: 0.9;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.5);
  }
`;

const VortexCore = styled.div<{ $level: number }>`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: ${({ $level }) => {
    const colors: Record<number, string> = {
      2: "radial-gradient(circle, #581c87 0%, #1e3a8a 50%, transparent 100%)",
      3: "radial-gradient(circle, #1e3a8a 0%, #164e63 50%, transparent 100%)",
      4: "radial-gradient(circle, #164e63 0%, #065f46 50%, transparent 100%)",
      5: "radial-gradient(circle, #7c2d12 0%, #991b1b 50%, transparent 100%)",
      6: "radial-gradient(circle, #9d174d 0%, #b91c1c 50%, transparent 100%)",
      7: "radial-gradient(circle, #c2410c 0%, #ca8a04 50%, transparent 100%)",
      8: "radial-gradient(circle, #a16207 0%, #3f6212 50%, transparent 100%)",
      9: "radial-gradient(circle, #15803d 0%, #065f46 50%, transparent 100%)",
      10: "radial-gradient(circle, #0e7490 0%, #2563eb 50%, transparent 100%)",
    };
    return colors[$level] || colors[2];
  }};

  animation: ${portalPulseOnce} 2s ease-in-out forwards;
  box-shadow: 0 0 100px currentColor;
  z-index: 1;
`;

const VortexRing = styled.div<{ $delay: number; $level: number }>`
  position: absolute;
  top: 50%;
  left: 50%;
  width: ${({ $delay }) => 200 + $delay * 50}px;
  height: ${({ $delay }) => 200 + $delay * 50}px;
  border-radius: 50%;
  border: 3px solid
    ${({ $level }) => {
      const colors: Record<number, string> = {
        2: "#581c87",
        3: "#1e3a8a",
        4: "#164e63",
        5: "#7c2d12",
        6: "#9d174d",
        7: "#c2410c",
        8: "#a16207",
        9: "#15803d",
        10: "#0e7490",
      };
      return colors[$level] || "#581c87";
    }};
  animation: ${vortexSpin} 2s ease-out forwards;
  opacity: 0.6;
  box-shadow: 0 0 20px currentColor, inset 0 0 20px currentColor;
  z-index: 1;
`;

const EnergyWave = styled.div<{ $delay: number }>`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.8);
  animation: ${energyRipple} 2s ease-out forwards;
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.6);
  z-index: 1;
`;

const ParticleContainer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
`;

const Particle = styled(motion.div)<{ $x: number; $y: number; $color: string }>`
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  left: ${({ $x }) => $x}%;
  top: ${({ $y }) => $y}%;
  box-shadow: 0 0 10px ${({ $color }) => $color};
  z-index: 1;
`;

const ScreenFlash = styled(motion.div)`
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.8) 0%,
    transparent 70%
  );
  pointer-events: none;
`;

interface LevelUpVortexProps {
  level: number;
  onComplete: () => void;
}

export const LevelUpVortex: React.FC<LevelUpVortexProps> = ({
  level,
  onComplete,
}) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const particles = React.useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const angle = (i / 30) * Math.PI * 2;
      const radius = 25 + Math.random() * 10;
      return {
        id: i,
        x: 50 + Math.cos(angle) * radius,
        y: 50 + Math.sin(angle) * radius,
        color: i % 2 === 0 ? "#00ffff" : "#ff00ff",
      };
    });
  }, []);

  return (
    <LevelUpContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ScreenFlash
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.5, times: [0, 0.2, 1] }}
      />

      <VortexCore $level={level} />

      {[0, 1, 2, 3, 4].map((i) => (
        <VortexRing key={`ring-${i}`} $delay={i} $level={level} />
      ))}

      {[0, 1, 2].map((i) => (
        <EnergyWave key={`wave-${i}`} $delay={i} />
      ))}

      <ParticleContainer>
        {particles.map((particle) => (
          <Particle
            key={particle.id}
            $x={particle.x}
            $y={particle.y}
            $color={particle.color}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0, 1, 1, 0],
              x: ["0%", "0%", "-50%"],
              y: ["0%", "0%", "-50%"],
            }}
            transition={{
              duration: 2,
              times: [0, 0.3, 0.8, 1],
              delay: particle.id * 0.015,
            }}
          />
        ))}
      </ParticleContainer>
    </LevelUpContainer>
  );
};

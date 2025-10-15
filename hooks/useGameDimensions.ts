import { useEffect, useState } from "react";

export interface GameDimensions {
  width: number;
  height: number;
  letterSize: number;
}

export const useGameDimensions = () => {
  const [dimensions, setDimensions] = useState<GameDimensions>(() =>
    calculateDimensions()
  );

  useEffect(() => {
    const handleResize = () => {
      setDimensions(calculateDimensions());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return dimensions;
};

function calculateDimensions(): GameDimensions {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Target 75% of viewport
  let width = Math.floor(viewportWidth * 0.75);
  let height = Math.floor(viewportHeight * 0.75);

  // Set constraints
  const MIN_WIDTH = 1024;
  const MIN_HEIGHT = 768;
  const MAX_WIDTH = 1800;
  const MAX_HEIGHT = 1200;

  // Apply min/max constraints
  width = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, width));
  height = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, height));

  // Scale letter size proportionally (base: 50px at 1024px width)
  const letterSize = Math.floor((width / 1024) * 50);

  return { width, height, letterSize };
}

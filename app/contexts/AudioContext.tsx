"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useAudio, SoundEffect } from "../../hooks/useAudio";

interface AudioContextType {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  toggleMusic: () => void;
  toggleSFX: () => void;
  playSFX: (effect: SoundEffect) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const audio = useAudio();

  return (
    <AudioContext.Provider value={audio}>{children}</AudioContext.Provider>
  );
};

export const useAudioContext = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudioContext must be used within AudioProvider");
  }
  return context;
};

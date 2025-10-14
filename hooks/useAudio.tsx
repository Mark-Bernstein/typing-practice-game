import { useEffect, useRef, useState } from "react";

export type SoundEffect =
  | "correct"
  | "wrong"
  | "life-lost"
  | "level-up"
  | "game-over"
  | "button-click"
  | "start";

export type MusicTrack = "menu" | "gameplay";

export const useAudio = () => {
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [sfxEnabled, setSfxEnabled] = useState(false);

  const musicRef = useRef<HTMLAudioElement | null>(null);
  const sfxRefs = useRef<Map<SoundEffect, HTMLAudioElement>>(new Map());
  const currentTrack = useRef<MusicTrack | null>(null);

  useEffect(() => {
    const effects: SoundEffect[] = [
      "correct",
      "wrong",
      "life-lost",
      "level-up",
      "game-over",
      "button-click",
      "start",
    ];

    effects.forEach((effect) => {
      try {
        const audio = new Audio(`/audio/sfx/${effect}.mp3`);
        audio.preload = "auto";
        audio.volume = 0.3;
        sfxRefs.current.set(effect, audio);
      } catch (error) {
        console.warn(`⚠️ Failed to preload SFX: ${effect}`, error);
      }
    });

    // Cleanup
    return () => {
      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current = null;
      }
      sfxRefs.current.forEach((audio) => {
        audio.pause();
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
      sfxRefs.current.clear();
    };
  }, []);

  // Play music
  const playMusic = (track: MusicTrack) => {
    if (!musicEnabled) {
      return;
    }

    // If already playing the same track, don't restart
    if (
      currentTrack.current === track &&
      musicRef.current &&
      !musicRef.current.paused
    ) {
      return;
    }

    // Stop current music
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
    }

    // Create new audio element
    const audioPath = `/audio/music/${track}.mp3`;

    musicRef.current = new Audio(audioPath);
    musicRef.current.loop = true;
    musicRef.current.volume = 0.2;
    currentTrack.current = track;

    // Play with error handling
    const playPromise = musicRef.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log("✅ Music playback started successfully");
        })
        .catch((error) => {
          console.error("❌ Music playback failed:", error);
          console.error(
            "This is often due to browser autoplay policy. Try clicking the music toggle ON first."
          );
        });
    }
  };

  // Stop music
  const stopMusic = () => {
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
      currentTrack.current = null;
    }
  };

  // Play sound effect
  const playSFX = (effect: SoundEffect) => {
    console.log("I TRIED TO PLAY A SOUND!!!!!!!!!!!!!");
    if (!sfxEnabled) {
      console.log(`⚠️ SFX disabled, not playing: ${effect}`);
      return;
    }

    const audio = sfxRefs.current.get(effect);
    if (audio) {
      console.log(`🔊 Playing SFX: ${effect}`);
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn(`⚠️ SFX ${effect} playback failed:`, error);
        });
      }
    } else {
      console.warn(`⚠️ SFX not found: ${effect}`);
    }
  };

  // Toggle music
  const toggleMusic = () => {
    const newState = !musicEnabled;
    setMusicEnabled(newState);

    if (!newState) {
      stopMusic();
    } else if (currentTrack.current) {
      // Resume music if it was playing
      playMusic(currentTrack.current);
    }
  };

  // Toggle SFX
  const toggleSFX = () => {
    // Always play this click sound regardless of the current sfxEnabled state
    const clickAudio = sfxRefs.current.get("button-click");
    if (clickAudio) {
      clickAudio.currentTime = 0;
      clickAudio.play().catch((error) => {
        console.warn("⚠️ Button click sound playback failed:", error);
      });
    }
    const newState = !sfxEnabled;
    setSfxEnabled(newState);
  };

  return {
    musicEnabled,
    sfxEnabled,
    toggleMusic,
    toggleSFX,
    playMusic,
    stopMusic,
    playSFX,
  };
};

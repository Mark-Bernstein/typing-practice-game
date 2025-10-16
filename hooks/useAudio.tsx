import { useCallback, useEffect, useRef, useState } from "react";

export type SoundEffect =
  | "correct"
  | "correct-word"
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

  // ✅ Maintain a live ref for sfxEnabled so callbacks always have the current value
  const sfxEnabledRef = useRef(sfxEnabled);
  useEffect(() => {
    sfxEnabledRef.current = sfxEnabled;
  }, [sfxEnabled]);

  useEffect(() => {
    const effects: SoundEffect[] = [
      "correct",
      "wrong",
      "life-lost",
      "level-up",
      "game-over",
      "button-click",
      "start",
      "correct-word",
    ];

    effects.forEach((effect) => {
      try {
        const audio = new Audio(`/audio/sfx/${effect}.mp3`);
        audio.preload = "auto";
        audio.volume = 0.35;
        sfxRefs.current.set(effect, audio);
      } catch (error) {
        console.warn(`⚠️ Failed to preload SFX: ${effect}`, error);
      }
    });

    return () => {
      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current = null;
      }
      sfxRefs.current.forEach((audio) => audio.pause());
      sfxRefs.current.clear();
    };
  }, []);

  // 🎵 Play music
  const playMusic = useCallback(
    (track: MusicTrack) => {
      if (!musicEnabled) return;

      if (
        currentTrack.current === track &&
        musicRef.current &&
        !musicRef.current.paused
      ) {
        return;
      }

      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current.currentTime = 0;
      }

      const audioPath = `/audio/music/${track}.mp3`;
      musicRef.current = new Audio(audioPath);
      musicRef.current.loop = true;
      musicRef.current.volume = 0.5;
      currentTrack.current = track;

      const playPromise = musicRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => console.log("✅ Music playback started successfully"))
          .catch((error) => {
            console.error("❌ Music playback failed:", error);
            console.error(
              "This is often due to browser autoplay policy. Try clicking the music toggle ON first."
            );
          });
      }
    },
    [musicEnabled]
  );

  // 🛑 Stop music
  const stopMusic = () => {
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
      currentTrack.current = null;
    }
  };

  // 🔊 Play sound effect (checks ref for live state)
  const playSFX = useCallback((effect: SoundEffect) => {
    if (!sfxEnabledRef.current) return;

    const audio = sfxRefs.current.get(effect);
    if (audio) {
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
  }, []);

  // 🎚️ Toggle music
  const toggleMusic = () => {
    const newState = !musicEnabled;
    setMusicEnabled(newState);

    if (!newState) {
      stopMusic();
    } else if (currentTrack.current) {
      playMusic(currentTrack.current);
    }
  };

  // 🎛️ Toggle SFX (click sound always plays)
  const toggleSFX = () => {
    const clickAudio = sfxRefs.current.get("button-click");
    if (clickAudio) {
      clickAudio.currentTime = 0;
      clickAudio.play().catch((error) => {
        console.warn("⚠️ Button click sound playback failed:", error);
      });
    }

    setSfxEnabled((prev) => !prev);
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

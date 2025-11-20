"use client";
import React, { useRef, useEffect } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

interface BackgroundParticlesProps {
  /** When false (e.g., during gameplay), disables mouse glow & interaction */
  isActive?: boolean;
}

export const BackgroundParticles: React.FC<BackgroundParticlesProps> = ({
  isActive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const colors = ["#22d3ee", "#9333ea", "#ec4899", "#00fff2"];
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const decay = 0.995; // how quickly velocity decays (closer to 1 = slower decay)
    const minSpeed = 0.2; // slowest allowed absolute velocity per axis

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles.current = Array.from({ length: 500 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
    };
    resize();
    window.addEventListener("resize", resize);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Mouse glow only while active
      if (isActive) {
        const grad = ctx.createRadialGradient(
          mouse.current.x,
          mouse.current.y,
          50,
          mouse.current.x,
          mouse.current.y,
          200
        );
        grad.addColorStop(0, "rgba(111, 75, 255, 0.15)");
        grad.addColorStop(0.3, "rgba(195, 0, 255, 0.5)");
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      particles.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // bounce on walls
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // repel from mouse only when active
        if (isActive) {
          const dx = p.x - mouse.current.x;
          const dy = p.y - mouse.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            p.vx += dx / 60;
            p.vy += dy / 60;
          }
        }

        // apply gradual slowdown
        p.vx *= decay;
        p.vy *= decay;

        // enforce minimum drift speed (so it never fully stops)
        if (Math.abs(p.vx) < minSpeed)
          p.vx = (Math.sign(p.vx) || Math.random() - 0.5) * minSpeed;
        if (Math.abs(p.vy) < minSpeed)
          p.vy = (Math.sign(p.vy) || Math.random() - 0.5) * minSpeed;

        // draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.7;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      requestAnimationFrame(animate);
    };
    animate();

    if (isActive) {
      window.addEventListener("mousemove", (e) => {
        mouse.current.x = e.clientX;
        mouse.current.y = e.clientY;
      });
    }

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, [isActive]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        background: "transparent",
        zIndex: 1,
        pointerEvents: "none",
        filter: isActive ? "blur(0px)" : "blur(8px)",
      }}
    />
  );
};

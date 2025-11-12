# ⚡ Typing Practice Game ⚡

## Overview

A **sci-fi / retro-themed interactive typing experience** built with **Next.js**, **TypeScript**, and **Styled Components**.  
Test your reflexes, typing accuracy, and focus as glowing letters, words, and full sentences descend through a futuristic cosmos.

Featuring **music**, **dynamic sound effects**, **reactive particle animations**, and **visual power-ups**, it delivers a deeply immersive and responsive gameplay experience.

The backend is powered by **PostgreSQL** via **@vercel/postgres**, enabling a **live online leaderboard**, **persistent player stats**, and **server-validated scoring**.  
Additional features include **level progression**, **shield mechanics**, **audio feedback**, and **adaptive difficulty scaling** designed for both casual and competitive players.

---

## 🎮 Features

### 🧠 Core Gameplay

- **Three Game Modes**
  - 🟢 **Letter Mode** – Type single letters as they fall
  - 🟣 **Word Mode** – Complete full words for higher points
  - 🟠 **Story Mode** – Type through evolving adventure stories _(punctuation included!)_
- **Progressive Difficulty** – Game speed and spawn rate increase as you improve
- **Combo Multiplier System** – Maintain accuracy for bonus points

---

### ⚡ Power-Ups & Bonuses

- **🛡️ Shield Pickups (`!`)** – Absorb missed letters or words before losing lives
- **❤️ Life Pickups (`$`)** – Regain back a missing life
- **💥 Combo Multipliers** – Increases score by maintaining accuracy.
- **🛡️🛡️🛡️ Charge Meter** – Gives 10 seconds of invincibility, full shields, and +10% multiplier

---

### 🪐 Visual Effects & Atmosphere

- **Dynamic Sci-Fi Menu** – “Start” button triggers a 3D warp explosion at click location using **Framer Motion**
- **Animated Underline Title** – Energy beam draws under the title in sync with intro animation
- **Neon Game UI** – Glowing progress bars, animated level transitions, and pulsating indicators

- **Particle Background** – Floating cosmic dust and energy dots for depth
- **Energy Rings & Warp Bursts** – High-impact visual transitions, GPU-friendly

---

### 🎧 Audio & Feedback

- **Dynamic Sound Effects** – Correct typing, shields, power-ups, game over cues, etc.
- **Music System** – Menu and gameplay music handled by a custom audio context
- **Real-Time Stats HUD** – Time, Score, Total Correct Words/Letters, Speed %, Combo multiplier, Current mode, and level indicator, Shields, Charge Meter %, Music and SFX toggle.

---

### 💾 Leaderboard & Progress

- **Online Leaderboard** – Submit your final score and see global results. (All 3 modes have their own leaderboard)
- **Total Plays Counter** – Tracks number of games played worldwide
- **Smooth Game Over Screen** – Animated score reveal, per-stat fade-in, and nickname prompt

---

## 🚀 Live Demo

🎮 **Play Now:** [https://typing-practice-game-six.vercel.app/](https://typing-practice-game-six.vercel.app/)

---

## 🛠️ Tech Stack

| Tool                  | Description                           |
| --------------------- | ------------------------------------- |
| **Next.js 15**        | React framework using App Router      |
| **TypeScript**        | Strong typing for better reliability  |
| **Styled Components** | CSS-in-JS with theme-ready design     |
| **Framer Motion**     | Smooth, realistic 3D-style animations |
| **React Hooks**       | Modern functional state management    |
| **Turbopack**         | Ultra-fast bundling and hot reload    |

---

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Mark-Bernstein/typing-game.git
   cd typing-game
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Run the development server**
   ```bash
   npm run dev
   ```
4. **Open your browser and navigate to**
   ```bash
   👉 http://localhost:3000
   ```

## 🧩 Upcoming Features

- 💣 Letter Bomb Power-Up – clears nearby falling text

- 🧱 Custom Difficulty Settings

## ✨ Author

**Mark Bernstein**  
Front-End Engineer & UI/UX Developer

🔗 [Portfolio](https://mark-bernstein-portfolio.vercel.app/) • [GitHub](https://github.com/Mark-Bernstein)

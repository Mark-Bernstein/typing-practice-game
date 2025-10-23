# ⚡ Typing Practice Game

A **sci-fi/retro-themed interactive typing experience** built with **Next.js**, **TypeScript**, and **Styled Components**.  
Test your reflexes, typing accuracy, and focus as glowing letters, words, and full sentences descend through a futuristic cosmos.  
Includes **music**, **sound effects**, **shields**, and **visual power-ups** for an immersive experience.

---

## 🎮 Features

### 🧠 Core Gameplay

- **Three Game Modes**
  - 🟢 **Letter Mode** – Type single letters as they fall
  - 🟣 **Word Mode** – Complete full words for higher points
  - 🟠 **Story Mode** – Type through evolving adventure stories _(punctuation rendered but ignored for smoother flow)_
- **Progressive Difficulty** – Game speed and spawn rate increase as you improve
- **Smart Scoring System** – Word length and combo streaks multiply your points
- **Combo Multiplier System** – Maintain accuracy for double, triple, and beyond scoring

---

### ⚡ Power-Ups & Bonuses

- **🛡️ Shield Pickups (`!`)** – Absorb missed letters or words before losing lives
- **💥 Double Points (coming soon)** – Temporary scoring surge
- **💣 Letter Bomb (coming soon)** – Clears nearby letters in an energy burst

---

### 🪐 Visual Effects & Atmosphere

- **Dynamic Sci-Fi Menu** – “Start” button triggers a 3D warp explosion at click location using **Framer Motion**
- **Animated Underline Title** – Energy beam draws under the title in sync with intro animation
- **Neon Game UI** – Glowing progress bars, animated level transitions, and pulsating indicators

- **Particle Background** – Floating cosmic dust and energy dots for depth
- **Energy Rings & Warp Bursts** – High-impact visual transitions, GPU-friendly

---

### 🎧 Audio & Feedback

- **Dynamic Sound Effects** – Correct typing, shields, power-ups, and game over cues
- **Music System** – Menu and gameplay music handled by a custom audio context
- **Real-Time Stats HUD** – Score, time, accuracy, combo multiplier, and level indicator

---

### 💾 Leaderboard & Progress

- **Online Leaderboard** – Submit your final score and see global results
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

- 🌀 Double Points Mode – temporary point multiplier

- 💣 Letter Bomb Power-Up – clears nearby falling text

- 🧱 Custom Difficulty Settings

## ✨ Author

**Mark Bernstein**  
Front-End Engineer & UI/UX Developer

🔗 [Portfolio](https://mark-bernstein-portfolio.vercel.app/) • [GitHub](https://github.com/Mark-Bernstein)

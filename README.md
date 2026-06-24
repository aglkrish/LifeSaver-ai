# ⚡ LifeSaver AI — Productivity Companion

An AI-powered productivity app that proactively helps you plan, prioritize, and complete tasks before deadlines are missed.

## Features

- **Smart Task Board** — urgency-ranked tasks with color-coded priority bars
- **AI Quick-Add** — describe a task in plain English; Claude parses deadline, priority & category
- **AI Companion Chat** — sidebar chatbot aware of your live tasks and habits
- **Time-Block Schedule** — auto-generates a realistic day schedule from your pending tasks
- **AI Day Plan** — one-click Claude-powered personalized plan for your day
- **Habit Tracker** — 7-day grid with streak counter and completion stats

## Tech Stack

- React 18 + Vite
- Zustand (state management)
- CSS Modules (zero external UI libraries)
- Anthropic Claude API (claude-sonnet-4-6)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev
```

> The app calls the Anthropic API directly from the browser.
> In production, proxy these calls through a backend to protect your API key.

## Project Structure

```
src/
  components/
    Topbar.jsx          # Navigation bar
    StatsRow.jsx        # 4 summary stat cards
    QuickAdd.jsx        # AI-powered natural language task input
    TaskCard.jsx        # Individual task with urgency indicator + AI tip
    TaskModal.jsx       # Detailed task creation modal
    Sidebar.jsx         # AI chat companion
  pages/
    BoardView.jsx       # Main task board with filters
    ScheduleView.jsx    # Time-blocked daily schedule + AI plan
    HabitsView.jsx      # 7-day habit grid tracker
  utils/
    helpers.js          # Urgency scoring, AI calls, formatting
  store.js              # Zustand global state
  styles/
    global.css          # CSS variables + reset
```

## Build for Production

```bash
npm run build
# Output: dist/ folder — deploy to Vercel, Netlify, or any static host
```

## Deployment (Vercel)

```bash
npm install -g vercel
vercel --prod
```

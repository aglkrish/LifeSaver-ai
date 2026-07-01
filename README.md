# ⚡ LifeSaver AI — Smart Productivity Companion

An AI-powered, urgency-aware productivity application that helps you plan, prioritize, and check off tasks before deadlines are missed. Powered by **Google Gemini 3.5 & 2.5 Flash** models with a robust client-side offline backup.

---

## ✦ Core Features

*   **🎯 Urgency-Ranked Task Board** — Tasks are automatically sorted using a custom real-time urgency scoring algorithm, featuring color-coded priority markers.
*   **✦ AI Quick-Add** — Type tasks in natural language (e.g., *"Submit ML classification tomorrow 4pm"*). The AI parser automatically extracts category, priority level, and sets the deadline.
*   **⚙️ AI Companion Chat** — A persistent sidebar coach aware of your active board state. Ask for study schedules, focus blocks, motivational nudges, or deadline summaries.
*   **◷ Time-Blocked Daily Schedule** — Auto-generated hourly schedule blocks aligning your high-priority items around breaks and reviews.
*   **⚡ AI Day Plan** — Generate a direct, actionable daily timeline from the active task queue with a single click.
*   **📊 Streak Habit Tracker** — Keep track of your daily routines with a 7-day grid and dynamic completion statistics.

---

## 🛠️ Tech Stack

*   **Frontend**: React 18 + Vite
*   **State Management**: Zustand
*   **Styling**: CSS Modules (vanilla CSS, zero heavy UI frameworks)
*   **AI Engine**: Google Gemini API (`gemini-2.5-flash`)
*   **Offline Mode**: Custom regex parser & heuristics engine for 100% offline functionality.

---

## ⚡ Architecture & Dual-Mode AI

To ensure maximum performance and privacy, the application uses a **Dual-Mode AI Engine**:

1.  **Online Mode (Google Gemini)**: 
    *   Direct browser-to-API calls are routed through a local Vite server proxy (`/api/gemini`) to bypass browser CORS constraints, firewalls, and adblockers.
    *   Authenticates securely using a key stored in `localStorage` or your `.env.local` file.
2.  **Offline Mode (Local Fallback)**:
    *   If no key is configured, the application falls back seamlessly to a local heuristics engine. 
    *   Uses Regex-based parsing to extract deadlines and categorizes tasks locally, while simulating supportive productivity dialogue in the sidebar.

---

## 🚀 Setup & Local Running

### 1. Clone the project
```bash
git clone https://github.com/aglkrish/LifeSaver-ai.git
cd lifesaver-ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure your API Key (Optional)
Create a `.env.local` file in the root directory:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```
*(Alternatively, you can click the `⚙️` settings gear icon directly inside the running app's sidebar to paste and save your key).*

### 4. Run the Dev Server
```bash
npm run dev
```
Open `http://localhost:5173/` in your browser.

---

## 📦 Project Structure

```
src/
  ├── components/
  │   ├── Topbar.jsx          # Dashboard header and view switcher
  │   ├── StatsRow.jsx        # Summary cards (Pending, Overdue, Streak, Habits)
  │   ├── QuickAdd.jsx        # Text box for natural language task parsing
  │   ├── TaskCard.jsx        # Task visualizer with urgency indicators and AI tips
  │   ├── TaskModal.jsx       # Modal dialog for detailed task adjustments
  │   └── Sidebar.jsx         # Gemini-powered companion chat and API settings
  ├── pages/
  │   ├── BoardView.jsx       # Main Kanban task categories and filtering
  │   ├── ScheduleView.jsx    # Time-blocked schedule and AI Day Plan generator
  │   └── HabitsView.jsx      # Habits streaks grid
  ├── utils/
  │   ├── helpers.js          # Main helper functions and Gemini API config
  │   └── offlineAI.js        # Offline heuristics parser & mock chatbot engine
  ├── store.js                # zustand global state database
  └── styles/
      └── global.css          # Color palettes, resets, and layout system
```

---

## 🌐 Build for Production

To create a optimized static build of the app:
```bash
npm run build
```
The production bundle will be generated in the `dist/` directory, ready to deploy to Vercel, Netlify,or any static host.

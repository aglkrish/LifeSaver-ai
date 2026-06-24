import { create } from 'zustand'

const seed = () => [
  {
    id: 1, title: 'Submit ML assignment – binary classification report',
    cat: 'Study', pri: 'critical',
    deadline: new Date(Date.now() + 5.5 * 3600000),
    done: false, notes: 'Include confusion matrix and ROC curve'
  },
  {
    id: 2, title: 'Pay electricity bill before due date',
    cat: 'Finance', pri: 'high',
    deadline: new Date(Date.now() + 16 * 3600000),
    done: false, notes: ''
  },
  {
    id: 3, title: 'Prepare for Tracer ML technical interview – embedder architecture',
    cat: 'Work', pri: 'high',
    deadline: new Date(Date.now() + 2 * 86400000),
    done: false, notes: 'Review contrastive learning, FAISS, embedder mismatch issue'
  },
  {
    id: 4, title: 'QueueCure – Vercel deployment & finalize README',
    cat: 'Project', pri: 'medium',
    deadline: new Date(Date.now() + 3 * 86400000),
    done: false, notes: 'Socket.IO prod config, env vars'
  },
  {
    id: 5, title: 'Read 2 chapters of Deep Learning book',
    cat: 'Study', pri: 'low',
    deadline: new Date(Date.now() + 5 * 86400000),
    done: false, notes: ''
  },
]

const seedHabits = () => [
  { id: 1, name: 'Deep work (2h)', icon: '💻', streak: 4, days: [1,1,1,0,1,1,0] },
  { id: 2, name: 'Read 30 min',    icon: '📚', streak: 7, days: [1,1,1,1,1,1,1] },
  { id: 3, name: 'Morning workout',icon: '🏃', streak: 2, days: [0,1,1,1,0,1,1] },
  { id: 4, name: '8 glasses water',icon: '💧', streak: 3, days: [1,0,1,1,1,1,0] },
]

export const useStore = create((set, get) => ({
  tasks:  seed(),
  habits: seedHabits(),
  chatHistory: [],

  addTask: (task) => set(s => ({ tasks: [...s.tasks, { ...task, id: Date.now() }] })),
  deleteTask: (id) => set(s => ({ tasks: s.tasks.filter(t => t.id !== id) })),
  toggleTask: (id) => set(s => ({
    tasks: s.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t)
  })),

  addHabit: (h) => set(s => ({
    habits: [...s.habits, { ...h, id: Date.now(), streak: 0, days: [0,0,0,0,0,0,0] }]
  })),
  toggleHabitDay: (hid, day) => set(s => ({
    habits: s.habits.map(h => {
      if (h.id !== hid) return h
      const days = [...h.days]
      days[day] = days[day] ? 0 : 1
      return { ...h, days, streak: days.filter(Boolean).length }
    })
  })),

  pushChat: (msg) => set(s => ({ chatHistory: [...s.chatHistory.slice(-14), msg] })),
  clearChat: () => set({ chatHistory: [] }),
}))

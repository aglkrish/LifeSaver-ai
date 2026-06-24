import React from 'react'
import { useStore } from '../store.js'
import { hoursFrom } from '../utils/helpers.js'
import styles from './Topbar.module.css'

const TABS = [
  { id: 'board',    label: 'Board',    icon: '⊞' },
  { id: 'schedule', label: 'Schedule', icon: '◷' },
  { id: 'habits',   label: 'Habits',   icon: '◈' },
]

export default function Topbar({ activeTab, onTabChange, onAddTask }) {
  const tasks = useStore(s => s.tasks)
  const urgent = tasks.filter(t => !t.done && hoursFrom(t) > 0 && hoursFrom(t) < 24).length
  const overdue = tasks.filter(t => !t.done && hoursFrom(t) <= 0).length
  const total = urgent + overdue

  return (
    <header className={styles.bar}>
      <div className={styles.brand}>
        <span className={styles.icon}>⚡</span>
        LifeSaver AI
      </div>

      <nav className={styles.tabs}>
        {TABS.map(t => (
          <button
            key={t.id}
            className={`${styles.tab} ${activeTab === t.id ? styles.active : ''}`}
            onClick={() => onTabChange(t.id)}
          >
            <span className={styles.tabIcon}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>

      <div className={styles.right}>
        {total > 0 && (
          <span className={styles.urgentBadge}>
            {total} urgent
          </span>
        )}
        <button className={styles.addBtn} onClick={onAddTask}>
          + Add Task
        </button>
      </div>
    </header>
  )
}

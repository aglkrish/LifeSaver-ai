import React, { useState } from 'react'
import { useStore } from '../store.js'
import styles from './HabitsView.module.css'

const WEEKDAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const ICONS    = ['💻','📚','🏃','💧','🧘','✍️','🎯','🍎','🌙','📝']

export default function HabitsView() {
  const habits       = useStore(s => s.habits)
  const addHabit     = useStore(s => s.addHabit)
  const toggleHabitDay = useStore(s => s.toggleHabitDay)

  const [showForm, setShowForm] = useState(false)
  const [name, setName]   = useState('')
  const [icon, setIcon]   = useState('💻')

  const todayIdx = (new Date().getDay() + 6) % 7

  const totalStreak = habits.reduce((a, h) => a + h.streak, 0)
  const weekDone    = habits.reduce((a, h) => a + h.days.filter(Boolean).length, 0)
  const weekTotal   = habits.length * 7

  const handleAdd = () => {
    if (!name.trim()) return
    addHabit({ name: name.trim(), icon })
    setName('')
    setShowForm(false)
  }

  return (
    <>
      {/* Overview cards */}
      <div className={styles.overview}>
        <div className={styles.ocard}>
          <div className={styles.oLabel}>Total habits</div>
          <div className={styles.oVal}>{habits.length}</div>
        </div>
        <div className={styles.ocard}>
          <div className={styles.oLabel}>Combined streak</div>
          <div className={styles.oVal} style={{ color: 'var(--warning)' }}>🔥 {totalStreak}</div>
        </div>
        <div className={styles.ocard}>
          <div className={styles.oLabel}>This week</div>
          <div className={styles.oVal} style={{ color: 'var(--success)' }}>
            {weekDone}/{weekTotal}
          </div>
          <div className={styles.oSub}>{weekTotal ? Math.round(weekDone / weekTotal * 100) : 0}% completion</div>
        </div>
      </div>

      {/* Header */}
      <div className={styles.head}>
        <div className={styles.headLabel}>🔥 Habit tracker — this week</div>
        <button className={styles.addBtn} onClick={() => setShowForm(f => !f)}>
          {showForm ? '✕ Cancel' : '+ Add habit'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className={styles.addForm}>
          <input
            className={styles.nameInput}
            placeholder="Habit name (e.g. Read 30 min)"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            autoFocus
          />
          <div className={styles.iconRow}>
            {ICONS.map(ic => (
              <button
                key={ic}
                className={`${styles.iconBtn} ${icon === ic ? styles.iconSelected : ''}`}
                onClick={() => setIcon(ic)}
              >
                {ic}
              </button>
            ))}
          </div>
          <button className={styles.confirmBtn} onClick={handleAdd} disabled={!name.trim()}>
            Add habit
          </button>
        </div>
      )}

      {/* Habit cards */}
      <div className={styles.list}>
        {habits.length === 0 && (
          <div className={styles.empty}>No habits yet — add one to start tracking!</div>
        )}
        {habits.map(h => {
          const doneDays = h.days.filter(Boolean).length
          const pct      = Math.round(doneDays / 7 * 100)
          return (
            <div key={h.id} className={styles.hcard}>
              <div className={styles.hTop}>
                <span className={styles.hIcon}>{h.icon}</span>
                <div className={styles.hInfo}>
                  <div className={styles.hName}>{h.name}</div>
                  <div className={styles.hStreak}>🔥 {h.streak}-day streak</div>
                </div>
                <div className={styles.hPct}>{pct}%</div>
              </div>

              <div className={styles.dayRow}>
                {WEEKDAYS.map((d, i) => (
                  <button
                    key={i}
                    className={`${styles.dayBtn} ${h.days[i] ? styles.dayDone : ''} ${i === todayIdx ? styles.dayToday : ''}`}
                    onClick={() => toggleHabitDay(h.id, i)}
                    title={d}
                  >
                    <span className={styles.dayLabel}>{d}</span>
                    <span className={styles.dayMark}>{h.days[i] ? '✓' : ''}</span>
                  </button>
                ))}
              </div>

              <div className={styles.progRow}>
                <span className={styles.progLabel}>{doneDays}/7 days</span>
                <div className={styles.progTrack}>
                  <div className={styles.progFill} style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

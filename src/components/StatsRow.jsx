import React from 'react'
import { useStore } from '../store.js'
import { hoursFrom } from '../utils/helpers.js'
import styles from './StatsRow.module.css'

export default function StatsRow() {
  const tasks = useStore(s => s.tasks)
  const total   = tasks.length
  const done    = tasks.filter(t => t.done).length
  const overdue = tasks.filter(t => !t.done && hoursFrom(t) <= 0).length
  const urgent  = tasks.filter(t => !t.done && hoursFrom(t) > 0 && hoursFrom(t) < 24).length
  const pct     = total ? Math.round(done / total * 100) : 0

  const cards = [
    { label: 'Total tasks', value: total, sub: `${pct}% complete`, bar: pct, color: 'var(--accent)' },
    { label: 'Completed',   value: done,  sub: 'tasks finished',    color: 'var(--success)' },
    { label: 'Due today',   value: urgent, sub: 'need attention',   color: 'var(--warning)' },
    { label: 'Overdue',     value: overdue, sub: overdue ? '⚠ act now' : '✓ all clear', color: overdue ? 'var(--danger)' : 'var(--success)' },
  ]

  return (
    <div className={styles.grid}>
      {cards.map((c, i) => (
        <div className={styles.card} key={i}>
          <div className={styles.label}>{c.label}</div>
          <div className={styles.value} style={{ color: c.color }}>{c.value}</div>
          {c.bar !== undefined && (
            <div className={styles.track}>
              <div className={styles.fill} style={{ width: `${c.bar}%` }} />
            </div>
          )}
          <div className={styles.sub}>{c.sub}</div>
        </div>
      ))}
    </div>
  )
}

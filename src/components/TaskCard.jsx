import React, { useState } from 'react'
import { useStore } from '../store.js'
import { urgencyLevel, deadlineLabel, fmtDeadline, aiTip } from '../utils/helpers.js'
import styles from './TaskCard.module.css'

const PRI_LABELS = { critical: '🔴 CRITICAL', high: '🟠 HIGH', medium: '🟣 MEDIUM', low: '🟢 LOW' }
const CAT_ICONS  = { Work:'💼', Study:'📚', Personal:'🏠', Health:'❤️', Finance:'💰', Project:'⚙️' }

export default function TaskCard({ task }) {
  const { toggleTask, deleteTask } = useStore()
  const [expanded, setExpanded] = useState(false)

  const level = urgencyLevel(task)
  const tip   = aiTip(task)

  return (
    <div className={`${styles.card} ${styles[level]} ${task.done ? styles.done : ''}`}>
      <div className={styles.urgBar} />

      <div className={styles.top}>
        <button
          className={`${styles.check} ${task.done ? styles.checked : ''}`}
          onClick={() => toggleTask(task.id)}
          aria-label="Toggle done"
        >
          {task.done ? '✓' : ''}
        </button>

        <div className={styles.body} onClick={() => setExpanded(e => !e)}>
          <div className={styles.title}>{task.title}</div>
          <div className={styles.meta}>
            <span className={styles.catChip}>{CAT_ICONS[task.cat]} {task.cat}</span>
            <span className={`${styles.priChip} ${styles[`pri_${task.pri}`]}`}>
              {PRI_LABELS[task.pri]}
            </span>
            <span className={`${styles.dlChip} ${styles[`dl_${level}`]}`}>
              {deadlineLabel(task)}
            </span>
            <span className={styles.fmtDate}>{fmtDeadline(task.deadline)}</span>
          </div>
        </div>

        <button
          className={styles.del}
          onClick={() => deleteTask(task.id)}
          aria-label="Delete task"
        >
          ✕
        </button>
      </div>

      {!task.done && (
        <div className={styles.tipRow}>
          <span className={styles.tipLabel}>{tip.label}</span>
          <span className={styles.tipMsg}>{tip.msg}</span>
        </div>
      )}

      {expanded && task.notes && (
        <div className={styles.notes}>{task.notes}</div>
      )}
    </div>
  )
}

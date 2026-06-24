import React, { useState } from 'react'
import { useStore } from '../store.js'
import { sortByUrgency } from '../utils/helpers.js'
import StatsRow from '../components/StatsRow.jsx'
import QuickAdd from '../components/QuickAdd.jsx'
import TaskCard from '../components/TaskCard.jsx'
import styles from './BoardView.module.css'

const FILTERS = ['All', 'Today', 'Pending', 'Done']

export default function BoardView() {
  const tasks = useStore(s => s.tasks)
  const [filter, setFilter] = useState('All')

  const sorted = sortByUrgency(tasks)
  const filtered = sorted.filter(t => {
    if (filter === 'All')     return true
    if (filter === 'Pending') return !t.done
    if (filter === 'Done')    return t.done
    if (filter === 'Today') {
      const h = (new Date(t.deadline) - Date.now()) / 3600000
      return h > -1 && h < 24
    }
    return true
  })

  return (
    <>
      <StatsRow />
      <QuickAdd />

      <section>
        <div className={styles.sectionHead}>
          <div className={styles.sectionLabel}>
            <span>Tasks</span>
            <span className={styles.badge}>sorted by urgency</span>
            <span className={styles.count}>{filtered.length}</span>
          </div>
          <div className={styles.filters}>
            {FILTERS.map(f => (
              <button
                key={f}
                className={`${styles.flt} ${filter === f ? styles.on : ''}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.list}>
          {filtered.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>✓</div>
              <div>No tasks in this view</div>
            </div>
          ) : (
            filtered.map(t => <TaskCard key={t.id} task={t} />)
          )}
        </div>
      </section>
    </>
  )
}

import React, { useState } from 'react'
import { useStore } from '../store.js'
import { parseTaskWithAI } from '../utils/helpers.js'
import styles from './QuickAdd.module.css'

export default function QuickAdd() {
  const addTask = useStore(s => s.addTask)
  const [input, setInput] = useState('')
  const [status, setStatus] = useState(null) // null | 'loading' | { text, ok }

  const handle = async () => {
    const val = input.trim()
    if (!val) return
    setStatus({ loading: true })
    try {
      const parsed = await parseTaskWithAI(val)
      addTask({
        title:    parsed.title || val,
        cat:      parsed.cat   || 'Work',
        pri:      parsed.pri   || 'medium',
        deadline: new Date(Date.now() + (parsed.hoursFromNow || 24) * 3600000),
        done:     false,
        notes:    '',
      })
      setStatus({ text: `✓ ${parsed.cat} · ${parsed.pri} — ${parsed.tip}`, ok: true })
      setInput('')
    } catch {
      addTask({ title: val, cat: 'Work', pri: 'medium', deadline: new Date(Date.now() + 86400000), done: false, notes: '' })
      setStatus({ text: 'Added with defaults (AI unavailable)', ok: false })
      setInput('')
    }
    setTimeout(() => setStatus(null), 5000)
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.sparkle}>✦</span>
        <span className={styles.label}>AI quick-add</span>
        <span className={styles.hint}>Describe your task — AI extracts deadline & priority</span>
      </div>
      <div className={styles.row}>
        <input
          className={styles.input}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handle()}
          placeholder='e.g. "Submit ML report by Friday 11pm" or "Interview prep tomorrow 3pm"'
        />
        <button className={styles.btn} onClick={handle} disabled={!input.trim() || status?.loading}>
          {status?.loading ? '…' : 'Parse & Add'}
        </button>
      </div>
      {status && !status.loading && (
        <div className={`${styles.feedback} ${status.ok ? styles.ok : styles.warn}`}>
          {status.text}
        </div>
      )}
    </div>
  )
}

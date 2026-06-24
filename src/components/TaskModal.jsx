import React, { useState } from 'react'
import { useStore } from '../store.js'
import styles from './TaskModal.module.css'

const CATS = ['Work','Study','Personal','Health','Finance','Project']
const PRIS = ['critical','high','medium','low']

export default function TaskModal({ onClose }) {
  const addTask = useStore(s => s.addTask)
  const def = new Date(Date.now() + 86400000)

  const [form, setForm] = useState({
    title: '', cat: 'Study', pri: 'medium',
    deadline: def.toISOString().slice(0, 16),
    notes: ''
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = () => {
    if (!form.title.trim()) return
    addTask({
      title:    form.title.trim(),
      cat:      form.cat,
      pri:      form.pri,
      deadline: new Date(form.deadline),
      done:     false,
      notes:    form.notes,
    })
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Add Task</h2>
          <button className={styles.close} onClick={onClose}>✕</button>
        </div>

        <div className={styles.fields}>
          <div className={styles.field}>
            <label>Task title *</label>
            <input
              autoFocus
              placeholder="What needs to be done?"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
            />
          </div>

          <div className={styles.row2}>
            <div className={styles.field}>
              <label>Category</label>
              <select value={form.cat} onChange={e => set('cat', e.target.value)}>
                {CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label>Priority</label>
              <select value={form.pri} onChange={e => set('pri', e.target.value)}>
                {PRIS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label>Deadline</label>
            <input
              type="datetime-local"
              value={form.deadline}
              onChange={e => set('deadline', e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label>Notes / subtasks</label>
            <textarea
              placeholder="Add context, links, subtasks…"
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
            />
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onClose}>Cancel</button>
          <button className={styles.submit} onClick={submit} disabled={!form.title.trim()}>
            Add Task
          </button>
        </div>
      </div>
    </div>
  )
}

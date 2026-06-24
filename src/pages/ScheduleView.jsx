import React, { useState, useEffect } from 'react'
import { useStore } from '../store.js'
import { sortByUrgency, hoursFrom, callGemini, buildSystemPrompt } from '../utils/helpers.js'
import styles from './ScheduleView.module.css'

const HOUR_LABELS = (h) => {
  if (h === 0)  return '12 AM'
  if (h < 12)  return `${h} AM`
  if (h === 12) return '12 PM'
  return `${h - 12} PM`
}

function buildSchedule(tasks) {
  const now  = new Date()
  const curH = now.getHours()
  const pending = sortByUrgency(tasks).filter(t => !t.done)
  const slots = []
  let ti = 0

  for (let h = Math.max(7, curH); h <= 22; h++) {
    const isNow = h === curH
    if (h === 12) {
      slots.push({ h, isNow, type: 'break', title: 'Lunch break', sub: 'Rest & recharge — away from screen' })
      continue
    }
    if (h === 15) {
      slots.push({ h, isNow, type: 'break', title: 'Short break (15 min)', sub: 'Walk, stretch, hydrate' })
      continue
    }
    if (h === 20) {
      slots.push({ h, isNow, type: 'review', title: 'Evening review', sub: "Check tomorrow's priorities & wrap up" })
      continue
    }
    if (pending[ti]) {
      const t = pending[ti++]
      const h2 = hoursFrom(t)
      const urgType = h2 < 12 ? 'critical' : h2 < 24 ? 'high' : 'medium'
      slots.push({ h, isNow, type: urgType, title: t.title, sub: `${t.pri} priority · ${t.cat} · ${Math.round(h2)}h left`, taskId: t.id })
    } else {
      slots.push({ h, isNow, type: 'free', title: 'Free block', sub: 'Deep work buffer or personal time' })
    }
  }
  return slots
}

export default function ScheduleView() {
  const tasks  = useStore(s => s.tasks)
  const habits = useStore(s => s.habits)
  const [slots, setSlots]   = useState([])
  const [focus, setFocus]   = useState(null)
  const [aiPlan, setAiPlan] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const s = buildSchedule(tasks)
    setSlots(s)
    const top = sortByUrgency(tasks).find(t => !t.done)
    setFocus(top || null)
  }, [tasks])

  const genAIPlan = async () => {
    setLoading(true)
    try {
      const reply = await callGemini({
        system: buildSystemPrompt(tasks, habits),
        messages: [{ role: 'user', content: 'Give me a concise, realistic day plan for today based on my tasks. List 4-5 specific time blocks with what to do. Be direct and actionable.' }],
        maxTokens: 350,
      })
      setAiPlan(reply)
    } catch {
      setAiPlan('Could not reach AI — check your API connection.')
    }
    setLoading(false)
  }

  return (
    <>
      {/* Focus card */}
      {focus && (
        <div className={styles.focusBanner}>
          <div className={styles.focusLeft}>
            <div className={styles.focusEyebrow}>🎯 Top priority right now</div>
            <div className={styles.focusTitle}>{focus.title}</div>
            <div className={styles.focusMeta}>{focus.pri} · {focus.cat} · {Math.round(hoursFrom(focus))}h left</div>
          </div>
          <button className={styles.planBtn} onClick={genAIPlan} disabled={loading}>
            {loading ? '…' : '✦ AI Day Plan'}
          </button>
        </div>
      )}

      {/* AI generated plan */}
      {aiPlan && (
        <div className={styles.aiPlan}>
          <div className={styles.aiPlanHead}>✦ Your AI-generated day plan</div>
          <div className={styles.aiPlanBody}>{aiPlan}</div>
        </div>
      )}

      {/* Time blocks */}
      <section>
        <div className={styles.sectionHead}>
          <span className={styles.sectionLabel}>◷ Time-blocked schedule</span>
          <span className={styles.sectionSub}>auto-sorted by urgency</span>
        </div>

        <div className={styles.grid}>
          {slots.map((s, i) => (
            <div key={i} className={styles.row}>
              <div className={`${styles.hourLabel} ${s.isNow ? styles.nowLabel : ''}`}>
                {HOUR_LABELS(s.h)}
              </div>
              <div className={`${styles.slot} ${s.isNow ? styles.nowSlot : ''}`}>
                <div className={`${styles.event} ${styles[s.type]}`}>
                  <div className={styles.eventTitle}>{s.title}</div>
                  <div className={styles.eventSub}>{s.sub}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

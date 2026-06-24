import React, { useState, useRef, useEffect } from 'react'
import { useStore } from '../store.js'
import { callGemini, buildSystemPrompt, nowTime } from '../utils/helpers.js'
import styles from './Sidebar.module.css'

const QUICK_PROMPTS = [
  { icon: '⚡', text: 'What should I focus on right now?' },
  { icon: '⏰', text: 'Am I going to miss any deadlines today?' },
  { icon: '📅', text: 'Build me a study schedule for today' },
  { icon: '🎯', text: 'What can I realistically finish in 2 hours?' },
  { icon: '🔥', text: 'Give me a push to get started' },
]

export default function Sidebar() {
  const tasks       = useStore(s => s.tasks)
  const habits      = useStore(s => s.habits)
  const chatHistory = useStore(s => s.chatHistory)
  const pushChat    = useStore(s => s.pushChat)

  const [input,     setInput]     = useState('')
  const [thinking,  setThinking]  = useState(false)
  const [showQuick, setShowQuick] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, thinking])

  const saveApiKey = (key) => {
    setApiKey(key)
    localStorage.setItem('gemini_api_key', key)
  }

  const send = async (msg) => {
    if (!msg.trim() || thinking) return
    setShowQuick(false)
    setInput('')
    pushChat({ role: 'user', content: msg, time: nowTime() })
    setThinking(true)
    try {
      const reply = await callGemini({
        system:   buildSystemPrompt(tasks, habits),
        messages: [...chatHistory, { role: 'user', content: msg }].map(m => ({ role: m.role, content: m.content })),
        maxTokens: 300,
      })
      pushChat({ role: 'assistant', content: reply, time: nowTime() })
    } catch (err) {
      console.error(err)
      pushChat({ role: 'assistant', content: 'Connection error — check API access and try again.', time: nowTime() })
    }
    setThinking(false)
  }

  return (
    <aside className={styles.aside}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.aliveDot} />
          <span className={styles.title}>AI Companion</span>
          <button 
            className={styles.settingsBtn} 
            onClick={() => setShowSettings(!showSettings)}
            title="Configure AI API Key"
          >
            ⚙️
          </button>
        </div>
        <div className={styles.sub}>
          {apiKey.trim() ? 'Powered by Gemini · Custom key active' : 'Powered by Gemini · Default key active'}
        </div>
      </div>

      {showSettings && (
        <div className={styles.settingsPanel}>
          <div className={styles.settingsLabel}>Google Gemini API Key</div>
          <div className={styles.settingsDesc}>
            Calls are made directly to Gemini. Leave blank to use your default key.
          </div>
          <div className={styles.keyRow}>
            <input
              type="password"
              className={styles.keyInput}
              value={apiKey}
              onChange={e => saveApiKey(e.target.value)}
              placeholder="AIzaSy..."
            />
            {apiKey.trim() && (
              <button className={styles.clearBtn} onClick={() => saveApiKey('')}>
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      <div className={styles.msgs}>
        {showQuick && (
          <div className={styles.quickPrompts}>
            {QUICK_PROMPTS.map((q, i) => (
              <button key={i} className={styles.qp} onClick={() => send(q.text)}>
                <span>{q.icon}</span> {q.text}
              </button>
            ))}
          </div>
        )}

        {chatHistory.map((m, i) => (
          <div key={i} className={`${styles.msg} ${styles[m.role]}`}>
            <div className={styles.bubble}>{m.content}</div>
            <div className={styles.time}>{m.time}</div>
          </div>
        ))}

        {thinking && (
          <div className={`${styles.msg} ${styles.assistant}`}>
            <div className={`${styles.bubble} ${styles.thinking}`}>
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className={styles.inputArea}>
        <div className={styles.inputRow}>
          <input
            className={styles.input}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send(input)}
            placeholder="Ask your AI companion…"
            disabled={thinking}
          />
          <button
            className={styles.sendBtn}
            onClick={() => send(input)}
            disabled={!input.trim() || thinking}
          >
            ↑
          </button>
        </div>
      </div>
    </aside>
  )
}

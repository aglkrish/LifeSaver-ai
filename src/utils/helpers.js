import { parseTaskOffline, mockClaudeResponse } from './offlineAI.js'

// ─── Time helpers ────────────────────────────────────────────
export const hoursFrom = (task) => (new Date(task.deadline) - Date.now()) / 3600000

export const fmtDeadline = (date) =>
  new Date(date).toLocaleDateString('en-IN', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })

export const nowTime = () =>
  new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

// ─── Urgency scoring (lower = more urgent) ──────────────────
export const urgencyScore = (task) => {
  if (task.done) return 9999
  const h = hoursFrom(task)
  if (h < 0)  return -1
  if (h < 12) return h / 100
  if (h < 24) return 1 + h / 100
  if (h < 48) return 2 + h / 100
  return 3 + h / 100
}

export const urgencyLevel = (task) => {
  const h = hoursFrom(task)
  if (h < 0)  return 'overdue'
  if (h < 12) return 'critical'
  if (h < 24) return 'high'
  if (h < 48) return 'medium'
  return 'low'
}

export const deadlineLabel = (task) => {
  const h = hoursFrom(task)
  if (h < 0) return 'Overdue'
  if (h < 24) return `${Math.round(h)}h left`
  return `${Math.round(h / 24)}d left`
}

export const aiTip = (task) => {
  const h = hoursFrom(task)
  if (h < 0)  return { label: 'Overdue', msg: 'Inform stakeholders immediately and submit what you have.' }
  if (h < 6)  return { label: 'Critical window', msg: 'Drop everything — block 2h right now.' }
  if (h < 24) return { label: 'Due today', msg: 'Schedule a focused 90-min session before 6 PM.' }
  if (h < 48) return { label: 'Due tomorrow', msg: 'Outline tonight, complete it first thing tomorrow.' }
  return { label: 'On track', msg: `Set a reminder ${Math.round(h/24) - 1}d before deadline.` }
}

// ─── Sort tasks by urgency ───────────────────────────────────
export const sortByUrgency = (tasks) =>
  [...tasks].sort((a, b) => urgencyScore(a) - urgencyScore(b))

// ─── Google Gemini API call ──────────────────────────────────
export const callGemini = async ({ system, messages, maxTokens = 350 }) => {
  let apiKey = localStorage.getItem('gemini_api_key');
  if (apiKey === 'undefined' || apiKey === 'null') {
    apiKey = '';
  }
  apiKey = apiKey || (import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) || "";
  apiKey = apiKey.trim();

  if (!apiKey || apiKey === 'undefined' || apiKey === 'null') {
    return mockClaudeResponse({ system, messages });
  }

  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  // Proxy the request through our Vite dev server to bypass local browser CORS / adblocker blocks
  const url = `/api/gemini/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents,
      systemInstruction: {
        parts: [{ text: system }]
      },
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 0.7,
      }
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
    return data.candidates[0].content.parts[0].text;
  }
  throw new Error('Invalid response structure from Gemini API');
}

// ─── Build AI system prompt from live task state ─────────────
export const buildSystemPrompt = (tasks, habits) => {
  const pending = sortByUrgency(tasks)
    .filter(t => !t.done)
    .slice(0, 8)
    .map(t => `- "${t.title}" [${t.cat}, ${t.pri}, ${Math.round(hoursFrom(t))}h left]`)
    .join('\n')

  const habitSummary = habits
    .map(h => `- ${h.name}: ${h.streak}d streak, ${h.days.filter(Boolean).length}/7 this week`)
    .join('\n')

  return `You are LifeSaver AI, a sharp and warm productivity companion.
User: Krish, CS undergrad at Bennett University (AI/ML specialization), actively applying to AI/ML internships.

Pending tasks (sorted by urgency):
${pending || 'No pending tasks'}

Habits this week:
${habitSummary || 'No habits tracked'}

Rules:
- Be concise: 2-4 sentences unless a plan is requested
- Speak naturally, no bullet lists in chat
- Be urgency-aware — highlight what matters NOW
- Suggest specific time blocks when relevant
- Be encouraging but honest`
}

// ─── Parse natural language task via Gemini ──────────────────
export const parseTaskWithAI = async (input) => {
  let apiKey = localStorage.getItem('gemini_api_key');
  if (apiKey === 'undefined' || apiKey === 'null') {
    apiKey = '';
  }
  apiKey = apiKey || (import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) || "";
  apiKey = apiKey.trim();

  if (!apiKey || apiKey === 'undefined' || apiKey === 'null') {
    return parseTaskOffline(input);
  }

  try {
    const text = await callGemini({
      maxTokens: 200,
      system: 'You are a task parser. Return ONLY valid JSON, no markdown, no backticks, no explanation.',
      messages: [{
        role: 'user',
        content: `Parse this task: "${input}"
Return JSON: {"title":string,"cat":"Work"|"Study"|"Personal"|"Health"|"Finance"|"Project","pri":"critical"|"high"|"medium"|"low","hoursFromNow":number,"tip":string}
hoursFromNow = hours until deadline mentioned (default 24). tip = 1 short action sentence.`
      }]
    })
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch (err) {
    console.warn('AI parsing failed, falling back to local regex parser:', err);
    return parseTaskOffline(input);
  }
}

// ─── Local Mock AI Helper Functions ──────────────────────────

// Parse the system prompt string to extract task & habit information
const parseSystemPrompt = (system) => {
  const tasks = [];
  const habits = [];
  
  if (!system) return { tasks, habits };
  
  // Extract tasks
  const pendingSection = system.match(/Pending tasks \([\s\S]*?\):\n([\s\S]*?)(?:\n\n|\nHabits|$)/);
  if (pendingSection && pendingSection[1]) {
    const taskLines = pendingSection[1].split('\n');
    taskLines.forEach(line => {
      const match = line.match(/^-\s*"([^"]+)"\s*\[([^,]+),\s*([^,]+),\s*(-?\d+)h\s+left\]/);
      if (match) {
        tasks.push({
          title: match[1],
          cat: match[2],
          pri: match[3],
          hoursLeft: parseInt(match[4]),
        });
      }
    });
  }
  
  // Extract habits
  const habitSection = system.match(/Habits this week:\n([\s\S]*?)(?:\n\n|\nRules|$)/);
  if (habitSection && habitSection[1]) {
    const habitLines = habitSection[1].split('\n');
    habitLines.forEach(line => {
      const match = line.match(/^-\s*([^:]+):\s*(\d+)d\s+streak/);
      if (match) {
        habits.push({
          name: match[1],
          streak: parseInt(match[2]),
        });
      }
    });
  }
  
  return { tasks, habits };
};

// Heuristics-based natural language parser for Quick-Add when offline
export const parseTaskOffline = (input) => {
  const text = input.trim();
  const lower = text.toLowerCase();
  
  // Category detection
  let cat = 'Work';
  if (/\b(study|assignment|homework|class|lecture|exam|test|quiz|report|learn|read|book|coursework)\b/.test(lower)) {
    cat = 'Study';
  } else if (/\b(bill|pay|money|buy|tax|subscription|invoice|price|cost)\b/.test(lower)) {
    cat = 'Finance';
  } else if (/\b(health|gym|workout|run|walk|doctor|exercise|water|sleep|eat|jog|meditate)\b/.test(lower)) {
    cat = 'Health';
  } else if (/\b(project|code|deploy|git|build|repo|vercel|backend|frontend|dev|socket|app|api|npm|html)\b/.test(lower)) {
    cat = 'Project';
  } else if (/\b(call|meet|meeting|interview|email|resume|apply|internship|job|career)\b/.test(lower)) {
    cat = 'Work';
  } else if (/\b(personal|gift|party|clean|home|house|grocery|groceries|movie|game)\b/.test(lower)) {
    cat = 'Personal';
  }
  
  // Priority detection
  let pri = 'medium';
  if (/\b(critical|urgent|asap|fast|immediate|block|must)\b/.test(lower)) {
    pri = 'critical';
  } else if (/\b(high|important|priority|soon)\b/.test(lower)) {
    pri = 'high';
  } else if (/\b(low|leisure|relax|draft|whenever|someday)\b/.test(lower)) {
    pri = 'low';
  }
  
  // Deadline detection (hours from now)
  let hoursFromNow = 24;
  
  // Match "in X hours" or "in X days"
  const hourMatch = lower.match(/in\s+(\d+)\s+hours?/);
  const dayMatch = lower.match(/in\s+(\d+)\s+days?/);
  
  if (hourMatch) {
    hoursFromNow = parseInt(hourMatch[1]);
  } else if (dayMatch) {
    hoursFromNow = parseInt(dayMatch[1]) * 24;
  } else if (/\btonight\b/.test(lower)) {
    const now = new Date();
    const target = new Date();
    target.setHours(22, 0, 0, 0);
    const diff = (target - now) / 3600000;
    hoursFromNow = diff > 0 ? diff : 6;
  } else if (/\btomorrow\b/.test(lower)) {
    hoursFromNow = 24;
  } else if (/\bday after tomorrow\b/.test(lower)) {
    hoursFromNow = 48;
  } else {
    // Check for days of the week: monday, tuesday, etc.
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    let targetDayIdx = -1;
    for (let i = 0; i < daysOfWeek.length; i++) {
      if (lower.includes(daysOfWeek[i])) {
        targetDayIdx = i;
        break;
      }
    }
    if (targetDayIdx !== -1) {
      const now = new Date();
      let daysDiff = targetDayIdx - now.getDay();
      if (daysDiff <= 0) daysDiff += 7; // Next week
      hoursFromNow = daysDiff * 24;
    }
  }
  
  // Ensure hoursFromNow is valid
  if (isNaN(hoursFromNow) || hoursFromNow < 0) {
    hoursFromNow = 24;
  }
  
  // Tip generation based on category/priority
  let tip = 'Review requirements and set a focus block.';
  if (cat === 'Study') {
    tip = 'Review lecture slides and start with the core concepts.';
  } else if (cat === 'Finance') {
    tip = 'Complete this payment today to avoid any extra charges or lapses.';
  } else if (cat === 'Health') {
    tip = 'Block out time for physical activity, keeping distractions away.';
  } else if (cat === 'Project') {
    tip = 'Break it down: write a basic draft first, then test and iterate.';
  } else if (pri === 'critical' || pri === 'high') {
    tip = 'High priority task — block out a 90-minute focus session today.';
  } else {
    tip = 'Keep it simple and focus on checking it off early.';
  }

  // Clean the title from filler words
  let cleanTitle = text.replace(/^(add|create|make|parse|please|new)\s+/i, '');
  // Capitalize first letter
  cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

  return {
    title: cleanTitle,
    cat,
    pri,
    hoursFromNow,
    tip,
  };
};

// Mock response generator for chat dialogues when offline
export const mockClaudeResponse = async ({ system, messages }) => {
  const { tasks, habits } = parseSystemPrompt(system);
  const lastUserMsg = messages[messages.length - 1]?.content || '';
  const text = lastUserMsg.trim().toLowerCase();
  
  // Simulate delay to make the AI feel "alive"
  await new Promise(resolve => setTimeout(resolve, 800));

  // Custom responses for Quick Prompts
  if (text.includes('what should i focus on right now')) {
    if (tasks.length > 0) {
      const topTask = tasks[0]; // Already sorted by urgency in prompt
      return `Krish, you should focus on "${topTask.title}" (${topTask.cat}) right now. It's your top priority (${topTask.pri}) and you have about ${topTask.hoursLeft} hours left. Block out some time this afternoon to make headway on it!`;
    }
    return `You're all caught up on pending tasks, Krish! This is a great opportunity to check off a habit, read, or plan your next projects.`;
  }
  
  if (text.includes('miss any deadlines today') || text.includes('deadline')) {
    const urgent = tasks.filter(t => t.hoursLeft > 0 && t.hoursLeft <= 24);
    const overdue = tasks.filter(t => t.hoursLeft <= 0);
    
    let reply = '';
    if (overdue.length > 0) {
      reply += `You have ${overdue.length} overdue task(s) on your board, including "${overdue[0].title}". You should handle those immediately! `;
    }
    if (urgent.length > 0) {
      reply += `Watch out, Krish! You have ${urgent.length} task(s) due within the next 24 hours: ${urgent.map(t => `"${t.title}"`).join(', ')}. Keep a close eye on these and tackle them next.`;
    } else {
      reply += `No immediate deadlines due today! Your closest pending task is due in ${tasks[0] ? tasks[0].hoursLeft : 'no'} hours. Keep up the steady pace!`;
    }
    return reply;
  }
  
  if (text.includes('study schedule') || text.includes('schedule')) {
    const studyTasks = tasks.filter(t => t.cat === 'Study');
    if (studyTasks.length > 0) {
      return `Here's a study schedule proposal for today, Krish:
- 10:00 AM - 12:00 PM: Focus on "${studyTasks[0].title}" (Deep Work block)
- 12:00 PM - 1:00 PM: Break & Lunch
- 2:00 PM - 3:30 PM: Secondary study block ${studyTasks[1] ? `for "${studyTasks[1].title}"` : 'to review lecture notes'}
- 4:30 PM - 5:30 PM: Quick tasks & daily habits check-in.
Let's stick to this to stay ahead!`;
    }
    return `Here's a standard daily plan for today, Krish:
- 09:00 AM - 11:30 AM: Deep focus time (primary task)
- 11:30 AM - 12:30 PM: Administrative tasks / emails
- 12:30 PM - 01:30 PM: Lunch and reset
- 02:00 PM - 04:00 PM: Collaborative work or habit building
- 05:00 PM: Review progress & log tomorrow's tasks.`;
  }
  
  if (text.includes('realistically finish in 2 hours')) {
    const quickTasks = tasks.filter(t => t.pri === 'medium' || t.pri === 'low');
    if (quickTasks.length > 0) {
      return `In a 2-hour window, you can realistically finish:
"${quickTasks[0].title}"
${quickTasks[1] ? `and maybe "${quickTasks[1].title}"\n` : ''}
Focus on one, eliminate distractions, and use a 50-minute work block followed by a 10-minute break.`;
    }
    if (tasks.length > 0) {
      return `You have some high-urgency tasks. Try making a strong dent in "${tasks[0].title}" by breaking it down into smaller micro-steps. You can get the outline or core structure done in 2 hours!`;
    }
    return `Since your task board is empty, you can complete all your habits for today, like morning workout and reading!`;
  }
  
  if (text.includes('give me a push') || text.includes('motivation') || text.includes('push to get started')) {
    const activeTask = tasks[0];
    if (activeTask) {
      return `Hey Krish! Bennett ML internships won't apply to themselves, and assignments won't write themselves. You've got "${activeTask.title}" waiting. Open your IDE, turn on Do Not Disturb, and work for just 15 minutes. The momentum will carry you!`;
    }
    return `Krish, you've been doing great. Build on your streak of habits and keep moving forward. What's one small thing you can check off right now?`;
  }

  // AI Day Plan prompt from ScheduleView.jsx:
  if (text.includes('give me a concise, realistic day plan for today based on my tasks')) {
    if (tasks.length === 0) {
      return `Your board is empty today! Focus on:
- 09:00 AM: Cardio workout / Exercise
- 10:30 AM: Read 30 mins
- 02:00 PM: Work on side projects or resume building
- 08:00 PM: Hydrate and plan for tomorrow.`;
    }
    const lines = [];
    lines.push(`Here is your custom day plan to handle your ${tasks.length} pending task(s):`);
    let hour = 9;
    tasks.slice(0, 4).forEach((t, idx) => {
      const displayHour = hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`;
      const nextHour = (hour + 2) > 12 ? `${hour + 2 - 12}:00 PM` : `${hour + 2}:00 AM`;
      lines.push(`- ${displayHour} - ${nextHour}: Focus on "${t.title}" (${t.cat})`);
      hour += 2.5;
    });
    lines.push(`- Evening: Wrap up daily habits (workouts/hydration).`);
    return lines.join('\n');
  }
  
  // General responses/fallbacks based on keyword matches
  if (text.includes('habit') || text.includes('streak')) {
    if (habits.length > 0) {
      const best = habits.reduce((prev, current) => (prev.streak > current.streak) ? prev : current);
      return `Your habits are looking solid! Your best streak is ${best.streak} days on "${best.name}". Keep it up! Consistency is key for long-term growth.`;
    }
    return `You haven't added any habits yet. Try tracking something simple like "Morning workout" or "Drinking 8 glasses of water" to build daily routines!`;
  }
  
  if (text.includes('hi') || text.includes('hello') || text.includes('hey')) {
    return `Hello Krish! I'm your AI productivity companion. I'm looking at your tasks and habits. How can I help you plan or prioritize your work today?`;
  }
  
  // Default fallback coach response
  if (tasks.length > 0) {
    const t = tasks[0];
    return `I hear you, Krish. With "${t.title}" coming up soon, let's make sure we stay focused. What specifically is blocking you from starting, or how can I help you break it down?`;
  }
  return `I'm here to help, Krish! Let me know if you want to organize your tasks, parse a new schedule, or get some productivity advice.`;
};

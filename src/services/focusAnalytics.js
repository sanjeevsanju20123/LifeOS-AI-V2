// src/services/focusAnalytics.js
export function sumMinutes(weekly) {
  return (weekly || []).reduce((s, d) => s + (d.minutes || 0), 0);
}

export function sumSessions(weekly) {
  return (weekly || []).reduce((s, d) => s + (d.sessions || 0), 0);
}

// Return array of 7 days starting from Monday label + data mapping (fill 0 if missing)
export function weeklySeries(weeklyHistory = []) {
  // Normalize to map by ISO date string
  const map = new Map((weeklyHistory || []).map(d => [d.date, d]));
  // compute current week mon..sun given latest date in data or today
  const end = weeklyHistory.length ? new Date(weeklyHistory[weeklyHistory.length - 1].date) : new Date();
  // find monday of that week
  const day = end.getDay(); // 0 Sunday..6 Saturday
  const diffToMon = (day + 6) % 7; // days since Monday
  const monday = new Date(end);
  monday.setDate(end.getDate() - diffToMon);
  const series = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const item = map.get(iso) || { date: iso, minutes: 0, sessions: 0 };
    // label like Mon, Tue
    const label = d.toLocaleDateString(undefined, { weekday: 'short' });
    series.push({ ...item, label });
  }
  return series;
}

// compute current streak (consecutive days ending today with minutes>0) and best streak overall in history
export function computeStreaks(allHistory = []) {
  // allHistory should be array of {date, minutes}. Sort ascending by date
  const hist = [...allHistory].sort((a, b) => a.date.localeCompare(b.date));
  let best = 0;
  let current = 0;
  let lastDate = null;

  for (const entry of hist) {
    const minutes = entry.minutes || 0;
    if (!lastDate) {
      if (minutes > 0) {
        current = 1;
        best = Math.max(best, current);
      } else {
        current = 0;
      }
      lastDate = entry.date;
      continue;
    }
    // check if entry.date is consecutive day from lastDate
    const ld = new Date(lastDate);
    const next = new Date(ld);
    next.setDate(ld.getDate() + 1);
    const nextISO = next.toISOString().slice(0, 10);
    if (entry.date === nextISO && (entry.minutes || 0) > 0) {
      current += 1;
    } else if (entry.date === nextISO && (entry.minutes || 0) === 0) {
      current = 0;
    } else {
      // gap bigger than 1 day or non-consecutive — reset if entry has minutes>0
      current = (entry.minutes || 0) > 0 ? 1 : 0;
    }
    best = Math.max(best, current);
    lastDate = entry.date;
  }

  // currentStreak should be recomputed to count consecutive days ending on last entry if last entry is today-like
  // Simpler approach: compute current streak by walking backward from last date
  let currentStreak = 0;
  const map = new Map(hist.map(e => [e.date, e.minutes || 0]));
  // start at last date in hist if present else today
  let cursor = hist.length ? new Date(hist[hist.length - 1].date) : new Date();
  while (true) {
    const iso = cursor.toISOString().slice(0, 10);
    const m = map.get(iso) || 0;
    if (m > 0) {
      currentStreak += 1;
    } else {
      break;
    }
    cursor.setDate(cursor.getDate() - 1);
  }

  return { current: currentStreak, best };
}

export function bestDay(weeklyHistory = []) {
  if (!weeklyHistory || weeklyHistory.length === 0) return null;
  const best = weeklyHistory.reduce((acc, d) => (d.minutes > (acc.minutes || 0) ? d : acc), {});
  if (!best.date) return null;
  const label = new Date(best.date).toLocaleDateString(undefined, { weekday: 'long' });
  return { date: best.date, label, minutes: best.minutes || 0 };
}

// percent change between totals: ((current - previous) / previous) * 100
export function percentChange(current, previous) {
  if (!previous) return null;
  return Math.round(((current - previous) / previous) * 100);
}

// focusScore heuristic: targetMinutesPerDay (default 30). Score 0..100
export function focusScore(weeklyHistory = [], targetMinutesPerDay = 30) {
  const total = sumMinutes(weeklyHistory);
  const goal = targetMinutesPerDay * 7;
  const pct = Math.min(1, total / goal);
  return Math.round(pct * 100);
}
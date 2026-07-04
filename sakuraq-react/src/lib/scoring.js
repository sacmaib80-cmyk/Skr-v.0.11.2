import { RULES } from './constants.js'
import { round1 } from './date.js'

// ── Quality checks (ported from the vanilla insight-bonus engine) ──

export function isLowQualityText(text) {
  const t = String(text || '').trim()
  if (!t) return true
  // long char runs: 555555 / aaaaaa
  if (/(.)\1{5,}/.test(t)) return true
  // same word repeated: "ดี ดี ดี" / "work work work"
  if (/(\b\S+\b)(\s+\1){2,}/i.test(t)) return true
  return false
}

/**
 * Bonus tiers — only apply when minutes >= bonusMinMinutes (25).
 *  +2  reflection note >= 20 chars, decent quality
 *  +4  above + why(>=12) + from(>=8) + to(>=8), all decent quality
 *  +6  above (+4) AND proof attached (>=10 chars) — the high-effort claim tier
 */
export function calcBonus({ minutes, note, why, from, to, proof }) {
  if ((Number(minutes) || 0) < RULES.bonusMinMinutes) return 0

  const noteT = String(note || '').trim()
  const whyT = String(why || '').trim()
  const fromT = String(from || '').trim()
  const toT = String(to || '').trim()
  const proofT = String(proof || '').trim()

  const passPlus2 = noteT.length >= 20 && !isLowQualityText(noteT)
  if (!passPlus2) return 0

  const passPlus4 =
    whyT.length >= 12 &&
    fromT.length >= 8 &&
    toT.length >= 8 &&
    !isLowQualityText(whyT) &&
    !isLowQualityText(fromT) &&
    !isLowQualityText(toT)

  if (!passPlus4) return 2

  const passPlus6 = proofT.length >= 10 && !isLowQualityText(proofT)
  return passPlus6 ? 6 : 4
}

// Base minutes already spent on this quest-name today (for the daily cap).
export function baseMinutesUsedToday(day, questName) {
  if (!day || !Array.isArray(day.quests)) return 0
  const qn = normName(questName)
  return day.quests
    .filter((q) => normName(q.questName) === qn)
    .reduce((s, q) => s + (Number(q.baseMinutesUsed) || 0), 0)
}

export function normName(s) {
  return String(s || '').trim().toLowerCase()
}

/**
 * Full score for one submitted quest, respecting the per-name daily cap.
 * Returns { baseMinutesUsed, baseScore, bonus, questScore }.
 */
export function scoreQuest({ day, questName, minutes, bonusInputs }) {
  const used = baseMinutesUsedToday(day, questName)
  const remaining = Math.max(0, RULES.baseCapPerQuestNamePerDay - used)
  const baseMinutesUsed = Math.min(Number(minutes) || 0, remaining)
  const baseScore = round1(baseMinutesUsed * RULES.basePerMinute)
  const bonus = calcBonus({ minutes, ...bonusInputs })
  const questScore = round1(baseScore + bonus)
  return { baseMinutesUsed, baseScore, bonus, questScore }
}

// ── Day / lifetime aggregation ──

export function dayGross(day) {
  if (!day || !Array.isArray(day.quests)) return 0
  const quests = day.quests.reduce((s, q) => s + (Number(q.questScore) || 0), 0)
  return round1(quests + (Number(day.gateBonus) || 0))
}

// break-penalty tier for minutes past the grace window
export function breakPenaltyFor(minutesOver, tiers) {
  const m = Math.floor(minutesOver)
  if (m < 1) return 0
  const tier = tiers.find((t) => m >= t.minOver && m <= t.maxOver)
  return tier ? tier.pts : 0
}

export function dayPenalties(day) {
  if (!day || !Array.isArray(day.penalties)) return 0
  return round1(day.penalties.reduce((s, p) => s + (Number(p.pts) || 0), 0))
}

// Effective total = gross minus break penalties (never below 0).
export function dayEffective(day) {
  return round1(Math.max(0, dayGross(day) - dayPenalties(day)))
}

export function lifetimePoints(days) {
  let total = 0
  Object.values(days || {}).forEach((d) => {
    total += dayEffective(d)
  })
  return round1(total)
}

export function levelFromPoints(points) {
  return Math.floor((Number(points) || 0) / RULES.pointsPerLevel) + 1
}

// Points into the current level (0..100) for the level bar.
export function levelProgress(points) {
  return round1((Number(points) || 0) % RULES.pointsPerLevel)
}

/**
 * Streak = consecutive days (ending today or yesterday) that have >=1 quest.
 */
export function computeStreak(days, todayKey, addDaysFn) {
  const has = (k) => {
    const d = days[k]
    return !!(d && Array.isArray(d.quests) && d.quests.length > 0)
  }
  let cursor = todayKey
  // allow the streak to "hold" if today isn't done yet but yesterday was
  if (!has(cursor)) cursor = addDaysFn(todayKey, -1)
  let count = 0
  while (has(cursor)) {
    count++
    cursor = addDaysFn(cursor, -1)
  }
  return count
}

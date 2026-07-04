// Local-date helpers (mirror the vanilla app's localDateKey behaviour).

export function localDateKey(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function addDays(dateKey, n) {
  const [y, m, d] = dateKey.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + n)
  return localDateKey(dt)
}

export function round1(n) {
  return Math.round((Number(n) || 0) * 10) / 10
}

// Whole days from dateKey a → b (b - a). Positive if b is later.
export function daysBetween(a, b) {
  const [ay, am, ad] = a.split('-').map(Number)
  const [by, bm, bd] = b.split('-').map(Number)
  const da = new Date(ay, am - 1, ad)
  const db = new Date(by, bm - 1, bd)
  return Math.round((db - da) / 86400000)
}

// "3 ก.ค." style short label
const TH_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']

export function shortLabel(dateKey) {
  const [, m, d] = dateKey.split('-').map(Number)
  return `${d} ${TH_MONTHS[m - 1]}`
}

const TH_WEEK = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
export function weekdayLabel(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number)
  return TH_WEEK[new Date(y, m - 1, d).getDay()]
}

export function isToday(dateKey) {
  return dateKey === localDateKey()
}

export function fmtClock(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds))
  const mm = String(Math.floor(s / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

export function timeAgo(ts) {
  const diff = Date.now() - ts
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'เมื่อกี้'
  if (min < 60) return `${min} นาทีก่อน`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} ชม.ก่อน`
  const day = Math.floor(hr / 24)
  return `${day} วันก่อน`
}

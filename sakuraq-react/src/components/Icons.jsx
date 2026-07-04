// Line-style icon set (stroke = currentColor).
const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }

export const IconHome = (p) => (
  <svg viewBox="0 0 24 24" {...S} {...p}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" /><path d="M9.5 21v-6h5v6" /></svg>
)
export const IconToday = (p) => (
  <svg viewBox="0 0 24 24" {...S} {...p}><rect x="3.5" y="4.5" width="17" height="16" rx="3" /><path d="M3.5 9h17M8 3v3M16 3v3" /><path d="m8.5 14 2 2 4-4" /></svg>
)
export const IconHistory = (p) => (
  <svg viewBox="0 0 24 24" {...S} {...p}><path d="M4 5v14M4 15l4-4 4 3 5-6 3 2.5" /><circle cx="8" cy="11" r="0.6" fill="currentColor" /></svg>
)
export const IconStore = (p) => (
  <svg viewBox="0 0 24 24" {...S} {...p}><path d="M4 8h16l-1 12H5L4 8Z" /><path d="M8.5 8V6a3.5 3.5 0 0 1 7 0v2" /></svg>
)
export const IconPlay = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M7 5.5v13a1 1 0 0 0 1.5.87l11-6.5a1 1 0 0 0 0-1.74l-11-6.5A1 1 0 0 0 7 5.5Z" /></svg>
)
export const IconPause = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}><rect x="6" y="4.5" width="4" height="15" rx="1.6" /><rect x="14" y="4.5" width="4" height="15" rx="1.6" /></svg>
)
export const IconStop = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}><rect x="5.5" y="5.5" width="13" height="13" rx="3" /></svg>
)
export const IconArrow = (p) => (
  <svg viewBox="0 0 24 24" {...S} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
)
export const IconBack = (p) => (
  <svg viewBox="0 0 24 24" {...S} {...p}><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
)
export const IconCheck = (p) => (
  <svg viewBox="0 0 24 24" {...S} {...p}><path d="m5 13 4 4L19 7" /></svg>
)
export const IconTrash = (p) => (
  <svg viewBox="0 0 24 24" {...S} {...p}><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M10 11v6M14 11v6" /></svg>
)
export const IconFlame = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 2c1 3-1.5 4.2-1.5 6.5 0 1 .6 1.8 1.5 1.8 1.4 0 1.6-1.8 1.3-3 2 1.4 3.2 3.6 3.2 6.2A6.5 6.5 0 0 1 12 20a6.5 6.5 0 0 1-6.5-6.5c0-4 3-6.3 4.4-8.4C10.7 3.7 11.6 2.8 12 2Z" /></svg>
)
export const IconStar = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 3.2 14.5 9l6.3.5-4.8 4.1 1.5 6.1L12 16.6 6.5 19.7 8 13.6 3.2 9.5 9.5 9 12 3.2Z" /></svg>
)
export const IconBolt = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" /></svg>
)
export const IconCoin = (p) => (
  <svg viewBox="0 0 24 24" {...S} {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5v9M9.5 9.5c0-1.2 1.1-2 2.5-2s2.5.8 2.5 2-1.1 2-2.5 2-2.5.8-2.5 2 1.1 2 2.5 2 2.5-.8 2.5-2" /></svg>
)
export const IconBook = (p) => (
  <svg viewBox="0 0 24 24" {...S} {...p}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5Z" /><path d="M4 5.5v15" /></svg>
)
export const IconBriefcase = (p) => (
  <svg viewBox="0 0 24 24" {...S} {...p}><rect x="3" y="7" width="18" height="13" rx="2.5" /><path d="M8 7V5.5A2.5 2.5 0 0 1 10.5 3h3A2.5 2.5 0 0 1 16 5.5V7" /></svg>
)
export const IconDumbbell = (p) => (
  <svg viewBox="0 0 24 24" {...S} {...p}><path d="M4 9v6M7 7v10M17 7v10M20 9v6M7 12h10" /></svg>
)
export const IconHeart = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 20s-7-4.3-9.2-8.5C1.2 8.2 3 5 6.2 5c2 0 3.2 1.2 3.8 2.2C10.6 6.2 11.8 5 13.8 5 17 5 18.8 8.2 21.2 11.5 19 15.7 12 20 12 20Z" /></svg>
)

export const catIcon = (id) => {
  if (id === 'Learning') return IconBook
  if (id === 'Work/Project') return IconBriefcase
  if (id === 'Physical') return IconDumbbell
  if (id === 'Connection') return IconHeart
  return IconStar
}

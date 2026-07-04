import { useEffect, useRef } from 'react'

// Ambient falling sakura petals on a canvas. Cheap, GPU-friendly, respects reduced-motion.
export default function SakuraPetals({ density = 14, colors = ['#fbcfe8', '#f9a8d4', '#e9d5ff', '#c7d2fe'] }) {
  const ref = useRef(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf
    let w = 0
    let h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)

    const rnd = (a, b) => a + Math.random() * (b - a)
    const make = (top) => ({
      x: rnd(0, w),
      y: top ? rnd(-h, 0) : rnd(-40, h),
      r: rnd(4, 9),
      sway: rnd(0.4, 1.4),
      swayOff: rnd(0, Math.PI * 2),
      vy: rnd(0.25, 0.8),
      rot: rnd(0, Math.PI * 2),
      vr: rnd(-0.02, 0.02),
      color: colors[(Math.random() * colors.length) | 0],
      alpha: rnd(0.45, 0.9),
    })
    let petals = Array.from({ length: density }, () => make(false))

    const drawPetal = (p) => {
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.globalAlpha = p.alpha
      ctx.fillStyle = p.color
      ctx.beginPath()
      // simple petal: two arcs
      ctx.moveTo(0, -p.r)
      ctx.quadraticCurveTo(p.r, -p.r * 0.2, 0, p.r)
      ctx.quadraticCurveTo(-p.r, -p.r * 0.2, 0, -p.r)
      ctx.fill()
      ctx.restore()
    }

    let t = 0
    const loop = () => {
      t += 0.016
      ctx.clearRect(0, 0, w, h)
      for (const p of petals) {
        p.y += p.vy
        p.x += Math.sin(t * p.sway + p.swayOff) * 0.5
        p.rot += p.vr
        if (p.y > h + 20) Object.assign(p, make(true))
        drawPetal(p)
      }
      raf = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [density])

  return <canvas ref={ref} className="petals" aria-hidden="true" />
}

import { motion } from 'framer-motion'
import { useState } from 'react'

/**
 * SakuraQ brand mascot (the real fox art).
 *  - default: animated fox-idle.webm (falls back to mascot.png if the video fails)
 *  - still:   static mascot.png (for celebration / empty states)
 */
export default function Mascot({ size = 150, still = false, float = true, glow = true }) {
  const [videoFailed, setVideoFailed] = useState(false)
  const useVideo = !still && !videoFailed

  return (
    <motion.div
      style={{ width: size, height: size, position: 'relative' }}
      animate={float ? { y: [0, -9, 0] } : {}}
      transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
    >
      {glow && (
        <div
          style={{
            position: 'absolute',
            inset: '12%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(167,139,250,0.30), transparent 66%)',
            filter: 'blur(12px)',
            zIndex: 0,
          }}
        />
      )}
      {useVideo ? (
        <video
          src="/fox-idle.webm"
          autoPlay
          muted
          loop
          playsInline
          onError={() => setVideoFailed(true)}
          style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'relative', zIndex: 1 }}
        />
      ) : (
        <img
          src="/mascot.png"
          alt="SakuraQ"
          style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'relative', zIndex: 1 }}
        />
      )}
    </motion.div>
  )
}

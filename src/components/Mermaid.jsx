'use client'

import { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

let idCounter = 0

export default function Mermaid({ chart }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!chart || !ref.current) return

    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose'
    })

    const id = `mermaid-${idCounter++}`

    mermaid.render(id, chart, (svgCode) => {
      if (ref.current) {
        ref.current.innerHTML = svgCode
      }
    })
  }, [chart])

  return (
    <div className="mermaid-wrapper">
      <div ref={ref} />
    </div>
  )
}
'use client'

import { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

let idCounter = 0
let isInitialized = false

export default function Mermaid({ chart }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!chart || !ref.current) return

    let cancelled = false

    async function renderChart() {
      if (!isInitialized) {
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose'
        })
        isInitialized = true
      }

      const id = `mermaid-${idCounter++}`
      const element = ref.current

      if (!element) return

      try {
        const { svg, bindFunctions } = await mermaid.render(id, chart, element)

        if (cancelled || !ref.current) return

        ref.current.innerHTML = svg
        bindFunctions?.(ref.current)
      } catch (error) {
        if (!cancelled && ref.current) {
          ref.current.innerHTML = '<pre>Unable to render diagram.</pre>'
        }
        console.error('Mermaid render failed', error)
      }
    }

    renderChart()

    return () => {
      cancelled = true
    }
  }, [chart])

  return (
    <div className="mermaid-wrapper">
      <div ref={ref} />
    </div>
  )
}

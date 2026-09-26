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
          securityLevel: 'loose',
          theme: 'base',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          themeVariables: {
            fontSize: '15px',
            primaryColor: '#e8f5f0',
            primaryBorderColor: '#009c6f',
            primaryTextColor: '#1f2937',
            lineColor: '#64748b',
            secondaryColor: '#fdf2f2',
            tertiaryColor: '#ffffff'
          },
          flowchart: {
            htmlLabels: true,
            curve: 'basis',
            nodeSpacing: 32,
            rankSpacing: 30,
            padding: 10,
            wrappingWidth: 220,
            useMaxWidth: true
          }
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

        // Render at natural size (mermaid sets width:100%, which collapses inside a flex item)
        const svgEl = ref.current.querySelector('svg')
        const naturalWidth = svgEl?.viewBox?.baseVal?.width
        if (svgEl && naturalWidth) {
          svgEl.style.width = `${naturalWidth}px`
          svgEl.style.maxWidth = '100%'
        }
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

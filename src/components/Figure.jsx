import { ImageZoom } from 'nextra/components'

// Markdown images: keeps Nextra's click-to-zoom and shows the alt text as a caption.
// Spans (not <figure>) because markdown puts images inside a <p>.
export default function Figure(props) {
  const { alt } = props

  return (
    <span className="ds-figure">
      <ImageZoom {...props} />
      {alt ? <span className="ds-figcaption">{alt}</span> : null}
    </span>
  )
}

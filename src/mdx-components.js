import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs'
import Figure from '@/components/Figure'
import Mermaid from '@/components/Mermaid'

export function useMDXComponents(components) {
  return {
    ...getDocsMDXComponents(),
    img: Figure,
    ...components,
    Mermaid
  }
}

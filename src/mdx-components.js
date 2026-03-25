import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs'
import Mermaid from '@/components/Mermaid'

export function useMDXComponents(components) {
  return {
    ...getDocsMDXComponents(),
    ...components,
    Mermaid
  }
}
import { generateStaticParamsFor, importPage } from 'nextra/pages'
import { notFound } from 'next/navigation'
import { useMDXComponents as getMDXComponents } from '@/mdx-components'
import { locales } from '@/proxy'
export const generateStaticParams = generateStaticParamsFor('mdxPath', 'lang')

export async function generateMetadata(props) {
  const params = await props.params

  try {
    const { metadata } = await importPage(params.mdxPath ?? [], params.lang)
    return metadata
  } catch (e) {
    return {}
  }
  
}

const Wrapper = getMDXComponents().wrapper ?? (({ children }) => <>{children}</>)

export default async function Page(props) {
  const params = await props.params

  if (!locales.includes(params.lang)) {
    notFound() // Triggers your root app/not-found.jsx
  }
  
  try {
    const {
      default: MDXContent,
      toc,
      metadata,
      sourceCode
    } = await importPage(params.mdxPath ?? [], params.lang)
    return (
      <Wrapper toc={toc} metadata={metadata} sourceCode={sourceCode}>
        <MDXContent {...props} params={params} />
      </Wrapper>
    )
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND' || e.message.includes('Cannot find module')) {
      notFound() 
    }

    throw e
  }
  
  
}

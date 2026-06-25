// proxy.js (located in your root or src/ directory)
import { NextResponse } from 'next/server'
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'

export const locales = ['en', 'fr', 'pt']
const defaultLocale = 'en'

function getLocale(request) {
  const headers = { 'accept-language': request.headers.get('accept-language') || '' }
  const languages = new Negotiator({ headers }).languages()
  return match(languages, locales, defaultLocale)
}

export function proxy(request) {
  const { pathname } = request.nextUrl
  
  // 1. Check if the URL already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
  if (pathnameHasLocale) return

  // 2. Check for a cookie first, then fall back to browser headers
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  const locale = locales.includes(cookieLocale) ? cookieLocale : getLocale(request)

  const url = new URL(`/${locale}${pathname === '/' ? '' : pathname}`, request.url)
  return NextResponse.redirect(url)
}

// proxy.js
export const config = {
  matcher: [
    /*
     * Exclude everything that is NOT a content page:
     * - api, _next, .well-known (system)
     * - images, favicon, robots.txt (static)
     */
    '/((?!api|_vercel|_next/static|_next/image|.well-known|_pagefind|images|favicon.ico).*)',
  ],
}
import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { MoonberryHeader } from './MoonberryHeader'
import { SiteFooter } from './SiteFooter'

function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1))
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname, hash])

  return null
}

export function Layout() {
  const location = useLocation()

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:right-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:text-sm focus:text-plum"
      >
        رفتن به محتوای اصلی
      </a>
      <MoonberryHeader />
      <main id="main" key={location.pathname} className="flex-1 animate-riseIn">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}

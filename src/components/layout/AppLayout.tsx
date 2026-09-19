import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MobileNav } from './MobileNav'

export function AppLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans">
      {/* Permanent Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:z-30 lg:flex lg:flex-col pointer-events-none [&>*]:pointer-events-auto">
        <Sidebar />
      </div>

      {/* Mobile Drawer Navigation */}
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* Main App Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onOpenMobileMenu={() => setMobileNavOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

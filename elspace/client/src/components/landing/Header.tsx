'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'

export function Header() {
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 dark:border-gray-800 dark:bg-gray-950/95 backdrop-blur">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <Icons.logo className="h-8 w-8" />
          <span className="font-space-grotesk text-xl font-bold">
            <span className="text-cyan-500">EL</span>
            <span className="text-indigo-900 dark:text-white">SPACE</span>
          </span>
        </Link>

        <div className="hidden items-center space-x-6 md:flex">
          <Link href="/projects" className="text-sm font-medium text-gray-600 hover:text-cyan-500 dark:text-gray-400">
            Browse Projects
          </Link>
          <Link href="/freelancers" className="text-sm font-medium text-gray-600 hover:text-cyan-500 dark:text-gray-400">
            Find Freelancers
          </Link>
          <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-cyan-500 dark:text-gray-400">
            Features
          </Link>
          <Link href="#pricing" className="text-sm font-medium text-gray-600 hover:text-cyan-500 dark:text-gray-400">
            Pricing
          </Link>
        </div>

        <div className="hidden space-x-3 md:flex">
          {session ? (
            <Button asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Icons.menu className="h-6 w-6" />
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="border-t border-gray-200 dark:border-gray-800 md:hidden">
          <div className="container mx-auto flex flex-col space-y-4 px-4 py-4">
            <Link href="/projects" className="text-sm font-medium">
              Browse Projects
            </Link>
            <Link href="/freelancers" className="text-sm font-medium">
              Find Freelancers
            </Link>
            <Link href="#features" className="text-sm font-medium">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium">
              Pricing
            </Link>
            <div className="space-y-2 pt-4">
              {session ? (
                <Button asChild className="w-full">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/register">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

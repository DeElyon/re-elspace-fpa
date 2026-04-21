'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'

export function MobileNav() {
  return (
    <nav className="md:hidden">
      <div className="flex items-center justify-between p-4">
        <Link href="/" className="flex items-center space-x-2">
          <Icons.logo className="h-6 w-6" />
          <span className="font-space-grotesk font-bold">ELSPACE</span>
        </Link>
        <Button size="icon" variant="ghost">
          <Icons.menu className="h-6 w-6" />
        </Button>
      </div>
    </nav>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Icons } from '@/components/ui/icons'

export function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const handleSearch = (value: string) => {
    if (value.startsWith('/')) {
      // Handle commands
      const command = value.slice(1).toLowerCase()
      if (command === 'projects') {
        router.push('/projects')
      } else if (command === 'dashboard') {
        router.push('/dashboard')
      }
      setOpen(false)
    }
  }

  return (
    <div className="hidden md:block">
      <Input
        placeholder="Search or type / for commands..."
        className="w-64"
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  )
}

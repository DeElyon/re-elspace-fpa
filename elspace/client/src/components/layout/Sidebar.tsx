'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/cn'
import { Icons } from '@/components/ui/icons'

export function Sidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()

  const isFreelancer = session?.user?.role === 'FREELANCER'
  const isClient = session?.user?.role === 'CLIENT'
  const isAdmin = session?.user?.role === 'ADMIN'

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Icons.home,
      show: true,
    },
    {
      name: 'Projects',
      href: '/projects',
      icon: Icons.briefcase,
      show: true,
    },
    {
      name: 'Freelancers',
      href: '/freelancers',
      icon: Icons.users,
      show: isClient,
    },
    {
      name: 'My Projects',
      href: '/projects/my-projects',
      icon: Icons.folder,
      show: isFreelancer || isClient,
    },
    {
      name: 'Messages',
      href: '/messages',
      icon: Icons.messageCircle,
      show: true,
    },
    {
      name: 'Sessions',
      href: '/sessions',
      icon: Icons.calendar,
      show: isFreelancer,
    },
    {
      name: 'Wallet',
      href: '/wallet',
      icon: Icons.dollarSign,
      show: true,
    },
    {
      name: 'Feed',
      href: '/feed',
      icon: Icons.feed,
      show: true,
    },
    {
      name: 'Communities',
      href: '/communities',
      icon: Icons.users,
      show: true,
    },
    {
      name: 'Disputes',
      href: '/disputes',
      icon: Icons.alertTriangle,
      show: true,
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: Icons.user,
      show: true,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Icons.settings,
      show: true,
    },
    {
      name: 'Admin',
      href: '/admin',
      icon: Icons.shield,
      show: isAdmin,
    },
  ]

  const visibleNav = navigation.filter(item => item.show)

  return (
    <aside className="hidden w-64 border-r border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950 md:block">
      <div className="h-full overflow-y-auto p-4">
        <nav className="space-y-2">
          {visibleNav.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-cyan-100 text-cyan-900 dark:bg-cyan-900/20 dark:text-cyan-400'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 py-20 md:py-32">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-cyan-50 to-indigo-100 dark:from-cyan-950/20 dark:to-indigo-950/20" />
      
      <div className="container mx-auto max-w-4xl text-center">
        <h1 className="font-space-grotesk text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
          <span className="bg-gradient-to-r from-cyan-500 to-indigo-600 bg-clip-text text-transparent">
            Connect. Build. Earn.
          </span>
        </h1>
        <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 md:text-xl">
          The ultimate freelance platform for global talent and ambitious projects. Work with top professionals or find expert help for your vision.
        </p>
        
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button size="lg" asChild>
            <Link href="/register">
              Get Started
              <Icons.arrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/projects">
              Browse Projects
            </Link>
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-8 md:grid-cols-4 lg:gap-12">
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-cyan-500">1M+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Projects</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-indigo-600">500K+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Freelancers</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-amber-500">$5B+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Earnings</div>
          </div>
          <div className="col-span-3 flex flex-col items-center md:col-span-1">
            <div className="text-3xl font-bold text-green-500">99%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Success</div>
          </div>
        </div>
      </div>
    </section>
  )
}

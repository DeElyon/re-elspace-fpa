'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'

export function CTASection() {
  return (
    <section className="bg-gradient-to-r from-cyan-600 to-indigo-600 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="font-space-grotesk text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-cyan-100 mb-8">
            Join thousands of professionals and businesses on EL SPACE today
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">
                Start as Freelancer
              </Link>
            </Button>
            <Button size="lg" className="bg-white text-cyan-600 hover:bg-gray-100" asChild>
              <Link href="/register?role=CLIENT">
                Post a Project
              </Link>
            </Button>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="text-white">
              <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                <Icons.shield className="h-6 w-6 text-cyan-200" />
              </div>
              <h3 className="font-semibold mb-1">100% Secure</h3>
              <p className="text-sm text-cyan-100">
                Encrypted payments and verified professionals
              </p>
            </div>
            <div className="text-white">
              <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                <Icons.zap className="h-6 w-6 text-cyan-200" />
              </div>
              <h3 className="font-semibold mb-1">Fast & Easy</h3>
              <p className="text-sm text-cyan-100">
                Get connected with talent in minutes
              </p>
            </div>
            <div className="text-white">
              <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                <Icons.headphones className="h-6 w-6 text-cyan-200" />
              </div>
              <h3 className="font-semibold mb-1">24/7 Support</h3>
              <p className="text-sm text-cyan-100">
                Always here to help when you need us
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

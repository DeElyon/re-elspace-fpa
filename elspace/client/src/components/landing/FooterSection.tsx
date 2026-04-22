'use client'

import Link from 'next/link'
import { Icons } from '@/components/ui/icons'

export function FooterSection() {
  return (
    <footer className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-5">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Icons.logo className="h-6 w-6" />
              <span className="font-space-grotesk font-bold">
                <span className="text-cyan-500">EL</span>
                <span className="dark:text-white">SPACE</span>
              </span>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Connecting talented professionals with opportunity
            </p>
          </div>

          {/* For Freelancers */}
          <div>
            <h3 className="font-semibold mb-4">For Freelancers</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link href="/projects" className="hover:text-cyan-500">
                  Browse Projects
                </Link>
              </li>
              <li>
                <Link href="/sessions" className="hover:text-cyan-500">
                  Book Sessions
                </Link>
              </li>
              <li>
                <Link href="/communities" className="hover:text-cyan-500">
                  Communities
                </Link>
              </li>
              <li>
                <Link href="/dashboard?role=FREELANCER" className="hover:text-cyan-500">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* For Clients */}
          <div>
            <h3 className="font-semibold mb-4">For Clients</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link href="/freelancers" className="hover:text-cyan-500">
                  Find Talent
                </Link>
              </li>
              <li>
                <Link href="/projects/post" className="hover:text-cyan-500">
                  Post a Project
                </Link>
              </li>
              <li>
                <Link href="/dashboard?role=CLIENT" className="hover:text-cyan-500">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-cyan-500">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link href="/about" className="hover:text-cyan-500">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-cyan-500">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-cyan-500">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-cyan-500">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link href="/privacy" className="hover:text-cyan-500">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-cyan-500">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-cyan-500">
                  Security
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-cyan-500">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © 2024 EL VERSE TECHNOLOGIES. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <Icons.twitter className="h-5 w-5 text-gray-600 hover:text-cyan-500 dark:text-gray-400" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <Icons.linkedin className="h-5 w-5 text-gray-600 hover:text-cyan-500 dark:text-gray-400" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Icons.github className="h-5 w-5 text-gray-600 hover:text-cyan-500 dark:text-gray-400" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

'use client'

import { Icons } from '@/components/ui/icons'

const features = [
  {
    title: 'Global Talent Pool',
    description: 'Access millions of freelancers from around the world with diverse skills and expertise.',
    icon: Icons.globe,
  },
  {
    title: 'Secure Escrow',
    description: 'Protected payments with our secure escrow system. Pay only when you\'re satisfied.',
    icon: Icons.lock,
  },
  {
    title: 'Real-time Messaging',
    description: 'Communicate instantly with team members and clients through our built-in chat system.',
    icon: Icons.messageSquare,
  },
  {
    title: 'Smart Matching',
    description: 'AI-powered project matching algorithm finds the perfect freelancer for your needs.',
    icon: Icons.zap,
  },
  {
    title: 'Video Conferencing',
    description: 'Built-in video calls for meetings, interviews, and real-time collaboration.',
    icon: Icons.video,
  },
  {
    title: '24/7 Support',
    description: 'Dedicated support team available around the clock to help with any issues.',
    icon: Icons.headphones,
  },
]

export function FeaturesSection() {
  return (
    <section className="border-t border-gray-200 px-4 py-20 dark:border-gray-800 md:py-32">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="font-space-grotesk text-4xl font-bold md:text-5xl">
            Why Choose EL SPACE?
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Everything you need to succeed in the gig economy
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group rounded-lg border border-gray-200 bg-white p-6 transition-all hover:border-cyan-500 hover:shadow-lg dark:border-gray-800 dark:bg-gray-950"
              >
                <div className="inline-flex rounded-lg bg-cyan-100 p-3 text-cyan-600 transition-all group-hover:bg-cyan-200 dark:bg-cyan-950 dark:text-cyan-400">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'

export function PricingSection() {
  const plans = [
    {
      name: 'Freelancer',
      description: 'Perfect for independent professionals',
      price: 'Free',
      period: 'Forever',
      features: [
        'Unlimited project bidding',
        'Portfolio showcase',
        'Real-time messaging',
        '1-on-1 sessions',
        'Secure payments',
        'Community access',
      ],
      icon: <Icons.briefcase className="h-6 w-6" />,
    },
    {
      name: 'Pro Freelancer',
      description: 'For experienced professionals',
      price: '$9',
      period: 'per month',
      features: [
        'Everything in Freelancer',
        'Advanced analytics',
        'Priority support',
        'Featured profile',
        'Client testimonials',
        'Advanced filters',
      ],
      icon: <Icons.star className="h-6 w-6" />,
      popular: true,
    },
    {
      name: 'Business',
      description: 'For growing companies',
      price: '$48',
      period: 'per month',
      features: [
        'Unlimited project postings',
        'Team management',
        'Advanced analytics',
        'Priority support',
        'Custom branding',
        'Dedicated account manager',
      ],
      icon: <Icons.buildingIcon className="h-6 w-6" />,
    },
  ]

  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <Badge className="mb-4">Pricing</Badge>
          <h2 className="font-space-grotesk text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Choose the plan that works best for you
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative transition-all ${
                plan.popular
                  ? 'border-2 border-cyan-500 shadow-lg scale-105'
                  : ''
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500">
                  Most Popular
                </Badge>
              )}
              <CardHeader>
                <div className="mb-2 inline-block rounded-lg bg-cyan-100 p-3 dark:bg-cyan-900/30">
                  <div className="text-cyan-600 dark:text-cyan-400">
                    {plan.icon}
                  </div>
                </div>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="text-4xl font-bold">{plan.price}</div>
                  <p className="text-sm text-gray-500">{plan.period}</p>
                </div>

                <Button asChild className="w-full">
                  <Link href="/register">
                    Get Started
                  </Link>
                </Button>

                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center space-x-3">
                      <Icons.check className="h-5 w-5 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            All plans include platform fee rate of 7-10% on transactions.{' '}
            <Link href="/pricing" className="text-cyan-500 hover:underline">
              Learn more about fees
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}

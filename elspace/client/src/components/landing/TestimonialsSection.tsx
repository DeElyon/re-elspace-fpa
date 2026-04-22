'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'

export function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Founder & CEO',
      company: 'TechStart Inc.',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      content:
        'EL SPACE has been a game-changer for finding top talent. The vetting process ensures we work with quality professionals.',
      rating: 5,
    },
    {
      name: 'Marcus Williams',
      role: 'Senior Developer',
      company: 'Freelance',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
      content:
        'The platform makes it easy to showcase my work and connect with clients. I\'ve tripled my income since joining.',
      rating: 5,
    },
    {
      name: 'Elena Rodriguez',
      role: 'Product Manager',
      company: 'InnovateLabs',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
      content:
        'The real-time messaging and video sessions make collaboration seamless. Highly recommended for any business.',
      rating: 5,
    },
  ]

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 py-20">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <Badge className="mb-4">Testimonials</Badge>
          <h2 className="font-space-grotesk text-4xl font-bold mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            See what our users have to say
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Icons.star
                      key={i}
                      className="h-5 w-5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                <p className="mb-6 text-gray-700 dark:text-gray-300">
                  "{testimonial.content}"
                </p>

                <div className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={testimonial.image} />
                    <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

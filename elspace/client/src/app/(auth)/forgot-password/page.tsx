'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/ui/icons'
import { useToast } from '@/hooks/useToast'

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error('Failed to send reset email')
      return res.json()
    },
    onSuccess: () => {
      setIsSubmitted(true)
      toast({
        title: 'Reset Email Sent',
        description: 'Check your inbox for password reset instructions.',
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Unable to send reset email. Please try again.',
        variant: 'destructive',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      forgotPasswordMutation.mutate(email)
    }
  }

  if (isSubmitted) {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <Icons.mail className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="font-space-grotesk text-2xl">Check Your Email</CardTitle>
            <CardDescription>
              We've sent a password reset link to {email}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-500">
              Didn't receive the email? Check your spam folder or
            </p>
            <Button variant="link" onClick={() => setIsSubmitted(false)}>
              try again
            </Button>
          </CardContent>
          <CardFooter className="justify-center">
            <Link href="/login" className="text-sm text-cyan-500 hover:underline">
              Back to Login
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link href="/" className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center space-x-2">
        <Icons.logo className="h-8 w-8" />
        <span className="font-space-grotesk text-xl font-bold">
          <span className="text-cyan-500">EL</span>
          <span className="text-indigo-900 dark:text-white">SPACE</span>
        </span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-space-grotesk text-2xl">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={forgotPasswordMutation.isPending}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={!email || forgotPasswordMutation.isPending}
            >
              {forgotPasswordMutation.isPending && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Send Reset Link
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-gray-500">
            Remember your password?{' '}
            <Link href="/login" className="text-cyan-500 hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

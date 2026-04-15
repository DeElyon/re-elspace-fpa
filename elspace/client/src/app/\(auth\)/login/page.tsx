'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/useToast'
import { Icons } from '@/components/ui/icons'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  remember: z.boolean().optional(),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showTwoFactor, setShowTwoFactor] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        if (result.error === 'TwoFactorRequired') {
          setShowTwoFactor(true)
          toast({
            title: '2FA Required',
            description: 'Please enter your authentication code.',
          })
        } else {
          toast({
            title: 'Login Failed',
            description: 'Invalid email or password.',
            variant: 'destructive',
          })
        }
      } else {
        toast({
          title: 'Welcome back!',
          description: 'You have successfully logged in.',
          variant: 'success',
        })
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true)
    try {
      await signIn(provider, { callbackUrl })
    } catch (error) {
      setIsLoading(false)
    }
  }

  if (showTwoFactor) {
    return <TwoFactorForm email={watch('email')} callbackUrl={callbackUrl} />
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link
        href="/"
        className="absolute left-4 top-4 flex items-center space-x-2 md:left-8 md:top-8"
      >
        <Icons.logo className="h-8 w-8" />
        <span className="font-space-grotesk text-xl font-bold">
          <span className="text-cyan-500">EL</span>
          <span className="text-indigo-900 dark:text-white">SPACE</span>
        </span>
      </Link>

      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="font-space-grotesk text-3xl font-bold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sign in to your account to continue
          </p>
        </div>

        <div className="grid gap-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isLoading}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-cyan-500 hover:text-cyan-600"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoCapitalize="none"
                  autoComplete="current-password"
                  disabled={isLoading}
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="remember" {...register('remember')} />
                <Label
                  htmlFor="remember"
                  className="text-sm font-normal text-gray-500 dark:text-gray-400"
                >
                  Remember me for 30 days
                </Label>
              </div>

              <Button type="submit" disabled={isLoading} className="bg-amber-500 hover:bg-amber-600">
                {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </div>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500 dark:bg-gray-950">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              type="button"
              disabled={isLoading}
              onClick={() => handleSocialLogin('google')}
            >
              <Icons.google className="mr-2 h-4 w-4" />
              Google
            </Button>
            <Button
              variant="outline"
              type="button"
              disabled={isLoading}
              onClick={() => handleSocialLogin('github')}
            >
              <Icons.gitHub className="mr-2 h-4 w-4" />
              GitHub
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Don&apos;t have an account?
            </p>
            <Link
              href="/register"
              className="text-sm font-medium text-cyan-500 hover:text-cyan-600"
            >
              Sign up
            </Link>
          </div>
        </div>

        <p className="px-8 text-center text-xs text-gray-500">
          By signing in, you agree to our{' '}
          <Link href="/legal/terms" className="underline hover:text-cyan-500">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/legal/privacy" className="underline hover:text-cyan-500">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}

function TwoFactorForm({ email, callbackUrl }: { email: string; callbackUrl: string }) {
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        code,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: 'Invalid Code',
          description: 'Please check your authentication code and try again.',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Welcome back!',
          description: 'You have successfully logged in.',
          variant: 'success',
        })
        router.push(callbackUrl)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="font-space-grotesk text-2xl font-bold">Two-Factor Authentication</h1>
        <p className="text-sm text-gray-500">
          Enter the code from your authenticator app
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="code">Authentication Code</Label>
            <Input
              id="code"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Verify
          </Button>
        </div>
      </form>
    </div>
  )
}

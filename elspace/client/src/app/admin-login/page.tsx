// client/src/app/admin-login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'
import { useToast } from '@/hooks/useToast'

export default function AdminLoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: 'Access Denied',
          description: 'Invalid credentials or insufficient permissions.',
          variant: 'destructive',
        })
      } else {
        const session = await fetch('/api/auth/session').then(res => res.json())
        
        if (session?.user?.role === 'ADMIN' || session?.user?.role === 'MODERATOR') {
          toast({
            title: 'Access Granted',
            description: 'Welcome to the admin panel.',
          })
          router.push('/admin')
        } else {
          toast({
            title: 'Access Denied',
            description: 'You do not have admin privileges.',
            variant: 'destructive',
          })
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
            <Icons.shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <CardTitle className="font-space-grotesk text-2xl">Admin Access</CardTitle>
          <CardDescription>
            Enter your credentials to access the control panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@elspace.tech"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
              Access Control Panel
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

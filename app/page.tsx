"use client";

import { useState } from 'react';
import AuthForm from './components/AuthForm';
import { useRouter } from 'next/navigation';

export default function Page() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  const handleLogin = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        document.cookie = `auth-token=${data.token}; path=/`;
        router.push('/dashboard');
      } else {
        const data = await res.json();
        alert(data.error || 'Login failed.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  const handleRegister = async (email: string, password: string, name?: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      if (res.ok) {
        setIsLogin(true); // Switch to login form after successful registration
      } else {
        const data = await res.json();
        alert(data.error || 'Registration failed.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome to MockMate</h1>
          <p className="mt-2 text-gray-600">
            {isLogin ? "Sign in to your account" : "Create your account"}
          </p>
        </div>

        <AuthForm
          title={isLogin ? "Login" : "Register"}
          onSubmit={isLogin ? handleLogin : handleRegister}
          linkText={isLogin ? "Need an account? Register here" : "Already have an account? Login here"}
          linkHref="#"
          onLinkClick={() => setIsLogin(!isLogin)}
        />
      </div>
    </div>
  );
}
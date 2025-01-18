"use client";

import { useRouter } from 'next/navigation';
import AuthForm from '../../components/AuthForm';

const Login = () => {
  const router = useRouter();

  const handleLogin = async (email: string, password: string) => {
    try {
      console.log('Attempting login...');
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // Important for handling cookies
      });

      console.log('Login response status:', res.status);
      
      if (res.ok) {
        console.log('Login successful, redirecting...');
        // Force a complete page reload to ensure middleware picks up the new cookie
        window.location.href = '/landing';
      } else {
        const data = await res.json();
        console.error('Login failed:', data);
        alert(data.error || 'Login failed.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Something went wrong.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <AuthForm
          title="Login"
          onSubmit={handleLogin}
          linkText="Don't have an account? Register here."
          linkHref="/auth/register"
        />
      </div>
    </div>
  );
};

export default Login;
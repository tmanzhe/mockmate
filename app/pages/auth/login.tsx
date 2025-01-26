import React from 'react';
import AuthForm from '../../components/AuthForm';

const Login = () => {
  const handleLogin = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        window.location.href = '/';
      } else {
        alert('Login failed.');
      }
    } catch (error) {
      console.error('Login error:', error); // Log the error for debugging
      alert('Something went wrong.');
    }
  };

  return (
    <AuthForm
      title="Login"
      onSubmit={handleLogin}
      linkText="Don't have an account? Register here."
      linkHref="/auth/register"
    />
  );
};

export default Login;
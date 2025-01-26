"use client";

import { useState } from 'react';
import AuthForm from './components/AuthForm';

export default function Page() {
  const [isLogin, setIsLogin] = useState(true);

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
        window.location.href = '/landing'; // Force full page reload
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
    <main
      className="gradient-background flex justify-center items-center"
      style={{ 
        height: "100vh", 
        width: "100vw", 
        overflow: "hidden", // Prevent scrolling
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.70)", // More subtle background
          padding: "2rem", // Comfortable padding
          textAlign: "center",
          width: "90%",
          maxWidth: "400px", // Compact width
          borderRadius: "12px",
        }}
      >
        <h1
          style={{
            color: "#F1DAC4",
            fontSize: "2rem", // Smaller font size
            marginBottom: "1rem", // Reduced margin
          }}
        >
          Welcome to MockMate
        </h1>
        <p
          style={{
            color: "#A69CAC",
            marginBottom: "1.5rem", // Reduced margin
            fontSize: "1rem", // Smaller font size
            lineHeight: "1.5",
          }}
        >
          {isLogin ? "Sign in to your account" : "Create your account"}
        </p>

        <AuthForm
          title={isLogin ? "Login" : "Register"}
          onSubmit={isLogin ? handleLogin : handleRegister}
          linkText={isLogin ? "Need an account? Register here" : "Already have an account? Login here"}
          linkHref="#"
          onLinkClick={() => setIsLogin(!isLogin)}
        />
      </div>
    </main>
  );
}
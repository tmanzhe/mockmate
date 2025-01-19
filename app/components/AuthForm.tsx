"use client";

import { useState } from 'react';

interface AuthFormProps {
  title: string;
  onSubmit: (email: string, password: string, name?: string) => void;
  linkText: string;
  linkHref: string;
  onLinkClick?: () => void;
}

const AuthForm = ({ title, onSubmit, linkText, linkHref, onLinkClick }: AuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (title === 'Register') {
      onSubmit(email, password, name);
    } else {
      onSubmit(email, password);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {title === 'Register' && (
        <div>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.8rem", // Reduced padding
              border: "1px solid #A69CAC", // Subtle border
              borderRadius: "4px", // Minimal border radius
              marginBottom: "1rem", // Reduced margin
              fontSize: "1rem", // Smaller font size
              backgroundColor: "transparent", // Transparent background
              color: "#F1DAC4", // Text color
            }}
          />
        </div>
      )}
      <div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "0.8rem", // Reduced padding
            border: "1px solid #A69CAC", // Subtle border
            borderRadius: "4px", // Minimal border radius
            marginBottom: "1rem", // Reduced margin
            fontSize: "1rem", // Smaller font size
            backgroundColor: "transparent", // Transparent background
            color: "#F1DAC4", // Text color
          }}
        />
      </div>
      <div>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "0.8rem", // Reduced padding
            border: "1px solid #A69CAC", // Subtle border
            borderRadius: "4px", // Minimal border radius
            marginBottom: "1rem", // Reduced margin
            fontSize: "1rem", // Smaller font size
            backgroundColor: "transparent", // Transparent background
            color: "#F1DAC4", // Text color
          }}
        />
      </div>
      <button
        type="submit"
        style={{
          backgroundColor: "#161B33",
          color: "#F1DAC4",
          padding: "0.8rem 1.5rem", // Reduced padding
          border: "none",
          borderRadius: "4px", // Minimal border radius
          fontSize: "1rem", // Smaller font size
          cursor: "pointer",
          transition: "all 0.3s ease",
          width: "100%",
        }}
      >
        {title}
      </button>
      <p
        style={{
          color: "#A69CAC",
          marginTop: "1rem", // Reduced margin
          fontSize: "0.9rem", // Smaller font size
        }}
      >
        {onLinkClick ? (
          <button
            onClick={(e) => {
              e.preventDefault();
              onLinkClick();
            }}
            style={{
              color: "#F1DAC4",
              background: "none",
              border: "none",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            {linkText}
          </button>
        ) : (
          <a
            href={linkHref}
            style={{
              color: "#F1DAC4",
              textDecoration: "underline",
            }}
          >
            {linkText}
          </a>
        )}
      </p>
    </form>
  );
};

export default AuthForm;
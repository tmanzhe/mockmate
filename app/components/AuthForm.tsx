"use client";

import { useState } from 'react';
import Link from 'next/link';

interface AuthFormProps {
  title: string;
  onSubmit: (email: string, password: string, name?: string) => void;
  linkText: string;
  linkHref: string;
}

const AuthForm = ({ title, onSubmit, linkText, linkHref }: AuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title === 'Register') {
      onSubmit(email, password, name);
    } else {
      onSubmit(email, password);
    }
  };

  return (
    <div>
      <h1>{title}</h1>
      <form onSubmit={handleSubmit}>
        {title === 'Register' && (
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{title}</button>
      </form>
      <p>
        <Link href={linkHref}>{linkText}</Link>
      </p>
    </div>
  );
};

export default AuthForm;
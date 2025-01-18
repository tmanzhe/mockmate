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
    <div className="mt-8 space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {title === 'Register' && (
          <div>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {title}
        </button>
      </form>
      <p className="text-center">
        {onLinkClick ? (
          <button
            onClick={(e) => {
              e.preventDefault();
              onLinkClick();
            }}
            className="text-blue-600 hover:text-blue-800"
          >
            {linkText}
          </button>
        ) : (
          <a href={linkHref} className="text-blue-600 hover:text-blue-800">
            {linkText}
          </a>
        )}
      </p>
    </div>
  );
};

export default AuthForm;
import React from 'react';
import AuthForm from '../../components/AuthForm';

const Register = () => {
  const handleRegister = async (email: string, password: string, name?: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      if (res.ok) {
        window.location.href = '/auth/login';
      } else {
        alert('Registration failed.');
      }
    } catch (error) {
      alert('Something went wrong.');
    }
  };

  return (
    <AuthForm
      title="Register"
      onSubmit={handleRegister}
      linkText="Already have an account? Login here."
      linkHref="/auth/login"
    />
  );
};

export default Register;
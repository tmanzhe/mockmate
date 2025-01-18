"use client";

import AuthForm from './components/AuthForm';

const Page = () => {
  const handleRegister = async (email: string, password: string, name?: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      if (res.ok) {
        console.log('Registration successful!');
        window.location.href = '/auth/login';
      } else {
        const data = await res.json();
        alert(data.error || 'Registration failed.');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <div>
      <h1>Register</h1>
      <AuthForm
        title="Register"
        onSubmit={handleRegister}
        linkText="Already have an account? Login here."
        linkHref="/auth/login"
      />
    </div>
  );
};

export default Page;

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
        const data = await res.json();
        document.cookie = `auth-token=${data.token}; path=/`;
        window.location.href = '/dashboard';
      } else {
        alert('Login failed.');
      }
    } catch (error) {
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

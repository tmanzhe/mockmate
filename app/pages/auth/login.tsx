import router from 'next/router';
import AuthForm from '../../components/AuthForm';

const Login = () => {
    const handleLogin = async (email: string, password: string) => {
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
      
          let data;
          try {
            data = await res.json();
          } catch (e) {
            console.error('Failed to parse JSON response:', e);
            throw new Error('Invalid server response');
          }
      
          if (res.ok) {
            document.cookie = `auth-token=${data.token}; path=/`;
            router.push('/dashboard');
          } else {
            alert(data.error || 'Login failed.');
          }
        } catch (error) {
          console.error('Login error:', error);
          alert('Something went wrong. Please try again.');
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

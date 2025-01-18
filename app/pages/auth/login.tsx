import AuthForm from '../../components/AuthForm';

const Login = () => {
    const handleLogin = async (email: string, password: string) => {
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
      
          // Check if the response is OK
          if (res.ok) {
            const contentType = res.headers.get('Content-Type');
            if (contentType && contentType.includes('application/json')) {
              const data = await res.json();
              document.cookie = `auth-token=${data.token}; path=/`;
              window.location.href = '/dashboard';
            } else {
              // If the response is not JSON, handle accordingly
              alert('Server did not return JSON.');
            }
          } else {
            // If the server returned an error (non-200 status code)
            const errorData = await res.json().catch(() => {
              // In case the response is not JSON
              return { error: 'Login failed due to an unknown error.' };
            });
            alert(errorData.error || 'Login failed.');
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

import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <h1>Welcome to MockMate</h1>
      <p>Please choose an option:</p>
      <div>
        <Link href="/auth/login">
          <button>Login</button>
        </Link>
        <Link href="/auth/register">
          <button>Register</button>
        </Link>
      </div>
    </main>
  );
}

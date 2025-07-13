import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { setDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Login() {
  const { currentUser, signIn, signUp } = useAuth();
  const router = useRouter();
  
  if (currentUser) router.push('/dashboard');   // already logged in

  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isNew) {
        const cred = await signUp(email, pw);
        // Add user to users collection with default role
        await setDoc(doc(db, 'users', cred.user.uid), {
          role: 'pm',
          email
        });
      } else {
        await signIn(email, pw);
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="h-screen flex flex-col items-center justify-center bg-gray-100">
      <form onSubmit={onSubmit} className="bg-white p-6 rounded shadow w-80 space-y-4">
        <h1 className="text-xl font-semibold text-center">{isNew ? 'Sign Up' : 'Log In'}</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <input 
          type="email" 
          placeholder="Email" 
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={pw}
          onChange={e => setPw(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : (isNew ? 'Create Account' : 'Login')}
        </button>
        <p className="text-center text-sm">
          {isNew ? 'Have an account?' : "New here?"}{' '}
          <span 
            onClick={() => setIsNew(!isNew)} 
            className="text-blue-600 cursor-pointer hover:underline"
          >
            {isNew ? 'Log in' : 'Sign up'}
          </span>
        </p>
      </form>
    </main>
  );
} 
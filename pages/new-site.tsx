import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useRouter } from 'next/router';
import Link from 'next/link';


export default function NewSite() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!currentUser) { 
    router.push('/login'); 
    return null; 
  }

  const handleSave = async () => {
    if (!name.trim() || !location.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await addDoc(collection(db, 'sites'), {
        name: name.trim(),
        location: location.trim(),
        owner: currentUser.uid,
        createdAt: Timestamp.now()
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create site');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="bg-white p-6 rounded shadow w-96 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">New Site</h1>
            <Link 
              href="/dashboard" 
              className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
            >
              ← Back to Dashboard
            </Link>
          </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <input 
          value={name} 
          onChange={e => setName(e.target.value)}
          placeholder="Site Name" 
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input 
          value={location} 
          onChange={e => setLocation(e.target.value)}
          placeholder="Location" 
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button 
          onClick={handleSave} 
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Creating...' : 'Save Site'}
        </button>
        </div>
      </div>
    </main>
  );
} 
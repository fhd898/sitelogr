import Link from 'next/link';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import useRole from '../hooks/useRole';

type Site = { id: string; name: string; location: string };

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const role = useRole();

  useEffect(() => {
    if (!currentUser) { 
      router.push('/login'); 
      return; 
    }
    
    const q = query(collection(db, 'sites'), where('owner', '==', currentUser.uid));
    const unsubscribe = onSnapshot(q, (snap) => {
      setSites(snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Site, 'id'>) })));
      setLoading(false);
    }, (error) => {
      console.error('Error fetching sites:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!currentUser) return null; // loading redirect

  return (
    <main className="p-6 max-w-xl mx-auto">
      {/* Site header bar */}
      <header className="sticky top-0 bg-white/70 backdrop-blur mb-6 py-3 px-4 shadow-sm">
        <h1 className="text-xl font-bold">SiteLogr Dashboard</h1>
      </header>
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Sites</h1>
        {['owner','pm'].includes(role ?? '') && (
          <Link 
            href="/new-site" 
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
          >
            + New Site
          </Link>
        )}
      </header>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading your sites...</p>
        </div>
      ) : sites.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">No sites yet.</p>
          {['owner','pm'].includes(role ?? '') && (
            <Link 
              href="/new-site" 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Create your first site
            </Link>
          )}
        </div>
      ) : (
        <ul className="space-y-3">
          {sites.map(site => (
            <li key={site.id} className="border border-gray-200 shadow-sm p-4 rounded-lg hover:shadow-md transition">
              <Link href={`/site/${site.id}`} className="block">
                <h2 className="font-semibold">{site.name}</h2>
                <p className="text-sm text-gray-600">{site.location}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
      
      <button 
        onClick={handleLogout} 
        className="mt-8 text-sm text-blue-600 hover:text-blue-800 hover:underline"
      >
        Log out
      </button>
      {/* Sticky FAB for new site (mobile) */}
      {['owner','pm'].includes(role ?? '') && (
        <Link href="/new-site"
          className="fixed bottom-5 right-5 bg-green-600 rounded-full w-14 h-14 flex items-center justify-center text-white text-2xl shadow-lg">
          +
        </Link>
      )}
    </main>
  );
} 
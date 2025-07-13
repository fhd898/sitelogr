import { useState } from 'react';
import { useRouter } from 'next/router';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../context/AuthContext';


export default function NewLog() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const { id: siteId } = router.query as { id: string };
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!siteId || !currentUser) return;
    let summary = '';
    setError(null);
    try {
      // Try to get AI summary
      const resp = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await resp.json();
      if (resp.ok) {
        summary = data.summary || '';
      } else {
        setError('AI summary unavailable, saving log without summary.');
      }
    } catch (err: any) {
      setError('AI summary unavailable, saving log without summary.');
    }
    // Save log with or without summary
    await addDoc(collection(db,'sites',siteId,'logs'),{
      text,
      summary,
      createdAt: Timestamp.now(),
      author: currentUser.uid,
    });
    router.push(`/site/${siteId}`);
  };

  if (!currentUser) { router.push('/login'); return null; }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="bg-white p-6 rounded shadow w-96 space-y-4">
          <h1 className="text-xl font-semibold text-center">New Daily Log</h1>
          <textarea 
            rows={4} 
            value={text} 
            onChange={e=>setText(e.target.value)}
            placeholder="Work performed, issues, weather…" 
            className="w-full border p-2 rounded"
          />
          <button onClick={save} className="w-full bg-green-600 text-white py-2 rounded">Save Log</button>
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </div>
      </div>
    </main>
  );
} 
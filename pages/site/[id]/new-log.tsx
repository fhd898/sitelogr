import { useState } from 'react';
import { useRouter } from 'next/router';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { v4 as uuid } from 'uuid';
import { useAuth } from '../../../context/AuthContext';
import { UploadButton } from '@uploadthing/react';

export default function NewLog() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const { id: siteId } = router.query as { id: string };
  const [text, setText] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!siteId || !currentUser) return;
    try {
      // 1️⃣ photoURLs are already set from UploadThing
      const photoURLs = files;
      // 2️⃣ AI summary via API route
      const resp = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'AI summary failed');
      const summary = data.summary || '';
      // 3️⃣ write to Firestore
      await addDoc(collection(db,'sites',siteId,'logs'),{
        text,
        summary,
        photos: photoURLs,
        createdAt: Timestamp.now(),
        author: currentUser.uid,
      });
      router.push(`/site/${siteId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to save log');
    }
  };

  if (!currentUser) { router.push('/login'); return null; }

  return (
    <main className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-96 space-y-4">
        <h1 className="text-xl font-semibold text-center">New Daily Log</h1>
        <textarea rows={4} value={text} onChange={e=>setText(e.target.value)}
                  placeholder="Work performed, issues, weather…" className="w-full border p-2 rounded"/>
        <UploadButton
          endpoint="imageUploader"
          onClientUploadComplete={res => {
            setFiles(res.map((f: any) => f.url));
          }}
          onUploadError={error => {
            setError(`Upload failed: ${error.message}`);
          }}
        />
        <button onClick={save} className="w-full bg-green-600 text-white py-2 rounded">Save Log</button>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </div>
    </main>
  );
} 
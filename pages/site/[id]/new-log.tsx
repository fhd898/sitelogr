import { useState } from 'react';
import { useRouter } from 'next/router';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db, storage } from '../../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuid } from 'uuid';
import { Configuration, OpenAIApi } from 'openai';
import { useAuth } from '../../../context/AuthContext';

export default function NewLog() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const { id: siteId } = router.query as { id: string };
  const [text, setText] = useState('');
  const [files, setFiles] = useState<FileList|null>(null);

  const save = async () => {
    if (!siteId || !currentUser) return;
    // 1️⃣ upload photos
    const photoURLs: string[] = [];
    if (files) {
      for (const file of Array.from(files)) {
        const storageRef = ref(storage, `logs/${siteId}/${uuid()}`);
        await uploadBytes(storageRef, file);
        photoURLs.push(await getDownloadURL(storageRef));
      }
    }
    // 2️⃣ AI summary
    const openai = new OpenAIApi(new Configuration({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_KEY,
    }));
    const aiResp = await openai.createChatCompletion({
      model:'gpt-4o-mini',
      messages:[
        { role:'system', content:'You are a construction site diary assistant. Summarize the entry in 2-3 concise sentences.'},
        { role:'user', content:text }
      ]
    });
    const summary = aiResp.data.choices[0].message?.content || '';

    // 3️⃣ write to Firestore
    await addDoc(collection(db,'sites',siteId,'logs'),{
      text,
      summary,
      photos: photoURLs,
      createdAt: Timestamp.now(),
      author: currentUser.uid,
    });
    router.push(`/site/${siteId}`);
  };

  if (!currentUser) { router.push('/login'); return null; }

  return (
    <main className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-96 space-y-4">
        <h1 className="text-xl font-semibold text-center">New Daily Log</h1>
        <textarea rows={4} value={text} onChange={e=>setText(e.target.value)}
                  placeholder="Work performed, issues, weather…" className="w-full border p-2 rounded"/>
        <input type="file" multiple accept="image/*" onChange={e=>setFiles(e.target.files!)} />
        <button onClick={save} className="w-full bg-green-600 text-white py-2 rounded">Save Log</button>
      </div>
    </main>
  );
} 
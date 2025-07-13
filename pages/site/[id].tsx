import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { makeLogPDF } from '../../lib/pdf';
import useRole from '../../hooks/useRole';

export default function SitePage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const { id } = router.query as { id: string };
  const [logs, setLogs] = useState<any[]>([]);
  const [siteName, setSiteName] = useState<string>('');
  const role = useRole();

  useEffect(() => {
    if (!currentUser) { router.push('/login'); return; }
    if (!id) return;
    // Fetch site data
    const siteRef = doc(db, 'sites', id);
    const unsubscribeSite = onSnapshot(siteRef, (doc) => {
      if (doc.exists()) {
        setSiteName(doc.data().name || 'Unknown Site');
      }
    });
    // Fetch logs
    const q = query(
      collection(db, 'sites', id, 'logs'),
      orderBy('createdAt','desc')
    );
    const unsubscribeLogs = onSnapshot(q, snap =>
      setLogs(snap.docs.map(d=>({ id:d.id, ...(d.data()) })))
    );
    return () => {
      unsubscribeSite();
      unsubscribeLogs();
    };
  }, [currentUser, id]);

  const handleDelete = async (logId: string) => {
    if (!id || !logId) return;
    await deleteDoc(doc(db, 'sites', id, 'logs', logId));
  };

  if (!currentUser) return null;

  return (
    <main className="p-6 max-w-xl mx-auto space-y-4">
      <Link href="/dashboard" className="text-sm text-blue-600">← Back</Link>
      <h1 className="text-2xl font-bold">Daily Logs</h1>
      <Link href={`/site/${id}/new-log`} className="bg-green-600 text-white px-3 py-1 rounded">
        + New Log
      </Link>
      {logs.length===0 && <p>No logs yet.</p>}
      {logs.map(l=>(
        <article key={l.id} className="border p-3 rounded">
          <p className="text-sm text-gray-600">{l.createdAt?.seconds ? new Date(l.createdAt.seconds*1000).toDateString() : ''}</p>
          <p className="my-2 whitespace-pre-wrap">{l.summary ?? l.text}</p>
          {l.photos?.length>0 && (
            <div className="flex gap-2">
              {l.photos.map((url:string)=><img key={url} src={url} className="h-16 w-16 object-cover rounded"/>) }
            </div>
          )}
          <button
            onClick={async()=> {
              const url = await makeLogPDF(siteName, l.summary ?? l.text, l.photos || []);
              window.open(url,'_blank');
            }}
            className="text-blue-600 text-sm"
          >
            Download PDF
          </button>
          {['owner','pm','supervisor'].includes(role ?? '') && (
            <button
              onClick={() => handleDelete(l.id)}
              className="ml-2 text-red-600 text-sm"
            >
              Delete
            </button>
          )}
        </article>
      ))}
    </main>
  );
} 
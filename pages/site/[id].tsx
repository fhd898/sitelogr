import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { makeLogPDF } from '../../lib/pdf';
import useRole from '../../hooks/useRole';
import StickyFab from '../../components/StickyFab';

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
      {logs.length===0 && <p>No logs yet.</p>}
      {logs.map(l=>(
        <article key={l.id} className="border p-3 rounded hover:shadow-md transition-all duration-200 hover:scale-[1.01] hover:border-green-200">
          <p className="text-sm text-gray-600">{l.createdAt?.seconds ? new Date(l.createdAt.seconds*1000).toDateString() : ''}</p>
          {l.weather && <p className="text-xs text-gray-400">Weather: {l.weather}</p>}
          <p className="my-2 whitespace-pre-wrap">{l.summary || l.text}</p>
          <button
            onClick={async()=> {
              const url = await makeLogPDF(siteName, l.summary || l.text, []);
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
      
      {/* Sticky FAB for new log */}
      <StickyFab href={`/site/${id}/new-log`} title="Add New Log" />
    </main>
  );
} 
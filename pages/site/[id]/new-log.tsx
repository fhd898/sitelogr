import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { addDoc, collection, Timestamp, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';


export default function NewLog() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const { id: siteId } = router.query as { id: string };
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [weather, setWeather] = useState<string>('Loading weather…');

  // Weather code mapping for better readability
  const getWeatherDescription = (code: number): string => {
    const weatherMap: { [key: number]: string } = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      71: 'Slight snow',
      73: 'Moderate snow',
      75: 'Heavy snow',
      95: 'Thunderstorm'
    };
    return weatherMap[code] || `Code ${code}`;
  };

  useEffect(() => {
    if (!siteId) return;
    // read site doc once to get lat/lon
    const unsub = onSnapshot(doc(db, 'sites', siteId), async (snap) => {
      const data = snap.data() as any;
      if (!data?.lat || !data?.lon) { 
        setWeather('N/A'); 
        return; 
      }
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${data.lat}&longitude=${data.lon}&current_weather=true`;
        const { data: wx } = await axios.get(url);
        const cur = wx.current_weather;
        const weatherDesc = getWeatherDescription(cur.weathercode);
        setWeather(`${cur.temperature}°C, ${weatherDesc}`);
      } catch (error) {
        setWeather('Weather unavailable');
      }
    });
    return unsub;
  }, [siteId]);

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
      weather,      // new field
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
          <p className="text-sm text-gray-500">Weather: {weather}</p>
          <textarea 
            autoFocus
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
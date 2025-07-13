import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';

export default function useRole() {
  const { currentUser } = useAuth();
  const [role, setRole] = useState<string|null>(null);

  useEffect(() => {
    if (!currentUser) { setRole(null); return; }
    return onSnapshot(doc(db, 'users', currentUser.uid), snap =>
      setRole(snap.data()?.role ?? null)
    );
  }, [currentUser]);

  return role; // 'owner' | 'pm' | ...
} 
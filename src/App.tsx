// src/App.tsx
import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import WordMatchPage from './pages/WordMatchPage';
import FillBlankPage from './pages/FillBlankPage';
import TranslationPage from './pages/TranslationPage';
import LetterScramblePage from './pages/LetterScramblePage';
import AdminLayout from './components/AdminLayout';
import Main from './pages/admin/Main';
import ManageWordMatch from './pages/admin/ManageWordMatch';
import ManageLetterScramble from './pages/admin/ManageLetterScramble';
import ManageTranslation from './pages/admin/ManageTranslation';
import ManageFillBlank from './pages/admin/ManageFillBlank';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);
  const [scores, setScores] = useState({
    wordMatch: 0,
    fillBlank: 0,
    translation: 0,
    letterScramble: 0,
  });

  // Protected Route Component
  const AdminRoute = ({ children }: { children: JSX.Element }) => {
    if (!isAdmin) return <Navigate to="/" replace />;
    return children;
  };

  // Listen for auth changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  // Check if user is admin
  useEffect(() => {
    if (!user) return;
    setAdminLoading(true);
    const adminDocRef = doc(db, 'admins', user.uid);
    getDoc(adminDocRef).then((snap) => {
      setIsAdmin(snap.exists() && snap.data()?.role === 'admin');
      setAdminLoading(false);
    });
  }, [user]);

  // Listen for user scores
  useEffect(() => {
    if (!user) return;
    const scoreRef = doc(db, 'scores', user.uid);
    const unsub = onSnapshot(scoreRef, (snap) => {
      if (snap.exists()) {
        setScores(snap.data() as typeof scores);
      } else {
        setDoc(scoreRef, { wordMatch: 0, fillBlank: 0, translation: 0, letterScramble: 0 });
        setScores({ wordMatch: 0, fillBlank: 0, translation: 0, letterScramble: 0 });
      }
    });
    return unsub;
  }, [user]);

  const addScore = async (game: keyof typeof scores, points: number) => {
    if (!user) return;
    const newScore = scores[game] + points;
    setScores((prev) => ({ ...prev, [game]: newScore }));
    await updateDoc(doc(db, 'scores', user.uid), { [game]: newScore });
  };

  const total = Object.values(scores).reduce((a, b) => a + b, 0);

  if (loading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="animate-spin w-16 h-16 border-8 border-purple-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <Routes>
      {/* User Routes with User Layout */}
      <Route element={<Layout user={user} totalScore={total} isAdmin={isAdmin} />}>
        <Route path="/" element={<HomePage scores={scores} />} />
        <Route path="/word-match" element={<WordMatchPage onScore={(p) => addScore('wordMatch', p)} />} />
        <Route path="/fill-blank" element={<FillBlankPage onScore={(p) => addScore('fillBlank', p)} />} />
        <Route path="/translation" element={<TranslationPage onScore={(p) => addScore('translation', p)} />} />
        <Route path="/letter-scramble" element={<LetterScramblePage onScore={(p) => addScore('letterScramble', p)} />} />
      </Route>

      {/* Admin Routes with Admin Layout */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout user={user} />
          </AdminRoute>
        }
      >
        <Route index element={<Main/>} />
        <Route path="word-match" element={<ManageWordMatch />} />
        <Route path="fill-blank" element={<ManageFillBlank />} />
        <Route path="translation" element={<ManageTranslation />} />
        <Route path="letter-scramble" element={<ManageLetterScramble />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
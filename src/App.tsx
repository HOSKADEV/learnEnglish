// src/App.tsx
import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { updateAchievementProgress, showAchievementNotification } from './utils/achievementsTracker';
import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import WordMatchPage from './pages/WordMatchPage';
import FillBlankPage from './pages/FillBlankPage';
import TranslationPage from './pages/TranslationPage';
import AudioListenGamePage from './pages/AudioListenGamePage';
import LetterScramblePage from './pages/LetterScramblePage';
import AchievementsPage from './pages/AchievementsPage';
import AdminLayout from './components/AdminLayout';
import Main from './pages/admin/Main';
import ManageWordMatch from './pages/admin/ManageWordMatch';
import ManageLetterScramble from './pages/admin/ManageLetterScramble';
import ManageTranslation from './pages/admin/ManageTranslation';
import ManageFillBlank from './pages/admin/ManageFillBlank';
import ManageUsers from './pages/admin/ManageUsers';
import ManageWordMatchAudio from './pages/admin/ManageWordMatchAudio';

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
    audioListen: 0,
  });

  // Protected Route Component
  const AdminRoute = ({ children }: { children: JSX.Element }) => {
    if (!isAdmin) return <Navigate to="/" replace />;
    return children;
  };

  // Listen for auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Check if user is admin
  useEffect(() => {
    if (!user) {
      setAdminLoading(false);
      return;
    }
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
        const data = snap.data();
        setScores({
          wordMatch: data.wordMatch ?? 0,
          fillBlank: data.fillBlank ?? 0,
          translation: data.translation ?? 0,
          letterScramble: data.letterScramble ?? 0,
          audioListen: data.audioListen ?? 0,
        });
      } else {
        const initialScores = {
          wordMatch: 0,
          fillBlank: 0,
          translation: 0,
          letterScramble: 0,
          audioListen: 0
        };
        setDoc(scoreRef, initialScores);
        setScores(initialScores);
      }
    });
    
    return unsub;
  }, [user]);

  // تحديث النقاط + تتبع الإنجازات
  const addScore = async (game: keyof typeof scores, points: number) => {
    if (!user) return;
    
    const newScore = scores[game] + points;
    setScores((prev) => ({ ...prev, [game]: newScore }));
    await updateDoc(doc(db, 'scores', user.uid), { [game]: newScore });

    // حساب النقاط الإجمالية
    const totalScore = Object.values({ ...scores, [game]: newScore }).reduce((a, b) => a + b, 0);

    // تحديث تقدم الإنجازات
    try {
      const newUnlocked = await updateAchievementProgress(
        user.uid,
        game,
        points,
        totalScore
      );

      // إظهار إشعار لكل إنجاز جديد
      if (newUnlocked && newUnlocked.length > 0) {
        for (const achievementId of newUnlocked) {
          // جلب تفاصيل الإنجاز من Firebase
          const achievementDoc = await getDoc(doc(db, 'achievements', achievementId));
          if (achievementDoc.exists()) {
            showAchievementNotification(achievementDoc.data().title);
          }
        }
      }
    } catch (err) {
      console.error("Error updating achievements:", err);
    }
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
        <Route path="/audio-listen" element={<AudioListenGamePage onScore={(p) => addScore("audioListen", p)} />} />
        <Route path="/letter-scramble" element={<LetterScramblePage onScore={(p) => addScore('letterScramble', p)} />} />
        <Route path="/achievements" element={<AchievementsPage />} />
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
        <Route index element={<Main />} />
        <Route path="word-match" element={<ManageWordMatch />} />
        <Route path="fill-blank" element={<ManageFillBlank />} />
        <Route path="translation" element={<ManageTranslation />} />
        <Route path="letter-scramble" element={<ManageLetterScramble />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="match-audio" element={<ManageWordMatchAudio />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
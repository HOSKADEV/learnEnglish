// src/App.tsx
import { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, onSnapshot, updateDoc, setDoc } from "firebase/firestore";
import { BookOpen, Home, Trophy, LogOut } from 'lucide-react';

import AuthScreen from './components/AuthScreen';
import { GameMenu } from './components/GameMenu';
import { WordMatchGame } from './components/WordMatchGame';
import { FillBlankGame } from './components/FillBlankGame';
import { TranslationGame } from './components/TranslationGame';
import { LetterScrambleGame } from './components/LetterScrambleGame';
import { ScoreBoard } from './components/ScoreBoard';

export type GameType = 'menu' | 'wordMatch' | 'fillBlank' | 'translation' | 'letterScramble';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentGame, setCurrentGame] = useState<GameType>('menu');
  const [scores, setScores] = useState({
    wordMatch: 0,
    fillBlank: 0,
    translation: 0,
    letterScramble: 0
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;

    const scoreRef = doc(db, "scores", user.uid);
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
    setScores(prev => ({ ...prev, [game]: newScore }));
    await updateDoc(doc(db, "scores", user.uid), { [game]: newScore });
  };

  const renderGame = () => {
    switch (currentGame) {
      case 'wordMatch':     return <WordMatchGame     onBack={() => setCurrentGame('menu')} onScore={(p) => addScore('wordMatch', p)} />;
      case 'fillBlank':     return <FillBlankGame     onBack={() => setCurrentGame('menu')} onScore={(p) => addScore('fillBlank', p)} />;
      case 'translation':   return <TranslationGame   onBack={() => setCurrentGame('menu')} onScore={(p) => addScore('translation', p)} />;
      case 'letterScramble':return <LetterScrambleGame onBack={() => setCurrentGame('menu')} onScore={(p) => addScore('letterScramble', p)} />;
      default:              return <GameMenu onSelectGame={setCurrentGame} />;
    }
  };

  const total = Object.values(scores).reduce((a, b) => a + b, 0);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="animate-spin w-16 h-16 border-8 border-purple-600 rounded-full border-t-transparent"></div>
    </div>;
  }

  if (!user) return <AuthScreen />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50" dir="rtl">
      <header className="bg-white shadow-lg sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
               <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div className="text-right">
                <h1 className="text-2xl font-bold">تعلم الإنجليزية</h1>
                <p className="text-sm text-red-600">مرحبًا، {user.email?.split('@')[0]}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">

              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 rounded-lg ml-3">
                <Trophy className="w-4 h-4 text-amber-600" />
                <span className="text-2xl font-bold text-amber-900">{total}</span>
              </div>

              {currentGame !== 'menu' && (
                <button onClick={() => setCurrentGame('menu')}   className="flex items-center justify-center w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors active:scale-95"
                >
                  <Home className="w-4 h-4" />
                </button>
              )}

              <button onClick={() => signOut(auth)} className="p-3  bg-red-100 hover:bg-red-200 flex items-center justify-center  w-9 h-9 rounded-lg transition">
                <LogOut className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6">
        {currentGame === 'menu' && <div className="mb-8"><ScoreBoard scores={scores} /></div>}
        {renderGame()}
      </main>
    </div>
  );
}
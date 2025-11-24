// src/components/AuthScreen.tsx
import { useState } from 'react';
import { Loader2, BookOpen } from 'lucide-react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // إنشاء مستخدم جديد
        const cred = await createUserWithEmailAndPassword(auth, email, password);

        // حفظ سجل النقاط
        await setDoc(doc(db, "scores", cred.user.uid), {
          wordMatch: 0,
          fillBlank: 0,
          translation: 0,
          letterScramble: 0
        });

        // حفظ المستخدم في مجموعة "users" لاستخدامه في Main
        await setDoc(doc(db, "users", cred.user.uid), {
          email: cred.user.email,
          createdAt: new Date(),
        });
      }
    } catch (err: any) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center px-4" dir="rtl">
      <div className="max-w-[500px] rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold">تعلم الإنجليزية</h1>
          <p className="text-gray-600 mt-2">العب وتعلم!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="البريد الإلكتروني"
            className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition"
            dir="ltr"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="كلمة المرور"
            className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition"
            dir="ltr"
          />

          {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl text-center font-medium">{error}</div>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-xl py-4 rounded-xl hover:opacity-90 transition flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (isLogin ? "تسجيل الدخول" : "إنشاء حساب")}
          </button>
        </form>

        <button
          onClick={() => { setIsLogin(!isLogin); setError(''); }}
          className="mt-6 text-purple-600 hover:text-purple-800 font-medium w-full text-center underline"
        >
          {isLogin ? "لا تملك حسابًا؟ سجّل الآن" : "تملك حسابًا؟ تسجيل الدخول"}
        </button>
      </div>
    </div>
  );
}

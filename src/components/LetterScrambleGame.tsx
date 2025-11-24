import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { ArrowLeft, Check, X, RotateCcw, ArrowRight, Lightbulb, Loader2 } from 'lucide-react';
import { Button } from './ui/button';

interface LetterScrambleGameProps {
  onBack: () => void;
  onScore: (points: number) => void;
}

interface Question {
  id?: string;
  word: string;
  hint: string;
  translation: string;
  order: number;
}

export function LetterScrambleGame({ onBack, onScore }: LetterScrambleGameProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [scrambledWord, setScrambledWord] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);

  // جلب الأسئلة من Firebase
  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const q = query(
        collection(db, "questions/letterScramble/items"), 
        orderBy("order", "asc")
      );
      const snap = await getDocs(q);
      const loadedQuestions = snap.docs.map(d => ({ 
        id: d.id, 
        ...d.data() 
      } as Question));
      
      if (loadedQuestions.length === 0) {
        setError("لا توجد أسئلة متاحة حاليًا");
      } else {
        setQuestions(loadedQuestions);
      }
    } catch (err) {
      console.error("Error loading questions:", err);
      setError("فشل تحميل الأسئلة. يرجى المحاولة مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (currentQuestion) {
      scrambleWord(currentQuestion.word);
    }
  }, [currentQuestionIndex, questions]);

  const scrambleWord = (word: string) => {
    const letters = word.split('');
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    setScrambledWord(letters.join(''));
  };

  const handleCheck = () => {
    const correct = userAnswer.toUpperCase() === currentQuestion.word;
    setIsCorrect(correct);
    setIsChecked(true);
    
    if (correct) {
      const points = showHint ? 5 : 10;
      setScore(score + points);
      onScore(points);
    }
    setAnsweredQuestions(answeredQuestions + 1);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer('');
      setIsChecked(false);
      setIsCorrect(null);
      setShowHint(false);
    }
  };

  const resetGame = () => {
    setCurrentQuestionIndex(0);
    setUserAnswer('');
    setIsChecked(false);
    setIsCorrect(null);
    setScore(0);
    setShowHint(false);
    setAnsweredQuestions(0);
  };

  const isGameComplete = answeredQuestions === questions.length;

  // حالة التحميل
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 border">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-pink-600" />
          <p className="text-gray-600">جاري تحميل الأسئلة...</p>
        </div>
      </div>
    );
  }

  // حالة الخطأ
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 border">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="text-red-600 text-5xl">⚠️</div>
          <p className="text-gray-600 text-center">{error}</p>
          <div className="flex gap-2">
            <Button onClick={loadQuestions} size="sm" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              إعادة المحاولة
            </Button>
            <Button onClick={onBack} variant="outline" size="sm" className="gap-2">
              رجوع
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-xl shadow-md p-4 border">
        <div className="flex items-center justify-between mb-4">
          <Button onClick={onBack} variant="ghost" size="sm" className="gap-1 px-2">
            رجوع
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-100 rounded-lg">
              <span className="text-sm text-pink-900">{score}</span>
            </div>
            <div className="text-xs text-gray-600">
              {currentQuestionIndex + 1}/{questions.length}
            </div>
          </div>
        </div>

        <div className="text-center mb-4">
          <h2 className="text-lg mb-1">ترتيب الحروف</h2>
          <p className="text-xs text-gray-600">رتب الحروف لتكوين كلمة</p>
        </div>

        {!isGameComplete ? (
          <>
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 mb-4">
              <div className="text-center mb-4">
                <p className="text-xs text-gray-600 mb-3">رتب هذه الحروف:</p>
                <div className="flex justify-center gap-1 mb-3 flex-wrap">
                  {scrambledWord.split('').map((letter, index) => (
                    <div
                      key={index}
                      className="w-10 h-10 bg-white border-2 border-pink-300 rounded-lg flex items-center justify-center text-lg shadow-sm"
                    >
                      {letter}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500">({currentQuestion.translation})</p>
              </div>

              <div>
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  disabled={isChecked}
                  placeholder="اكتب الكلمة هنا"
                  className={`w-full px-4 py-2.5 rounded-lg border-2 text-center uppercase ${
                    isChecked
                      ? isCorrect
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                      : 'border-gray-300 focus:border-pink-500 focus:outline-none'
                  }`}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isChecked && userAnswer.trim()) {
                      handleCheck();
                    }
                  }}
                />
              </div>
            </div>

            {!isChecked && (
              <div className="flex justify-center gap-2 mb-4">
                <Button
                  onClick={handleCheck}
                  disabled={!userAnswer.trim()}
                  size="sm"
                  className="gap-1.5 flex-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  تحقق
                </Button>
                <Button
                  onClick={() => setShowHint(true)}
                  variant="outline"
                  size="sm"
                  className="gap-1.5 flex-1"
                  disabled={showHint}
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  تلميح
                </Button>
              </div>
            )}

            {showHint && !isChecked && (
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3 mb-4 text-center">
                <p className="text-xs text-blue-900">💡 {currentQuestion.hint}</p>
              </div>
            )}

            {isChecked && (
              <div className={`p-3 rounded-lg mb-4 ${
                isCorrect ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'
              }`}>
                <p className="text-center text-xs">
                  {isCorrect 
                    ? `✓ إجابة صحيحة! +${showHint ? 5 : 10} نقاط`
                    : `✗ الإجابة الصحيحة: ${currentQuestion.word}`
                  }
                </p>
              </div>
            )}

            {isChecked && currentQuestionIndex < questions.length - 1 && (
              <div className="text-center">
                <Button onClick={handleNext} size="sm" className="gap-2">
                  السؤال التالي
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center p-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border-2 border-pink-300">
            <h3 className="text-lg mb-1">ممتاز! 🎉</h3>
            <p className="text-xs text-gray-600 mb-1">لقد أكملت جميع الأسئلة!</p>
            <p className="text-base mb-4">نقاطك: {score}/{questions.length * 10}</p>
            <Button onClick={resetGame} size="sm" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              العب مرة أخرى
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
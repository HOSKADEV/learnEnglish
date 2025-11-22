import { useState, useEffect } from 'react';
import { ArrowLeft, Check, X, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';

interface WordMatchGameProps {
  onBack: () => void;
  onScore: (points: number) => void;
}

interface Word {
  id: number;
  english: string;
  arabic: string;
}

const wordPairs: Word[] = [
  { id: 1, english: 'Apple', arabic: 'تفاحة' },
  { id: 2, english: 'Book', arabic: 'كتاب' },
  { id: 3, english: 'Cat', arabic: 'قطة' },
  { id: 4, english: 'Dog', arabic: 'كلب' },
  { id: 5, english: 'House', arabic: 'منزل' },
  { id: 6, english: 'Car', arabic: 'سيارة' },
  { id: 7, english: 'Tree', arabic: 'شجرة' },
  { id: 8, english: 'Water', arabic: 'ماء' }
];

export function WordMatchGame({ onBack, onScore }: WordMatchGameProps) {
  const [currentPairs, setCurrentPairs] = useState<Word[]>([]);
  const [selectedEnglish, setSelectedEnglish] = useState<number | null>(null);
  const [selectedArabic, setSelectedArabic] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [wrong, setWrong] = useState<{ english: number; arabic: number } | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    const shuffled = [...wordPairs].sort(() => Math.random() - 0.5).slice(0, 6);
    setCurrentPairs(shuffled);
    setMatched([]);
    setSelectedEnglish(null);
    setSelectedArabic(null);
    setWrong(null);
    setScore(0);
  };

  const handleEnglishClick = (id: number) => {
    if (matched.includes(id)) return;
    setSelectedEnglish(id);
    
    if (selectedArabic !== null) {
      checkMatch(id, selectedArabic);
    }
  };

  const handleArabicClick = (id: number) => {
    if (matched.includes(id)) return;
    setSelectedArabic(id);
    
    if (selectedEnglish !== null) {
      checkMatch(selectedEnglish, id);
    }
  };

  const checkMatch = (englishId: number, arabicId: number) => {
    if (englishId === arabicId) {
      setMatched([...matched, englishId]);
      setScore(score + 10);
      onScore(10);
      setSelectedEnglish(null);
      setSelectedArabic(null);
    } else {
      setWrong({ english: englishId, arabic: arabicId });
      setTimeout(() => {
        setWrong(null);
        setSelectedEnglish(null);
        setSelectedArabic(null);
      }, 1000);
    }
  };

  const shuffledArabic = [...currentPairs].sort(() => Math.random() - 0.5);

  return (
    <div>
      <div className="bg-white rounded-xl shadow-md p-4 border">
        <div className="flex items-center justify-between mb-4">
          <Button onClick={onBack} variant="ghost" size="sm" className="gap-1 px-2">
            رجوع
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Button onClick={resetGame} variant="outline" size="sm" className="gap-1 px-2">
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 rounded-lg">
              <span className="text-sm text-blue-900">النقاط: {score}</span>
            </div>
          </div>
        </div>

        <div className="text-center mb-4">
          <h2 className="text-lg mb-1">مطابقة الكلمات</h2>
          <p className="text-xs text-gray-600">اضغط على الكلمة ثم على معناها</p>
        </div>

        <div className="space-y-6">
          {/* English Words */}
          <div className="space-y-2">
            <h3 className="text-center text-sm text-gray-700">English</h3>
            {currentPairs.map((word) => (
              <button
                key={`en-${word.id}`}
                onClick={() => handleEnglishClick(word.id)}
                disabled={matched.includes(word.id)}
                className={`w-full p-3 rounded-lg border-2 transition-all active:scale-95 ${
                  matched.includes(word.id)
                    ? 'bg-green-100 border-green-500 opacity-50'
                    : selectedEnglish === word.id
                    ? 'bg-blue-100 border-blue-500 scale-105'
                    : wrong?.english === word.id
                    ? 'bg-red-100 border-red-500 shake'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  {matched.includes(word.id) && (
                    <Check className="w-4 h-4 text-green-600" />
                  )}
                  {wrong?.english === word.id && (
                    <X className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm">{word.english}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Arabic Words */}
          <div className="space-y-2">
            <h3 className="text-center text-sm text-gray-700">العربية</h3>
            {shuffledArabic.map((word) => (
              <button
                key={`ar-${word.id}`}
                onClick={() => handleArabicClick(word.id)}
                disabled={matched.includes(word.id)}
                className={`w-full p-3 rounded-lg border-2 transition-all active:scale-95 ${
                  matched.includes(word.id)
                    ? 'bg-green-100 border-green-500 opacity-50'
                    : selectedArabic === word.id
                    ? 'bg-blue-100 border-blue-500 scale-105'
                    : wrong?.arabic === word.id
                    ? 'bg-red-100 border-red-500 shake'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  {matched.includes(word.id) && (
                    <Check className="w-4 h-4 text-green-600" />
                  )}
                  {wrong?.arabic === word.id && (
                    <X className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm">{word.arabic}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {matched.length === currentPairs.length && (
          <div className="mt-6 text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-300">
            <h3 className="text-lg mb-1">أحسنت! 🎉</h3>
            <p className="text-xs text-gray-600 mb-3">لقد أكملت اللعبة بنجاح!</p>
            <Button onClick={resetGame} size="sm" className="gap-2">
              <RotateCcw className="w-3.5 h-3.5" />
              العب مرة أخرى
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
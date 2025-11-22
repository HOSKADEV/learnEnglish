import { useState } from 'react';
import { ArrowLeft, Check, X, RotateCcw, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

interface TranslationGameProps {
  onBack: () => void;
  onScore: (points: number) => void;
}

interface Question {
  id: number;
  word: string;
  correct: string;
  options: string[];
}

const questions: Question[] = [
  {
    id: 1,
    word: 'Happy',
    correct: 'سعيد',
    options: ['سعيد', 'حزين', 'غاضب', 'خائف']
  },
  {
    id: 2,
    word: 'Beautiful',
    correct: 'جميل',
    options: ['قبيح', 'جميل', 'كبير', 'صغير']
  },
  {
    id: 3,
    word: 'Friend',
    correct: 'صديق',
    options: ['عدو', 'أخ', 'صديق', 'جار']
  },
  {
    id: 4,
    word: 'School',
    correct: 'مدرسة',
    options: ['مدرسة', 'مستشفى', 'متجر', 'حديقة']
  },
  {
    id: 5,
    word: 'Food',
    correct: 'طعام',
    options: ['ماء', 'طعام', 'هواء', 'نار']
  },
  {
    id: 6,
    word: 'Sun',
    correct: 'شمس',
    options: ['قمر', 'نجم', 'شمس', 'سحاب']
  },
  {
    id: 7,
    word: 'Fast',
    correct: 'سريع',
    options: ['بطيء', 'سريع', 'قوي', 'ضعيف']
  },
  {
    id: 8,
    word: 'Love',
    correct: 'حب',
    options: ['كره', 'حب', 'خوف', 'أمل']
  },
  {
    id: 9,
    word: 'Cold',
    correct: 'بارد',
    options: ['حار', 'بارد', 'دافئ', 'معتدل']
  },
  {
    id: 10,
    word: 'Night',
    correct: 'ليل',
    options: ['صباح', 'ظهر', 'مساء', 'ليل']
  }
];

export function TranslationGame({ onBack, onScore }: TranslationGameProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    const correct = answer === currentQuestion.correct;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(score + 10);
      onScore(10);
    }
    setAnsweredQuestions(answeredQuestions + 1);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    }
  };

  const resetGame = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setScore(0);
    setAnsweredQuestions(0);
  };

  const isGameComplete = answeredQuestions === questions.length;

  return (
    <div>
      <div className="bg-white rounded-xl shadow-md p-4 border">
        <div className="flex items-center justify-between mb-4">
          <Button onClick={onBack} variant="ghost" size="sm" className="gap-1 px-2">
            رجوع
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 rounded-lg">
              <span className="text-sm text-purple-900">{score}</span>
            </div>
            <div className="text-xs text-gray-600">
              {currentQuestionIndex + 1}/{questions.length}
            </div>
          </div>
        </div>

        <div className="text-center mb-4">
          <h2 className="text-lg mb-1">لعبة الترجمة</h2>
          <p className="text-xs text-gray-600">اختر الترجمة الصحيحة</p>
        </div>

        {!isGameComplete ? (
          <>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-8 mb-4 text-center">
              <p className="text-xs text-gray-600 mb-2">ما معنى هذه الكلمة؟</p>
              <h3 className="text-3xl">{currentQuestion.word}</h3>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  disabled={selectedAnswer !== null}
                  className={`p-3 rounded-lg border-2 transition-all active:scale-95 ${
                    selectedAnswer === option
                      ? isCorrect
                        ? 'bg-green-100 border-green-500 scale-105'
                        : 'bg-red-100 border-red-500'
                      : selectedAnswer !== null && option === currentQuestion.correct
                      ? 'bg-green-100 border-green-500'
                      : 'bg-white border-gray-200'
                  } ${selectedAnswer !== null ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between">
                    {selectedAnswer === option && isCorrect && (
                      <Check className="w-4 h-4 text-green-600" />
                    )}
                    {selectedAnswer === option && !isCorrect && (
                      <X className="w-4 h-4 text-red-600" />
                    )}
                    <span className="text-sm">{option}</span>
                  </div>
                </button>
              ))}
            </div>

            {selectedAnswer && (
              <div className={`p-3 rounded-lg mb-4 ${
                isCorrect ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'
              }`}>
                <p className="text-center text-xs">
                  {isCorrect 
                    ? '✓ إجابة صحيحة! ممتاز!' 
                    : `✗ الإجابة الصحيحة: ${currentQuestion.correct}`
                  }
                </p>
              </div>
            )}

            {selectedAnswer && currentQuestionIndex < questions.length - 1 && (
              <div className="text-center">
                <Button onClick={handleNext} size="sm" className="gap-2">
                  السؤال التالي
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-300">
            <h3 className="text-lg mb-1">رائع! 🎉</h3>
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
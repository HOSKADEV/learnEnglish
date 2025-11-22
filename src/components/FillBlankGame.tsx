import { useState, useEffect } from 'react';
import { ArrowLeft, Check, X, RotateCcw, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

interface FillBlankGameProps {
  onBack: () => void;
  onScore: (points: number) => void;
}

interface Question {
  id: number;
  sentence: string;
  blank: string;
  options: string[];
  translation: string;
}

const questions: Question[] = [
  {
    id: 1,
    sentence: 'I ___ a student.',
    blank: 'am',
    options: ['am', 'is', 'are'],
    translation: 'أنا طالب'
  },
  {
    id: 2,
    sentence: 'She ___ a teacher.',
    blank: 'is',
    options: ['am', 'is', 'are'],
    translation: 'هي معلمة'
  },
  {
    id: 3,
    sentence: 'They ___ happy.',
    blank: 'are',
    options: ['am', 'is', 'are'],
    translation: 'هم سعداء'
  },
  {
    id: 4,
    sentence: 'I ___ to school every day.',
    blank: 'go',
    options: ['go', 'goes', 'going'],
    translation: 'أذهب إلى المدرسة كل يوم'
  },
  {
    id: 5,
    sentence: 'He ___ English very well.',
    blank: 'speaks',
    options: ['speak', 'speaks', 'speaking'],
    translation: 'هو يتحدث الإنجليزية جيداً'
  },
  {
    id: 6,
    sentence: 'We ___ a big house.',
    blank: 'have',
    options: ['have', 'has', 'having'],
    translation: 'لدينا منزل كبير'
  },
  {
    id: 7,
    sentence: 'The cat ___ on the table.',
    blank: 'is',
    options: ['am', 'is', 'are'],
    translation: 'القطة على الطاولة'
  },
  {
    id: 8,
    sentence: 'I ___ my homework yesterday.',
    blank: 'did',
    options: ['do', 'did', 'does'],
    translation: 'أنجزت واجبي المنزلي بالأمس'
  }
];

export function FillBlankGame({ onBack, onScore }: FillBlankGameProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    const correct = answer === currentQuestion.blank;
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

  const renderSentence = () => {
    const parts = currentQuestion.sentence.split('___');
    return (
      <div className="flex flex-wrap items-center justify-center gap-2 text-xl md:text-2xl">
        <span>{parts[0]}</span>
        <span className={`px-4 py-2 rounded-lg border-2 border-dashed min-w-[100px] text-center ${
          selectedAnswer
            ? isCorrect
              ? 'bg-green-100 border-green-500 text-green-900'
              : 'bg-red-100 border-red-500 text-red-900'
            : 'bg-blue-50 border-blue-300'
        }`}>
          {selectedAnswer || '___'}
        </span>
        <span>{parts[1]}</span>
      </div>
    );
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
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 rounded-lg">
              <span className="text-sm text-green-900">{score}</span>
            </div>
            <div className="text-xs text-gray-600">
              {currentQuestionIndex + 1}/{questions.length}
            </div>
          </div>
        </div>

        <div className="text-center mb-4">
          <h2 className="text-lg mb-1">املأ الفراغ</h2>
          <p className="text-xs text-gray-600">اختر الكلمة الصحيحة</p>
        </div>

        {!isGameComplete ? (
          <>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
              {renderSentence()}
              <div className="text-center mt-2 text-xs text-gray-600">
                {currentQuestion.translation}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 mb-4">
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
                      : selectedAnswer !== null && option === currentQuestion.blank
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
                  {isCorrect ? '✓ إجابة صحيحة! أحسنت!' : `✗ الإجابة الصحيحة: ${currentQuestion.blank}`}
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
          <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-300">
            <h3 className="text-lg mb-1">أحسنت! 🎉</h3>
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
import { Trophy } from 'lucide-react';

interface ScoreBoardProps {
  scores: {
    wordMatch: number;
    fillBlank: number;
    translation: number;
    letterScramble: number;
  };
}

export function ScoreBoard({ scores }: ScoreBoardProps) {
  const gameNames = {
    wordMatch: 'مطابقة الكلمات',
    fillBlank: 'املأ الفراغ',
    translation: 'الترجمة',
    letterScramble: 'ترتيب الحروف'
  };

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-4 border mt-4">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <div className="text-right">
          <h2 className="text-base">إنجازاتك</h2>
          <p className="text-gray-500 text-xs">إجمالي النقاط: {totalScore}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {Object.entries(scores).map(([game, score]) => (
          <div key={game} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 text-center">
            <div className="text-xl text-gray-900 mb-0.5">{score}</div>
            <div className="text-xs text-gray-600">{gameNames[game as keyof typeof gameNames]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
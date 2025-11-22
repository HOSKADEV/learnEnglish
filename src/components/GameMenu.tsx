import { Puzzle, FileText, Languages, Shuffle } from 'lucide-react';
import type { GameType } from '../App';

interface GameMenuProps {
  onSelectGame: (game: GameType) => void;
}

export function GameMenu({ onSelectGame }: GameMenuProps) {
  const games = [
    {
      id: 'wordMatch' as GameType,
      title: 'مطابقة الكلمات',
      description: 'طابق الكلمات الإنجليزية مع معانيها',
      icon: Puzzle,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'fillBlank' as GameType,
      title: 'املأ الفراغ',
      description: 'أكمل الجمل بالكلمة الصحيحة',
      icon: FileText,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'translation' as GameType,
      title: 'الترجمة',
      description: 'اختر الترجمة الصحيحة للكلمة',
      icon: Languages,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'letterScramble' as GameType,
      title: 'ترتيب الحروف',
      description: 'رتب الحروف لتكوين كلمة صحيحة',
      icon: Shuffle,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl mb-1">اختر لعبة</h2>
        <p className="text-sm text-gray-600">تعلم الإنجليزية بطريقة ممتعة</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {games.map((game) => {
          const Icon = game.icon;
          return (
            <button
              key={game.id}
              onClick={() => onSelectGame(game.id)}
              className={`${game.bgColor} p-4 rounded-xl border-2 border-transparent hover:border-gray-300 transition-all active:scale-95 group`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 bg-gradient-to-br ${game.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 text-right">
                  <h3 className="text-base mb-1">{game.title}</h3>
                  <p className="text-gray-600 text-xs">{game.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
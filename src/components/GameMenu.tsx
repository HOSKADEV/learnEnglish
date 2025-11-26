import { Puzzle, FileText, Languages, Shuffle, Headphones } from 'lucide-react';
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
    },
    {
      id: 'audioListen' as GameType,
      title: 'الاستماع والكتابة',
      description: 'استمع للكلمة واكتبها بشكل صحيح',
      icon: Headphones,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl mb-1">اختر لعبة</h2>
        <p className="text-sm text-gray-600">تعلم الإنجليزية بطريقة ممتعة</p>
      </div>

      {/* 2-column grid for smaller cards */}
      <div className="max-w-3xl mx-auto grid grid-cols-2 gap-4 justify-center">
        {games.map((game) => {
          const Icon = game.icon;
          return (
            <button
              key={game.id}
              onClick={() => onSelectGame(game.id)}
              className={`${game.bgColor} p-3 rounded-xl max-w-[300px] w-full mx-auto text-center border-2 border-transparent hover:border-gray-300 transition-all active:scale-95`}
            >
              <div
                className={`w-12 h-12 mx-auto mb-2 bg-gradient-to-br ${game.color} rounded-xl flex items-center justify-center`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-sm font-medium">{game.title}</h3>
              <p className="text-gray-600 text-xs mt-1">{game.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
"use client";
import { useState, useEffect } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../../firebase";
import { Gamepad2, FileText, Languages, Shuffle, Plus, TrendingUp, Users, BookOpen, ArrowLeft, Type } from "lucide-react";

export default function Main() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalQuestions: 0,
    activeGames: 0,
    growthRate: "0",
    totalUsers: 0,
  });
  const [gameCards, setGameCards] = useState([
    {
      id: 'fillblank',
      title: 'ملء الفراغات',
      description: 'إدارة أسئلة لعبة ملء الفراغات في الجمل',
      icon: FileText,
      color: 'from-green-400 to-green-600',
      count: '0 سؤال',
      link: '/admin/fillblank'
    },
    {
      id: 'letterscramble',
      title: 'ترتيب الحروف',
      description: 'إدارة أسئلة لعبة ترتيب الحروف المبعثرة',
      icon: Shuffle,
      color: 'from-orange-400 to-orange-600',
      count: '0 سؤال',
      link: '/admin/letterscramble'
    },
    {
      id: 'translation',
      title: 'الترجمة',
      description: 'إدارة أسئلة لعبة الترجمة مع خيارات متعددة',
      icon: Languages,
      color: 'from-purple-400 to-purple-600',
      count: '0 سؤال',
      link: '/admin/translation'
    },
    {
      id: 'fillletters',
      title: 'ملء الحروف',
      description: 'إدارة لعبة ملء الحروف الناقصة في الكلمات (مثل: H_LL)',
      icon: Type,
      color: 'from-teal-400 to-cyan-600',
      count: '0 سؤال',
      link: '/admin/fillletters'
    },
    {
      id: 'wordmatch',
      title: 'مطابقة الكلمات',
      description: 'ربط الكلمات الإنجليزية بترجمتها العربية',
      icon: Languages,
      color: 'from-indigo-400 to-blue-600',
      count: '0 سؤال',
      link: '/admin/wordmatch'
    }
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        let totalQuestions = 0;
        let activeGamesCount = 0;

        const gamePaths = [
          "questions/fillBlank/items",
          "questions/letterScramble/items",
          "questions/translation/items",
          "questions/fillLetters/items",    // لو عندك
          "questions/wordMatch/items"
        ];

        const updates = await Promise.all(
          gamePaths.map(async (path) => {
            const snap = await getDocs(query(collection(db, path)));
            return { path, count: snap.size };
          })
        );

        // تحديث عدد الأسئلة لكل لعبة
        const updatedCards = gameCards.map(card => {
          let count = 0;
          if (card.id === 'fillblank') count = updates.find(u => u.path.includes('fillBlank'))?.count || 0;
          if (card.id === 'letterscramble') count = updates.find(u => u.path.includes('letterScramble'))?.count || 0;
          if (card.id === 'translation') count = updates.find(u => u.path.includes('translation'))?.count || 0;
          if (card.id === 'fillletters') count = updates.find(u => u.path.includes('fillLetters'))?.count || 0;
          if (card.id === 'wordmatch') count = updates.find(u => u.path.includes('wordMatch'))?.count || 0;

          if (count > 0) activeGamesCount++;

          return {
            ...card,
            count: `${count} سؤال${count > 1 ? '' : ''}`
          };
        });

        totalQuestions = updates.reduce((sum, u) => sum + u.count, 0);

        // جلب عدد المستخدمين (افتراضيًا من مجموعة users)
        const usersSnap = await getDocs(collection(db, "users"));
        const totalUsers = usersSnap.size;

        setGameCards(updatedCards);
        setStats({
          totalQuestions,
          activeGames: activeGamesCount,
          growthRate: "0", // يمكن تحديثه ديناميكيًا لاحقًا
          totalUsers
        });

      } catch (err) {
        console.error("خطأ في جلب الإحصائيات:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleNavigate = (link: string) => {
    window.location.href = link;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-2xl font-bold text-gray-600">جاري تحميل الإحصائيات...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="w-full max-w-none mx-auto">

        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg">
            <Gamepad2 size={40} className="text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            لوحة التحكم الرئيسية
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            إدارة شاملة لجميع الألعاب التعليمية والأسئلة بكل سهولة وأمان
          </p>
        </div>

        {/* Stats Grid - ديناميكية */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transform hover:scale-105 transition">
            <div className="flex items-center justify-between">
              <div className="">
                <p className="text-gray-500 text-sm mb-1">إجمالي الأسئلة</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalQuestions}</p>
              </div>
              <div className="bg-blue-500 w-14 h-14 rounded-full flex items-center justify-center">
                <BookOpen size={28} className="text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transform hover:scale-105 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">الألعاب النشطة</p>
                <p className="text-3xl font-bold text-gray-800">{stats.activeGames}</p>
              </div>
              <div className="bg-green-500 w-14 h-14 rounded-full flex items-center justify-center">
                <Gamepad2 size={28} className="text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transform hover:scale-105 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">معدل النمو</p>
                <p className="text-3xl font-bold text-green-600">{stats.growthRate}</p>
              </div>
              <div className="bg-purple-500 w-14 h-14 rounded-full flex items-center justify-center">
                <TrendingUp size={28} className="text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transform hover:scale-105 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">المستخدمين</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalUsers}</p>
              </div>
              <div className="bg-orange-500 w-14 h-14 rounded-full flex items-center justify-center">
                <Users size={28} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 border">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <Plus className="text-blue-600" size={28} />
            إجراءات سريعة
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {gameCards.map((game) => (
              <button
                key={game.id}
                onClick={() => handleNavigate(game.link)}
                className="group bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border-2 border-gray-200 hover:border-blue-400 transition-all hover:shadow-lg text-right"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`bg-gradient-to-r ${game.color} w-10 h-10 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition`}>
                    <game.icon size={20} className="text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-600">{game.count}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600">
                  إضافة سؤال - {game.title}
                </h3>
              </button>
            ))}
          </div>
        </div>

        {/* Games Management Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
            <Gamepad2 className="text-blue-600" size={36} />
            إدارة الألعاب
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {gameCards.map((game) => (
              <button
                key={game.id}
                onClick={() => handleNavigate(game.link)}
                onMouseEnter={() => setHoveredCard(game.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className="group relative bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 transform transition-all hover:scale-105 hover:shadow-2xl text-right"
              >
                <div className={`bg-gradient-to-r ${game.color} p-6 relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
                  <div className="relative flex items-center justify-between">
                    <game.icon size={48} className="text-white drop-shadow-lg" />
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                      <span className="text-white font-bold text-sm">{game.count}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-blue-600">
                    {game.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {game.description}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
                    <span className="text-sm text-gray-500">انقر للإدارة</span>
                    <ArrowLeft className={`w-6 h-6 text-blue-600 transition-transform ${hoveredCard === game.id ? 'translate-x-[-8px]' : ''}`} />
                  </div>
                </div>

                <div className={`absolute inset-0 bg-gradient-to-r ${game.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
              </button>
            ))}
          </div>
        </div>

        {/* Footer Tip */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-xl p-10 text-white text-center">
          <h3 className="text-3xl font-bold mb-4">نصيحة اليوم</h3>
          <p className="text-blue-50 text-lg max-w-3xl mx-auto leading-relaxed">
            راجع الأسئلة بشكل دوري، وتأكد من تنويع أنواع الأسئلة لتحسين تجربة المتعلمين
          </p>
        </div>

      </div>
    </div>
  );
}
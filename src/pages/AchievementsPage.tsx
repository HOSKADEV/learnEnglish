// src/pages/AchievementsPage.tsx
import { useState, useEffect } from "react";
import { collection, doc, getDocs, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Trophy, Award, Star, Target, Zap, Crown, Medal, Lock, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { syncUserAchievements } from "../utils/syncAchievements";

// أيقونات الإنجازات
const achievementIcons = {
  trophy: Trophy,
  award: Award,
  star: Star,
  target: Target,
  zap: Zap,
  crown: Crown,
  medal: Medal,
};

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  type: string;
  gradient?: string;
}

export default function AchievementsPage() {
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userProgress, setUserProgress] = useState<{ [key: string]: number }>({});
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (userId) {
      initializePage();
    }
  }, [userId]);

  const initializePage = async () => {
    if (!userId) return;
    
    // أولاً: مزامنة الإنجازات مع النقاط الحالية
    await syncUserAchievements(userId);
    
    // ثانياً: جلب البيانات المحدثة
    await loadAchievements();
    await loadUserProgress();
  };

  // جلب جميع الإنجازات من Firebase
  const loadAchievements = async () => {
    try {
      const snap = await getDocs(collection(db, "achievements"));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Achievement));
      setAchievements(list);
    } catch (err) {
      console.error("Error loading achievements:", err);
    }
  };

  // جلب تقدم المستخدم
  const loadUserProgress = async () => {
    if (!userId) return;
    
    try {
      const userDoc = await getDoc(doc(db, "userAchievements", userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserProgress(data.progress || {});
        setUnlockedBadges(data.unlockedBadges || []);
      }
    } catch (err) {
      console.error("Error loading user progress:", err);
    } finally {
      setLoading(false);
    }
  };

  // حساب نسبة التقدم
  const getProgress = (achievement: Achievement) => {
    const current = userProgress[achievement.id] || 0;
    const percentage = Math.min((current / achievement.target) * 100, 100);
    return { current, percentage };
  };

  // التحقق إذا تم فتح الإنجاز
  const isUnlocked = (achievementId: string) => {
    return unlockedBadges.includes(achievementId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-700">جاري تحميل الإنجازات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Back Button & Sync Button */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>رجوع للصفحة الرئيسية</span>
          </button>

          <button
            onClick={async () => {
              setLoading(true);
              if (userId) {
                await syncUserAchievements(userId);
                await loadUserProgress();
                await loadAchievements();
              }
              setLoading(false);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow hover:shadow-md transition"
          >
            <Loader2 className="w-5 h-5" />
            <span>تحديث الإنجازات</span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4 shadow-lg">
            <Trophy size={40} className="text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-800 mb-2">الإنجازات والشارات</h1>
          <p className="text-gray-600 text-lg">
            فتحت {unlockedBadges.length} من {achievements.length} شارة
          </p>
        </div>

        {/* Progress Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {unlockedBadges.length} / {achievements.length}
              </h3>
              <p className="text-gray-600">الشارات المفتوحة</p>
            </div>
            <div className="w-32 h-32 relative">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#fbbf24"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${achievements.length > 0 ? (unlockedBadges.length / achievements.length) * 351.86 : 0} 351.86`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-800">
                  {achievements.length > 0 ? Math.round((unlockedBadges.length / achievements.length) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Grid */}
        {achievements.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">لا توجد إنجازات متاحة حالياً</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-6 justify-center">
            {achievements.map((achievement) => {
              const Icon = achievementIcons[achievement.icon as keyof typeof achievementIcons] || Trophy;
              const unlocked = isUnlocked(achievement.id);
              const { current, percentage } = getProgress(achievement);

              return (
                <div
                  key={achievement.id}
                  onClick={() => setSelectedAchievement(achievement)}
                  className={`
                    relative bg-white rounded-2xl shadow-lg p-6 border-2 cursor-pointer
                    transition-all duration-300 hover:scale-105 hover:shadow-2xl
                    flex-1 min-w-[280px] max-w-[350px]
                    ${unlocked 
                      ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  {/* Unlocked Badge */}
                  {unlocked && (
                    <div className="absolute -top-3 -right-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-2 shadow-lg">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                  )}

                  {/* Lock Icon for Locked */}
                  {!unlocked && percentage < 100 && (
                    <div className="absolute top-4 left-4 bg-gray-200 rounded-full p-2">
                      <Lock className="w-5 h-5 text-gray-500" />
                    </div>
                  )}

                  {/* Icon */}
                  <div
                    className={`
                      w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center
                      ${unlocked 
                        ? `bg-gradient-to-br ${achievement.gradient || 'from-yellow-400 to-orange-500'} shadow-lg` 
                        : 'bg-gray-200'
                      }
                    `}
                  >
                    <Icon 
                      size={40} 
                      className={unlocked ? 'text-white' : 'text-gray-400'} 
                    />
                  </div>

                  {/* Title & Description */}
                  <h3 className={`text-xl font-bold text-center mb-2 ${unlocked ? 'text-gray-800' : 'text-gray-500'}`}>
                    {achievement.title}
                  </h3>
                  <p className={`text-center text-sm mb-4 ${unlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                    {achievement.description}
                  </p>

                  {/* Progress Bar */}
                  {!unlocked && (
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>{current} / {achievement.target}</span>
                        <span>{Math.round(percentage)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Unlocked Date */}
                  {unlocked && (
                    <div className="text-center">
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 rounded-full text-sm text-yellow-800 font-semibold">
                        <Star className="w-4 h-4" />
                        تم الفتح!
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Achievement Details Modal */}
        {selectedAchievement && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedAchievement(null)}
          >
            <div
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const Icon = achievementIcons[selectedAchievement.icon as keyof typeof achievementIcons] || Trophy;
                const unlocked = isUnlocked(selectedAchievement.id);
                const { current, percentage } = getProgress(selectedAchievement);

                return (
                  <>
                    <div className="text-center mb-6">
                      <div
                        className={`
                          w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center
                          ${unlocked 
                            ? `bg-gradient-to-br ${selectedAchievement.gradient || 'from-yellow-400 to-orange-500'} shadow-xl` 
                            : 'bg-gray-200'
                          }
                        `}
                      >
                        <Icon size={48} className={unlocked ? 'text-white' : 'text-gray-400'} />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-800 mb-2">
                        {selectedAchievement.title}
                      </h2>
                      <p className="text-gray-600">{selectedAchievement.description}</p>
                    </div>

                    {!unlocked && (
                      <div className="mb-6">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>التقدم الحالي</span>
                          <span className="font-bold">{current} / {selectedAchievement.target}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-center text-sm text-gray-500 mt-2">
                          باقي {selectedAchievement.target - current} لفتح الشارة
                        </p>
                      </div>
                    )}

                    {unlocked && (
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 text-center border-2 border-yellow-200">
                        <Award className="w-12 h-12 text-yellow-600 mx-auto mb-2" />
                        <p className="text-lg font-bold text-yellow-800">تهانينا! لقد فتحت هذه الشارة</p>
                      </div>
                    )}

                    <button
                      onClick={() => setSelectedAchievement(null)}
                      className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transition"
                    >
                      إغلاق
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
// src/utils/achievementsTracker.ts
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

interface AchievementProgress {
  [key: string]: number;
}

interface UserAchievements {
  unlockedBadges: string[];
  progress: AchievementProgress;
  lastUpdated: Date;
}

// تحديث تقدم المستخدم بعد كل لعبة
export const updateAchievementProgress = async (
  userId: string,
  gameType: string,
  points: number,
  totalScore: number
) => {
  try {
    const userAchievementsRef = doc(db, "userAchievements", userId);
    const userDoc = await getDoc(userAchievementsRef);

    let currentData: UserAchievements = {
      unlockedBadges: [],
      progress: {},
      lastUpdated: new Date(),
    };

    if (userDoc.exists()) {
      currentData = userDoc.data() as UserAchievements;
    }

    // تحديث التقدم
    const newProgress = { ...currentData.progress };
    
    // حساب إجمالي الأسئلة (افتراض: كل 10 نقاط = سؤال واحد)
    const totalQuestions = Math.floor(totalScore / 10);

    // جلب جميع الإنجازات
    const achievementsSnap = await getDocs(collection(db, "achievements"));
    
    achievementsSnap.forEach((achievementDoc) => {
      const achievement = achievementDoc.data();
      const achievementId = achievementDoc.id;

      // تحديث التقدم حسب النوع
      switch (achievement.type) {
        case "total_score":
          newProgress[achievementId] = totalScore;
          break;
        case "total":
          newProgress[achievementId] = totalQuestions;
          break;
        case "translation":
          if (gameType === "translation") {
            newProgress[achievementId] = (newProgress[achievementId] || 0) + 1;
          }
          break;
        case "wordMatch":
          if (gameType === "wordMatch") {
            newProgress[achievementId] = (newProgress[achievementId] || 0) + 1;
          }
          break;
        case "fillBlank":
          if (gameType === "fillBlank") {
            newProgress[achievementId] = (newProgress[achievementId] || 0) + 1;
          }
          break;
        case "letterScramble":
          if (gameType === "letterScramble") {
            newProgress[achievementId] = (newProgress[achievementId] || 0) + 1;
          }
          break;
        case "audioListen":
          if (gameType === "audioListen") {
            newProgress[achievementId] = (newProgress[achievementId] || 0) + 1;
          }
          break;
      }
    });

    // التحقق من الإنجازات المكتملة
    const newUnlocked: string[] = [];

    achievementsSnap.forEach((achievementDoc) => {
      const achievement = achievementDoc.data();
      const achievementId = achievementDoc.id;
      
      // تحقق إذا لم يتم فتح الإنجاز مسبقاً
      if (!currentData.unlockedBadges.includes(achievementId)) {
        const currentProgress = newProgress[achievementId] || 0;
        
        // إذا وصل للهدف
        if (currentProgress >= achievement.target) {
          newUnlocked.push(achievementId);
          console.log(`🎉 Unlocked achievement: ${achievement.title}`);
        }
      }
    });

    // تحديث Firebase
    await setDoc(userAchievementsRef, {
      unlockedBadges: [...currentData.unlockedBadges, ...newUnlocked],
      progress: newProgress,
      lastUpdated: new Date(),
    });

    // إرجاع الشارات الجديدة المفتوحة
    return newUnlocked;

  } catch (err) {
    console.error("Error updating achievements:", err);
    return [];
  }
};

// إظهار إشعار بفتح إنجاز جديد
export const showAchievementNotification = (achievementTitle: string) => {
  console.log(`🎉 تهانينا! لقد فتحت: ${achievementTitle}`);
  
  // إشعار بسيط - يمكنك تحسينه باستخدام toast library
  if (typeof window !== 'undefined') {
    // يمكنك استخدام react-hot-toast أو sonner هنا
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-4 rounded-xl shadow-2xl z-50 animate-bounce';
    notification.innerHTML = `
      <div class="flex items-center gap-3">
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
        <div>
          <p class="font-bold">إنجاز جديد!</p>
          <p class="text-sm">${achievementTitle}</p>
        </div>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 4000);
  }
};
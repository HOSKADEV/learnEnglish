// src/utils/syncAchievements.ts
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

/**
 * مزامنة تقدم المستخدم الحالي مع نظام الإنجازات
 */
export const syncUserAchievements = async (userId: string) => {
  try {
    console.log("🔄 Starting sync for user:", userId);

    // 1. جلب النقاط الحالية للمستخدم
    const scoresDoc = await getDoc(doc(db, "scores", userId));
    if (!scoresDoc.exists()) {
      console.log("❌ No scores found for user");
      return null;
    }

    const scores = scoresDoc.data();
    console.log("📊 User scores:", scores);

    // حساب إجمالي النقاط
    const totalScore = Object.values(scores).reduce((a: any, b: any) => Number(a) + Number(b), 0) as number;
    console.log("💯 Total score:", totalScore);

    // حساب عدد الأسئلة لكل لعبة (افتراض: كل 10 نقاط = سؤال واحد)
    const questionsAnswered = {
      total: Math.floor(totalScore / 10),
      translation: Math.floor((scores.translation || 0) / 10),
      wordMatch: Math.floor((scores.wordMatch || 0) / 10),
      fillBlank: Math.floor((scores.fillBlank || 0) / 10),
      letterScramble: Math.floor((scores.letterScramble || 0) / 10),
      audioListen: Math.floor((scores.audioListen || 0) / 10),
    };

    console.log("📝 Questions answered:", questionsAnswered);

    // 2. جلب جميع الإنجازات
    const achievementsSnap = await getDocs(collection(db, "achievements"));
    console.log("🏆 Found", achievementsSnap.size, "achievements");

    // 3. جلب أو إنشاء userAchievements document
    const userAchievementsRef = doc(db, "userAchievements", userId);
    const userAchievementsDoc = await getDoc(userAchievementsRef);

    let currentData = {
      unlockedBadges: [] as string[],
      progress: {} as { [key: string]: number },
      lastUpdated: new Date(),
    };

    if (userAchievementsDoc.exists()) {
      currentData = userAchievementsDoc.data() as any;
      console.log("📦 Current unlocked:", currentData.unlockedBadges);
    }

    // 4. حساب التقدم والشارات المفتوحة
    const newProgress: { [key: string]: number } = {};
    const newUnlocked: string[] = [...currentData.unlockedBadges];

    achievementsSnap.forEach((achievementDoc) => {
      const achievement = achievementDoc.data();
      const achievementId = achievementDoc.id;

      let currentProgress = 0;

      // حساب التقدم حسب نوع الإنجاز
      switch (achievement.type) {
        case "total_score":
          currentProgress = totalScore;
          break;
        case "total":
          currentProgress = questionsAnswered.total;
          break;
        case "translation":
          currentProgress = questionsAnswered.translation;
          break;
        case "wordMatch":
          currentProgress = questionsAnswered.wordMatch;
          break;
        case "fillBlank":
          currentProgress = questionsAnswered.fillBlank;
          break;
        case "letterScramble":
          currentProgress = questionsAnswered.letterScramble;
          break;
        case "audioListen":
          currentProgress = questionsAnswered.audioListen;
          break;
        default:
          currentProgress = 0;
      }

      newProgress[achievementId] = currentProgress;

      // التحقق من فتح الشارة
      if (!newUnlocked.includes(achievementId) && currentProgress >= achievement.target) {
        newUnlocked.push(achievementId);
        console.log(`✅ Unlocked: ${achievement.title} (${currentProgress}/${achievement.target})`);
      }
    });

    console.log("📊 New progress:", newProgress);
    console.log("🎉 Total unlocked:", newUnlocked.length);

    // 5. حفظ البيانات المحدثة
    await setDoc(userAchievementsRef, {
      unlockedBadges: newUnlocked,
      progress: newProgress,
      lastUpdated: new Date(),
    });

    console.log("✅ Sync completed successfully!");

    return {
      totalScore,
      unlockedCount: newUnlocked.length,
      progress: newProgress,
      newlyUnlocked: newUnlocked.filter(id => !currentData.unlockedBadges.includes(id))
    };

  } catch (err) {
    console.error("❌ Error syncing achievements:", err);
    return null;
  }
};
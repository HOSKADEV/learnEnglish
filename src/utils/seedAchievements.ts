// src/utils/seedAchievements.ts   ← اسم الملف
import { db } from "../firebase";
import { collection, doc, setDoc } from "firebase/firestore";

// قائمة كل الإنجازات المطلوبة (بالهيكل الصحيح 100%)
const achievements = [
  {
    title: "المبتدئ",
    description: "أجب على 50 سؤال من أي نوع",
    icon: "trophy",
    type: "total",
    target: 50,
    gradient: "from-yellow-400 to-orange-500",
  },
  {
    title: "محب اللغة",
    description: "أجب على 100 سؤال",
    icon: "star",
    type: "total",
    target: 100,
    gradient: "from-purple-400 to-pink-500",
  },
  {
    title: "متقدم",
    description: "أجب على 150 سؤال",
    icon: "target",
    type: "total",
    target: 150,
    gradient: "from-blue-400 to-cyan-500",
  },
  {
    title: "أسطورة",
    description: "أجب على 300 سؤال",
    icon: "crown",
    type: "total",
    target: 300,
    gradient: "from-red-500 to-rose-600",
  },
  {
    title: "خبير الترجمة",
    description: "أجب على 100 سؤال ترجمة",
    icon: "award",
    type: "translation",
    target: 100,
  },
  {
    title: "ملك الترجمة",
    description: "أجب على 200 سؤال ترجمة",
    icon: "crown",
    type: "translation",
    target: 200,
  },
  {
    title: "محترف مطابقة الكلمات",
    description: "أكمل 100 تمرين مطابقة",
    icon: "zap",
    type: "wordMatch",
    target: 100,
  },
  {
    title: "أذن ذهبية",
    description: "أكمل 50 تمرين استماع",
    icon: "medal",
    type: "audioListen",
    target: 50,
  },
  // أضف كمان لو حابب
];

export const seedAchievements = async () => {
  console.log("جاري إنشاء الإنجازات...");

  for (const ach of achievements) {
    // نستخدم title + target كـ ID عشان يكون فريد وسهل القراءة
    const id = `${ach.type}_${ach.target}`;
    await setDoc(doc(db, "achievements", id), ach);
    console.log(`تم إنشاء: ${ach.title} (${id})`);
  }

  console.log("تم إنشاء كل الإنجازات بنجاح!");
};
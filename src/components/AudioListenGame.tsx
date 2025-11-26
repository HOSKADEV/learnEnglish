import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import { ArrowLeft, Loader2, RotateCcw, Volume2 } from "lucide-react";
import { Button } from "./ui/button";

interface AudioGameProps {
  onBack: () => void;
  onScore: (points: number) => void;
  className?: string;
}

interface AudioWord {
  id?: string;
  english: string;
  arabic: string;
  order: number;
}

export function AudioListenGame({ onBack, onScore, className = "" }: AudioGameProps) {
  const [words, setWords] = useState<AudioWord[]>([]);
  const [currentWord, setCurrentWord] = useState<AudioWord | null>(null);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "questions/audioWords/items"),
        orderBy("order", "asc")
      );
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AudioWord));

      setWords(list);
      pickRandom(list);
    } catch (err) {
      console.error("Error loading audio words", err);
    } finally {
      setLoading(false);
    }
  };

  const pickRandom = (items: AudioWord[]) => {
    if (items.length === 0) return;
    const rand = items[Math.floor(Math.random() * items.length)];
    setCurrentWord(rand);
    setInput("");
    setFeedback(null);
  };

  const playAudio = (text: string) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    speechSynthesis.speak(utter);
  };

  const checkAnswer = () => {
    if (!currentWord) return;

    if (input.trim().toLowerCase() === currentWord.english.toLowerCase()) {
      setFeedback("correct");
      setScore((s) => s + 10);
      onScore(10);
      setTimeout(() => {
        pickRandom(words);
      }, 1200);
    } else {
      setFeedback("wrong");
    }
  };

  const resetGame = () => {
    setScore(0);
    pickRandom(words);
    setFeedback(null);
    setInput("");
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-8 shadow border">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p>جاري تحميل الكلمات الصوتية...</p>
        </div>
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className="bg-white rounded-xl p-8 shadow border">
        <p className="text-center">لا توجد كلمات صوتية بعد</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow p-4 border ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <Button onClick={onBack} variant="ghost" size="sm" className="gap-1 px-2">
          رجوع
          <ArrowLeft className="w-4 h-4" />
        </Button>

        <div className="flex gap-2 items-center">
          <Button onClick={resetGame} variant="outline" size="sm" className="gap-1 px-2">
            <RotateCcw className="w-4 h-4" />
          </Button>

          <div className="px-3 py-1.5 bg-blue-100 rounded-lg text-sm text-blue-900">
            النقاط: {score}
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-4">
        <h2 className="text-lg font-semibold">استمع للكلمة واكتبها</h2>
        <p className="text-xs text-gray-600">اضغط على زر الصوت للاستماع</p>
      </div>

      {/* Audio Button */}
      <div className="flex justify-center mb-6">
        <Button
          onClick={() => playAudio(currentWord.english)}
          className="gap-2 px-6 py-3 text-lg"
        >
          <Volume2 className="w-5 h-5" />
          استماع
        </Button>
      </div>

      {/* Input */}
      <div className="mb-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="اكتب الكلمة هنا..."
          className={`w-full p-3 rounded-lg border text-center text-lg outline-none transition-all
            ${feedback === "correct" ? "border-green-500 bg-green-50" : ""}
            ${feedback === "wrong" ? "border-red-500 bg-red-50" : ""}
          `}
        />
      </div>

      {/* Button Check */}
      <div className="text-center">
        <Button onClick={checkAnswer} size="sm" className="px-6">
          تحقق
        </Button>
      </div>

      {/* Feedback */}
      {feedback === "correct" && (
        <p className="text-center mt-3 text-green-600 font-semibold">✔ إجابة صحيحة!</p>
      )}

      {feedback === "wrong" && (
        <p className="text-center mt-3 text-red-600 font-semibold">
          ✘ خطأ، الكلمة هي: {currentWord.english}
        </p>
      )}
    </div>
  );
}

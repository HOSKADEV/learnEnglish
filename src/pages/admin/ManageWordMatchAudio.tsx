"use client";

import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase";
import { Plus, Edit2, Trash2, X } from "lucide-react";

interface AudioWord {
  id?: string;
  english: string;
  arabic: string;
  order: number;
}

export default function ManageAudioWords() {
  const [words, setWords] = useState<AudioWord[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState("");
  const [form, setForm] = useState({ english: "", arabic: "", order: 1 });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState("");

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = async () => {
    try {
      const q = query(
        collection(db, "questions/audioWords/items"),
        orderBy("order", "asc")
      );
      const snap = await getDocs(q);
      setWords(snap.docs.map((d) => ({ id: d.id, ...d.data() } as AudioWord)));
    } catch (err) {
      alert("فشل تحميل الكلمات");
    } finally {
      setLoading(false);
    }
  };

  const listenWord = (word: string) => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    speechSynthesis.speak(utterance);
  };

  const openAddModal = () => {
    setForm({ english: "", arabic: "", order: words.length + 1 });
    setIsEdit(false);
    setEditId("");
    setShowAddEditModal(true);
  };

  const openEditModal = (w: AudioWord) => {
    setForm({ english: w.english, arabic: w.arabic, order: w.order });
    setIsEdit(true);
    setEditId(w.id!);
    setShowAddEditModal(true);
  };

  const openDeleteModal = (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const save = async () => {
    if (!form.english.trim() || !form.arabic.trim()) return alert("املأ الحقول");
    try {
      if (isEdit && editId) {
        await updateDoc(doc(db, "questions/audioWords/items", editId), form);
      } else {
        await addDoc(collection(db, "questions/audioWords/items"), {
          ...form,
          order: form.order || words.length + 1,
        });
      }
      setShowAddEditModal(false);
      loadWords();
    } catch (err) {
      alert("حدث خطأ");
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, "questions/audioWords/items", deleteId));
      setShowDeleteModal(false);
      loadWords();
    } catch (err) {
      alert("فشل الحذف");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-2xl">
        جاري التحميل...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="rounded-2xl shadow-xl p-8 mb-8 bg-white flex justify-between items-center">
          <h1 className="text-4xl font-bold text-gray-800">
            إدارة الكلمات الصوتية
          </h1>
          <button
            onClick={openAddModal}
            className="px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-[15px] py-2 rounded-xl hover:opacity-90 transition flex items-center justify-center gap-3"
          >
            <Plus size={28} /> إضافة كلمة
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-right font-bold text-gray-700">#</th>
                <th className="px-6 py-4 text-right font-bold text-gray-700">الكلمة بالإنجليزية</th>
                <th className="px-6 py-4 text-right font-bold text-gray-700">الترجمة بالعربية</th>
                <th className="px-6 py-4 text-center font-bold text-gray-700">استماع</th>
                <th className="px-6 py-4 text-center font-bold text-gray-700">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {words.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-gray-500 text-xl">
                    لا توجد كلمات
                  </td>
                </tr>
              ) : (
                words.map((w, index) => (
                  <tr key={w.id} className="border-t hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-center">{index + 1}</td>
                    <td className="px-6 py-4 font-bold text-lg">{w.english}</td>
                    <td className="px-6 py-4 font-bold text-blue-600 text-lg">{w.arabic}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => listenWord(w.english)}
                        className="px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-xl transition"
                      >
                        🔊
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center flex justify-center gap-3">
                      <button
                        onClick={() => openEditModal(w)}
                        className="p-3 bg-blue-100 hover:bg-blue-200 rounded-xl transition"
                      >
                        <Edit2 size={22} className="text-blue-600" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(w.id!)}
                        className="p-3 bg-red-100 hover:bg-red-200 rounded-xl transition"
                      >
                        <Trash2 size={22} className="text-red-600" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* مودال الإضافة/التعديل */}
      {showAddEditModal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setShowAddEditModal(false)}
        >
             <button
    onClick={() => listenWord(form.english)}
    className="absolute top-1/2 -translate-y-1/2 right-3 p-2 bg-blue-100 rounded-xl hover:bg-blue-200"
  >
    🔊
  </button>
          <div
            className="bg-white p-10 rounded-2xl w-96 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAddEditModal(false)}
              className="absolute top-3 right-3 text-2xl"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center">
              {isEdit ? "تعديل الكلمة" : "إضافة كلمة جديدة"}
            </h2>
          <div className="relative mb-4">
  <input
    placeholder="الكلمة بالإنجليزية"
    value={form.english}
    onChange={(e) => setForm({ ...form, english: e.target.value })}
    className="w-full pr-12 p-3 border-2 border-gray-300 rounded-xl mb-2 focus:border-blue-500 outline-none"
  />
 
</div>

            <input
              placeholder="الترجمة بالعربية"
              value={form.arabic}
              onChange={(e) => setForm({ ...form, arabic: e.target.value })}
              className="w-full p-3 border-2 border-gray-300 rounded-xl mb-4 focus:border-blue-500 outline-none"
            />
            <input
              type="number"
              placeholder="الترتيب"
              value={form.order}
              onChange={(e) =>
                setForm({ ...form, order: +e.target.value || 1 })
              }
              className="w-full p-3 border-2 border-gray-300 rounded-xl mb-6 focus:border-blue-500 outline-none"
            />
            <div className="flex gap-4">
              <button
                onClick={save}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-bold hover:opacity-90"
              >
                حفظ
              </button>
              <button
                onClick={() => setShowAddEditModal(false)}
                className="flex-1 bg-gray-300 py-3 rounded-xl font-bold hover:bg-gray-400"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال تأكيد الحذف */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-white p-8 rounded-2xl w-96 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold mb-4">تأكيد الحذف</h3>
            <p className="mb-6">
              هل أنت متأكد من حذف هذه الكلمة نهائيًا؟
            </p>
            <div className="flex gap-4">
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700"
              >
                نعم، احذف
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-300 py-3 rounded-xl font-bold hover:bg-gray-400"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

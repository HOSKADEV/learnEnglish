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

interface Question {
  id?: string;
  word: string;
  hint: string;
  translation: string;
  order: number;
}

export default function ManageLetterScramble() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  // حالات المودال
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState("");
  const [deleteId, setDeleteId] = useState("");

  const [form, setForm] = useState({ word: "", hint: "", translation: "", order: 1 });

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const q = query(collection(db, "questions/letterScramble/items"), orderBy("order", "asc"));
      const snap = await getDocs(q);
      setQuestions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Question)));
    } catch (err) {
      alert("فشل تحميل الأسئلة");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setForm({ word: "", hint: "", translation: "", order: questions.length + 1 });
    setIsEdit(false);
    setEditId("");
    setShowAddEditModal(true);
  };

  const openEditModal = (q: Question) => {
    setForm({ word: q.word, hint: q.hint, translation: q.translation, order: q.order });
    setIsEdit(true);
    setEditId(q.id!);
    setShowAddEditModal(true);
  };

  const openDeleteModal = (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const save = async () => {
    if (!form.word.trim() || !form.hint.trim() || !form.translation.trim()) {
      return alert("املأ جميع الحقول");
    }
    try {
      if (isEdit && editId) {
        await updateDoc(doc(db, "questions/letterScramble/items", editId), {
          word: form.word.toUpperCase(),
          hint: form.hint,
          translation: form.translation,
          order: form.order,
        });
      } else {
        await addDoc(collection(db, "questions/letterScramble/items"), {
          word: form.word.toUpperCase(),
          hint: form.hint,
          translation: form.translation,
          order: form.order || questions.length + 1,
        });
      }
      setShowAddEditModal(false);
      loadQuestions();
    } catch (err) {
      alert("حدث خطأ");
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, "questions/letterScramble/items", deleteId));
      setShowDeleteModal(false);
      loadQuestions();
    } catch (err) {
      alert("فشل الحذف");
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen text-2xl">جاري التحميل...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* العنوان + زر الإضافة */}
        <div className=" rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800">إدارة لعبة ترتيب الحروف</h1>
              <p className="text-gray-600 mt-2 text-lg">عدد الأسئلة: {questions.length}</p>
            </div>
            <button
              onClick={openAddModal}
                                       className="px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-[15px] py-2 rounded-xl hover:opacity-90 transition flex items-center justify-center gap-3 disabled:opacity-70"

            >
              <Plus size={28} />
              إضافة سؤال جديد
            </button>
          </div>
        </div>

        {/* الجدول */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-orange-100">
              <tr>
                <th className="px-6 py-4 text-right font-bold text-gray-700">#</th>
                <th className="px-6 py-4 text-right font-bold text-gray-700">الكلمة</th>
                <th className="px-6 py-4 text-right font-bold text-gray-700">التلميح</th>
                <th className="px-6 py-4 text-right font-bold text-gray-700">الترجمة</th>
                <th className="px-6 py-4 text-center font-bold text-gray-700">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {questions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-gray-500 text-xl">
                    لا توجد أسئلة بعد
                  </td>
                </tr>
              ) : (
                questions.map((q, index) => (
                  <tr key={q.id} className="border-t hover:bg-orange-50 transition">
                    <td className="px-6 py-4 text-center font-medium">{q.order || index + 1}</td>
                    <td className="px-6 py-4 font-bold text-lg">{q.word}</td>
                    <td className="px-6 py-4 text-gray-700">{q.hint}</td>
                    <td className="px-6 py-4 text-blue-600 font-medium">{q.translation}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => openEditModal(q)}
                          className="p-3 bg-blue-100 hover:bg-blue-200 rounded-xl transition"
                        >
                          <Edit2 size={22} className="text-blue-600" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(q.id!)}
                          className="p-3 bg-red-100 hover:bg-red-200 rounded-xl transition"
                        >
                          <Trash2 size={22} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* مودال الإضافة والتعديل */}
      {showAddEditModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999}}
          onClick={() => setShowAddEditModal(false)}>
          <div style={{background:"white",padding:"40px",borderRadius:"20px",width:"90%",maxWidth:"600px",position:"relative"}}
            onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowAddEditModal(false)}
              style={{position:"absolute",top:"16px",right:"16px",background:"none",border:"none",fontSize:"32px",cursor:"pointer"}}>
              ×
            </button>
            <h2 className="text-3xl font-bold mb-8 text-center">
              {isEdit ? "تعديل السؤال" : "إضافة سؤال جديد"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input placeholder="الكلمة بالإنجليزية (حروف كبيرة)" value={form.word}
                onChange={e => setForm({...form, word: e.target.value.toUpperCase()})}
                className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg focus:border-orange-500 outline-none" autoFocus />
              <input placeholder="الترجمة بالعربية" value={form.translation}
                onChange={e => setForm({...form, translation: e.target.value})}
                className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg focus:border-orange-500 outline-none" />
            </div>
            <textarea placeholder="التلميح" value={form.hint}
              onChange={e => setForm({...form, hint: e.target.value})}
              className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg mt-6 focus:border-orange-500 outline-none resize-none h-32" />
            <input type="number" placeholder="الترتيب" value={form.order}
              onChange={e => setForm({...form, order: +e.target.value || 1})}
              className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg mt-6 focus:border-orange-500 outline-none" />
            <div className="flex gap-4 mt-8">
              <button onClick={save}
                className="flex-1 bg-orange-600 text-white py-4 rounded-xl font-bold text-xl hover:bg-orange-700 transition">
                {isEdit ? "حفظ التعديلات" : "حفظ السؤال"}
              </button>
              <button onClick={() => setShowAddEditModal(false)}
                className="flex-1 bg-gray-300 py-4 rounded-xl font-bold text-xl hover:bg-gray-400 transition">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال تأكيد الحذف */}
      {showDeleteModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999}}
          onClick={() => setShowDeleteModal(false)}>
          <div style={{background:"white",padding:"40px",borderRadius:"20px",width:"90%",maxWidth:"400px",textAlign:"center"}}
            onClick={e => e.stopPropagation()}>
            <div className="text-red-600 text-6xl mb-6">⚠️</div>
            <h3 className="text-2xl font-bold mb-4">تأكيد الحذف</h3>
            <p className="text-gray-600 mb-8 text-lg">
              هل أنت متأكد من حذف هذا السؤال نهائيًا؟<br/>هذا الإجراء لا يمكن التراجع عنه.
            </p>
            <div className="flex gap-4">
              <button onClick={confirmDelete}
                className="flex-1 bg-red-600 text-white py-4 rounded-xl font-bold text-xl hover:bg-red-700 transition">
                نعم، احذف
              </button>
              <button onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-300 py-4 rounded-xl font-bold text-xl hover:bg-gray-400 transition">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
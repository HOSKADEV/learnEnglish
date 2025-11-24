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
import { Plus, Edit2, Trash2 } from "lucide-react";
import { SearchBar } from "@/components/shared/SearchBar";
import { Pagination } from "@/components/shared/Pagination";
import { usePagination } from "@/hooks/usePagination";

interface Question {
  id?: string;
  word: string;
  correct: string;
  options: string[];
  order: number;
}

export default function ManageTranslation() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // جديد

  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState("");
  const [deleteId, setDeleteId] = useState("");

  const [form, setForm] = useState({
    word: "",
    correct: "",
    option1: "",
    option2: "",
    option3: "",
    order: 1,
  });

  // استخدام usePagination مع البحث
  const {
    currentItems: currentQuestions,
    filteredItems: filteredQuestions,
    currentPage,
    totalPages,
    startIndex,
    setCurrentPage,
  } = usePagination({
    items: questions,
    itemsPerPage: 10,
    searchTerm,
    searchFields: ["word", "correct", "options"], // نبحث في الكلمة والإجابة والخيارات
  });

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const q = query(collection(db, "questions/translation/items"), orderBy("order", "asc"));
      const snap = await getDocs(q);
      setQuestions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Question)));
    } catch (err) {
      alert("فشل تحميل الأسئلة");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setForm({ word: "", correct: "", option1: "", option2: "", option3: "", order: questions.length + 1 });
    setIsEdit(false);
    setEditId("");
    setShowAddEditModal(true);
  };

  const openEditModal = (q: Question) => {
    const opts = q.options || [];
    setForm({
      word: q.word,
      correct: q.correct,
      option1: opts[0] || "",
      option2: opts[1] || "",
      option3: opts[2] || "",
      order: q.order,
    });
    setIsEdit(true);
    setEditId(q.id!);
    setShowAddEditModal(true);
  };

  const openDeleteModal = (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const save = async () => {
    if (!form.word.trim() || !form.correct.trim() || !form.option1.trim() || !form.option2.trim() || !form.option3.trim()) {
      return alert("يرجى ملء جميع الحقول (الكلمة + الإجابة الصحيحة + الخيارات الثلاثة)");
    }

    const options = [form.option1.trim(), form.option2.trim(), form.option3.trim(), form.correct.trim()];
    const shuffled = options.sort(() => Math.random() - 0.5);

    try {
      if (isEdit && editId) {
        await updateDoc(doc(db, "questions/translation/items", editId), {
          word: form.word.trim(),
          correct: form.correct.trim(),
          options: shuffled,
          order: form.order,
        });
      } else {
        await addDoc(collection(db, "questions/translation/items"), {
          word: form.word.trim(),
          correct: form.correct.trim(),
          options: shuffled,
          order: form.order || questions.length + 1,
        });
      }
      setShowAddEditModal(false);
      loadQuestions();
    } catch (err) {
      alert("حدث خطأ أثناء الحفظ");
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, "questions/translation/items", deleteId));
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
        {/* العنوان + زر الإضافة + شريط البحث */}
        <div className="rounded-2xl shadow-xl p-8 mb-8 bg-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800">إدارة لعبة الترجمة</h1>
              <p className="text-gray-600 mt-2 text-lg">
                عدد الأسئلة: {questions.length}
                {searchTerm && ` (نتائج البحث: ${filteredQuestions.length})`}
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-[15px] py-2 rounded-xl hover:opacity-90 transition flex items-center justify-center gap-3"
            >
              <Plus size={28} />
              إضافة سؤال جديد
            </button>
          </div>

          {/* شريط البحث */}
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="ابحث عن كلمة إنجليزية أو ترجمة..."
          />
        </div>

        {/* الجدول */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-purple-100">
              <tr>
                <th className="px-6 py-4 text-right font-bold text-gray-700">#</th>
                <th className="px-6 py-4 text-right font-bold text-gray-700">الكلمة</th>
                <th className="px-6 py-4 text-right font-bold text-gray-700">الإجابة الصحيحة</th>
                <th className="px-6 py-4 text-right font-bold text-gray-700">الخيارات</th>
                <th className="px-6 py-4 text-center font-bold text-gray-700">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {currentQuestions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-gray-500 text-xl">
                    {searchTerm ? "لا توجد نتائج للبحث" : "لا توجد أسئلة بعد"}
                  </td>
                </tr>
              ) : (
                currentQuestions.map((q, index) => (
                  <tr key={q.id} className="border-t hover:bg-purple-50 transition">
                    <td className="px-6 py-4 text-center font-medium">
                      {q.order || startIndex + index + 1}
                    </td>
                    <td className="px-6 py-4 font-bold text-lg text-purple-700">{q.word}</td>
                    <td className="px-6 py-4 text-green-600 font-bold">{q.correct}</td>
                    <td className=" ACL px-6 py-4 text-sm leading-relaxed">
                      {q.options.join(" | ")}
                    </td>
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

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          className="mt-8"
        />
      </div>

      {/* مودال الإضافة والتعديل */}
      {showAddEditModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => setShowAddEditModal(false)}
        >
          <div
            style={{
              background: "white",
              padding: "40px",
              borderRadius: "20px",
              width: "90%",
              maxWidth: "700px",
              position: "relative",
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAddEditModal(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "none",
                border: "none",
                fontSize: "32px",
                cursor: "pointer",
              }}
            >
              ×
            </button>
            <h2 className="text-3xl font-bold mb-8 text-center">
              {isEdit ? "تعديل السؤال" : "إضافة سؤال جديد"}
            </h2>
            <input
              placeholder="الكلمة بالإنجليزية"
              value={form.word}
              onChange={e => setForm({ ...form, word: e.target.value })}
              className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg mb-4 focus:border-purple-500 outline-none"
              autoFocus
            />
            <input
              placeholder="الإجابة الصحيحة (بالعربية)"
              value={form.correct}
              onChange={e => setForm({ ...form, correct: e.target.value })}
              className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg mb-4 focus:border-purple-500 outline-none"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <input
                placeholder="خيار 1 (خاطئ)"
                value={form.option1}
                onChange={e => setForm({ ...form, option1: e.target.value })}
                className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg focus:border-purple-500 outline-none"
              />
              <input
                placeholder="خيار 2 (خاطئ)"
                value={form.option2}
                onChange={e => setForm({ ...form, option2: e.target.value })}
                className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg focus:border-purple-500 outline-none"
              />
              <input
                placeholder="خيار 3 (خاطئ)"
                value={form.option3}
                onChange={e => setForm({ ...form, option3: e.target.value })}
                className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg focus:border-purple-500 outline-none"
              />
            </div>
            <input
              type="number"
              placeholder="الترتيب"
              value={form.order}
              onChange={e => setForm({ ...form, order: +e.target.value || 1 })}
              className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg mb-8 focus:border-purple-500 outline-none"
            />
            <div className="flex gap-4">
              <button
                onClick={save}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-4 rounded-xl font-bold text-xl hover:opacity-90 transition"
              >
                {isEdit ? "حفظ التعديلات" : "حفظ السؤال"}
              </button>
              <button
                onClick={() => setShowAddEditModal(false)}
                className="flex-1 bg-gray-300 py-4 rounded-xl font-bold text-xl hover:bg-gray-400 transition"
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
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            style={{
              background: "white",
              padding: "40px",
              borderRadius: "20px",
              width: "90%",
              maxWidth: "400px",
              textAlign: "center",
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="text-red-600 text-6xl mb-6">تحذير</div>
            <h3 className="text-2xl font-bold mb-4">تأكيد الحذف</h3>
            <p className="text-gray-600 mb-8 text-lg">
              هل أنت متأكد من حذف هذا السؤال نهائيًا؟<br />
              هذا الإجراء لا يمكن التراجع عنه.
            </p>
            <div className="flex gap-4">
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 text-white py-4 rounded-xl font-bold text-xl hover:bg-red-700 transition"
              >
                نعم، احذف
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-300 py-4 rounded-xl font-bold text-xl hover:bg-gray-400 transition"
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
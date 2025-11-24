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
import { SearchBar } from "@/components/shared/SearchBar";
import { Pagination } from "@/components/shared/Pagination";
import { usePagination } from "@/hooks/usePagination";

interface Question {
  id?: string;
  sentence: string;
  blank: string;
  options: string[];
  translation: string;
  order: number;
}

export default function ManageFillBlank() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState("");
  const [deleteId, setDeleteId] = useState("");

  const [form, setForm] = useState({
    sentence: "",
    blank: "",
    option1: "",
    option2: "",
    option3: "",
    translation: "",
    order: 1,
  });

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
    searchFields: ["sentence", "blank", "translation", "options"],
  });

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const q = query(collection(db, "questions/fillBlank/items"), orderBy("order", "asc"));
      const snap = await getDocs(q);
      setQuestions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Question)));
    } catch (err) {
      alert("فشل تحميل الأسئلة");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setForm({
      sentence: "",
      blank: "",
      option1: "",
      option2: "",
      option3: "",
      translation: "",
      order: questions.length + 1,
    });
    setIsEdit(false);
    setEditId("");
    setShowAddEditModal(true);
  };

  const openEditModal = (q: Question) => {
    const opts = q.options || [];
    setForm({
      sentence: q.sentence,
      blank: q.blank,
      option1: opts[0] || "",
      option2: opts[1] || "",
      option3: opts[2] || "",
      translation: q.translation,
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
    if (!form.sentence.includes("___") || !form.blank.trim() || !form.translation.trim()) {
      return alert("تأكد من وجود ___ في الجملة وملء الحقول الأساسية");
    }

    const options = [form.option1, form.option2, form.option3].filter(Boolean);
    options.push(form.blank);
    const shuffled = options.sort(() => Math.random() - 0.5);

    try {
      if (isEdit && editId) {
        await updateDoc(doc(db, "questions/fillBlank/items", editId), {
          sentence: form.sentence.trim(),
          blank: form.blank.trim(),
          options: shuffled,
          translation: form.translation.trim(),
          order: form.order,
        });
      } else {
        await addDoc(collection(db, "questions/fillBlank/items"), {
          sentence: form.sentence.trim(),
          blank: form.blank.trim(),
          options: shuffled,
          translation: form.translation.trim(),
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
      await deleteDoc(doc(db, "questions/fillBlank/items", deleteId));
      setShowDeleteModal(false);
      loadQuestions();
    } catch (err) {
      alert("فشل الحذف");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-2xl text-gray-600">
        جاري التحميل...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header + Search */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800">إدارة لعبة ملء الفراغات</h1>
              <p className="text-gray-600 mt-2 text-lg">
                عدد الأسئلة: <span className="font-bold">{questions.length}</span>
                {searchTerm && (
                  <span className="mr-2 text-green-600">
                    (نتائج البحث: {filteredQuestions.length})
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition shadow-lg"
            >
              <Plus size={28} />
              إضافة سؤال جديد
            </button>
          </div>
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="ابحث في الجملة، الإجابة، أو الترجمة..."
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-100">
                <tr>
                  <th className="px-6 py-4 text-right font-bold text-gray-700">#</th>
                  <th className="px-6 py-4 text-right font-bold text-gray-700">الجملة</th>
                  <th className="px-6 py-4 text-right font-bold text-gray-700">الإجابة الصحيحة</th>
                  <th className="px-6 py-4 text-right font-bold text-gray-700">الخيارات</th>
                  <th className="px-6 py-4 text-right font-bold text-gray-700">الترجمة</th>
                  <th className="px-6 py-4 text-center font-bold text-gray-700">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {currentQuestions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-20 text-gray-500 text-xl font-medium">
                      {searchTerm ? "لا توجد نتائج للبحث" : "لا توجد أسئلة بعد"}
                    </td>
                  </tr>
                ) : (
                  currentQuestions.map((q, index) => (
                    <tr key={q.id} className="border-t hover:bg-green-50 transition">
                      <td className="px-6 py-4 text-center font-medium">
                        {q.order || startIndex + index + 1}
                      </td>
                      <td className="px-6 py-4 text-gray-800">{q.sentence.replace("___", "___")}</td>
                      <td className="px-6 py-4 font-bold text-green-600">{q.blank}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{q.options.join(" | ")}</td>
                      <td className="px-6 py-4 text-blue-600">{q.translation}</td>
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

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          className="mt-8"
        />
      </div>

      {/* Add/Edit Modal with Scroll */}
      {showAddEditModal && (
        <div className="fixed inset-0  flex items-center justify-center z-50 p-4"style={{
         
            background: "rgba(0,0,0,0.7)",
           
          }}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-screen overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-3xl font-bold text-gray-800">
                {isEdit ? "تعديل السؤال" : "إضافة سؤال جديد"}
              </h2>
              <button
                onClick={() => setShowAddEditModal(false)}
                className="text-gray-500 hover:text-gray-700 text-3xl"
              >
                <X size={32} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <textarea
                placeholder="الجملة (استخدم ___ في مكان الفراغ)"
                value={form.sentence}
                onChange={e => setForm({ ...form, sentence: e.target.value })}
                className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg focus:border-green-500 outline-none resize-none h-32"
                autoFocus
              />
              <input
                placeholder="الإجابة الصحيحة"
                value={form.blank}
                onChange={e => setForm({ ...form, blank: e.target.value })}
                className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg focus:border-green-500 outline-none"
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  placeholder="خيار 1"
                  value={form.option1}
                  onChange={e => setForm({ ...form, option1: e.target.value })}
                  className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg focus:border-green-500 outline-none"
                />
                <input
                  placeholder="خيار 2"
                  value={form.option2}
                  onChange={e => setForm({ ...form, option2: e.target.value })}
                  className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg focus:border-green-500 outline-none"
                />
                <input
                  placeholder="خيار 3 (اختياري)"
                  value={form.option3}
                  onChange={e => setForm({ ...form, option3: e.target.value })}
                  className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg focus:border-green-500 outline-none"
                />
              </div>
              <input
                placeholder="الترجمة العربية للجملة"
                value={form.translation}
                onChange={e => setForm({ ...form, translation: e.target.value })}
                className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg focus:border-green-500 outline-none"
              />
              <input
                type="number"
                placeholder="الترتيب"
                value={form.order}
                onChange={e => setForm({ ...form, order: +e.target.value || 1 })}
                className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg focus:border-green-500 outline-none"
              />
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-4">
              <button
                onClick={save}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-bold text-xl hover:opacity-90 transition shadow-lg"
              >
                {isEdit ? "حفظ التعديلات" : "حفظ السؤال"}
              </button>
              <button
                onClick={() => setShowAddEditModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-4 rounded-xl font-bold text-xl transition"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0  flex items-center justify-center z-50 p-4"   style={{
         
            background: "rgba(0,0,0,0.7)",
           
          }}>
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-red-600 text-7xl mb-4">تحذير</div>
            <h3 className="text-2xl font-bold mb-4">تأكيد الحذف</h3>
            <p className="text-gray-600 mb-8 text-lg">
              هل أنت متأكد من حذف هذا السؤال نهائيًا؟<br />
              هذا الإجراء لا يمكن التراجع عنه.
            </p>
            <div className="flex gap-4">
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold text-xl transition"
              >
                نعم، احذف
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-4 rounded-xl font-bold text-xl transition"
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
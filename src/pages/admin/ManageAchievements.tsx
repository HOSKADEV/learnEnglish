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

interface Achievement {
  id?: string;
  title: string;
  description: string;
  icon: string;
  type: string;
  target: number;
  gradient: string;
}

export default function ManageAchievements() {
  const [items, setItems] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState("");
  const [deleteId, setDeleteId] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    icon: "trophy",
    type: "total",
    target: 0,
    gradient: "from-yellow-400 to-orange-500",
  });

  // Pagination hook
  const {
    currentItems,
    filteredItems,
    currentPage,
    totalPages,
    setCurrentPage,
  } = usePagination({
    items,
    itemsPerPage: 10,
    searchTerm,
    searchFields: ["title", "description", "icon", "type"],
  });

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      // ✅ التصحيح: استخدام "achievements" فقط بدون "/list"
      const q = query(collection(db, "achievements"), orderBy("target", "asc"));
      const snap = await getDocs(q);
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as Achievement)));
    } catch {
      alert("فشل تحميل الإنجازات");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setForm({
      title: "",
      description: "",
      icon: "trophy",
      type: "total",
      target: 0,
      gradient: "from-yellow-400 to-orange-500",
    });
    setIsEdit(false);
    setEditId("");
    setShowAddEditModal(true);
  };

  const openEditModal = (a: Achievement) => {
    setForm({
      title: a.title,
      description: a.description,
      icon: a.icon,
      type: a.type,
      target: a.target,
      gradient: a.gradient,
    });
    setIsEdit(true);
    setEditId(a.id!);
    setShowAddEditModal(true);
  };

  const openDeleteModal = (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const save = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      return alert("الرجاء ملء جميع الحقول");
    }

    try {
      if (isEdit && editId) {
        // ✅ التصحيح: استخدام "achievements" فقط
        await updateDoc(doc(db, "achievements", editId), form);
      } else {
        // ✅ التصحيح: استخدام "achievements" فقط
        await addDoc(collection(db, "achievements"), form);
      }
      setShowAddEditModal(false);
      loadAchievements();
    } catch {
      alert("حدث خطأ أثناء الحفظ");
    }
  };

  const confirmDelete = async () => {
    try {
      // ✅ التصحيح: استخدام "achievements" فقط
      await deleteDoc(doc(db, "achievements", deleteId));
      setShowDeleteModal(false);
      loadAchievements();
    } catch {
      alert("فشل الحذف");
    }
  };

  if (loading)
    return <div className="flex justify-center items-center h-screen text-2xl">جاري التحميل...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="rounded-2xl shadow-xl p-8 mb-8 bg-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800">إدارة الإنجازات</h1>
              <p className="text-gray-600 mt-2 text-lg">
                عدد الإنجازات: {items.length}
                {searchTerm && ` (نتائج البحث: ${filteredItems.length})`}
              </p>
            </div>

            <button
              onClick={openAddModal}
              className="px-6 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold text-[15px] py-2 rounded-xl flex items-center gap-3"
            >
              <Plus size={28} />
              إضافة إنجاز
            </button>
          </div>

          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="ابحث بالعنوان أو النوع..."
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-orange-100">
              <tr>
                <th className="px-6 py-4 text-right">العنوان</th>
                <th className="px-6 py-4 text-right">النوع</th>
                <th className="px-6 py-4 text-right">الهدف</th>
                <th className="px-6 py-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-16 text-gray-500 text-xl">
                    لا توجد نتائج
                  </td>
                </tr>
              ) : (
                currentItems.map(a => (
                  <tr key={a.id} className="border-t hover:bg-orange-50 transition">
                    <td className="px-6 py-4 font-bold text-lg text-orange-700">{a.title}</td>
                    <td className="px-6 py-4">{a.type}</td>
                    <td className="px-6 py-4">{a.target}</td>

                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => openEditModal(a)}
                          className="p-3 bg-blue-100 hover:bg-blue-200 rounded-xl"
                        >
                          <Edit2 size={22} className="text-blue-600" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(a.id!)}
                          className="p-3 bg-red-100 hover:bg-red-200 rounded-xl"
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

      {/* ADD / EDIT MODAL */}
      {showAddEditModal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]"
          onClick={() => setShowAddEditModal(false)}
        >
          <div
            className="bg-white p-10 rounded-2xl w-[90%] max-w-[700px] relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAddEditModal(false)}
              className="absolute top-4 right-4 text-3xl"
            >
              ×
            </button>

            <h2 className="text-3xl font-bold mb-8 text-center">
              {isEdit ? "تعديل الإنجاز" : "إضافة إنجاز"}
            </h2>

            <input
              placeholder="العنوان"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full p-4 border-2 rounded-xl mb-4"
            />

            <textarea
              placeholder="الوصف"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full p-4 border-2 rounded-xl mb-4"
            />

            <input
              placeholder="الأيقونة (مثل trophy)"
              value={form.icon}
              onChange={e => setForm({ ...form, icon: e.target.value })}
              className="w-full p-4 border-2 rounded-xl mb-4"
            />

            <select
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
              className="w-full p-4 border-2 rounded-xl mb-4"
            >
              <option value="total">إجمالي</option>
              <option value="streak">سلسلة</option>
              <option value="daily">يومي</option>
            </select>

            <input
              type="number"
              placeholder="الهدف"
              value={form.target}
              onChange={e => setForm({ ...form, target: Number(e.target.value) })}
              className="w-full p-4 border-2 rounded-xl mb-4"
            />

            <input
              placeholder="التدرج (from-yellow-400 to-orange-500)"
              value={form.gradient}
              onChange={e => setForm({ ...form, gradient: e.target.value })}
              className="w-full p-4 border-2 rounded-xl mb-10"
            />

            <button
              onClick={save}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-xl font-bold text-xl"
            >
              {isEdit ? "تحديث" : "إضافة"}
            </button>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]"
          onClick={() => setShowDeleteModal(false)}
        >
          <div className="bg-white p-10 rounded-2xl w-[90%] max-w-[400px] text-center">
            <h3 className="text-2xl font-bold mb-4">تأكيد الحذف</h3>
            <p className="text-gray-600 mb-8 text-lg">
              هل أنت متأكد؟ لا يمكن التراجع بعد الحذف.
            </p>
            <div className="flex gap-4">
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 text-white py-4 rounded-xl"
              >
                حذف
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-300 py-4 rounded-xl"
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
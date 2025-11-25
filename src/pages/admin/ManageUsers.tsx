"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { Trash2 } from "lucide-react";
import { SearchBar } from "@/components/shared/SearchBar";
import { Pagination } from "@/components/shared/Pagination";
import { usePagination } from "@/hooks/usePagination";

interface User {
  id: string;
  email: string;
  createdAt: any;
}

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletingEmail, setDeletingEmail] = useState("");

  // استخدام usePagination مع البحث (نبحث فقط في الإيميل)
  const {
    currentItems: currentUsers,
    filteredItems: filteredUsers,
    currentPage,
    totalPages,
    startIndex,
    setCurrentPage,
  } = usePagination({
    items: users,
    itemsPerPage: 10,
    searchTerm,
    searchFields: ["email"], // نبحث فقط في الإيميل
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const usersData = usersSnap.docs.map((doc) => ({
        id: doc.id,
        email: doc.data().email,
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt || new Date(),
      }));
      setUsers(usersData);
    } catch (err) {
      console.error("خطأ في جلب المستخدمين:", err);
      alert("فشل تحميل قائمة المستخدمين");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (id: string, email: string) => {
    setDeleteId(id);
    setDeletingEmail(email);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteDoc(doc(db, "users", deleteId));
      setUsers((prev) => prev.filter((u) => u.id !== deleteId));
      setShowDeleteModal(false);
      setDeleteId(null);
      setDeletingEmail("");
      alert("تم حذف المستخدم بنجاح");
    } catch (err) {
      console.error("خطأ في الحذف:", err);
      alert("فشل حذف المستخدم");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-2xl text-purple-600">
        جاري تحميل المستخدمين...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* العنوان + شريط البحث */}
        <div className="rounded-2xl shadow-xl p-8 mb-8 bg-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800">إدارة المستخدمين</h1>
              <p className="text-gray-600 mt-2 text-lg">
                عدد المستخدمين: <strong>{users.length}</strong>
                {searchTerm && ` (نتائج البحث: ${filteredUsers.length})`}
              </p>
            </div>
          </div>

          {/* شريط البحث */}
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="ابحث عن بريد إلكتروني..."
          />
        </div>

        {/* الجدول */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-purple-100">
              <tr>
                <th className="px-6 py-4 text-right font-bold text-gray-700">#</th>
                <th className="px-6 py-4 text-right font-bold text-gray-700">البريد الإلكتروني</th>
                <th className="px-6 py-4 text-right font-bold text-gray-700">تاريخ الإنشاء</th>
                <th className="px-6 py-4 text-center font-bold text-gray-700">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-16 text-gray-500 text-xl">
                    {searchTerm ? "لا توجد نتائج للبحث" : "لا يوجد مستخدمون مسجلون بعد"}
                  </td>
                </tr>
              ) : (
                currentUsers.map((user, index) => (
                  <tr key={user.id} className="border-t hover:bg-purple-50 transition">
                    <td className="px-6 py-4 text-center font-medium">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-6 py-4 font-bold text-purple-700">{user.email}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      at{" "}
                      {new Date(user.createdAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => openDeleteModal(user.id, user.email)}
                          className="p-3 bg-red-100 hover:bg-red-200 rounded-xl transition"
                          title="حذف المستخدم"
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

      {/* مودال تأكيد الحذف */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-10 max-w-md w-full mx-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-red-600 text-6xl mb-6">تحذير</div>
            <h3 className="text-3xl font-bold mb-4">تأكيد حذف المستخدم</h3>
            <p className="text-gray-700 mb-6 text-lg leading-relaxed">
              هل أنت متأكد من حذف المستخدم التالي نهائيًا؟
              <br />
              <strong className="text-purple-700">{deletingEmail}</strong>
            </p>
            <p className="text-red-500 text-sm mb-8">هذا الإجراء لا يمكن التراجع عنه!</p>

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
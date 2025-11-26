import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useState } from "react";
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Languages, 
  Shuffle, 
  LogOut,
  Home,
  Menu,
  X,
  Users
} from "lucide-react";
import { Trophy } from "lucide-react";
interface AdminLayoutProps {
  user: any;
}

export default function AdminLayout({ user }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { icon: LayoutDashboard, label: "لوحة التحكم", path: "/admin" },
    { icon: BookOpen, label: "مطابقة الكلمات", path: "/admin/word-match" },
    { icon: Trophy, label: "الإنجازات", path: "/admin/achievements" },
    { icon: FileText, label: "املأ الفراغ", path: "/admin/fill-blank" },
    { icon: Languages, label: "الترجمة", path: "/admin/translation" },
    { icon: Shuffle, label: "ترتيب الحروف", path: "/admin/letter-scramble" },
    { icon: Users, label: "المستخدمون", path: "/admin/users" },
  ];

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100" dir="rtl">
      <div className="flex">
        {/* Sidebar */}
        <aside 
          className={`bg-white shadow-lg fixed top-0 bottom-0 right-0 transition-all duration-300 ease-in-out z-40 ${
            sidebarOpen ? "w-64" : "w-0"
          } overflow-hidden`}
        >
          <nav className="p-4 space-y-2 mt-[73px]">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    active
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Header and Main Content Container */}
        <div 
          className={`flex-1 transition-all duration-300 ease-in-out ${
            sidebarOpen ? "mr-64" : "mr-0"
          }`}
        >
          {/* Header */}
          <header className="bg-white shadow-lg sticky top-0 z-50">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Toggle Button */}
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Toggle sidebar"
                  >
                    {sidebarOpen ? (
                      <X className="w-5 h-5 text-gray-700" />
                    ) : (
                      <Menu className="w-5 h-5 text-gray-700" />
                    )}
                  </button>

                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                    <LayoutDashboard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">لوحة التحكم</h1>
                    <p className="text-sm text-gray-600">مرحبًا، {user.email?.split("@")[0]}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                  >
                    <Home className="w-4 h-4 text-blue-600" />
                  </button>
                  
                  <button
                    onClick={() => signOut(auth)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
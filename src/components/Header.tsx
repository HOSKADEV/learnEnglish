// src/components/Header.tsx
import { useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { BookOpen, Home, Trophy, LogOut, Settings } from "lucide-react";

interface HeaderProps {
  user: any;
  totalScore: number;
  isAdmin: boolean;
}

export default function Header({ user, totalScore, isAdmin }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-bold">تعلم الإنجليزية</h1>
              <p className="text-sm text-red-600">
                مرحبًا، {user.email?.split("@")[0]}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 rounded-lg ml-3">
              <Trophy className="w-4 h-4 text-amber-600" />
              <span className="text-2xl font-bold text-amber-900">{totalScore}</span>
            </div>
            
            {!isHomePage && (
              <button
                onClick={() => navigate("/")}
                className="flex items-center justify-center w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors active:scale-95"
              >
                <Home className="w-4 h-4" />
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => navigate("/admin")}
                className="flex items-center justify-center w-9 h-9 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors active:scale-95"
              >
                <Settings className="w-4 h-4 text-purple-600" />
              </button>
            )}
            
            <button
              onClick={() => signOut(auth)}
              className="p-3 bg-red-100 hover:bg-red-200 flex items-center justify-center w-9 h-9 rounded-lg transition"
            >
              <LogOut className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
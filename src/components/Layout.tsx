// src/components/Layout.tsx
import { useEffect } from "react";
import { useLocation, Outlet } from "react-router-dom";
import Header from "./Header";

interface LayoutProps {
  user: any;
  totalScore: number;
  isAdmin: boolean;
}

export default function Layout({ user, totalScore, isAdmin }: LayoutProps) {
  const location = useLocation();

  // منع الـ scroll عند فتح المودال
  useEffect(() => {
    const hasOpenModal = document.querySelector('[data-modal-open="true"]');
    if (hasOpenModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [location]);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50" dir="rtl">
        <Header user={user} totalScore={totalScore} isAdmin={isAdmin} />
        
        <main className="relative min-h-screen">
          <Outlet />
        </main>
      </div>
      
      {/* مؤشر للمودال المفتوح */}
      <div data-modal-open={!!document.querySelector('.fixed.inset-0[z-index="50"]')} />
    </>
  );
}
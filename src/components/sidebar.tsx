import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Gamepad2, FileText, Languages, Shuffle, Menu, X, LayoutDashboard, Trophy } from "lucide-react"

const navigationItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    id: "achievements",
    label: "الإنجازات والشارات",
    icon: Trophy,               
    href: "/admin/achievements",
  },
  {
    id: "wordMatch",
    label: "مطابقة الكلمات",
    icon: Gamepad2,
    href: "/admin/word-match",
  },
  {
    id: "fillBlank",
    label: "ملء الفراغات",
    icon: FileText,
    href: "/admin/fill-blank",
  },
  {
    id: "translation",
    label: "الترجمة",
    icon: Languages,
    href: "/admin/translation",
  },
  {
    id: "letterScramble",
    label: "ترتيب الحروف",
    icon: Shuffle,
    href: "/admin/letter-scramble",
  },
  {
    id: "matchAudio",
    label: "الاستماع والمطابقة",
    icon: Headphones,
    href: "/admin/match-audio",
  },
  {
    id: "users",
    label: "إدارة المستخدمين",
    icon: Users,
    href: "/admin/users",
  },
];

const styles = {
  mobileToggle: {
    position: 'fixed',
    top: '16px',
    right: '16px',
    zIndex: 50,
    padding: '8px',
    backgroundColor: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'background-color 0.2s',
  },
  sidebar: {
    height: '100vh',
    width: '256px',
    backgroundColor: 'white',
    borderLeft: '1px solid #e5e7eb',
    transition: 'transform 0.3s ease',
    zIndex: 40,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
    direction: 'rtl',
  },
  sidebarClosed: {
    transform: 'translateX(100%)',
  },
  header: {
    padding: '24px',
    borderBottom: '1px solid #e5e7eb',
    background: 'linear-gradient(to bottom right, #eff6ff, white)',
  },
  headerTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: 0,
  },
  headerSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
    marginTop: '4px',
  },
  nav: {
    flex: 1,
    padding: '16px',
    overflowY: 'auto',
  },
  navList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  navItem: {
    marginBottom: '4px',
  },
  navButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    textAlign: 'right',
    transition: 'all 0.2s',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    color: '#4b5563',
    fontSize: '14px',
    textDecoration: 'none',
  },
  navButtonActive: {
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    fontWeight: 600,
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  navButtonHover: {
    backgroundColor: '#f9fafb',
    color: '#111827',
  },
  iconActive: {
    color: '#2563eb',
  },
  iconInactive: {
    color: '#9ca3af',
  },
  navText: {
    flex: 1,
  },
  activeIndicator: {
    width: '4px',
    height: '24px',
    backgroundColor: '#2563eb',
    borderRadius: '9999px',
  },
  footer: {
    padding: '16px',
    borderTop: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#6b7280',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 30,
    backdropFilter: 'blur(2px)',
    transition: 'opacity 0.3s',
  },
  spacer: {
    width: '256px',
  },
}

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const [hoveredItem, setHoveredItem] = useState(null)
  const [toggleHovered, setToggleHovered] = useState(false)
  const location = useLocation()
  
  const getActiveItem = () => {
    const path = location.pathname
    const item = navigationItems.find(item => item.href === path)
    return item ? item.id : 'dashboard'
  }
  
  const activeItem = getActiveItem()

  const handleResize = () => {
    if (window.innerWidth >= 768) {
      setIsOpen(true)
    }
  }

  useState(() => {
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  })

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          ...styles.mobileToggle,
          backgroundColor: toggleHovered ? '#f3f4f6' : 'white',
          display: isMobile ? 'block' : 'none',
        }}
        aria-label="Toggle menu"
        onMouseEnter={() => setToggleHovered(true)}
        onMouseLeave={() => setToggleHovered(false)}
      >
        {isOpen ? <X size={24} style={{ color: '#374151' }} /> : <Menu size={24} style={{ color: '#374151' }} />}
      </button>

      <aside
        style={{
          ...styles.sidebar,
          ...((!isOpen && isMobile) ? styles.sidebarClosed : {}),
        }}
      >
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>لوحة التحكم</h1>
          <p style={styles.headerSubtitle}>إدارة الألعاب التعليمية</p>
        </div>

        <nav style={styles.nav}>
          <ul style={styles.navList}>
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = activeItem === item.id
              const isHovered = hoveredItem === item.id
              
              return (
                <li key={item.id} style={styles.navItem}>
                  <Link
                    to={item.href}
                    onClick={() => {
                      if (isMobile) {
                        setIsOpen(false)
                      }
                    }}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    style={{
                      ...styles.navButton,
                      ...(isActive ? styles.navButtonActive : {}),
                      ...(isHovered && !isActive ? styles.navButtonHover : {}),
                    }}
                  >
                    <Icon 
                      size={20} 
                      style={isActive ? styles.iconActive : styles.iconInactive}
                    />
                    <span style={styles.navText}>{item.label}</span>
                    {isActive && <div style={styles.activeIndicator} />}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div style={styles.footer}>
          <span>© 2025 لوحة التحكم</span>
          <span style={{ color: '#9ca3af' }}>v1.0</span>
        </div>
      </aside>

      {isOpen && isMobile && (
        <div
          onClick={() => setIsOpen(false)}
          style={styles.overlay}
        />
      )}

      {!isMobile && <div style={styles.spacer} />}
    </>
  )
}
import React from 'react';
import { Clock, PlusCircle, Library as LibraryIcon, MapPin, ClipboardList, UserPlus, User as UserIcon } from 'lucide-react';

// ─────────────────────────────────────────────
//  MobileBottomNav
//  Hiện chỉ trên mobile (ẩn trên md+)
//  Thành viên đăng nhập : Lập Dự Án | Tra Ngày | Thư Viện | Bản Đồ | Tài Khoản
//  Khách tự do          : Tra Ngày  | Khảo Sát | Đăng Ký
// ─────────────────────────────────────────────
export default function MobileBottomNav({ currentView, setCurrentView, currentUser, isSharedMode }) {
  if (isSharedMode) return null;

  // ── Tabs theo vai trò ──────────────────────────────────────────────
  const memberTabs = [
    {
      id: 'CREATE',
      label: 'Dự Án',
      icon: PlusCircle,
      activeColor: '#6366f1',        // indigo-500
      activeBg: '#eef2ff',
    },
    {
      id: 'TRACKER',
      label: 'Tra Ngày',
      icon: Clock,
      activeColor: '#f59e0b',        // amber-500
      activeBg: '#fffbeb',
    },
    {
      id: 'LIBRARY',
      label: 'Thư Viện',
      icon: LibraryIcon,
      activeColor: '#10b981',        // emerald-500
      activeBg: '#f0fdf4',
    },
    {
      id: 'MAP_VIEW',
      label: 'Bản Đồ',
      icon: MapPin,
      activeColor: '#8b5cf6',        // violet-500
      activeBg: '#f5f3ff',
    },
    {
      id: 'ACCOUNT',
      label: 'Tài Khoản',
      icon: UserIcon,
      activeColor: '#0ea5e9',        // sky-500
      activeBg: '#f0f9ff',
    },
  ];

  const guestTabs = [
    {
      id: 'TRACKER',
      label: 'Tra Ngày',
      icon: Clock,
      activeColor: '#f59e0b',
      activeBg: '#fffbeb',
    },
    {
      id: 'GUEST_WIZARD',
      label: 'Khảo Sát',
      icon: ClipboardList,
      activeColor: '#e11d48',        // rose-600
      activeBg: '#fff1f2',
    },
    {
      id: 'LOGIN',
      label: 'Đăng Ký',
      icon: UserPlus,
      activeColor: '#0ea5e9',
      activeBg: '#f0f9ff',
    },
  ];

  // Lọc theo quyền hạn nếu là thành viên (không phải ADMIN)
  const allMemberViews = ['TRACKER', 'CREATE', 'LIBRARY', 'MAP_VIEW', 'ACCOUNT', 'RESULT', 'LUBAN'];
  let tabs;
  if (currentUser) {
    if (currentUser.role === 'ADMIN') {
      tabs = memberTabs;
    } else {
      // Lọc chỉ những tab nằm trong permissions của user
      // TRACKER và ACCOUNT luôn hiển thị
      tabs = memberTabs.filter(tab => {
        if (tab.id === 'TRACKER' || tab.id === 'ACCOUNT') return true;
        return currentUser.permissions?.[tab.id];
      });
    }
  } else {
    tabs = guestTabs;
  }

  const handleTabPress = (id) => {
    if (id === 'CREATE') setCurrentView && setCurrentView('CREATE', 'reset');
    else setCurrentView && setCurrentView(id);
  };

  // Xác định tab nào đang active (RESULT / LUBAN cũng highlight CREATE)
  const getActiveTab = () => {
    if (currentView === 'RESULT') return currentUser ? 'CREATE' : 'TRACKER';
    if (currentView === 'LUBAN') return 'TRACKER';
    return currentView;
  };
  const activeTab = getActiveTab();

  return (
    <>
      {/* Placeholder giữ chỗ để content không bị nav che */}
      <div className="h-20 md:hidden" aria-hidden="true" />

      {/* Bottom Nav Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(148,163,184,0.2)',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
        role="navigation"
        aria-label="Điều hướng chính"
      >
        <div className="flex items-stretch justify-around" style={{ minHeight: '60px' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`mobile-nav-${tab.id.toLowerCase()}`}
                onClick={() => handleTabPress(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                  padding: '8px 4px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {/* Active indicator pill */}
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '6px',
                      width: '36px',
                      height: '4px',
                      borderRadius: '2px',
                      background: tab.activeColor,
                      transform: 'scaleX(1)',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                )}

                {/* Icon container */}
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '32px',
                    borderRadius: '10px',
                    background: isActive ? tab.activeBg : 'transparent',
                    transition: 'all 0.2s ease',
                    marginTop: isActive ? '4px' : '0',
                  }}
                >
                  <Icon
                    size={20}
                    style={{
                      color: isActive ? tab.activeColor : '#94a3b8',
                      transition: 'color 0.2s ease',
                      strokeWidth: isActive ? 2.5 : 1.8,
                    }}
                  />
                </span>

                {/* Label */}
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? tab.activeColor : '#94a3b8',
                    letterSpacing: '0.01em',
                    transition: 'color 0.2s ease',
                    lineHeight: 1,
                  }}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

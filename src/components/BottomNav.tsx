// src/components/BottomNav.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './css/BottomNav.module.css';

const navItems = [
  {
    label: '메인',
    icon: '/assets/home.svg',
    activeIcon: '/assets/home-active.svg',
    path: '/mainpage',
  },
  {
    label: '채팅',
    icon: '/assets/chat.svg',
    activeIcon: '/assets/chat-active.svg',
    path: '/chat',
  },
  {
    label: '검색',
    icon: '/assets/search-bottom.svg',
    activeIcon: '/assets/search-active.svg',
    path: '/fest/all',
  },
  {
    label: '마이페이지',
    icon: '/assets/mypage.svg',
    activeIcon: '/assets/mypage-active.svg',
    path: '/mypage',
  },
];

const BottomNav: React.FC = () => {
  const location = useLocation();

  return (
    <div className={styles.container}>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link key={item.path} to={item.path} className={styles.link}>
            <img
              src={isActive ? item.activeIcon : item.icon}
              alt={item.label}
              className={styles.icon}
              style={{
                filter: isActive ? 'none' : 'grayscale(100%) opacity(0.5)',
              }}
            />
            <span
              className={styles.label}
              style={{
                color: isActive ? '#3977F4' : '#CFCFCF',
              }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
};

export default BottomNav;

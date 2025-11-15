import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import EventCard from '../components/EventCard';
import styles from './css/LikedEventsPage.module.css';
import { motion } from 'framer-motion';

interface LikedEvent {
  eventId: number;
  title: string;
  category: string;
  isFree: string;
  startDate?: string;
  endDate?: string;
  mainImg?: string;
}

const formatDate = (start?: string, end?: string) => {
  if (!start || !end) return '';
  const s = start.split('-');
  const e = end.split('-');
  return `${s[0].slice(2)}.${s[1]}.${s[2]} ~ ${e[0].slice(2)}.${e[1]}.${e[2]}`;
};

const LikedEventsPage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<LikedEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedEvents = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get('/api/auth/user/event/likes');
        const content = res.data.data?.content ?? [];
        setEvents(content);
        console.log('좋아요한 행사:', content);
      } catch (error) {
        console.error('좋아요한 행사 불러오기 실패:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLikedEvents();
  }, []);

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className={styles.header}>
        <motion.img
          src="/assets/slash.svg"
          alt="뒤로가기"
          className={styles.icon}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/mypage')}
        />
        <h2 className={styles.title}>좋아요한 행사</h2>
      </div>

      <p className={styles.sectionLabel}>좋아요한 행사 모음</p>

      {loading ? (
        <div className={styles.loading}>로딩 중...</div>
      ) : events.length === 0 ? (
        <div className={styles.empty}>
          <p>좋아요한 행사가 없습니다.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {events.map((item) => (
            <motion.div
              key={item.eventId}
              style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '12px' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <EventCard
                category={item.category}
                title={item.title}
                location={item.isFree === "Y" ? "무료" : "유료"}
                dateRange={formatDate(item.startDate, item.endDate)}
                mainImg={item.mainImg || '/assets/default-card.jpg'}
                eventId={item.eventId}
                onClick={(id) => navigate(`/fest/detail?eventId=${id}`)}
              />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default LikedEventsPage;


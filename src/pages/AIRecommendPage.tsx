import { useQueries, UseQueryResult } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import EventCard from '../components/EventCard';
import RankedCard from '../components/RankedCard';
import styles from './css/AIRecommendPage.module.css';
import axiosInstance from '../api/axiosInstance';
import BottomNav from '../components/BottomNav';
interface CardItem {
  eventId: number;
  title: string;
  category: string;
  guName: string;
  startDate: string;
  endDate: string;
  mainImg: string;
}

const formatDate = (start?: string, end?: string) => {
  if (!start || !end) return '';
  const s = start.split('-');
  const e = end.split('-');
  if (s.length < 3 || e.length < 3) return '';
  return `25.${s[1]}.${s[2]} ~ 25.${e[1]}.${e[2]}`;
};

const AIRecommendPage = () => {
  const navigate = useNavigate();

  const [recommendQuery, popularQuery] = useQueries({
    queries: [
      {
        queryKey: ['recommendEvents'],
        queryFn: async (): Promise<CardItem[]> => {
          const res = await axiosInstance.get('/api/auth/user/event/recommend');
          return Array.isArray(res.data.data) ? res.data.data : [];
        },
        staleTime: 0,
        refetchOnMount: true,
      },
      {
        queryKey: ['popularEvents', 4],
        queryFn: async (): Promise<CardItem[]> => {
          const res = await axiosInstance.get('/api/auth/user/event', {
            params: { sortByPopularity: 'True', size: 4 },
          });
          const content = Array.isArray(res.data.data?.content)
            ? res.data.data.content
            : [];
          return content;
        },
        staleTime: 0,
        refetchOnMount: true,
      },
    ],
  }) as [UseQueryResult<CardItem[]>, UseQueryResult<CardItem[]>];

  if (recommendQuery.isLoading || popularQuery.isLoading) {
    return <div>로딩 중...</div>;
  }

  const recommendData = recommendQuery.data || [];
  const popularData = popularQuery.data || [];

  return (
    <motion.div
      className={styles.wrapper}
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
          onClick={() => navigate(('/mainpage'), { replace: true })}
        />
        <h2 className={styles.title}>AI 추천</h2>
      </div>

      <p className={styles.subtitle}>고객님을 위한 AI 맞춤 제안</p>

      <div className={styles.list}>
          {recommendData.length === 0 ? (
            <div className={styles.emptyMessage}>
              아직 AI 추천을 제공할 수 없습니다. 활동이 부족해요!
            </div>
          ) : (
            recommendData.map((item) => (
              <motion.div
                key={item.eventId}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <EventCard
                  category={item.category}
                  title={item.title}
                  location={item.guName}
                  dateRange={formatDate(item.startDate, item.endDate)}
                  mainImg={item.mainImg || '/assets/default-card.jpg'}
                  eventId={item.eventId}
                  onClick={(id) => navigate(`/fest/detail?eventId=${id}`)}
                />
              </motion.div>
            ))
          )}
        </div>


      <h3 className={styles.sectionTitle}>지금 인기있는 그 장소</h3>

      <div className={styles.listGrid}>
        {popularData.map((item, idx) => (
          <motion.div
            key={item.eventId}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <RankedCard
              rank={idx + 1}
              title={item.title}
              dateRange={formatDate(item.startDate, item.endDate)}
              mainImg={item.mainImg || '/assets/default-card.jpg'}
              onClick={() => navigate(`/fest/detail?eventId=${item.eventId}`)}
            />
          </motion.div>
        ))}
      </div>
      <BottomNav/>
    </motion.div>
  );
};

export default AIRecommendPage;
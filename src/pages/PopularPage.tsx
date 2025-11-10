// src/pages/PopularPage.tsx
import { useQuery } from '@tanstack/react-query';
import styles from './css/PopularPage.module.css';
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom'; 
import { motion } from 'framer-motion'; 

interface CardItem {
  eventId: number;
  title: string;
  category: string;
  guName: string;
  startDate: string;
  endDate: string;
  mainImg?: string;
}

const formatDate = (dateStr: string): string => {
  const [yyyy, mm, dd] = dateStr.split('-');
  return `${yyyy}.${mm}.${dd}`;
};

const PopularPage = () => {
    const navigate = useNavigate(); // ✅ 추가

  const handleBack = () => {
    navigate('/mainpage', { replace: true });

  };
  const { data = [] } = useQuery<CardItem[]>({
    queryKey: ['popularEventsFull'],
    queryFn: async () => {
      const res = await axiosInstance.get('/api/auth/user/event', {
        params: { sortByPopularity: 'True', size: 20 },
      });
      const content = Array.isArray(res.data.data?.content)
        ? res.data.data.content
        : Array.isArray(res.data.data)
        ? res.data.data
        : [];
      return content;
    },
  });

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
          onClick={handleBack}
          className={styles.icon}
          whileTap={{ scale: 0.9 }}
        />
        <h2 className={styles.title}>실시간 인기</h2>
      </div>

      <div className={styles.grid}>
        {data.map((item, idx) => (
          <motion.div
            className={styles.card}
            key={item.eventId}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300 }}
            onClick={() => navigate(`/fest/detail?eventId=${item.eventId}`)}
          >
            <div className={styles.imageWrapper}>
              <img src={item.mainImg || '/assets/default-card.jpg'} alt={item.title} />
              <span className={styles.rank}>{idx + 1}</span>
            </div>
            <div className={styles.info}>
              <p className={styles.titleText}>{item.title}</p>
              <p className={styles.dateText}>
                📅 {formatDate(item.startDate)} ~ {formatDate(item.endDate)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default PopularPage;
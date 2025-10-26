// src/pages/MyPage.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './css/MyPage.module.css';
import BottomNav from '../components/BottomNav';
import useUserStore from '../store/userStore';
import axiosInstance from '../api/axiosInstance';

const MyPage = () => {
  const navigate = useNavigate();
  const { nickname } = useUserStore();
  const setUserInfo = useUserStore((state) => state.setUserInfo);

  const handleEditClick = () => {
    navigate('/profile');
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await axiosInstance.get('/api/auth/user/info');
        const { username, email, gender, birthday } = res.data.data;
        const [year, month, day] = birthday.split('-');

        setUserInfo({
          nickname: username,
          email,
          gender,
          birth: { year, month, day },
        });
      } catch (err) {
        console.error('유저 정보 불러오기 실패', err);
      }
    };

    fetchUserInfo();
  }, []);

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <p className={styles.welcome}>
        {nickname}님,
        <br />
        반갑습니다.
      </p>

      <motion.button
        className={styles.editBtn}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleEditClick}
      >
        프로필 수정
      </motion.button>

      <div className={styles.section}>
        <p className={styles.sectionTitle}>활동</p>

        <motion.div
          className={styles.item}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/ai')}
        >
          <span>AI 맞춤 추천</span>
          <img src="/assets/detail/slash.svg" alt="arrow" />
        </motion.div>

        <motion.div
          className={styles.item}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/scrap')}
        >
          <span>스크랩한 행사</span>
          <img src="/assets/detail/slash.svg" alt="arrow" />
        </motion.div>

        <motion.div
          className={styles.item}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/myreview')}
        >
          <span>내가 쓴 리뷰</span>
          <img src="/assets/detail/slash.svg" alt="arrow" />
        </motion.div>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionTitle}>기타</p>

        <motion.div
          className={styles.item}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/term')}
        >
          <span>이용약관</span>
          <img src="/assets/detail/slash.svg" alt="arrow" />
        </motion.div>

        <motion.div
          className={styles.item}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/support')}
        >
          <span>고객지원</span>
          <img src="/assets/detail/slash.svg" alt="arrow" />
        </motion.div>
      </div>

      <motion.button
        className={styles.logout}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          navigate('/', { replace: true });
        }}
      >
        로그아웃
      </motion.button>

      <BottomNav />
    </motion.div>
  );
};

export default MyPage;

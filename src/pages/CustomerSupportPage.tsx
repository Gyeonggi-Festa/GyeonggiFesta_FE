import React from 'react';
import PageHeader from '../components/PageHeader';
import styles from './css/CustomerSupportPage.module.css';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // ✅ 추가

const supportItems = [
  '오류를 발견했어요.',
  '비정상 이용자를 신고하고 싶어요.',
  '기타 문의사항이 있어요.',
  '회원탈퇴를 하고 싶어요.',
];

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1 },
  }),
};

const CustomerSupportPage: React.FC = () => {
  const navigate = useNavigate();

  const handleItemClick = (item: string) => {
    if (item === '회원탈퇴를 하고 싶어요.') {
      navigate('/delete');
    } else {
      window.open('https://open.kakao.com/o/sXpLyXuh', '_blank');
    }
  };

  return (
    <motion.div
      className={styles.wrapper}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <PageHeader title="고객지원" />

      <p className={styles.subtitle}>원하는 메뉴를 선택하세요</p>

      <ul className={styles.list}>
        {supportItems.map((item, index) => (
          <motion.li
            key={index}
            className={styles.listItem}
            onClick={() => handleItemClick(item)} // ✅ item 전달
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            custom={index}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            {item}
            <span className={styles.arrow}>›</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
};

export default CustomerSupportPage;

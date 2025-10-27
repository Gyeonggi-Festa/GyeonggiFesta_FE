import React from 'react';
import styles from './css/PageHeader.module.css';
import { useNavigate } from 'react-router-dom'; 
interface PageHeaderProps {
  title: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title }) => {
    const navigate = useNavigate(); // ✅ 훅 사용

  const handleBack = () => {
    navigate(-1); // ✅ 뒤로가기
  };
  return (
    <div className={styles.header}>
      <img onClick={handleBack} src="/assets/slash.svg" alt="뒤로가기" className={styles.icon} />
      <h2 className={styles.title}>{title}</h2>
    </div>
  );
};

export default PageHeader;

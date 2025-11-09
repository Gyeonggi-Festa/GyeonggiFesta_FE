import React from 'react';
import styles from './css/PageHeader.module.css';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  onBack?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, onBack }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={styles.header}>
      <img
        onClick={handleBack}
        src="/assets/slash.svg"
        alt="뒤로가기"
        className={styles.icon}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleBack()}
      />
      <h2 className={styles.title}>{title}</h2>
    </div>
  );
};

export default PageHeader;

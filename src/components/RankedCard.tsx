// src/components/RankedCard.tsx
import React from 'react';
import styles from './css/RankedCard.module.css';

interface RankedCardProps {
  rank: number;
  title: string;
  dateRange: string;
  mainImg: string;
  onClick: () => void;
}

const RankedCard: React.FC<RankedCardProps> = ({
  rank,
  title,
  dateRange,
  mainImg,
  onClick,
}) => {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.imageWrapper}>
        <img src={mainImg} alt={title} className={styles.image} />
        <span className={styles.rank}>{rank}</span>
      </div>
      <div className={styles.info}>
        <div className={styles.title}>{title}</div>
        <div className={styles.date}>📅 {dateRange}</div>
      </div>
    </div>
  );
};

export default RankedCard;
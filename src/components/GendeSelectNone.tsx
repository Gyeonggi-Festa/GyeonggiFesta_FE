import React from 'react';
import useUserStore from '../store/userStore';
import styles from './css/GenderSelect.module.css';

const GenderSelectNone: React.FC = () => {
  const { gender } = useUserStore();

  
  const handleBlockedClick = () => {
    alert('성별은 수정할 수 없습니다.');
  };

  return (
    <div className={styles.wrapper}>
      {['남자', '여자'].map((g) => (
        <button
          key={g}
          onClick={handleBlockedClick}
          className={gender === g ? styles.selected : styles.button}
        >
          {g}
        </button>
      ))}
    </div>
  );
};

export default GenderSelectNone;

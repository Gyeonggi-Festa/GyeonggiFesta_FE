import React from 'react';
import useUserStore from '../store/userStore';
import styles from './css/NicknameInput.module.css';

const NicknameInput: React.FC = () => {
  const { nickname, setNickname } = useUserStore();

  return (
    <div className={styles.wrapper}>
      <label className={styles.label}>닉네임</label>
      <input
        type="text"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        className={styles.input}
        placeholder="닉네임 입력"
      />
    </div>
  );
};

export default NicknameInput;

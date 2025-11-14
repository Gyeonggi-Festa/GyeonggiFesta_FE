import React from 'react';
import styles from './css/GroupChatJoinModal.module.css';

interface GroupChatJoinModalProps {
  name: string;
  information: string;
  participation: number;
  category: string;
  onClose: () => void;
  onJoin: () => void;
}

const GroupChatJoinModal: React.FC<GroupChatJoinModalProps> = ({
  name,
  information,
  participation,
  category,
  onClose,
  onJoin,
}) => {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.title}>{name}</span>
          <button className={styles.close} onClick={onClose}>닫기</button>
        </div>

        <div className={styles.meta}>
          <span className={styles.category}>{category}</span>
          <div className={styles.participants}>
            <img src="/assets/person.svg" alt="사람 아이콘" />
            {participation}명
          </div>
        </div>

        <div className={styles.information}>{information}</div>

        <button className={styles.joinButton} onClick={onJoin}>
          입장하기
        </button>
      </div>
    </div>
  );
};

export default GroupChatJoinModal;
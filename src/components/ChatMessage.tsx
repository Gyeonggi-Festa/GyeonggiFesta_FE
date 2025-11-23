// src/components/Chat/ChatMessage.tsx
import React from 'react';
import styles from './css/ChatMessage.module.css';

interface ChatMessageProps {
  sender: 'me' | 'other';
  message: string;
  time: string;
  senderName?: string;
  isDeleted?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ sender, message, time, senderName, isDeleted }) => {
  const isMe = sender === 'me';
  // 탈퇴한 회원의 경우 "알 수 없음"으로 표시
  const displayName = senderName && senderName.trim() !== '' ? senderName : '알 수 없음';

  return (
    <div className={`${styles["chatroom-message"]} ${isMe ? styles["chatroom-my-message"] : styles["chatroom-other-message"]}`}>
      <div className={styles["chatroom-message-wrapper"]}>
        {!isMe && (
          <div className={styles["chatroom-sender-name"]}>{displayName}</div>
        )}
        <div className={styles["chatroom-message-bubble"]}>
          <div className={`${styles["chatroom-message-text"]} ${isDeleted ? styles["chatroom-deleted-message"] : ''}`}>
            {message}
          </div>
        </div>
        <div className={styles["chatroom-message-time"]}>{time}</div>
      </div>
    </div>
  );
};

export default ChatMessage;
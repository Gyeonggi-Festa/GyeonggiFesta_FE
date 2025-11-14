// src/components/Chat/ChatMessage.tsx
import React from 'react';
import styles from './css/ChatMessage.module.css';

interface ChatMessageProps {
  sender: 'me' | 'other';
  message: string;
  time: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ sender, message, time }) => {
  const isMe = sender === 'me';

  return (
    <div className={`${styles["chatroom-message"]} ${isMe ? styles["chatroom-my-message"] : styles["chatroom-other-message"]}`}>
      <div className={styles["chatroom-message-wrapper"]}>
        <div className={styles["chatroom-message-bubble"]}>
          <div className={styles["chatroom-message-text"]}>{message}</div>
        </div>
        <div className={styles["chatroom-message-time"]}>{time}</div>
      </div>
    </div>
  );
};

export default ChatMessage;
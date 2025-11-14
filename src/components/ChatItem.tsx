import React from 'react';
import styles from "./css/ChatItem.module.css";
import { getRelativeTime } from '../utils/time';
interface ChatItemProps {
    name: string;
    participation: number;
    
    message: string;
    time: string;
    hasNotification: boolean;
  }
  
  
  const ChatItem: React.FC<ChatItemProps> = ({ name, participation, message, time, hasNotification }) => {
    return (
      <div className={styles["chat-item"]}>
        <div className={styles["chat-info"]}>
          <div className={styles["chat-top"]}>
            <div className={styles["chat-name"]}>{name}</div>
            <div className={styles["chat-age-gender"]}>{participation}</div>
          </div>
          <div className={styles["chat-bottom"]}>
            <span className={styles["chat-message"]}>{message}</span>
            <span className={styles["chat-time"]}>{getRelativeTime(time)}</span>
          </div>

        </div>
        {hasNotification && <div className={styles["chat-notification"]}></div>}
      </div>
    );
  };
  

export default ChatItem;
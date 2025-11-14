import React,{useState} from 'react';
import styles from './css/GroupChatItem.module.css';
import { useNavigate } from 'react-router-dom';
import { connectStomp, sendEnterMessage } from '../utils/socket';
import axiosInstance from '../api/axiosInstance';
import GroupChatJoinModal from './GroupChatJoinModal';

interface GroupChatItemProps {
  chatRoomId: number;
  name: string;
  information: string;
  participation: number;
  category: string;
}

const GroupChatItem: React.FC<GroupChatItemProps> = ({
  chatRoomId,
  name,
  information,
  participation,
  category,
}) => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  const handleClick = () => setModalOpen(true);
  const handleJoin = async () => {
    try {
      await axiosInstance.post(`/api/auth/user/chatrooms/${chatRoomId}/join`);

      await connectStomp();
      sendEnterMessage(chatRoomId);
      navigate(`/chat/room/${chatRoomId}`, {
        state: {
          roomTitle: name,
          participantCount: participation,
        },
      });
    } catch (err) {
      alert('채팅방 참가에 실패했습니다.');
    }
  };
  return (
    <div onClick={handleClick} className={styles.container}>
      <div className={styles.header}>
        <span className={styles.category}>{category}</span>
        <span className={styles.title}>{name}</span>
      </div>

      <div className={styles.bottomRow}>
        <div className={styles.description}>{information}</div>
        <div className={styles.meta}>
          <div className={styles.participants}>
            <img src="/assets/person.svg" alt="참가자" />
            {participation}명
          </div>
        </div>
      </div>
      {modalOpen && (
        <GroupChatJoinModal
          name={name}
          information={information}
          participation={participation}
          category={category}
          onClose={() => setModalOpen(false)}
          onJoin={handleJoin}
        />
      )}
    </div>
  );
};

export default GroupChatItem;
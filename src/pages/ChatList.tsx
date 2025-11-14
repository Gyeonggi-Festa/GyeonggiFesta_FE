import React, { useState , useEffect} from 'react';
import { Link } from 'react-router-dom';
import styles from './css/ChatList.module.css';
import ChatItem from '../components/ChatItem';
import BottomNav from '../components/BottomNav';
import GroupChatItem from '../components/GroupChatItem';
import { useNavigate } from "react-router-dom";
import axiosInstance from '../api/axiosInstance';
import { motion } from 'framer-motion'; // ✅ 추가
interface ChatData {
  id: number;
  name: string;
  message: string;
  participation: number;
  time: string;
  hasNotification: boolean;
  mode: 'my' | 'unread' | 'group';
}
interface ApiChatData {
  chatRoomId: number;
  name: string;
  participation: number;
  type: 'DIRECT' | 'GROUP';
  createdFrom: string | null;
  createdFromId: number | null;
  notReadMessageCount: number;
  lastMessageTime: string;
  lastMessageText: string;
}


interface GroupChatData {
  chatRoomId: number;
  name: string;
  information: string;
  participation: number;
  category: string;
}


const categories = [
      '전체', '교육', '행사', '전시', '공연'
];

const Chat: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<'my' | 'unread' | 'group'>('my');
  const [visibleCount, setVisibleCount] = useState(4);
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [showSearch, setShowSearch] = useState(false);
  const [apiChatList, setApiChatList] = useState<ApiChatData[]>([]);
  const [groupChatList, setGroupChatList] = useState<GroupChatData[]>([]);
  
  useEffect(() => {
    const fetchChatList = async () => {
      try {
        const response = await axiosInstance.get('/api/auth/user/my-chatrooms');
        setApiChatList(response.data.data.content); 
        console.log("📋 내 채팅방 전체 응답:", response.data);
        console.log("📋 채팅방 ID 목록:", response.data.data.content.map((c: ApiChatData) => c.chatRoomId));
        // ❗ 서버 응답 구조에 따라 .data.data 조정 필요 (ex. 바로 배열이면 .data)
      } catch (error) {
        console.error('채팅방 리스트 가져오기 실패:', error);
      }
    };
  
    fetchChatList();
  }, []);

  useEffect(() => {
    const fetchGroupChatList = async () => {
      try {
        const response = await axiosInstance.get('/api/auth/user/chatrooms');
        const content = response.data.data?.content;
        if (Array.isArray(content)) {
          setGroupChatList(content);
        } else {
          console.error('그룹 채팅방 데이터가 배열이 아닙니다:', content);
          setGroupChatList([]);
        }
      } catch (error) {
        console.error('그룹 채팅방 리스트 가져오기 실패:', error);
      }
    };
  
    fetchGroupChatList();
  }, []);
  
  const chatData: ChatData[] = Array.isArray(apiChatList)
  ? apiChatList.map(chat => {
      let mode: 'my' | 'unread' | 'group';

      if (chat.type === "GROUP") {
        mode = 'group';
      } else if (chat.notReadMessageCount > 0) {
        mode = 'unread';
      } else {
        mode = 'my';
      }

      return {
        id: chat.chatRoomId,
        name: chat.name,
        participation: chat.participation,
        message: chat.lastMessageText || "메시지 없음",
        time: chat.lastMessageTime,
        hasNotification: chat.notReadMessageCount > 0,
        mode,
      };
    })
  : [];

  const myGroupRoomIds = apiChatList
  .filter((chat) => chat.type === 'GROUP')
  .map((chat) => chat.chatRoomId);
  

  
  const filteredChats = selectedMode === 'my'
  ? chatData.filter(chat => chat.mode === 'my' || chat.mode === 'unread' ||chat.mode === 'group') // ✅ 수정: 그룹도 포함
  : chatData.filter(chat => chat.mode === selectedMode);

  const navigate = useNavigate();
  
  const filteredGroupChats = groupChatList.filter(item => {
    const matchCategory = selectedCategory === '전체' || item.category === selectedCategory;
    const matchKeyword = item.name.toLowerCase().includes(searchKeyword.toLowerCase());
    const notJoined = !myGroupRoomIds.includes(item.chatRoomId);
    return matchCategory && matchKeyword && notJoined;
  });
  

  return (
    <motion.div
      className={styles["chat-container"]}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles["chat-header"]}>
        <h2 className={styles["chat-tit"]}>채팅</h2>
        
      </div>

      <div className={styles["chat-filter-buttons"]}>
        {['my', 'unread', 'group'].map(mode => (
          <motion.button
            key={mode}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`${styles["filter-button"]} ${selectedMode === mode ? styles["selected"] : ''}`}
            onClick={() => setSelectedMode(mode as 'my' | 'unread' | 'group')}
          >
            {{
              my: '내 채팅방',
              unread: '안 읽은 채팅방',
              group: '단체 채팅방',
            }[mode]}
          </motion.button>
        ))}
      </div>

      <div className={styles["chat-list"]}>
        {filteredChats.map(chat => (
          <Link
            key={chat.id}
            to={`/chat/room/${chat.id}`}
            state={{ roomTitle: chat.name, participantCount: chat.participation }}
            style={{ textDecoration: 'none' }}
          >
            <ChatItem {...chat} />
          </Link>
        ))}
      </div>

      {selectedMode === 'group' && (
        <motion.div
          className={styles["group-chat-section"]}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className={styles["group-chat-header"]}>
            <h3 className={styles["group-chat-title"]}>전체 채팅방</h3>
            <div className={styles["search-area"]}>
              <button
                onClick={() => {
                  if (showSearch) setSearchKeyword('');
                  setShowSearch(prev => !prev);
                }}
                className={styles["search-toggle"]}
              >
                {showSearch ? '취소' : <img src="/assets/search.svg" alt="검색" />}
              </button>
            </div>
          </div>

          {showSearch && (
            <motion.input
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={styles["search-input"]}
              placeholder="관심사 혹은 키워드를 입력하세요"
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          )}

          <div className={styles["group-category-list"]}>
            {['전체', ...categories].map(cat => (
              <button
                key={cat}
                className={`${styles["category-button"]} ${selectedCategory === cat ? styles["selected"] : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className={styles["group-chat-list"]}>
            {filteredGroupChats.slice(0, visibleCount).map((chat, index) => (
              <GroupChatItem key={index} {...chat} />
            ))}

            {visibleCount < filteredGroupChats.length && (
              <motion.button
                className={styles["load-more-button"]}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setVisibleCount(prev => prev + 4)}
              >
                더보기
              </motion.button>
            )}
          </div>
        </motion.div>
      )}

      {selectedMode === 'group' && (
        <motion.div
          className={styles["floating-plus-button"]}
          onClick={() => navigate("/chat/create-group")}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <img src="/assets/plus.svg" alt="그룹채팅 추가" />
        </motion.div>
      )}

      <BottomNav />
    </motion.div>
  );
};

export default Chat;
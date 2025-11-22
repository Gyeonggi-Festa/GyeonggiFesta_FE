import React, { useState, useEffect, useRef } from 'react';
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
  createdFrom?: string | null;
  createdFromId?: number | null;
}

interface PostInfo {
  postId: number;
  eventTitle: string;
  eventMainImage: string;
  eventStartDate: string;
  visitDates: string[];
  title: string;
}


const categories = [
      '전체', '교육', '행사', '전시', '공연'
];

const Chat: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<'my' | 'unread' | 'group' | 'companion'>('my');
  const [visibleCount, setVisibleCount] = useState(3);
  const [joinedVisibleCount, setJoinedVisibleCount] = useState(3);
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [showSearch, setShowSearch] = useState(false);
  const [apiChatList, setApiChatList] = useState<ApiChatData[]>([]);
  const [groupChatList, setGroupChatList] = useState<GroupChatData[]>([]);
  const [postInfoMap, setPostInfoMap] = useState<Map<number, PostInfo>>(new Map());
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreGroups, setHasMoreGroups] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);
  const previousChatListRef = useRef<ApiChatData[]>([]);
  
  // 실패한 게시글 ID를 localStorage에 저장하여 영구적으로 유지
  const getFailedPostIds = (): Set<number> => {
    try {
      const saved = localStorage.getItem('failedPostIds');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  };
  
  const saveFailedPostId = (postId: number) => {
    const failedIds = getFailedPostIds();
    failedIds.add(postId);
    localStorage.setItem('failedPostIds', JSON.stringify([...failedIds]));
  };
  
  const failedPostIdsRef = useRef<Set<number>>(getFailedPostIds());
  
  // 푸시 알림 권한 요청
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('알림 권한:', permission);
      });
    }
  }, []);

  const showNotification = (roomName: string, message: string) => {
    // 현재 채팅방 페이지에 있으면 알림 표시 안 함
    if (window.location.pathname.startsWith('/chat/room/')) {
      return;
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(roomName, {
        body: message,
        icon: '/assets/favicon.svg',
        badge: '/assets/favicon.svg',
        requireInteraction: false,
      });
    }
  };

  const fetchChatList = async () => {
    try {
      const response = await axiosInstance.get('/api/auth/user/my-chatrooms');
      const newChatList = response.data.data.content;
      
      // 이전 목록과 비교하여 새로운 메시지가 있는 채팅방 확인
      if (previousChatListRef.current.length > 0) {
        newChatList.forEach((newChat: ApiChatData) => {
          const previousChat = previousChatListRef.current.find(
            (prev) => prev.chatRoomId === newChat.chatRoomId
          );
          
          // 새로운 메시지가 있고, 이전에 읽지 않은 메시지가 없었거나 더 많아진 경우
          if (
            previousChat &&
            newChat.notReadMessageCount > 0 &&
            (previousChat.notReadMessageCount === 0 || 
             newChat.notReadMessageCount > previousChat.notReadMessageCount) &&
            newChat.lastMessageText
          ) {
            // 현재 열려있는 채팅방이 아니면 알림 표시
            const currentRoomId = window.location.pathname.split('/chat/room/')[1];
            if (currentRoomId !== String(newChat.chatRoomId)) {
              showNotification(newChat.name, newChat.lastMessageText);
            }
          }
        });
      }
      
      previousChatListRef.current = newChatList;
      setApiChatList(newChatList); 
      console.log("📋 내 채팅방 전체 응답:", response.data);
      console.log("📋 채팅방 ID 목록:", newChatList.map((c: ApiChatData) => c.chatRoomId));
      // ❗ 서버 응답 구조에 따라 .data.data 조정 필요 (ex. 바로 배열이면 .data)
    } catch (error) {
      console.error('채팅방 리스트 가져오기 실패:', error);
    }
  };

  useEffect(() => {
    fetchChatList();
    
    // 주기적으로 채팅방 목록 업데이트 (5초마다)
    const intervalId = setInterval(() => {
      fetchChatList();
    }, 5000);

    // 페이지가 포커스될 때마다 업데이트
    const handleFocus = () => {
      fetchChatList();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // 모임팟 일정 정보 가져오기 (createdFrom === 'POST'인 채팅방의 게시글 정보)
  useEffect(() => {
    const fetchPostInfos = async () => {
      const postRooms = apiChatList.filter((room) => room.createdFrom === 'POST' && room.createdFromId);
      if (postRooms.length === 0) return;

      const newPostInfoMap = new Map<number, PostInfo>();
      
      for (const room of postRooms) {
        if (room.createdFromId) {
          // 이미 실패한 게시글은 다시 요청하지 않음
          if (failedPostIdsRef.current.has(room.createdFromId)) {
            continue;
          }

          try {
            const res = await axiosInstance.get(`/api/auth/user/posts/${room.createdFromId}`);
            const postData = res.data?.data || res.data;
            if (postData) {
              newPostInfoMap.set(room.chatRoomId, {
                postId: postData.postId,
                eventTitle: postData.eventTitle || '',
                eventMainImage: postData.eventMainImage || '/assets/default-card.jpg',
                eventStartDate: postData.eventStartDate || '',
                visitDates: postData.visitDates || [],
                title: postData.title || '',
              });
            }
          } catch (error: any) {
            // 400/404 에러 (게시글 삭제/유효하지 않음)는 완전히 무시
            if (error.response?.status === 400 || error.response?.status === 404) {
              // 실패한 게시글 ID를 ref와 localStorage 모두에 저장
              failedPostIdsRef.current.add(room.createdFromId);
              saveFailedPostId(room.createdFromId);
              console.log(`🗑️ 삭제된 게시글 ID ${room.createdFromId} - 더 이상 요청하지 않습니다.`);
              continue;
            }
            // 다른 에러도 무시 (불필요한 콘솔 출력 방지)
          }
        }
      }
      
      setPostInfoMap(newPostInfoMap);
    };

    if (apiChatList.length > 0) {
      fetchPostInfos();
    }
  }, [apiChatList]);

  // 그룹 채팅방 목록 조회 (카테고리, 검색어, 페이지네이션 적용)
  const fetchGroupChatList = async (reset: boolean = false) => {
    try {
      const pageToFetch = reset ? 0 : currentPage;
      const params: any = {
        page: pageToFetch + 1, // API는 1부터 시작
        size: 10,
      };
      
      // 검색 키워드가 있으면 추가
      if (searchKeyword.trim()) {
        params.keyword = searchKeyword.trim();
      }
      
      // 카테고리별 API 호출
      let apiUrl = '/api/auth/user/chatrooms';
      if (selectedCategory !== '전체') {
        apiUrl = `/api/auth/user/chatrooms/${encodeURIComponent(selectedCategory)}`;
      }
      
      const response = await axiosInstance.get(apiUrl, { params });
      const content = response.data.data?.content || [];
      const pageInfo = response.data.data?.page;
      
      if (Array.isArray(content)) {
        if (reset) {
          setGroupChatList(content);
          setCurrentPage(0);
        } else {
          setGroupChatList(prev => [...prev, ...content]);
        }
        
        // 더 불러올 데이터가 있는지 확인
        if (pageInfo) {
          const hasMore = pageInfo.number < pageInfo.totalPages - 1;
          setHasMoreGroups(hasMore);
        }
      } else {
        console.error('그룹 채팅방 데이터가 배열이 아닙니다:', content);
        if (reset) setGroupChatList([]);
      }
    } catch (error) {
      console.error('그룹 채팅방 리스트 가져오기 실패:', error);
      if (reset) setGroupChatList([]);
    }
  };

  // 카테고리나 검색어가 변경되면 목록 초기화 후 재조회
  useEffect(() => {
    if (selectedMode === 'group') {
      setCurrentPage(0);
      fetchGroupChatList(true);
    }
  }, [selectedCategory, searchKeyword, selectedMode]);
  
  const chatData: ChatData[] = Array.isArray(apiChatList)
  ? apiChatList.map(chat => {
      let mode: 'my' | 'unread' | 'group';
      
      // 내가 최근에 메시지를 보낸 채팅방인지 확인 (10초 이내)
      const lastSentRooms = JSON.parse(localStorage.getItem('lastSentRooms') || '{}');
      const lastSentTime = lastSentRooms[chat.chatRoomId];
      const isRecentlySent = lastSentTime && (Date.now() - lastSentTime < 10000); // 10초 이내

      // notReadMessageCount가 1 이상이고, 내가 최근에 메시지를 보내지 않았으면 안 읽은 채팅방으로 분류
      if (chat.notReadMessageCount >= 1 && !isRecentlySent) {
        mode = 'unread';
      } else if (chat.type === "GROUP") {
        mode = 'group';
      } else {
        mode = 'my';
      }

      return {
        id: chat.chatRoomId,
        name: chat.name,
        participation: chat.participation,
        message: chat.lastMessageText || "메시지 없음",
        time: chat.lastMessageTime,
        hasNotification: chat.notReadMessageCount >= 1 && !isRecentlySent,
        mode,
      };
    })
  : [];

  // 내가 속한 단체 채팅방 ID 목록 (모임팟 제외)
  const myGroupRoomIds = apiChatList
  .filter((chat) => chat.type === 'GROUP' && chat.createdFrom !== 'POST')
  .map((chat) => chat.chatRoomId);
  

  
  // 동행 채팅방 필터링 (createdFrom === 'POST') - 모임팟에서 게시글 생성 시 생성된 오픈채팅방만
  const postRooms = apiChatList.filter((room) => room.createdFrom === 'POST');
  const companionChatData: ChatData[] = postRooms
    .map(chat => {
      let mode: 'my' | 'unread' | 'group';
      
      // 내가 최근에 메시지를 보낸 채팅방인지 확인 (10초 이내)
      const lastSentRooms = JSON.parse(localStorage.getItem('lastSentRooms') || '{}');
      const lastSentTime = lastSentRooms[chat.chatRoomId];
      const isRecentlySent = lastSentTime && (Date.now() - lastSentTime < 10000); // 10초 이내
      
      // notReadMessageCount가 1 이상이고, 내가 최근에 메시지를 보내지 않았으면 안 읽은 채팅방으로 분류
      if (chat.notReadMessageCount >= 1 && !isRecentlySent) {
        mode = 'unread';
      } else if (chat.type === "GROUP") {
        mode = 'group';
      } else {
        mode = 'my';
      }
      return {
        id: chat.chatRoomId,
        name: chat.name,
        participation: chat.participation,
        message: chat.lastMessageText || "메시지 없음",
        time: chat.lastMessageTime,
        hasNotification: chat.notReadMessageCount >= 1 && !isRecentlySent,
        mode,
      };
    })
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()); // 최신순 정렬

  // 내 채팅방: 내가 속한 단체 채팅방만 (type === 'GROUP', 모임팟 제외)
  // 읽지 않은 메시지가 있어도 내 채팅방에 표시되도록 원본 apiChatList에서 필터링
  const myChatRooms = chatData
    .filter(chat => {
      const originalChat = apiChatList.find(ac => ac.chatRoomId === chat.id);
      return originalChat?.type === 'GROUP' && originalChat?.createdFrom !== 'POST';
    })
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()); // 최신순 정렬

  // 안 읽은 채팅방 (최신순 정렬)
  const unreadChatRooms = chatData
    .filter(chat => chat.mode === 'unread')
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  const filteredChats = selectedMode === 'my'
    ? myChatRooms // 내가 속한 단체 채팅방만
    : selectedMode === 'companion'
    ? companionChatData // 동행 채팅방 (createdFrom === 'POST')
    : selectedMode === 'unread'
    ? unreadChatRooms
    : chatData.filter(chat => chat.mode === selectedMode);

  const navigate = useNavigate();
  
  // 내가 참가한 그룹 채팅방 목록 (createdFrom !== 'POST'인 것만)
  const joinedGroupChats = groupChatList.filter(item => {
    const isJoined = myGroupRoomIds.includes(item.chatRoomId);
    const isNotFromPost = item.createdFrom !== 'POST';
    return isJoined && isNotFromPost;
  });
  
  // 단체 채팅방: createdFrom !== 'POST'인 채팅방만 (단체 채팅방 생성 페이지에서 만든 것만)
  // 서버에서 이미 카테고리와 검색어로 필터링된 목록이 오므로, 내가 속한 채팅방만 제외
  const filteredGroupChats = groupChatList.filter(item => {
    const isNotFromPost = item.createdFrom !== 'POST';
    const notJoined = !myGroupRoomIds.includes(item.chatRoomId);
    return isNotFromPost && notJoined;
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
        {['my', 'unread', 'companion', 'group'].map(mode => (
          <motion.button
            key={mode}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`${styles["filter-button"]} ${selectedMode === mode ? styles["selected"] : ''}`}
            onClick={() => setSelectedMode(mode as 'my' | 'unread' | 'group' | 'companion')}
          >
            {{
              my: '내 채팅방',
              unread: '안 읽은 채팅방',
              companion: '모임팟',
              group: '단체 채팅방',
            }[mode]}
          </motion.button>
        ))}
      </div>

      {selectedMode === 'companion' && postRooms.filter((room) => postInfoMap.has(room.chatRoomId)).length > 0 && (
        <div className={styles["meeting-pot-schedule-section"]}>
          <h3 className={styles["schedule-title"]}>내 모임팟 일정</h3>
          <div className={styles["schedule-slider-wrapper"]}>
            <div 
              className={styles["schedule-slider"]}
              ref={sliderRef}
              onScroll={() => {
                if (sliderRef.current) {
                  const scrollLeft = sliderRef.current.scrollLeft;
                  const containerWidth = sliderRef.current.clientWidth;
                  // 각 카드는 calc(100% - 24px) 너비이므로 실제 너비는 containerWidth - 24px
                  const cardWidth = containerWidth - 24;
                  const gap = 12;
                  const cardFullWidth = cardWidth + gap;
                  const index = Math.round(scrollLeft / cardFullWidth);
                  const maxIndex = postRooms.filter((room) => postInfoMap.has(room.chatRoomId)).length - 1;
                  setCurrentSlideIndex(Math.max(0, Math.min(index, maxIndex)));
                }
              }}
            >
              {postRooms
                .filter((room) => postInfoMap.has(room.chatRoomId))
                .map((room) => {
                  const postInfo = postInfoMap.get(room.chatRoomId);
                  if (!postInfo) return null;
                  
                  const formatDate = (dateStr: string) => {
                    if (!dateStr) return '';
                    const [yyyy, mm, dd] = dateStr.split('-');
                    return `${yyyy.slice(2)}.${mm}.${dd}`;
                  };

                  // visitDates의 첫 번째 날짜 사용
                  const visitDate = postInfo.visitDates && postInfo.visitDates.length > 0 
                    ? postInfo.visitDates[0] 
                    : postInfo.eventStartDate;

                  return (
                    <motion.div
                      key={room.chatRoomId}
                      className={styles["schedule-card"]}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        navigate(`/chat/room/${room.chatRoomId}`, {
                          state: {
                            roomTitle: room.name,
                            participantCount: room.participation,
                          },
                        });
                      }}
                    >
                      <div className={styles["schedule-image"]}>
                        <img
                          src={postInfo.eventMainImage}
                          alt={postInfo.eventTitle}
                        />
                      </div>
                      <div className={styles["schedule-info"]}>
                        <div className={styles["schedule-category"]}>페스티벌</div>
                        <div className={styles["schedule-event-title"]}>{postInfo.eventTitle}</div>
                        <div className={styles["schedule-date"]}>
                          <img src="/assets/detail/date.svg" alt="날짜" />
                          {formatDate(visitDate)}
                        </div>
                        <div className={styles["schedule-post-title"]}>{postInfo.title}</div>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
            {/* 슬라이드 인디케이터 */}
            {postRooms.filter((room) => postInfoMap.has(room.chatRoomId)).length > 1 && (
              <div className={styles["schedule-indicators"]}>
                {postRooms
                  .filter((room) => postInfoMap.has(room.chatRoomId))
                  .map((_, index) => (
                    <span
                      key={index}
                      className={`${styles["indicator-dot"]} ${
                        index === currentSlideIndex ? styles["active"] : ''
                      }`}
                    />
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {selectedMode !== 'group' && (
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
      )}

      {selectedMode === 'group' && (
        <motion.div
          className={styles["group-chat-section"]}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* 내 채팅방 섹션 */}
          {joinedGroupChats.length > 0 && (
            <div className={styles["joined-chat-section"]}>
              <h3 className={styles["group-chat-title"]}>참가중인 단체 채팅방</h3>
              <div className={styles["group-chat-list"]}>
                {joinedGroupChats.slice(0, joinedVisibleCount).map((chat, index) => (
                  <div
                    key={`joined-${chat.chatRoomId}-${index}`}
                    onClick={() => {
                      navigate(`/chat/room/${chat.chatRoomId}`, {
                        state: {
                          roomTitle: chat.name,
                          participantCount: chat.participation,
                        },
                      });
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div style={{ pointerEvents: 'none' }}>
                      <GroupChatItem {...chat} />
                    </div>
                  </div>
                ))}

                {joinedVisibleCount < joinedGroupChats.length && (
                  <motion.button
                    className={styles["load-more-button"]}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setJoinedVisibleCount(prev => prev + 3)}
                  >
                    더보기
                  </motion.button>
                )}
              </div>
            </div>
          )}

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
            {categories.map(cat => (
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
            {filteredGroupChats.map((chat, index) => (
              <GroupChatItem key={`not-joined-${chat.chatRoomId}-${index}`} {...chat} />
            ))}

            {hasMoreGroups && (
              <motion.button
                className={styles["load-more-button"]}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setCurrentPage(prev => prev + 1);
                  fetchGroupChatList(false);
                }}
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
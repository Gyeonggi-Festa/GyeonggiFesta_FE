import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import styles from './css/MeetingPotDetailPage.module.css';
import { motion } from 'framer-motion';
import BottomNav from '../components/BottomNav';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import SuccessModal from '../components/SuccessModal';

interface PostDetail {
  postId: number;
  title: string;
  content: string;
  writer: string;
  viewCount: number;
  likes: number;
  comments: number;
  updatedAt: string;
  eventId: number;
  eventTitle: string;
  eventMainImage: string;
  eventStartDate: string;
  eventEndDate: string;
  visitDates: string[];
  recruitmentTotal: number;
  recruitmentPeriodDays: number;
  preferredGender: string;
  preferredMinAge: number | null;
  preferredMaxAge: number | null;
}

const formatDate = (dateStr: string): string => {
  const [yyyy, mm, dd] = dateStr.split('-');
  return `${yyyy}.${mm}.${dd}`;
};

const formatDateTime = (dateTimeStr: string): string => {
  const date = new Date(dateTimeStr);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
};

const formatGender = (gender: string): string => {
  switch (gender) {
    case 'ANY':
      return '성별 무관';
    case 'MALE':
      return '남성';
    case 'FEMALE':
      return '여성';
    default:
      return '성별 무관';
  }
};

const formatAge = (minAge: number | null, maxAge: number | null): string => {
  if (minAge === null && maxAge === null) {
    return '연령 무관';
  }
  if (minAge !== null && maxAge !== null) {
    return `${minAge}세 ~ ${maxAge}세`;
  }
  if (minAge !== null) {
    return `${minAge}세 이상`;
  }
  if (maxAge !== null) {
    return `${maxAge}세 이하`;
  }
  return '연령 무관';
};

interface ChatRoomInfo {
  chatRoomId: number;
  name: string;
  participation: number;
}

const MeetingPotDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [chatRoom, setChatRoom] = useState<ChatRoomInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  useEffect(() => {
    const fetchPostDetail = async () => {
      if (!postId) {
        alert('게시글 ID가 없습니다.');
        navigate('/meetingpot');
        return;
      }

      try {
        setLoading(true);
        const res = await axiosInstance.get(`/api/auth/user/posts/${postId}`);
        console.log('게시글 상세 응답:', res.data);
        console.log('게시글 상세 데이터 전체:', JSON.stringify(res.data, null, 2));
        
        const postData = res.data?.data || res.data;
        setPost(postData);
        
        // 게시글 데이터에 채팅방 정보가 포함되어 있는지 확인
        if (postData.chatRoomId) {
          console.log('✅ 게시글에 채팅방 정보 포함됨:', postData.chatRoomId);
          setChatRoom({
            chatRoomId: postData.chatRoomId,
            name: postData.chatRoomName || postData.title,
            participation: postData.participation || 0,
          });
        }
        
        // 게시글과 연결된 채팅방 찾기 (모든 동행 채팅방 목록에서 검색)
        // 게시글 데이터에 채팅방 정보가 없을 경우에만 실행
        if (!chatRoom) {
          try {
            const chatListRes = await axiosInstance.get('/api/auth/user/companion-chatrooms');
            const chatRooms = chatListRes.data?.data?.content || chatListRes.data?.data || [];
            console.log('🔍 전체 동행 채팅방 목록:', chatRooms);
            console.log('🔍 채팅방 목록 개수:', chatRooms.length);
            console.log('🔍 현재 게시글 ID:', postId, '(타입:', typeof postId, ')');
            console.log('🔍 현재 게시글 제목:', postData.title);
            console.log('🔍 첫 번째 채팅방 전체 구조:', JSON.stringify(chatRooms[0], null, 2));
            
            // 모든 채팅방의 정보 확인
            console.log('🔍 모든 채팅방 상세 정보:');
            chatRooms.forEach((room: any, index: number) => {
              console.log(`  [${index}] ID: ${room.chatRoomId}, 이름: "${room.name}"`);
              console.log(`       createdFrom: ${room.createdFrom}, createdFromId: ${room.createdFromId}`);
              console.log(`       제목 일치: ${room.name === postData.title}`);
            });
            
            let relatedChatRoom = null;
            
            // 방법 1: createdFrom='POST'이고 createdFromId가 일치하는 채팅방 찾기
            relatedChatRoom = chatRooms.find(
              (room: any) => room.createdFrom === 'POST' && room.createdFromId === Number(postId)
            );
            
            if (relatedChatRoom) {
              console.log('✅ [방법1] createdFromId로 채팅방 찾음:', relatedChatRoom);
            } else {
              console.log('⚠️ [방법1] createdFromId로 채팅방을 찾지 못함');
              
              // 방법 2: 제목이 포함된 채팅방 찾기 (가장 최근 것)
              const titleBasedRooms = chatRooms.filter((room: any) => 
                room.name && postData.title && room.name.includes(postData.title.substring(0, 10))
              );
              
              if (titleBasedRooms.length > 0) {
                // 가장 최근 채팅방 선택 (chatRoomId가 큰 것)
                relatedChatRoom = titleBasedRooms.reduce((latest: any, current: any) => 
                  current.chatRoomId > latest.chatRoomId ? current : latest
                );
                console.log('✅ [방법2] 제목으로 채팅방 찾음:', relatedChatRoom);
              } else {
                console.log('⚠️ [방법2] 제목으로 채팅방을 찾지 못함');
                
                // 방법 3: createdFrom='POST'인 가장 최근 채팅방 찾기
                const postBasedRooms = chatRooms.filter((room: any) => room.createdFrom === 'POST');
                if (postBasedRooms.length > 0) {
                  relatedChatRoom = postBasedRooms.reduce((latest: any, current: any) => 
                    current.chatRoomId > latest.chatRoomId ? current : latest
                  );
                  console.log('✅ [방법3] POST 타입의 최근 채팅방 찾음 (임시):', relatedChatRoom);
                } else {
                  console.log('❌ 모든 방법으로 채팅방을 찾지 못했습니다.');
                }
              }
            }
            
            if (relatedChatRoom) {
              setChatRoom({
                chatRoomId: relatedChatRoom.chatRoomId,
                name: relatedChatRoom.name,
                participation: relatedChatRoom.participation || 0,
              });
              console.log('✅ 최종 선택된 채팅방:', relatedChatRoom);
            } else {
              console.log('❌ 연결된 채팅방을 찾을 수 없습니다.');
              console.log('찾으려는 조건: createdFrom="POST", createdFromId=' + Number(postId));
            }
          } catch (chatError) {
            console.error('채팅방 정보 가져오기 실패:', chatError);
            // 채팅방 정보가 없어도 게시글은 표시
          }
        }
      } catch (error) {
        console.error('게시글 상세 불러오기 실패:', error);
        alert('게시글을 불러오는데 실패했습니다.');
        navigate('/meetingpot');
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetail();
  }, [postId, navigate]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>로딩 중...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>게시글을 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className={styles.header}>
        <motion.img
          src="/assets/slash.svg"
          alt="뒤로가기"
          className={styles.icon}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/meetingpot')}
        />
        <motion.img
          src="/assets/more.svg"
          alt="메뉴"
          className={styles.menuIcon}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsDeleteModalOpen(true)}
        />
      </div>

      <div className={styles.content}>
        {/* 축제 정보 */}
        <div className={styles.eventSection}>
          <div className={styles.eventImageWrapper}>
            <img
              src={post.eventMainImage || '/assets/default-card.jpg'}
              alt={post.eventTitle}
              className={styles.eventImage}
            />
          </div>
          <div className={styles.eventInfo}>
            <h3 className={styles.eventTitle}>{post.eventTitle}</h3>
            <p className={styles.eventDate}>
              {formatDate(post.eventStartDate)} ~ {formatDate(post.eventEndDate)}
            </p>
          </div>
        </div>

        {/* 게시글 제목 */}
        <h1 className={styles.postTitle}>{post.title}</h1>

        {/* 통계 정보 */}
        <div className={styles.statsRow}>
          <span className={styles.stat}>
            <img src="/assets/FestivalCard/eye-mini.svg" alt="조회" />
            {post.viewCount}
          </span>
          <span className={styles.stat}>
            <img src="/assets/FestivalCard/heart-mini.svg" alt="좋아요" />
            {post.likes}
          </span>
          <span className={styles.stat}>
            <img src="/assets/FestivalCard/chat-mini.svg" alt="댓글" />
            {post.comments}
          </span>
        </div>

        {/* 작성자 정보 */}
        <div className={styles.authorRow}>
          <span className={styles.writer}>작성자: {post.writer && post.writer.trim() !== '' ? post.writer : '알 수 없음'}</span>
          <span className={styles.updatedAt}>{formatDateTime(post.updatedAt)}</span>
        </div>

        {/* 게시글 내용 */}
        <div className={styles.contentSection}>
          <h3 className={styles.sectionTitle}>내용</h3>
          <p className={styles.contentText}>{post.content}</p>
        </div>

        {/* 방문 예정일 */}
        <div className={styles.infoSection}>
          <h3 className={styles.sectionTitle}>방문 예정일</h3>
          <div className={styles.visitDates}>
            {post.visitDates.map((date) => (
              <span key={date} className={styles.dateTag}>
                {formatDate(date)}
              </span>
            ))}
          </div>
        </div>

        {/* 모집 정보 */}
        <div className={styles.infoSection}>
          <h3 className={styles.sectionTitle}>모집 정보</h3>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>모집 인원:</span>
            <span className={styles.infoValue}>{post.recruitmentTotal}명</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>모집 기간:</span>
            <span className={styles.infoValue}>{post.recruitmentPeriodDays}일</span>
          </div>
        </div>

        {/* 선호 조건 */}
        <div className={styles.infoSection}>
          <h3 className={styles.sectionTitle}>선호 조건</h3>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>성별:</span>
            <span className={styles.infoValue}>{formatGender(post.preferredGender)}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>연령:</span>
            <span className={styles.infoValue}>{formatAge(post.preferredMinAge, post.preferredMaxAge)}</span>
          </div>
        </div>

      </div>

      {/* 채팅방 링크 - 하단 고정 */}
      {chatRoom && (
        <div className={styles.chatButtonSection}>
          <button
            className={styles.chatButton}
            onClick={async () => {
              try {
                // 채팅방 참여 API 호출
                await axiosInstance.post(`/api/auth/user/chatrooms/${chatRoom.chatRoomId}/join`);
                
                // STOMP 연결 및 입장 메시지 전송
                const { connectStomp, sendEnterMessage } = await import('../utils/socket');
                await connectStomp();
                sendEnterMessage(chatRoom.chatRoomId);
                
                // 채팅방으로 이동
                navigate(`/chat/room/${chatRoom.chatRoomId}`, {
                  state: {
                    roomTitle: chatRoom.name,
                    participantCount: chatRoom.participation + 1, // 참여 후 인원 증가
                  },
                });
              } catch (error: any) {
                console.error('채팅방 참여 실패:', error);
                const errorMessage = error.response?.data?.message || '채팅방 참여에 실패했습니다.';
                alert(errorMessage);
              }
            }}
          >
            <img src="/assets/chat.svg" alt="채팅" />
            <span>채팅방 입장</span>
            <span className={styles.participantCount}>({chatRoom.participation}명 참여 중)</span>
          </button>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={async () => {
          try {
            await axiosInstance.delete(`/api/auth/user/posts/${postId}`);
            setIsDeleteModalOpen(false);
            setIsSuccessModalOpen(true);
          } catch (error: any) {
            console.error('게시글 삭제 실패:', error);
            const errorMessage = error.response?.data?.message || '게시글 삭제에 실패했습니다.';
            alert(errorMessage);
            setIsDeleteModalOpen(false);
          }
        }}
      />

      <SuccessModal
        isOpen={isSuccessModalOpen}
        message="게시글이 삭제되었습니다."
        onClose={() => {
          setIsSuccessModalOpen(false);
          navigate('/meetingpot');
        }}
      />

      <BottomNav />
    </motion.div>
  );
};

export default MeetingPotDetailPage;


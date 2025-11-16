import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import styles from './css/MeetingPotDetailPage.module.css';
import { motion } from 'framer-motion';
import BottomNav from '../components/BottomNav';

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
        
        const postData = res.data?.data || res.data;
        setPost(postData);
        
        // 게시글과 연결된 채팅방 찾기
        try {
          const chatListRes = await axiosInstance.get('/api/auth/user/my-chatrooms');
          const chatRooms = chatListRes.data?.data?.content || [];
          console.log('내 채팅방 목록:', chatRooms);
          
          // createdFrom이 'POST'이고 createdFromId가 현재 postId와 일치하는 채팅방 찾기
          const relatedChatRoom = chatRooms.find(
            (room: any) => room.createdFrom === 'POST' && room.createdFromId === Number(postId)
          );
          
          if (relatedChatRoom) {
            setChatRoom({
              chatRoomId: relatedChatRoom.chatRoomId,
              name: relatedChatRoom.name,
              participation: relatedChatRoom.participation || 0,
            });
            console.log('연결된 채팅방 찾음:', relatedChatRoom);
          } else {
            console.log('연결된 채팅방을 찾을 수 없습니다.');
          }
        } catch (chatError) {
          console.error('채팅방 정보 가져오기 실패:', chatError);
          // 채팅방 정보가 없어도 게시글은 표시
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
        <h2 className={styles.title}>동행 모집</h2>
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
          <span className={styles.writer}>작성자: {post.writer}</span>
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

        {/* 채팅방 링크 */}
        {chatRoom && (
          <motion.div
            className={styles.chatButtonSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <button
              className={styles.chatButton}
              onClick={() => {
                navigate(`/chat/room/${chatRoom.chatRoomId}`, {
                  state: {
                    roomTitle: chatRoom.name,
                    participantCount: chatRoom.participation,
                  },
                });
              }}
            >
              <img src="/assets/chat-active.svg" alt="채팅" />
              오픈채팅방 참여하기
            </button>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </motion.div>
  );
};

export default MeetingPotDetailPage;


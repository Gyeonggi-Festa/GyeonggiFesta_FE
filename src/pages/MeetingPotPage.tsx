import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import styles from './css/MeetingPotPage.module.css';
import { motion } from 'framer-motion';
import BottomNav from '../components/BottomNav';

interface Post {
  postId: number;
  title: string;
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

interface ChatRoom {
  chatRoomId: number;
  name: string;
  createdFrom: string | null;
  createdFromId: number | null;
}

const MeetingPotPage: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get('/api/auth/user/posts');
        console.log('전체 API 응답:', res.data);
        
        // API 응답 구조에 따라 데이터 추출
        let content: Post[] = [];
        if (res.data?.data?.content) {
          // { code, status, data: { content: [...] } } 형식
          content = res.data.data.content;
        } else if (res.data?.content) {
          // { content: [...] } 형식
          content = res.data.content;
        } else if (Array.isArray(res.data)) {
          // 직접 배열 형식
          content = res.data;
        }
        
        console.log('추출된 게시글 목록:', content);
        setPosts(content);
      } catch (error) {
        console.error('게시글 목록 불러오기 실패:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handlePostClick = (postId: number) => {
    navigate(`/meetingpot/${postId}`);
  };

  const handleWriteClick = () => {
    navigate('/meetingpot/write');
  };

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
          onClick={() => navigate(-1)}
        />
        <h2 className={styles.title}>동행을 찾을땐, <span className={styles.highlight}>모임팟</span></h2>
      </div>

      {loading ? (
        <div className={styles.loading}>로딩 중...</div>
      ) : posts.length === 0 ? (
        <div className={styles.empty}>
          <p>아직 등록된 게시글이 없습니다.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {posts.map((post) => (
            <motion.div
              key={post.postId}
              className={styles.card}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 300 }}
              onClick={() => handlePostClick(post.postId)}
            >
              <div className={styles.cardHeader}>
                <div className={styles.eventImage}>
                  <img
                    src={post.eventMainImage || '/assets/default-card.jpg'}
                    alt={post.eventTitle}
                  />
                </div>
                <div className={styles.cardInfo}>
                  <h3 className={styles.postTitle}>{post.title}</h3>
                  <p className={styles.eventTitle}>{post.eventTitle}</p>
                  <div className={styles.eventDate}>
                    {formatDate(post.eventStartDate)} ~ {formatDate(post.eventEndDate)}
                  </div>
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.visitDates}>
                  <span className={styles.label}>방문 예정일:</span>
                  <span className={styles.value}>
                    {post.visitDates.map((date) => formatDate(date)).join(', ')}
                  </span>
                </div>
                <div className={styles.recruitment}>
                  <span className={styles.label}>모집 인원:</span>
                  <span className={styles.value}>{post.recruitmentTotal}명</span>
                </div>
                <div className={styles.preferences}>
                  <span className={styles.label}>선호 조건:</span>
                  <span className={styles.value}>
                    {formatGender(post.preferredGender)} / {formatAge(post.preferredMinAge, post.preferredMaxAge)}
                  </span>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.meta}>
                  <span className={styles.writer}>작성자: {post.writer}</span>
                  <span className={styles.updatedAt}>{formatDate(post.updatedAt)}</span>
                </div>
                <div className={styles.stats}>
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
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <button className={styles.writeButton} onClick={handleWriteClick}>
        <img src="/assets/pencil.svg" alt="글쓰기" />
        
      </button>

      <BottomNav />
    </motion.div>
  );
};

export default MeetingPotPage;


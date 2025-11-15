import { useEffect, useRef, useState, useCallback } from 'react';
import UpcomingEvents from '../components/UpcomingEvents';
import FestivalCard from '../components/FestivalCard';
import MainTopCard from '../components/MainTopCard';
import BottomNav from '../components/BottomNav';
import axiosInstance from '../api/axiosInstance';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { getRating } from '../utils/ratingUtils';

const formatDate = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

interface Festival {
  eventId: number;
  comments: number;
  title: string;
  category: string;
  startDate: string;
  endDate: string;
  isFree: string;
  currentUserLike?: boolean;
  favorites?: number;  // favorites가 1이면 좋아요가 칠해짐
  mainImg?: string;
  rating?: number;      // ⭐ 평점 (optional - 없으면 랜덤 생성)
  likes: number;  
}

const MainpageLogin = () => {
  const navigate = useNavigate();
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const observerRef = useRef<HTMLDivElement | null>(null);

  const loadFestivals = useCallback(async (date: Date, pageNum: number = 1, append: boolean = false) => {
    try {
      const dateStr = formatDate(date);
      console.log('📅 날짜 선택으로 API 호출:', dateStr);
      const response = await axiosInstance.get('/api/auth/user/event', {
        params: { startDate: dateStr, endDate: dateStr, page: pageNum, size: 5 },
      });
      const newEvents = response.data.data.content;
      
      console.log('📅 API 응답 데이터:', newEvents);
      
      if (append) {
        setFestivals(prev => [...prev, ...newEvents]);
      } else {
        setFestivals(newEvents);
        setPage(1);
      }
      
      if (newEvents.length < 5) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (error) {
      console.error('행사 불러오기 실패:', error);
    }
  }, []);

  // 날짜가 변경되면 API 호출
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    loadFestivals(selectedDate, 1, false);
  }, [selectedDate, loadFestivals]);

  // 페이지가 변경되면 추가 데이터 로드 (같은 날짜)
  useEffect(() => {
    if (page > 1) {
      loadFestivals(selectedDate, page, true);
    }
  }, [page, selectedDate, loadFestivals]);

  useEffect(() => {
    if (!hasMore) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) setPage(p => p + 1);
      },
      { threshold: 1 }
    );
    const current = observerRef.current;
    if (current) observer.observe(current);
    return () => {
      if (current) observer.unobserve(current);
    };
  }, [hasMore]);

  return (
    <PageWrapper>
      <MainTopCardWrapper>
        <MainTopCard />
        <ButtonGroup>
          <GradientButton className="popular" onClick={() => navigate('/popular')}>실시간 인기</GradientButton>
          <GradientButton className="ai" onClick={() => navigate('/ai')}>AI 추천</GradientButton>
        </ButtonGroup>
      </MainTopCardWrapper>

      <UpcomingEvents onDateSelect={setSelectedDate} />

      {festivals.map((festival, index) => (
        <FestivalCardWrapper key={`festival-${festival.eventId}-${index}`}>
          <FestivalCard
            eventId={festival.eventId}
            commentCount={festival.comments}
            mainText={festival.title}
            subText={festival.category}
            festivalName={festival.title}
            dateRange={`${festival.startDate} ~ ${festival.endDate}`}
            price={festival.isFree === '무료' ? '무료' : '유료'}
            location={festival.isFree === "Y" ? "무료" : "유료"}
            likedDefault={festival.favorites === 1 || festival.currentUserLike === true}
            mainImg={festival.mainImg}
            rating={getRating(festival.eventId, festival.rating)} // 없을 경우 랜덤 생성 (1.0~5.0)
            likes={festival.likes || 0}
            
          />
        </FestivalCardWrapper>
      ))}

      {hasMore && <div ref={observerRef} style={{ height: '1px' }} />}
      <BottomNav />
    </PageWrapper>
  );
};

export default MainpageLogin;

// ───────── Styled Components ─────────

const PageWrapper = styled.div`
  padding-bottom: 120px;
  background-color: #f0f0f0;
  min-height: 100vh;
`;

const FestivalCardWrapper = styled.div`
  padding-bottom: 50px;
  background-color: #f0f0f0;
`;

const MainTopCardWrapper = styled.div`
  position: relative;
`;

const ButtonGroup = styled.div`
  position: absolute;
  bottom: 16px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 20px;
  z-index: 2;
`;

const GradientButton = styled.button`
  width: 130px;
  height: 50px;
  border-radius: 25px;
  border: none;
  color: white;
  font-weight: bold;
  font-size: 14px;
  backdrop-filter: blur(6px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: transform 0.2s;
  text-align: center;
  &.popular {
    background: linear-gradient(135deg, #5b91fd, #345baa);
  }
  &.ai {
    background: linear-gradient(135deg, #fa8c64, #7a716e);
  }
  &:hover {
    transform: translateY(-2px);
  }
`;

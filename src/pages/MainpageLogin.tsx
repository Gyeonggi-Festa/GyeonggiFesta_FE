import { useEffect, useRef, useState, useCallback } from 'react';
import UpcomingEvents from '../components/UpcomingEvents';
import FestivalCard from '../components/FestivalCard';
import MainTopCard from '../components/MainTopCard';
import BottomNav from '../components/BottomNav';
import axiosInstance from '../api/axiosInstance';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

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
  isFree: '무료' | '유료' | string;
  guName: string;
  currentUserLike: boolean;
  mainImg?: string;
  rating: number;      // ⭐ 평점
  likes: number;  
}

const MainpageLogin = () => {
  const navigate = useNavigate();
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const loadFestivals = useCallback(async () => {
    try {
      const today = formatDate(new Date());
      const response = await axiosInstance.get('/api/auth/user/event', {
        params: { startDate: today, endDate: today, page, size: 5 },
      });
      const newEvents = response.data.data.content;
      
      console.log("pl",newEvents);
      setFestivals(prev => [...prev, ...newEvents]);
      if (newEvents.length < 5) setHasMore(false);
    } catch (error) {
      console.error('행사 불러오기 실패:', error);
    }
  }, [page]);

  useEffect(() => {
    loadFestivals();
  }, [loadFestivals]);

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
    <div style={{ paddingBottom: '120px' }}>
      <MainTopCardWrapper>
        <MainTopCard />
        <ButtonGroup>
          <GradientButton className="popular" onClick={() => navigate('/popular')}>실시간 인기</GradientButton>
          <GradientButton className="ai" onClick={() => navigate('/ai')}>AI 추천</GradientButton>
        </ButtonGroup>
      </MainTopCardWrapper>

      <UpcomingEvents />

      {festivals.map((festival, index) => (
        <FestivalCardWrapper key={festival.eventId || index}>
          <FestivalCard
            eventId={festival.eventId}
            commentCount={festival.comments}
            mainText={festival.title}
            subText={festival.category}
            festivalName={festival.title}
            dateRange={`${festival.startDate} ~ ${festival.endDate}`}
            price={festival.isFree === '무료' ? '무료' : '유료'}
            location={festival.guName}
            likedDefault={festival.currentUserLike}
            mainImg={festival.mainImg}
            rating={festival.rating || 3.0} // 없을 경우 기본값
            likes={festival.likes || 0}
            
          />
        </FestivalCardWrapper>
      ))}

      {hasMore && <div ref={observerRef} style={{ height: '1px' }} />}
      <BottomNav />
    </div>
  );
};

export default MainpageLogin;

// ───────── Styled Components ─────────

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

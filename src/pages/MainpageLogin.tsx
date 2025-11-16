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
  isFree: string;
  currentUserLike?: boolean;
  favorites?: number;  // favorites가 1이면 좋아요가 칠해짐
  mainImg?: string;
  rating?: number;      // ⭐ 평점 (optional - 없으면 랜덤 생성)
  likes: number;
  roadAddress?: string;  // 도로명 주소
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
          <GradientButton className="popular" onClick={() => navigate('/popular')}>
            <span>실시간 인기</span>
          </GradientButton>
          <GradientButton className="meeting" onClick={() => navigate('/meetingpot')}>
            <span>모임팟</span>
          </GradientButton>
          <GradientButton className="ai" onClick={() => navigate('/ai')}>
            <span>AI 추천</span>
          </GradientButton>
        </ButtonGroup>
      </MainTopCardWrapper>

      {/* 카테고리 원형 버튼 섹션 */}
      <CategorySection>
        <CategoryButton 
          className="education"
          onClick={() => navigate('/fest/all?category=교육')}
        >
          <CategoryLabel>교육</CategoryLabel>
        </CategoryButton>
        <CategoryButton 
          className="event"
          onClick={() => navigate('/fest/all?category=행사')}
        >
          <CategoryLabel>행사</CategoryLabel>
        </CategoryButton>
        <CategoryButton 
          className="exhibition"
          onClick={() => navigate('/fest/all?category=전시')}
        >
          <CategoryLabel>전시</CategoryLabel>
        </CategoryButton>
        <CategoryButton 
          className="performance"
          onClick={() => navigate('/fest/all?category=공연')}
        >
          <CategoryLabel>공연</CategoryLabel>
        </CategoryButton>
      </CategorySection>

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
            location={festival.roadAddress || "주소 정보 없음"}
            likedDefault={festival.favorites === 1 || festival.currentUserLike === true}
            mainImg={festival.mainImg}
            rating={festival.rating && festival.rating > 0 ? festival.rating : 0} // rating이 0이면 표시하지 않음
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
  padding-bottom: 30px;
  background-color: #f0f0f0;
`;

const MainTopCardWrapper = styled.div`
  position: relative;
`;

const ButtonGroup = styled.div`
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 12px;
  z-index: 2;
  flex-wrap: wrap;
`;

const GradientButton = styled.button`
  width: 110px;
  height: 50px;
  border-radius: 25px;
  border: none;
  background-color: #FFFFFF !important;
  font-weight: bold;
  font-size: 13px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: transform 0.2s;
  text-align: center;
  flex-shrink: 0;
  position: relative;
  
  /* 텍스트 그라데이션을 위한 span 스타일 */
  & > span {
    display: inline-block;
    background-image: none;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    color: transparent;
  }
  
  &.popular > span {
    background-image: linear-gradient(90deg, #3977F4 0%, #17439E 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    color: transparent;
  }
  &.meeting > span {
    background-image: linear-gradient(90deg, #FF9028 0%, #D33838 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    color: transparent;
  }
  &.ai > span {
    background-image: linear-gradient(90deg, #FF8BCD 0.94%, #5393FA 100.94%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    color: transparent;
  }
  
  &:hover {
    transform: translateY(-2px);
  }
  &:active {
    transform: scale(0.97);
  }
`;

// 카테고리 섹션 스타일
const CategorySection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  padding: 24px 20px;
  background-color: #f0f0f0;
  flex-wrap: wrap;
  margin-top: -30px;
`;

const CategoryButton = styled.button`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: none;
  background-color: #FFFFFF;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transition: all 0.2s ease;
  padding: 0;
  position: relative;
  overflow: hidden;
  
  /* 교육 - 노란색→주황색 그라데이션 (연한 버전) */
  &.education {
    background: linear-gradient(135deg, #FFE066 0%, #FF8C5A 100%);
  }
  
  /* 행사 - 빨강→주황 그라데이션 (연한 버전) */
  &.event {
    background: linear-gradient(135deg, #FF6B8E 0%, #FF9D6B 100%);
  }
  
  /* 전시 - 녹색→청록 그라데이션 (연한 버전) */
  &.exhibition {
    background: linear-gradient(135deg, #6BFF9D 0%, #5AE6FF 100%);
  }
  
  /* 공연 - 파랑→주황 그라데이션 (연한 버전) */
  &.performance {
    background: linear-gradient(135deg, #6B9AFF 0%, #FF8C6B 100%);
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const CategoryLabel = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: #FFFFFF;
  text-align: center;
  z-index: 2;
  position: relative;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
`;

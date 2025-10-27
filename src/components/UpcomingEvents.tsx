// ../components/UpcomingEvents.tsx

import React, {  useState, useMemo, useCallback  } from 'react';
import styled from 'styled-components';
import arrowIcon from '/assets/arrow.svg';
import { DAYS_KR, getWeekDays, isDateInRange } from '../utils/dateUtils';
import EventCard from './EventCard';
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom'; // 상단에 추가
import { useQuery } from '@tanstack/react-query';

interface EventType {
  eventId: number;
  category: string;
  title: string;
  guName: string;
  startDate: string;
  endDate: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'ENDED';
  mainImg:string;
}
const formatDate = (date: Date): string =>
  date.toISOString().split('T')[0];

const UpcomingEvents: React.FC = () => {
  const today = useMemo(() => new Date(), []);
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(today);
  const [visibleCount, setVisibleCount] = useState(3);

  const weekDates = useMemo(() => getWeekDays(today), [today]);
  const weekStart = formatDate(weekDates[0]);
  const weekEnd = formatDate(weekDates[6]);

  const fetchEvents = async (): Promise<EventType[]> => {
    const response = await axiosInstance.get('/api/auth/user/event', {
      params: {
        startDate: weekStart,
        endDate: weekEnd,
        page: 1,
        size: 1280,
      },
    });
    return response.data.data.content;
  };

  const { data: events = [], isLoading, isError } = useQuery<EventType[], Error>({
    queryKey: ['weekly-events', weekStart, weekEnd],
    queryFn: fetchEvents,
    staleTime: 1000 * 60 * 10, // 10분
    gcTime: 1000 * 60 * 30,   // ✅ v5에서는 cacheTime이 아니라 gcTime
  });

  const filteredEvents = useMemo(
    () => events.filter((e) => isDateInRange(selectedDate, e.startDate, e.endDate)),
    [events, selectedDate]
  );

  const visibleEvents = useMemo(
    () => filteredEvents.slice(0, visibleCount),
    [filteredEvents, visibleCount]
  );

  const onDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    setVisibleCount(3);
  }, []);

  const handleEventClick = useCallback(
    (eventId: number) => {
      navigate(`/fest/detail?eventId=${eventId}`);
    },
    [navigate]
  );

  if (isLoading) return <Container>로딩 중...</Container>;
  if (isError) return <Container>데이터를 불러오는 데 실패했습니다.</Container>;

  return (
    <Container>
      <Header>
        <Title>다가오는 행사 일정</Title>
        <SeeAll>
          <SeeAllText onClick={() => navigate('/fest/all')}>전체보기</SeeAllText>
          <ArrowIcon src={arrowIcon} alt="arrow" />
        </SeeAll>
      </Header>

      <DateSelector>
        {weekDates.map((date) => {
          const isSelected = date.toDateString() === selectedDate.toDateString();
          return (
            <DateButton
              key={date.toDateString()}
              onClick={() => onDateSelect(date)}
              selected={isSelected}
            >
              <DayLabel>{DAYS_KR[date.getDay()]}</DayLabel>
              <DateLabel>{date.getDate()}</DateLabel>
            </DateButton>
          );
        })}
      </DateSelector>

      <EventsWrapper>
        {visibleEvents.map((event) => (
          <EventCard
            key={event.eventId}
            category={event.category}
            title={event.title}
            location={event.guName}
            dateRange={`${event.startDate} ~ ${event.endDate}`}
            mainImg={event.mainImg}
            eventId={event.eventId}
            onClick={handleEventClick}
          />
        ))}
      </EventsWrapper>

      {visibleEvents.length < filteredEvents.length && (
        <LoadMoreButton onClick={() => setVisibleCount((prev) => prev + 3)}>
          더보기
        </LoadMoreButton>
      )}
    </Container>
  );
};

export default UpcomingEvents;


// styled-components 생략 없이 그대로 유지
const Container = styled.div`
  width: calc(100% - 40px);
  margin: 0 auto;
  background: white;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  margin-bottom: 50px
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: #000;
`;

const SeeAll = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const SeeAllText = styled.span`
  font-size: 15px;
  font-weight: 500;
  color: #777;
`;

const ArrowIcon = styled.img`
  width: 16px;
  height: 16px;
`;

const DateSelector = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
`;

const DateButton = styled.button<{ selected: boolean }>`
  background-color: ${(props) => (props.selected ? '#3977F4' : 'transparent')};
  color: ${(props) => (props.selected ? '#fff' : '#000')};
  border-radius: 50%;
  width: 36px;
  height: 36px;
  text-align: center;
  font-weight: 500;
  border: none;
  cursor: pointer;
`;

const DayLabel = styled.div`
  font-size: 8px;
  font-weight: 500;
`;

const DateLabel = styled.div`
  font-size: 18px;
  font-weight: 600;
`;

const EventsWrapper = styled.div`
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
const LoadMoreButton = styled.button`
  margin: 3px auto 0;
  display: block;
  font-size: 12px;
  font-weight: 500;
  padding: 5px 10px;
  border: none;
  background-color: #f8f8f8;
  border-radius: 99px;
  color: #999;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  margin-top: 10px;
`;

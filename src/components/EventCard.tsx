// ../components/EventCard.tsx

// EventCard.tsx
import React from 'react';
import styled from 'styled-components';

interface EventCardProps {
  category: string;
  title: string;
  location: string;
  dateRange: string;
  mainImg: string;
  eventId: number; // ✅ 추가
  onClick: (eventId: number) => void; // ✅ 추가
}

const EventCard: React.FC<EventCardProps> = ({
  category,
  title,
  location,
  dateRange,
  mainImg,
  eventId,
  onClick,
}) => {
  return (
    <CardWrapper onClick={() => onClick(eventId)}>
      <Thumbnail src={mainImg} alt={title} />
      <EventInfo>
        <Category>{category}</Category>
        <TitleText>{title}</TitleText>
        <SubInfo>📍 {location}</SubInfo>
        <SubInfo>📅 {dateRange}</SubInfo>
      </EventInfo>
    </CardWrapper>
  );
};

export default EventCard;

// 스타일
const CardWrapper = styled.div `
  display: flex;
  align-items: center;
  border-radius: 10px;
  overflow: hidden;
  height: 96px; /* 고정 높이 설정 */
`;

// Thumbnail을 styled.img로 변경
const Thumbnail = styled.img`
  width: 80px;
  height: 80px;
  object-fit: contain;
  flex-shrink: 0;
  border-radius: 10px;
  background-color: #f5f5f5;
`;


const EventInfo = styled.div `
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  min-width: 0; /* flex 아이템의 텍스트 오버플로우 처리 */
`;

const Category = styled.div `
  font-size: 12px;
  color: #999;
  font-weight: 500;
`;

const TitleText = styled.div`
  font-size: 14px;
  font-weight: 600;
  margin: 4px 0;
  color: #000;

  display: -webkit-box;
  -webkit-line-clamp: 2; /* 최대 2줄 */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
  max-height: 2.6em; /* 2줄 높이 제한 */
`;

const SubInfo = styled.div `
  font-size: 12px;
  margin-top: 5px;
  color: #777;
`;
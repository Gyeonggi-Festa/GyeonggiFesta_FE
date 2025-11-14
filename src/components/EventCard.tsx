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

  white-space: nowrap;       /* 줄바꿈 없이 한 줄 */
  overflow: hidden;          /* 넘치는 텍스트 숨기기 */
  text-overflow: ellipsis;   /* 넘치는 부분 ...으로 표시 */
`;

const SubInfo = styled.div `
  font-size: 12px;
  margin-top: 5px;
  color: #777;
`;
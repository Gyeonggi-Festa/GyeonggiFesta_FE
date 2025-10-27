import styled from 'styled-components';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ 추가
import axiosInstance from '../api/axiosInstance';
interface FestivalCardProps {
  eventId: number;
  commentCount: number;
  mainText: string;
  subText: string;
  festivalName: string;
  dateRange: string;
  price: string;
  location: string;
  likedDefault?: boolean;
  mainImg?: string; // ✅ 추가
  rating: number;      // ⭐ 평점
  likes: number;  
}

const FestivalCard = ({
  eventId,
  commentCount,
  mainText,
  subText,
  festivalName,
  dateRange,
  price,
  location,
  likedDefault ,
  mainImg,
  rating,
  likes,
}: FestivalCardProps & { mainImg?: string }) => {
  const [liked, setLiked] = useState(likedDefault);
  const navigate = useNavigate(); 
  const handleToggleLike = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // 카드 전체 클릭 방지
  
    try {
      if (liked) {
        await axiosInstance.delete(`/api/auth/user/event/like/${eventId}`);
      } else {
        await axiosInstance.post(`/api/auth/user/event/like/${eventId}`);
      }
      setLiked(!liked);
    } catch (error) {
      console.error("좋아요 요청 실패:", error);
    }
  };

  
  const handleClick = () => {
    navigate(`/fest/detail?eventId=${eventId}`); 
  };
  return (
    <>
      <CardWrapper $background={mainImg} onClick={handleClick}>
        <CommentBadge>평점 {rating.toFixed(1)}</CommentBadge>

        <ContentWrapper>
          <MainText>{mainText}</MainText>
          <SubText>{subText}</SubText>
        </ContentWrapper>

        <HeartButton onClick={handleToggleLike}>
          <img
            src={liked ? '/assets/heart-fill.svg' : '/assets/heart.svg'}
            alt="하트 버튼"
          />
        </HeartButton>
      </CardWrapper>

      <InfoWrapper onClick={handleClick}>
        <InfoRow>
            <FestivalName>{festivalName}</FestivalName>
            <DateText>{dateRange}</DateText>
        </InfoRow>
        <ExtraInfoRow>
            <PriceText>{price}</PriceText>
            <LocationText>
              <img src="/assets/location.svg" alt="위치 아이콘" width={14} height={14} />
              {location}
              
            </LocationText>

            <MetricsWrapper>
              <MetricItem>
                <img src="/assets/FestivalCard/star-mini.svg" alt="평점" />
                <span style={{ color: '#FFB200' }}>{rating.toFixed(1)}</span>
              </MetricItem>
              <MetricItem>
                <img src="/assets/FestivalCard/heart-mini.svg" alt="좋아요" />
                <span style={{ color: '#CC4E00' }}>{likes}</span>
              </MetricItem>
              <MetricItem>
                <img src="/assets/FestivalCard/chat-mini.svg" alt="댓글 수" />
                <span style={{ color: '#E5004C' }}>{commentCount}</span>
              </MetricItem>
            </MetricsWrapper>
          </ExtraInfoRow>

      </InfoWrapper>
    </>
  );
};

export default FestivalCard;


const CardWrapper = styled.div<{ $background?: string }>`
  position: relative;
  border-radius: 16px;
  padding: 16px;
  width: calc(100% - 40px);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 360px;
  overflow: hidden;
  color: white;
  cursor: pointer;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
  background: ${({ $background }) =>
      $background
        ? ` url(${$background})`
        : 'none'};
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    z-index: 0;
    transition: background-image 0.3s ease-in-out;
  }

  > * {
    position: relative;
    z-index: 1;
  }
`;




const CommentBadge = styled.div`
  position: absolute;
  top: 24px;
  right: 24px;
  background-color: #D9D9D9;
  padding: 7px 30px;
  border-radius: 36px;
  font-size: 16px;
  font-weight: 600;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background: linear-gradient(to top, rgb(255 255 255 / 64%), rgb(255 255 255 / 37%));
`;


const MainText = styled.div`
  color: black; /* 기존 rgb(0, 0, 0) → white */
  font-weight: 600;
  font-size: 24px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SubText = styled.div`
  color: black; /* 기존 0.5 → 더 선명하게 */
  font-weight: 500;
  font-size: 16px;
`;

const HeartButton = styled.button`
  position: absolute;
  bottom: 12px;
  right: 16px;
  width: 24px;
  height: 24px;
  padding: 8px;
  border-radius: 50%;
  background: #EFEFEF;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;

  &:active {
    transform: scale(1.2);
  }

  img {
    width: 21px;
    height: 18px;
  }
`;
const FestivalName = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: clamp(12px, 4vw, 14px);
  max-width: 60%;
`;

const InfoWrapper = styled.div`
  background-color:transport;
  padding: 0px 8px;
  width: calc(100% - 40px);
  margin: 0 auto ;
  border-radius: 0 0 16px 16px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  color: #000000;
`;

const DateText = styled.div`
  white-space: nowrap;
  font-size: clamp(10px, 3vw, 13px);
  color: #929292;
  font-weight: 500;
`;


const ExtraInfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  margin-top: 8px;
  gap: 12px; // 텍스트 간 여백 확보
  flex-wrap: nowrap; // 줄바꿈 방지
  color: #929292;
`;

const PriceText = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: clamp(12px, 3.5vw, 14px);
  max-width: 50%;
`;


const LocationText = styled.div`
  color: #929292;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: clamp(12px, 3.5vw, 14px);
`;
const MetricsWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
`;

const MetricItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;

  img {
    width: 12px;
    height: 12px;
  }

  span {
    font-size: 12px;
    font-weight: 500;
  }
`;


import '../index.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
// MainTopCard.tsx
import React from 'react';
import Slider from 'react-slick';
import { useQueries, UseQueryResult } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import styles from './css/MainTopCard.module.css';

interface CardItem {
  eventId: number;
  mainText: string;
  subText: string;
  imageUrl: string;
}

// 슬라이더 설정은 그대로 재사용
const sliderSettings = {
  dots: false,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: false,
  autoplay: true,
  autoplaySpeed: 3000,
  pauseOnHover: true,
  lazyLoad: 'ondemand',
} as const;

const MainTopCard: React.FC = () => {
  const navigate = useNavigate();

  // 병렬로 2개의 쿼리를 실행
  const [recommendQuery, popularQuery] = useQueries({
    queries: [
      {
        queryKey: ['recommendEvents'],
        queryFn: async (): Promise<CardItem[]> => {
          const res = await axiosInstance.get('/api/auth/user/event/recommend');
          const arr = Array.isArray(res.data.data) ? res.data.data : [];
          console.log("arr",arr);
          return arr.map((item: any) => ({
            eventId: item.eventId,
            mainText: item.title,
            subText: `${item.category} | ${item.guName}`,
            imageUrl: item.mainImg || '/assets/default-card.jpg',
          }));
        },
        staleTime: 0,
        refetchOnMount: true, // ✅ 추가
        // 이 컴포넌트에서는 전역 staleTime을 그대로 사용해도 되지만, 필요시 override 가능
      },
      {
        queryKey: ['popularEvents', 4],
        queryFn: async (): Promise<CardItem[]> => {
          const res = await axiosInstance.get('/api/auth/user/event', {
            params: { sortByPopularity: 'True', size: 4 },
          });
          const content = Array.isArray(res.data.data?.content)
            ? res.data.data.content
            : Array.isArray(res.data.data)
            ? res.data.data
            : [];
            console.log("content",content);
          return content.map((item: any) => ({
            eventId: item.eventId,
            mainText: item.title,
            subText: `${item.category} | ${item.guName}`,
            imageUrl: item.mainImg || '/assets/default-card.jpg',
          }));
        },
        staleTime: 0,
        refetchOnMount: true, // ✅ 추가
      },
    ],
  }) as [UseQueryResult<CardItem[]>, UseQueryResult<CardItem[]>];

  // 로딩 및 에러 처리
  if (recommendQuery.isLoading || popularQuery.isLoading) {
    return <div>로딩 중…</div>;
  }
  if (recommendQuery.error || popularQuery.error) {
    return <div>데이터를 불러오는 중 오류가 발생했습니다.</div>;
  }

  const topCardData = recommendQuery.data || [];
  const popularCardData = popularQuery.data || [];

  return (
    <div className={styles.container}>
        {topCardData.length + popularCardData.length > 0 ? (
          <div style={{ position: 'relative' }}>
            <Slider {...sliderSettings} className={styles.slider}>
              {[...topCardData, ...popularCardData].map((item, idx) => (
                <div key={idx}>
                  <div
                    className={styles.cardWrapper}
                    style={{
                      backgroundImage: `url(${item.imageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                    onClick={() => navigate(`/fest/detail?eventId=${item.eventId}`)}
                  >
                    <div className={styles.cardOverlay}>
                      <p className={styles.mainText}>{item.mainText}</p>
                      <p className={styles.subText}>{item.subText}</p>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>

            
          </div>
        ) : (
          <div className={styles.emptyMessage}>
            활동이 없어 <strong>추천할 수 없습니다.</strong>
          </div>
        )}
      </div>

  );
};

export default MainTopCard;

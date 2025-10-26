import { useEffect, useState } from "react";
import styles from "./css/ReviewSection.module.css";
import ReviewItem from "./ReviewItem";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

interface ReviewSectionProps {
  eventId: string;
}

interface ReviewData {
  id: number;
  eventId: number;
  memberName: string;
  content: string;
  visitedAt: string;
  rating: number;
  mediaList?: { imageUrl: string }[];
  verifyId:string;
}

export default function ReviewSection({ eventId }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [visibleCount, setVisibleCount] = useState(3);
  const [totalReviews, setTotalReviews] = useState(0);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axiosInstance.get(
          `/api/auth/user/events/${eventId}/reviews`
        );
        const content = res.data.data.content;
        console.log("content",content);
        setReviews(content);
        setTotalReviews(res.data.data.page.totalElements);
      } catch (error) {
        console.error("리뷰 데이터를 불러오는 중 오류 발생:", error);
      }
    };

    fetchReviews();
  }, [eventId]);

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 3);
  };

  const visibleReviews = reviews.slice(0, visibleCount);
  const hasMore = visibleCount < reviews.length;

  return (
    <div className={styles.container}>
      {/* 상단 라벨 */}
      <div className={styles.header}>
        <p className={styles.title}>
          리뷰
          <span className={styles.count}>({totalReviews})</span>
        </p>
        <button
          className={styles.writeBtn}
          onClick={() => navigate(`/fest/detail/review?eventId=${eventId}`)}
        >
          <img src="/assets/pencil.svg" alt="리뷰 작성" />
          리뷰 전체보기
        </button>
      </div>

      {/* 리뷰 목록 */}
      <div className={styles.list}>
      {visibleReviews.map((review) => (
        <ReviewItem
          key={review.id}
          reviewId={review.id}
          name={review.memberName}
          visitDate={new Date(review.visitedAt).toLocaleDateString("ko-KR")}
          content={review.content}
          mediaList={review.mediaList}
          onDelete={() => {
            setReviews((prev) => prev.filter((r) => r.id !== review.id));
            setTotalReviews((prev) => prev - 1);
          }}
          reviewAuthorVerifyId={review.verifyId}
        />
        ))}
      </div>

      {/* 더보기 버튼 */}
      {hasMore && (
        <button className={styles.moreBtn} onClick={handleShowMore}>
          리뷰 더보기
        </button>
      )}
    </div>
  );
}

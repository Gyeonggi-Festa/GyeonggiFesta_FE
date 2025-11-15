import { useState,useEffect } from "react";
import styles from "./css/ReviewPage.module.css";
import ReviewBigItem from "./ReviewBigItem";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
interface Review {
  id: number;
  name: string;
  visitDate: string;
  content: string;
  profileImg: string | null; // 첫 번째 이미지 URL 또는 null
  rating: number; // 별점
}

export default function ReviewPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [photoOnly, setPhotoOnly] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const eventId = searchParams.get("eventId");
  useEffect(() => {
    const fetchReviews = async () => {
      if (!eventId) return;
      try {
        const res = await axiosInstance.get(`/api/auth/user/events/${eventId}/reviews`);
        const content = res.data.data.content;

        const transformed = content.map((item: any) => ({
          id: item.id,
          name: item.memberName,
          visitDate: new Date(item.createdAt).toLocaleDateString("ko-KR"),
          content: item.content,
          profileImg: item.mediaList.length > 0 ? item.mediaList[0].imageUrl : null, // string[]
          rating: item.rating || 0, // 별점
        }));

        setReviews(transformed);
      } catch (error) {
        console.error("리뷰 불러오기 실패:", error);
      }
    };

    fetchReviews();
  }, [eventId]);

  const filteredReviews = photoOnly
    ? reviews.filter((r) => r.profileImg !== null)
    : reviews;

  return (
    <div className={styles.page}>
      {/* 헤더 */}
      <div className="">
        <img src="/assets/slash.svg" alt="썸네일" className={styles.thumb} onClick={() => navigate(-1)} />
      
      </div>
      <div className={styles.header}>
        <p className={styles.title}>
          리뷰 <span className={styles.count}>({filteredReviews.length})</span>
        </p>
        <button className={styles.writeBtn}
          onClick={() => {
            if (eventId) navigate(`/fest/detail/review/write?eventId=${eventId}`);
            else alert("이벤트 ID가 없습니다.");
          }}
        >
          <img src="/assets/pencil.svg" alt="작성" />
          리뷰 작성하기
        </button>
      </div>

      {/* 필터 */}
      <div className={styles.filter}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={photoOnly}
            onChange={(e) => setPhotoOnly(e.target.checked)}
          />
          <span className={styles.customCheckbox} />
          <span className={styles.photoOnlyText}>사진 리뷰만</span>
        </label>
      </div>

      {/* 리뷰 리스트 */}
      <div className={styles.list}>
        {filteredReviews.map((review) => (
          <ReviewBigItem key={review.id} {...review} />
        ))}
      </div>
    </div>
  );
}

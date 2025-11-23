import styles from "./css/ReviewItem.module.css";
import axiosInstance from "../api/axiosInstance";


interface ReviewItemProps {
  reviewId: number; // ✅ reviewId 추가
  name: string;
  visitDate: string;
  content: string;
  mediaList?: { imageUrl: string }[];
  onDelete?: () => void; // ✅ 삭제 후 목록 갱신 등 외부 처리
  reviewAuthorVerifyId: string;
  rating?: number; // 별점 추가
}

export default function ReviewItem({ reviewId, name, visitDate, content, mediaList = [], onDelete, reviewAuthorVerifyId, rating = 0 }: ReviewItemProps) {
  const hasImage = mediaList.length > 0;
  const imageUrl = hasImage ? mediaList[0].imageUrl : null;
  
  // 탈퇴한 회원의 경우 "알 수 없음"으로 표시
  const displayName = name && name.trim() !== '' ? name : '알 수 없음';
  
  const myVerifyId = localStorage.getItem("verify_id"); // ✅ 내 ID 가져오기
  const isAuthor = myVerifyId === reviewAuthorVerifyId; // ✅ 비교

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        await axiosInstance.delete(`/api/auth/user/reviews/${reviewId}`);
        alert("리뷰가 삭제되었습니다.");
        onDelete?.();
      } catch (err) {
        console.error(err);
        alert("리뷰 삭제에 실패했습니다.");
      }
    }
  };

  return (
    <div className={styles.item}>
      <div className={styles.topInfo}>
        <div className={styles.leftInfo}>
          <span className={styles.name}>{displayName}</span>
          <span className={styles.meta}>{visitDate}</span>
          {rating > 0 && (
            <div className={styles.rating}>
              <img src="/assets/star-fill.svg" alt="별점" className={styles.starIcon} />
              <span className={styles.ratingValue}>{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        {isAuthor && (
          <button
            className={styles.deleteBtn}
            onClick={handleDelete}
          >
            삭제
          </button>
        )}
      </div>

      <div className={styles.row}>
        {imageUrl && (
          <img src={imageUrl} alt="리뷰 이미지" className={styles.profileImg} />
        )}
        <p className={styles.content}>{content}</p>
      </div>

      <div className={styles.divider} />
    </div>
  );
}
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
}

export default function ReviewItem({ reviewId, name, visitDate, content, mediaList = [], onDelete,reviewAuthorVerifyId }: ReviewItemProps) {
  const hasImage = mediaList.length > 0;
  const imageUrl = hasImage ? mediaList[0].imageUrl : null;
  
  const myVerifyId = localStorage.getItem("verify_id"); // ✅ 내 ID 가져오기
  const isAuthor = myVerifyId === reviewAuthorVerifyId; // ✅ 비교
  

  return (
    <div className={styles.item}>
      <div className={styles.topInfo}>
        <span className={styles.name}>{name}</span>
        <span className={styles.meta}>{visitDate}</span>
        {isAuthor && (
          <button
            className={styles.deleteBtn}
            onClick={async (e) => {
              e.stopPropagation();
              if (window.confirm("정말 삭제하시겠습니까?")) {
                try {
                  await axiosInstance.delete(`/api/auth/user/reviews/${reviewId}`);
                  alert("리뷰가 삭제되었습니다.");
                  onDelete?.();
                } catch (err) {
                  alert("삭제 실패");
                  console.error(err);
                }
              }
            }}
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
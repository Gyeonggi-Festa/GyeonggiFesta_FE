import styles from "./css/ReviewBigItem.module.css";

interface ReviewItemProps {
  name: string;
  visitDate: string;
  content: string;
  profileImg?: string | null;
  rating?: number;
}

export default function ReviewBigItem({ name,  visitDate, content, profileImg, rating = 0 }: ReviewItemProps) {
  // 탈퇴한 회원의 경우 "알 수 없음"으로 표시
  const displayName = name && name.trim() !== '' ? name : '알 수 없음';
  
  return (
    <div className={styles.item}>
        <div className={styles.headerRow}>
            <div className={styles.leftInfo}>
              <span className={styles.name}>{displayName}</span>
              <span className={styles.meta}>{visitDate} 방문</span>
            </div>
            {rating > 0 && (
              <div className={styles.rating}>
                <img src="/assets/star-fill.svg" alt="별점" className={styles.starIcon} />
                <span className={styles.ratingValue}>{rating.toFixed(1)}</span>
              </div>
            )}
        </div>

        {profileImg && (
          <img src={profileImg} className={styles.contentImg} alt="리뷰 이미지"/>
        )}

        <p className={styles.description}>{content}</p>
    </div>
  );
}

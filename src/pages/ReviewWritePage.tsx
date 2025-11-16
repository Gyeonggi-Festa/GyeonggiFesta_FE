import { useState, ChangeEvent } from "react";
import styles from "./css/ReviewWritePage.module.css";
import "react-calendar/dist/Calendar.css";
import CalendarModal from "../components/CalendarModal";
import useFestivalStore from "../store/useFestivalStore"; // ✅ 상태 가져오기
import axiosInstance from "../api/axiosInstance";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import SuccessModal from "../components/SuccessModal";

export default function ReviewWritePage() {
    const [review, setReview] = useState("");
    const [date, setDate] = useState("");
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [image, setImage] = useState<File | null>(null);
    const [rating, setRating] = useState(0); // 별점: 0 ~ 5
    const { eventData } = useFestivalStore(); // ✅ Zustand 상태에서 데이터 가져오기
    const navigate = useNavigate();
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    
    const handleDateChange = (value: Date) => {
        const yyyy = value.getFullYear();
        const mm = String(value.getMonth() + 1).padStart(2, "0");
        const dd = String(value.getDate()).padStart(2, "0");
        setDate(`${yyyy}-${mm}-${dd}`);
        setCalendarOpen(false);
    };

    const handleDateError = (message: string) => {
        setErrorMessage(message);
        setIsErrorModalOpen(true);
    };
    const [searchParams] = useSearchParams();
    const eventId = searchParams.get("eventId"); // string | null
    console.log(eventId);
    // console.log("review",review,date,image);
    const numericEventId = eventId ? parseInt(eventId, 10) : null;
    const handleSubmit = async () => {
        console.log("🔥 handleSubmit 실행됨");
      
        if (!isFormValid || !numericEventId || isNaN(numericEventId)) {
            console.log("⚠️ 유효하지 않은 상태", numericEventId, isFormValid);
            return;
          }
          
      
        let mediaList = [];
      
        try {
          // ✅ 1단계: presigned URL 요청 및 S3 업로드
          if (image) {
            const presignedResponse = await axiosInstance.get("/api/auth/user/post/presigned", {
              params: {
                originalFileName: image.name,
                contentType: image.type,
              },
            });
      
            const { presignedUrl, s3Key } = presignedResponse.data.data;
            console.log("📦 presigned URL 응답:", presignedResponse.data);
      
            await axios.put(presignedUrl, image, {
              headers: {
                "Content-Type": image.type,
              },
            });
            console.log("✅ 이미지 S3 업로드 성공");
      
            mediaList.push({
              s3Key,
              order: 0,
            });
          }
      
          // ✅ 2단계: 리뷰 등록 POST 요청
          const payload = {
            eventId: numericEventId,
            content: review,
            visitedAt:date,
            rating: Number(rating).toFixed(2),
            mediaList,
          };
      
          console.log("🚀 리뷰 등록 payload:", payload);
      
          const res = await axiosInstance.post("/api/auth/user/reviews", payload);
          console.log("🎉 리뷰 등록 성공 응답:", res.data);
      
          alert("리뷰가 성공적으로 등록되었습니다!");
          // 이후 초기화나 페이지 이동 가능
          setReview("");
          setDate("");
          setImage(null);
          setRating(0);
          navigate(`/fest/detail/?eventId=${eventId}`, { replace: true });

        } catch (err) {
          console.error("❌ 리뷰 등록 실패:", err);
          alert("리뷰 등록 중 오류가 발생했습니다.");
        }
      };
      
    
    

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setImage(e.target.files[0]);
        }
    };
    

    const isFormValid = date !== "" && review.length >= 10;
    
    return (
        <div className={styles.container}>
            {/* 헤더 */}
            <div className={styles.header}>
                <img src="/assets/slash.svg" alt="뒤로가기" 
                className={styles.backIcon}  onClick={() => navigate(-1)} />
            </div>

            {/* 행사 정보 */}
            <div className={styles.imageSection}>
                <div className={styles.imagePlaceholder}>
                    {eventData?.mainImg ? (
                        <img src={eventData.mainImg} alt="행사 대표 이미지" className={styles.thumbnailImg} />
                    ) : (
                        <span className={styles.noImage}>이미지가 없습니다</span>
                    )}
                </div>
                <div className={styles.info}>
                 
                    <span className={styles.gu}>{eventData?.isFree === "Y" ? "무료" : "유료"}</span>
                </div>
                <h1 className={styles.title}>{eventData?.title ?? "행사 제목 없음"}</h1>
            </div>

            {/* 별점 필드 */}
            <div className={styles.ratingBox}>
                <label className={styles.label}>별점을 선택해주세요.</label>
                <div className={styles.stars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                    <img
                        key={star}
                        src={rating >= star ? "/assets/star-filled.svg" : "/assets/star-empty.svg"}
                        alt={`${star}점`}
                        className={styles.starIcon}
                        onClick={() => setRating(star)}
                    />
                    ))}
                </div>
            </div>


            {/* 방문 날짜 */}
            <div className={styles.dateBox}>
                <label className={styles.label}>방문하신 날짜</label>
                <div className={styles.inputRow} onClick={() => setCalendarOpen(true)}>
                    <input
                        className={styles.dateInput}
                        type="text"
                        placeholder="날짜를 입력하세요"
                        value={date}
                        readOnly
                    />
                    <img src="/assets/arrow.svg" alt="달력" className={styles.arrow} />
                </div>
            </div>

            {/* 리뷰 작성 */}
            <div className={styles.reviewBox}>
                <label className={styles.label}>솔직한 리뷰를 작성해 주세요.</label>
                <textarea
                    className={styles.textarea}
                    placeholder={`- 솔직한 후기를 10자 이상 작성해 주세요.\n- 리뷰 작성 시 유의사항을 확인해 주세요.\n- 욕설, 비방, 명예훼손성 표현은 누군가에게 상처가 될 수 있습니다.`}
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    maxLength={500}
                />
                <div className={styles.charCount}>{review.length}/500</div>
            </div>

            {/* 사진 첨부 */}
            <div className={styles.photoUpload}>
                {!image ? (
                    <label className={styles.uploadBtn}>
                        <img src="/assets/write/plus.svg" alt="사진첨부" />
                        <span>사진 첨부하기</span>
                        <span className={styles.optional}>(선택)</span>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            hidden
                        />
                    </label>
                ) : (
                    <div className={styles.imageInfo}>
                        <span className={styles.imageName}>{image.name}</span>
                        <img src="/assets/check.svg" alt="첨부 완료" className={styles.checkIcon} />
                    </div>
                )}
            </div>

            {/* 등록 버튼 */}
            <button
                className={`${styles.submitBtn} ${isFormValid ? styles.active : ""}`}
                disabled={!isFormValid}
                onClick={handleSubmit}
            >
                리뷰 등록하기
            </button>

            {/* 달력 모달 */}
            {calendarOpen && (
                <CalendarModal
                    onClose={() => setCalendarOpen(false)}
                    onSelectDate={handleDateChange}
                    onError={handleDateError}
                    maxDate={new Date()} // 오늘 이전만 선택 가능 (리뷰 작성)
                />
            )}

            {/* 에러 모달 */}
            <SuccessModal
                isOpen={isErrorModalOpen}
                message={errorMessage}
                onClose={() => setIsErrorModalOpen(false)}
            />
        </div>
    );
}
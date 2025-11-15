import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import ReviewItem from '../components/ReviewItem';
import styles from './css/MyReviewPage.module.css';
import {motion} from 'framer-motion';

interface Review {
    id: number;
    eventId: number;
    eventTitle: string;
    memberName: string;
    content: string;
    createdAt: string;
    rating: number;
    mediaList?: {
        imageUrl: string
    }[];
}

const MyReviewPage = () => {
    const navigate = useNavigate();
    const [reviews, setReviews] = useState<Review[]>([]);
    const myVerifyId = localStorage.getItem("verify_id");

    useEffect(() => {
        const fetchMyReviews = async () => {
            try {
                const res = await axiosInstance.get('/api/auth/user/my-reviews');
                setReviews(res.data.data.content);
            } catch (err) {
                console.error('리뷰 가져오기 실패:', err);
            }
        };

        fetchMyReviews();
    }, []);

    return (
        <motion.div
            className={styles.wrapper}
            initial={{
                opacity: 0,
                y: 20
            }}
            animate={{
                opacity: 1,
                y: 0
            }}
            transition={{
                duration: 0.4
            }}>
            {/* 헤더 */}
            <div className={styles.header}>
                <motion.img
                    src="/assets/slash.svg"
                    alt="뒤로가기"
                    className={styles.icon}
                    onClick={() => navigate("/mypage")}
                    whileTap={{
                        scale: 0.9
                    }}/>
                <p className={styles.title}>내가 쓴 리뷰</p>
            </div>

            {/* 섹션 타이틀 */}
            <p className={styles.sectionTitle}>작성한 리뷰 모음</p>

            {/* 리뷰 목록 */}
            {
                reviews.length > 0
                    ? (
                        <div className={styles.reviewList}>
                            {
                                reviews.map((review) => (
                                    <motion.div
                                        key={review.id}
                                        onClick={() => navigate(`/fest/detail?eventId=${review.eventId}`)}
                                        whileHover={{
                                            scale: 1.02
                                        }}
                                        whileTap={{
                                            scale: 0.97
                                        }}
                                        style={{
                                            cursor: 'pointer'
                                        }}>
                                        <ReviewItem
                                        reviewId={review.id}
                                        name={review.memberName}
                                        visitDate={new Date(review.createdAt).toLocaleDateString('ko-KR')}
                                        content={review.content}
                                        mediaList={review.mediaList}
                                        onDelete={() =>
                                            setReviews((prev) => prev.filter((r) => r.id !== review.id))
                                        }
                                        reviewAuthorVerifyId={myVerifyId || ''}
                                        />

                                    </motion.div>
                                ))
                            }
                        </div>
                    )
                    : (<p className={styles.emptyMessage}>작성한 리뷰가 없습니다.</p>)
            }
        </motion.div>
    );
};

export default MyReviewPage;
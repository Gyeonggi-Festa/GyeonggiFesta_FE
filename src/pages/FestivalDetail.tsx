import { useEffect, useState } from "react";
import styles from "./css/FestivalDetail.module.css";
import FestivalInfo from "../components/FestivalInfo";
import FestivalMap from "../components/FestivalMap";
import FestivalDescription from "../components/FestivalDescription";
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosInstance from "../api/axiosInstance";
import ReviewSection from "../components/ReviewSection";
import useFestivalStore from "../store/useFestivalStore";
import CommentSection from "../components/CommentSection";
import { useRef } from "react"; // 스크롤 이동용
import { motion } from 'framer-motion';
import BottomNav from "../components/BottomNav";

const getStatus = (start: string, end: string) => {
  const today = new Date();
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (today < startDate) return { text: "예정", color: "#00A859" };
  if (today > endDate) return { text: "마감", color: "#888888" };
  return { text: "진행중", color: "#0900FF" };
};

export default function FestivalDetail() {
  const [searchParams] = useSearchParams();
  const reviewSectionRef = useRef<HTMLDivElement>(null);
  const commentSectionRef = useRef<HTMLDivElement>(null);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const eventId = searchParams.get("eventId");
  const { setEventId, setEventData } = useFestivalStore();
  const [data, setData] = useState<any>();
  const [liked, setLiked] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const navigate = useNavigate();
  const [likeAnimation, setLikeAnimation] = useState(false);
const [favoriteAnimation, setFavoriteAnimation] = useState(false);
  const copyToClipboard = () => {
    if (!data?.orgLink) return alert('복사할 링크가 없습니다.');
    navigator.clipboard.writeText(data.orgLink)
      .then(() => alert("링크가 복사되었습니다!"))
      .catch(() => alert("클립보드 복사에 실패했습니다."));
  };

  const scrollToReview = () => {
    reviewSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToComment = () => {
    commentSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    if (!eventId) return;
    setEventId(eventId);

    const fetchFestivalDetail = async () => {
      try {
        const response = await axiosInstance.get(`/api/auth/user/event/${eventId}`);
        const eventData = response.data.data;
        
        setData(eventData);
        setEventData(eventData);
        console.log("eventData",eventData)
      } catch (error) {
        console.error("행사 상세 정보를 불러오지 못했습니다:", error);
      }
    };

    fetchFestivalDetail();
  }, [eventId, setEventId, setEventData]);

  useEffect(() => {
    if (data) {
      setLiked(data.currentUserLike === true);
      setFavorited(data.currentUserFavorite === true);
    }
  }, [data]);
  
  

  if (!data) return <div>로딩 중...</div>;

  const status = getStatus(data.startDate, data.endDate);

  const detailInfo = {
    location: data.place,
    date: `${data.startDate.replace(/-/g, ".")} ~ ${data.endDate.replace(/-/g, ".")}`,
    fee: data.useFee || data.isFree,
    people: data.useTarget || "정보 없음",
    mask: data.player || "출연자 정보 없음",
    buliding: data.orgName || "기관 정보 없음",
  };

  const toggleLike = async () => {
    try {
      if (liked) {
        await axiosInstance.delete(`/api/auth/user/event/like/${eventId}`);
      } else {
        await axiosInstance.post(`/api/auth/user/event/like/${eventId}`);
      }
      setLiked(!liked);
      setLikeAnimation(true);
      setTimeout(() => setLikeAnimation(false), 300); // 애니메이션 지속 시간
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
    }
  };

  const toggleFavorite = async () => {
    try {
      if (favorited) {
        await axiosInstance.delete(`/api/auth/user/event/favorite/${eventId}`);
      } else {
        await axiosInstance.post(`/api/auth/user/event/favorite/${eventId}`);
      }
      setFavorited(!favorited);
      setFavoriteAnimation(true);
      setTimeout(() => setFavoriteAnimation(false), 300);
    } catch (error) {
      console.error("즐겨찾기 처리 실패:", error);
    }
  };

  return (
    <motion.div className={styles.container} initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}>
      <div className={styles.header}>
        <img
          src="/assets/back.svg"
          alt="Back"
          onClick={() => navigate('/mainpage')}
          className={styles.backIcon}
        />
        <div className={styles.moreContainer}>
          <img
            src={showMoreOptions ? "/assets/x.svg" : "/assets/more.svg"} // ✅ 아이콘 조건부 변경
            alt="More"
            onClick={() => setShowMoreOptions((prev) => !prev)}
            className={styles.moreIcon}
          />

          {showMoreOptions && (
            <div className={styles.moreDropdown}>
              <div onClick={() => navigate(`/fest/detail/review/write?eventId=${eventId}`)}>리뷰 작성하기</div>
              <div onClick={scrollToReview}>리뷰 보러가기</div>
              <div onClick={scrollToComment}>댓글로 가기</div>
            </div>
          )}
        </div>
      </div>

      <p className={styles.subtitle}>{data.category}</p>
      <h1 className={styles.title}>{data.title}</h1>

      <div className={styles.locationInfoRow}>
        <img src="/assets/detail/map.svg" alt="Map Icon" className={styles.mapIcon} />
        <span className={styles.locationText}>{data.guName || "어디구 있지도 있어"}</span>
        <img src="/assets/FestivalCard/star-mini.svg" alt="평점" />
        <span style={{ color: '#FFB200' }}>{data.rating.toFixed(1)}</span>
        <img src="/assets/FestivalCard/heart-mini.svg" alt="좋아요" />
                <span style={{ color: '#CC4E00' }}>{data.likes}</span>
      </div>

      <div className={styles.dateRow}>
        <span className={styles.date}>
          {data.startDate.replace(/-/g, ".")} ~ {data.endDate.replace(/-/g, ".")}
        </span>
        <span
          className={styles.status}
          style={{
            color: status.color,
            border: `1px solid ${status.color}`,
            fontWeight: "bold",
            borderRadius: "99px",
            padding: "4px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {status.text}
        </span>
      </div>

      <div className={styles.iconContainer}>
        <motion.img
          src={liked ? "/assets/hart-fill.svg" : "/assets/hart.svg"}
          alt="Heart Icon"
          onClick={toggleLike}
          className={styles.icon}
          animate={likeAnimation ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.4 }}
        />

        <motion.img
          src={favorited ? "/assets/star-fill.svg" : "/assets/star.svg"}
          alt="Star Icon"
          onClick={toggleFavorite}
          className={styles.icon}
          animate={favoriteAnimation ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.4 }}
        />


        <img
          src="/assets/send.svg"
          alt="Send Icon"
          onClick={copyToClipboard}
          className={styles.icon}
        />

      </div>

      <div className={styles.websiteImage}>
        <img src={data.mainImg} alt="Festival Cover" />
      </div>

      <div className={styles.websiteBox}>
        <div className={styles.websiteLeft}>
          <img src="/assets/earth.svg" alt="Earth Icon" />
          <div className={styles.websiteTextBox}>
            <p className={styles.websiteLabel}>웹사이트 방문</p>
            <a
              href={data.orgLink}
              className={styles.websiteLink}
              target="_blank"
              rel="noopener noreferrer"
              title={data.orgLink}
            ></a>
          </div>
        </div>
        <img
          src="/assets/detail/slash.svg"
          alt="Slash Icon"
          onClick={() => window.open(data.orgLink, "_blank")}
          className={styles.slashIcon}
        />
      </div>

      <FestivalInfo values={detailInfo} />
      <FestivalMap lat={parseFloat(data.lot)} lng={parseFloat(data.lat)} guName={data.guName} />
      <FestivalDescription content={data.introduce || "등록된 설명이 없습니다."} />
      <div ref={commentSectionRef}>
        <CommentSection eventId={eventId!} />
      </div>
      <div ref={reviewSectionRef}>
        <ReviewSection eventId={eventId!} />
        
      </div>
      <BottomNav/>
    </motion.div>
  );
}
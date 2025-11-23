import React, { useState } from 'react'; // ✅ useState 추가

import styles from './css/ParkingModal.module.css';

interface ParkingDetail {
  parkingId: string;
  parkingName: string;
  address: string;
  parkingType: string;
  operationType: string;
  tel: string;
  totalSpace: number;
  currentParked: number;
  lastUpdated: string;
  weekdayOperatingHours: string;
  weekendOperatingHours: string;
  holidayOperatingHours: string;
  saturdayFeeStatus: string;
  holidayFeeStatus: string;
  baseRate: number;
  baseTime: number;
  additionalRate: number;
  additionalTime: number;
  dailyMaxRate: number;
  availableSpace: number;
  nightPaid: boolean;
  paid: boolean;
}

interface ParkingModalProps {
  data: ParkingDetail;
  onClose: () => void;
  onRefresh: () => void;
}

const getStatus = (available: number) => {
  if (available >= 20) return { text: '주차공간이 여유로워요', color: '#00DC1D' };
  if (available >= 10) return { text: '조금 혼잡할 수 있어요', color: '#F1940A' };
  return { text: '다른 주차장을 이용하세요', color: '#7E7E7E' };
};
const splitTime = (time: string) => {
  const [start, end] = time.split('~').map((t) => t.trim());
  return { start, end };
};

const ParkingModal: React.FC<ParkingModalProps> = ({ data, onClose ,onRefresh}) => {
  const [isRotating, setIsRotating] = useState(false); // ✅ 회전 상태 추가

  const handleRefresh = () => {
    if (isRotating) return;
    setIsRotating(true);
    onRefresh();
    setTimeout(() => setIsRotating(false), 1000); // ✅ 애니메이션 끝나면 해제
  };
  const available = data.availableSpace;
  const status = getStatus(available);
  const weekday = splitTime(data.weekdayOperatingHours);
  const weekend = splitTime(data.weekendOperatingHours);
  console.log(data.totalSpace,data.currentParked,status);
  return (
    <div className={styles.container}>
      <div className={styles.header}>
          <img
            src="/assets/refresh-spin.svg"
            alt="새로고침"
            className={`${styles.refreshIcon} ${isRotating ? styles.rotate : ''}`}
            onClick={handleRefresh}
            style={isRotating ? { pointerEvents: 'none', opacity: 0.5 } : {}}
          />

        <span className={styles.close} onClick={onClose}>닫기</span>
      </div>

      <div className={styles.name}>{data.parkingName}</div>

      <div className={styles.statusBox}>
        <div className={styles.dot} style={{ backgroundColor: status.color }} />
        <span className={styles.statusText}>{status.text}</span>
        <span className={styles.statusRatio}>
          <span className={styles.availableCount}>
            {Math.min(data.currentParked, data.totalSpace)}
          </span> /
          <span className={styles.totalCount}> {data.totalSpace}</span>
        </span>

      </div>

      <div className={styles.row}>
        <span className={styles.icon}>📍</span>
        <span className={styles.underlinedPhone}>{data.address}</span>
      </div>

      <div className={styles.row}>
        <span className={styles.icon}>💳</span>
        <div>
          <div>{data.paid ? '유료' : '무료'}</div>
          <div>기본 요금: {data.baseTime}분 {data.baseRate.toLocaleString()}원</div>
          <div>추가 요금: {data.additionalTime}분당 {data.additionalRate.toLocaleString()}원</div>
          <div>일일 최대: {data.dailyMaxRate > 0 ? `${data.dailyMaxRate.toLocaleString()}원` : '제한 없음'}</div>
        </div>
      </div>

      <div className={styles.row}>
        <span className={styles.icon}>🕒</span>
        <div>
          <div>평일: {weekday.start} ~ {weekday.end}</div>
          <div>주말: {weekend.start} ~ {weekend.end}</div>
          {/* 공휴일 생략 가능 */}
        </div>
      </div>

      <div className={styles.row}>
        <span className={styles.icon}>📞</span>
        <span className={styles.underlinedPhone}>{data.tel}</span>
      </div>
    </div>
  );
};

export default ParkingModal;
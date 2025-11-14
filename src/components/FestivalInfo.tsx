// components/FestivalInfo.tsx
import  { useState } from "react";
import styles from "./css/FestivalInfo.module.css";

interface InfoValues {
  location: string;
  date: string;
  fee: string;
  people: string;
  mask: string;
  buliding: string;
}

interface FestivalInfoProps {
  values: InfoValues;
}

export default function FestivalInfo({ values }: FestivalInfoProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.container}>
      <div className={styles.header} onClick={() => setIsOpen(!isOpen)}>
        <span className={styles.title}>상세 정보</span>
        <img
          src={
            isOpen
              ? "/assets/detail/up.svg"
              : "/assets/detail/down.svg"
          }
          alt="Toggle Icon"
          className={styles.toggleIcon}
        />
      </div>

      {(
      <div className={`${styles.infoWrapper} ${isOpen ? styles.open : ''}`}>
        <ul className={styles.infoList}>
          <li className={styles.infoItem}>
            <img src="/assets/detail/location.svg" className={styles.icon} alt="장소 아이콘" />
            <div className={styles.textBox}>
              <p className={styles.label}>장소</p>
              <p className={styles.value}>{values.location}</p>
            </div>
          </li>

          <li className={styles.infoItem}>
            <img src="/assets/detail/date.svg" className={styles.icon} alt="날짜 아이콘" />
            <div className={styles.textBox}>
              <p className={styles.label}>날짜 / 기간</p>
              <p className={styles.value}>{values.date}</p>
            </div>
          </li>

          <li className={styles.infoItem}>
            <img src="/assets/detail/fee.svg" className={styles.icon} alt="이용요금 아이콘" />
            <div className={styles.textBox}>
              <p className={styles.label}>이용요금</p>
              <p className={styles.value}>{values.fee}</p>
            </div>
          </li>

          <li className={styles.infoItem}>
            <img src="/assets/detail/people.svg" className={styles.icon} alt="이용대상 아이콘" />
            <div className={styles.textBox}>
              <p className={styles.label}>이용대상</p>
              <p className={styles.value}>{values.people}</p>
            </div>
          </li>

          <li className={styles.infoItem}>
            <img src="/assets/detail/mask.svg" className={styles.icon} alt="출연자 아이콘" />
            <div className={styles.textBox}>
              <p className={styles.label}>출연자</p>
              <p className={styles.value}>{values.mask}</p>
            </div>
          </li>

          <li className={styles.infoItem}>
            <img src="/assets/detail/buliding.svg" className={styles.icon} alt="기관명 아이콘" />
            <div className={styles.textBox}>
              <p className={styles.label}>기관명</p>
              <p className={styles.value}>{values.buliding}</p>
            </div>
          </li>
        </ul>
        </div>
      )}
    </div>
  );
}
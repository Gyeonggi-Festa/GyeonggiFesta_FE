import Calendar from "react-calendar";
import styles from "./css/CalendarModal.module.css";

interface CalendarModalProps {
  onClose: () => void;
  onSelectDate: (value: Date) => void;
  onError?: (message: string) => void; // 에러 메시지 콜백 추가
  minDate?: Date; // 최소 선택 가능 날짜 (오늘 이후만 선택하려면 오늘 날짜)
  maxDate?: Date; // 최대 선택 가능 날짜 (오늘 이전만 선택하려면 오늘 날짜)
}

export default function CalendarModal({ onClose, onSelectDate, onError, minDate, maxDate }: CalendarModalProps) {
  const handleDateChange = (value: any) => {
    if (value instanceof Date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // 오늘 날짜의 시간을 00:00:00으로 설정
      const selectedDate = new Date(value);
      selectedDate.setHours(0, 0, 0, 0); // 선택한 날짜의 시간을 00:00:00으로 설정
      
      // minDate가 설정되어 있고, 선택한 날짜가 minDate보다 이전인 경우
      if (minDate) {
        const minDateNormalized = new Date(minDate);
        minDateNormalized.setHours(0, 0, 0, 0);
        if (selectedDate < minDateNormalized) {
          if (onError) {
            onError('오늘 이후의 날짜를 선택해주세요.');
          }
          return;
        }
      }
      
      // maxDate가 설정되어 있고, 선택한 날짜가 maxDate보다 이후인 경우
      if (maxDate) {
        const maxDateNormalized = new Date(maxDate);
        maxDateNormalized.setHours(0, 0, 0, 0);
        if (selectedDate > maxDateNormalized) {
          if (onError) {
            onError('오늘 날짜 이후를 선택할 수 없습니다.');
          }
          return;
        }
      }
      
      onSelectDate(value);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()} // 모달 클릭 시 닫히지 않도록
      >
        <Calendar
            onChange={handleDateChange}
            calendarType="gregory"
            prevLabel="<"
            nextLabel=">"
            formatMonthYear={(_, date) =>
                `${date.getFullYear()}년 ${date.getMonth() +1}월`
            }
            minDate={minDate} // 최소 선택 가능 날짜
            maxDate={maxDate} // 최대 선택 가능 날짜
        />

        <button className={styles.closeBtn} onClick={onClose}>
          날짜 입력하기
        </button>
      </div>
    </div>
  );
}
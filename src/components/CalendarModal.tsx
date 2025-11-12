import Calendar from "react-calendar";
import styles from "./css/CalendarModal.module.css";

interface CalendarModalProps {
  onClose: () => void;
  onSelectDate: (value: Date) => void;
}

export default function CalendarModal({ onClose, onSelectDate }: CalendarModalProps) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()} // 모달 클릭 시 닫히지 않도록
      >
        <Calendar
            onChange={(value) => {
                if (value instanceof Date) onSelectDate(value);
            }}
            calendarType="gregory"
            prevLabel="<"
            nextLabel=">"
            formatMonthYear={(_, date) =>
                `${date.getFullYear()}년 ${date.getMonth() +1}월`
            }
        />

        <button className={styles.closeBtn} onClick={onClose}>
          날짜 입력하기
        </button>
      </div>
    </div>
  );
}
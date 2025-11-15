import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import styles from './css/MeetingPotWritePage.module.css';
import CalendarModal from '../components/CalendarModal';
import "react-calendar/dist/Calendar.css";

const MAX_NAME_LENGTH = 50;
const MAX_DESC_LENGTH = 500;

const categoryList = ['전체', '교육', '행사', '전시', '공연'];

interface Event {
  eventId: number;
  title: string;
  category: string;
  startDate: string;
  endDate: string;
  mainImg: string;
}

const MeetingPotWritePage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [information, setInformation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  // 오늘 날짜를 yyyy-MM-dd 형식으로 반환
  const getTodayString = (): string => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // 날짜 유효성 검사 (오늘 이후인지 확인)
  const isValidDate = (dateStr: string): boolean => {
    if (!dateStr) return false;
    const selectedDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  };

  // 날짜 선택 핸들러
  const handleDateChange = (value: Date) => {
    const yyyy = value.getFullYear();
    const mm = String(value.getMonth() + 1).padStart(2, '0');
    const dd = String(value.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    
    if (isValidDate(dateStr)) {
      setEventDate(dateStr);
    } else {
      alert('오늘 이후의 날짜를 선택해주세요.');
      return;
    }
    setCalendarOpen(false);
  };

  // 축제 목록 불러오기
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const today = getTodayString();
        const res = await axiosInstance.get('/api/auth/user/event', {
          params: {
            startDate: today,
            endDate: '2030-12-31', // 미래 날짜까지
            page: 1,
            size: 100,
          },
        });
        const content = res.data?.data?.content ?? [];
        setEvents(content);
      } catch (error) {
        console.error('축제 목록 불러오기 실패:', error);
      }
    };
    fetchEvents();
  }, []);

  // 축제 선택 시 이름에 축제 이름 포함
  useEffect(() => {
    if (selectedEvent && !name.includes(selectedEvent.title)) {
      // 축제 이름이 포함되어 있지 않으면 추가
      if (name.trim() === '') {
        setName(`${selectedEvent.title} 같이 갈 사람~`);
      } else {
        // 이미 입력된 이름이 있으면 축제 이름을 포함하도록 안내
        setName(`${selectedEvent.title} ${name}`);
      }
    }
  }, [selectedEvent]);

  const isFormValid = name.trim() && information.trim() && selectedCategory && eventDate && isValidDate(eventDate);

  const handleSubmit = async () => {
    if (!isFormValid) {
      alert('모든 필드를 올바르게 입력해주세요.');
      return;
    }

    // 축제 이름이 포함되어 있는지 확인
    if (selectedEvent && !name.includes(selectedEvent.title)) {
      alert('채팅방 이름에 동행할 축제 이름이 포함되어야 합니다.');
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.post('/api/auth/user/companion-chatrooms', {
        name,
        information,
        category: selectedCategory === '전체' ? '' : selectedCategory,
        eventDate,
      });

      console.log('동행 채팅방 생성 성공:', response.data);
      alert('동행 모집 게시글이 등록되었습니다!');
      navigate('/meetingpot');
    } catch (error: any) {
      console.error('동행 채팅방 생성 실패:', error);
      const errorMessage = error.response?.data?.message || '게시글 등록에 실패했습니다. 다시 시도해주세요.';
      
      if (error.response?.status === 400) {
        alert('입력한 날짜가 유효하지 않습니다. 오늘 이후의 날짜를 선택해주세요.');
      } else {
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img
          src="/assets/x.svg"
          alt="닫기"
          className={styles.closeIcon}
          onClick={() => navigate('/meetingpot')}
        />
        <h2 className={styles.title}>동행 모집 글쓰기</h2>
      </div>

      <div className={styles.content}>
        <label className={styles.label}>
          동행할 축제 선택 <span className={styles.required}>*</span>
        </label>
        <div className={styles.eventSelector}>
          {selectedEvent ? (
            <div className={styles.selectedEvent}>
              <img
                src={selectedEvent.mainImg || '/assets/default-card.jpg'}
                alt={selectedEvent.title}
                className={styles.eventImage}
              />
              <div className={styles.eventInfo}>
                <p className={styles.eventTitle}>{selectedEvent.title}</p>
                <p className={styles.eventCategory}>{selectedEvent.category}</p>
              </div>
              <button
                className={styles.changeButton}
                onClick={() => setSelectedEvent(null)}
              >
                변경
              </button>
            </div>
          ) : (
            <div className={styles.eventList}>
              {events.length === 0 ? (
                <div className={styles.emptyEvent}>로딩 중...</div>
              ) : (
                events.slice(0, 5).map((event) => (
                  <div
                    key={event.eventId}
                    className={styles.eventItem}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <img
                      src={event.mainImg || '/assets/default-card.jpg'}
                      alt={event.title}
                      className={styles.eventThumbnail}
                    />
                    <div className={styles.eventItemInfo}>
                      <p className={styles.eventItemTitle}>{event.title}</p>
                      <p className={styles.eventItemCategory}>{event.category}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <label className={styles.label}>
          채팅방 이름 <span className={styles.required}>*</span>
          {selectedEvent && (
            <span className={styles.hint}>(축제 이름이 포함되어야 합니다)</span>
          )}
        </label>
        <div className={styles.inputBox}>
          <input
            type="text"
            maxLength={MAX_NAME_LENGTH}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 청춘 페스티벌 같이 갈 사람~"
          />
        </div>
        <div className={styles.charCount}>{name.length}/{MAX_NAME_LENGTH}</div>

        <label className={styles.label}>
          카테고리 <span className={styles.required}>*</span>
        </label>
        <div className={styles.categoryWrap}>
          {categoryList.filter(cat => cat !== '전체').map((cat) => (
            <button
              key={cat}
              className={`${styles.categoryBtn} ${selectedCategory === cat ? styles.selected : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <label className={styles.label}>
          동행 일정 <span className={styles.required}>*</span>
        </label>
        <div className={styles.dateInputBox} onClick={() => setCalendarOpen(true)}>
          <input
            type="text"
            value={eventDate ? eventDate.replace(/-/g, '.') : ''}
            placeholder="날짜를 선택해주세요"
            readOnly
          />
          <img src="/assets/arrow.svg" alt="달력" className={styles.calendarIcon} />
        </div>
        {eventDate && !isValidDate(eventDate) && (
          <p className={styles.errorText}>오늘 이후의 날짜를 선택해주세요.</p>
        )}

        <label className={styles.label}>
          채팅방 소개 <span className={styles.required}>*</span>
        </label>
        <textarea
          className={styles.textarea}
          maxLength={MAX_DESC_LENGTH}
          value={information}
          onChange={(e) => setInformation(e.target.value)}
          placeholder="예: 20대만! 같이 공연 보고 밥 먹어요"
        />
        <div className={styles.charCount}>{information.length}/{MAX_DESC_LENGTH}</div>

        <button
          className={`${styles.submitBtn} ${isFormValid ? styles.active : ''}`}
          disabled={!isFormValid || loading}
          onClick={handleSubmit}
        >
          {loading ? '등록 중...' : '등록하기'}
        </button>
      </div>

      {calendarOpen && (
        <CalendarModal
          onClose={() => setCalendarOpen(false)}
          onSelectDate={handleDateChange}
        />
      )}
    </div>
  );
};

export default MeetingPotWritePage;


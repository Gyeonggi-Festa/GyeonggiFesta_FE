import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import styles from './css/MeetingPotWritePage.module.css';
import CalendarModal from '../components/CalendarModal';
import "react-calendar/dist/Calendar.css";

const MAX_TITLE_LENGTH = 100;
const MAX_CONTENT_LENGTH = 500;

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
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [visitDates, setVisitDates] = useState<string[]>([]);
  const [recruitmentTotal, setRecruitmentTotal] = useState<number>(1);
  const [recruitmentPeriodDays, setRecruitmentPeriodDays] = useState<number>(7);
  const [preferredGender, setPreferredGender] = useState<'ANY' | 'MALE' | 'FEMALE'>('ANY');
  const [preferredMinAge, setPreferredMinAge] = useState<number | null>(null);
  const [preferredMaxAge, setPreferredMaxAge] = useState<number | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  // 날짜 유효성 검사 (오늘 이후인지 확인)
  const isValidDate = (dateStr: string): boolean => {
    if (!dateStr) return false;
    const selectedDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  };

  // 날짜 포맷팅 (yyyy-MM-dd -> yyyy.MM.dd)
  const formatDateDisplay = (dateStr: string): string => {
    return dateStr.replace(/-/g, '.');
  };

  // 날짜 선택 핸들러 (여러 날짜 선택 가능)
  const handleDateChange = (value: Date) => {
    const yyyy = value.getFullYear();
    const mm = String(value.getMonth() + 1).padStart(2, '0');
    const dd = String(value.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    
    if (!isValidDate(dateStr)) {
      alert('오늘 이후의 날짜를 선택해주세요.');
      return;
    }

    // 이미 선택된 날짜면 제거, 아니면 추가
    if (visitDates.includes(dateStr)) {
      setVisitDates(visitDates.filter(d => d !== dateStr));
    } else {
      setVisitDates([...visitDates, dateStr].sort());
    }
  };

  // 날짜 제거 핸들러
  const handleRemoveDate = (dateStr: string) => {
    setVisitDates(visitDates.filter(d => d !== dateStr));
  };

  // 축제 목록 불러오기 (전체 축제)
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axiosInstance.get('/api/auth/user/event', {
          params: {
            page: 1,
            size: 1000, // 전체 축제를 불러오기 위해 크게 설정
          },
        });
        const content = res.data?.data?.content ?? [];
        setEvents(content);
        console.log('전체 축제 목록:', content);
      } catch (error) {
        console.error('축제 목록 불러오기 실패:', error);
      }
    };
    fetchEvents();
  }, []);

  // 축제 선택 시 제목에 축제 이름 포함
  useEffect(() => {
    if (selectedEvent && !title.includes(selectedEvent.title)) {
      if (title.trim() === '') {
        setTitle(`${selectedEvent.title} 동행 구합니다`);
      }
    }
  }, [selectedEvent]);

  const isFormValid = 
    selectedEvent !== null &&
    title.trim() !== '' &&
    content.trim() !== '' &&
    visitDates.length > 0 &&
    recruitmentTotal > 0 &&
    recruitmentPeriodDays > 0;

  const handleSubmit = async () => {
    if (!isFormValid) {
      alert('모든 필수 항목을 올바르게 입력해주세요.');
      return;
    }

    if (!selectedEvent) {
      alert('동행할 축제를 선택해주세요.');
      return;
    }

    if (visitDates.length === 0) {
      alert('방문 예정일을 최소 1개 이상 선택해주세요.');
      return;
    }

    try {
      setLoading(true);

      // 1. 게시글 생성
      const postData: any = {
        eventId: selectedEvent.eventId,
        title,
        content,
        keyList: [],
        visitDates,
        recruitmentTotal,
        recruitmentPeriodDays,
        preferredGender,
      };

      // null이 아닌 경우에만 추가
      if (preferredMinAge !== null) {
        postData.preferredMinAge = preferredMinAge;
      }
      if (preferredMaxAge !== null) {
        postData.preferredMaxAge = preferredMaxAge;
      }

      const postResponse = await axiosInstance.post('/api/auth/user/posts', postData);

      console.log('동행 게시글 등록 성공:', postResponse.data);
      
      // 게시글 ID 추출
      const createdPostId = postResponse.data?.data?.postId || postResponse.data?.postId;
      if (!createdPostId) {
        console.error('게시글 ID를 받지 못했습니다.');
      }

      // 2. 채팅방 생성 (visitDates의 첫 번째 날짜 사용)
      const eventDate = visitDates[0]; // 첫 번째 방문 예정일을 채팅방 날짜로 사용
      
      // 채팅방 이름에 축제 이름이 포함되도록 확인
      let chatRoomName = title;
      if (!chatRoomName.includes(selectedEvent.title)) {
        chatRoomName = `${selectedEvent.title} ${chatRoomName}`;
      }
      
      // 채팅방 이름이 30자를 초과하면 축제 이름 + 간단한 설명으로 변경
      if (chatRoomName.length > 30) {
        chatRoomName = `${selectedEvent.title} 같이 갈 사람~`;
      }

      try {
        const chatResponse = await axiosInstance.post('/api/auth/user/companion-chatrooms', {
          name: chatRoomName,
          information: content.length > 100 ? content.substring(0, 100) + '...' : content,
          category: selectedEvent.category,
          eventDate: eventDate,
          createdFrom: 'POST',
          createdFromId: createdPostId,
        });

        console.log('채팅방 생성 성공:', chatResponse.data);
        alert('동행 모집 게시글이 등록되었고, 단체 채팅방이 생성되었습니다!');
      } catch (chatError: any) {
        console.error('채팅방 생성 실패:', chatError);
        // 채팅방 생성 실패해도 게시글은 등록되었으므로 경고만 표시
        const chatErrorMessage = chatError.response?.data?.message || '채팅방 생성에 실패했습니다.';
        alert(`게시글은 등록되었지만 채팅방 생성에 실패했습니다: ${chatErrorMessage}`);
      }

      navigate('/meetingpot');
    } catch (error: any) {
      console.error('동행 게시글 등록 실패:', error);
      const errorMessage = error.response?.data?.message || '게시글 등록에 실패했습니다. 다시 시도해주세요.';
      alert(errorMessage);
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
          제목 <span className={styles.required}>*</span>
        </label>
        <div className={styles.inputBox}>
          <input
            type="text"
            maxLength={MAX_TITLE_LENGTH}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 경기 페스타 동행 구합니다"
          />
        </div>
        <div className={styles.charCount}>{title.length}/{MAX_TITLE_LENGTH}</div>

        <label className={styles.label}>
          내용 <span className={styles.required}>*</span>
        </label>
        <textarea
          className={styles.textarea}
          maxLength={MAX_CONTENT_LENGTH}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="예: 주말 일정으로 함께하실 분!"
        />
        <div className={styles.charCount}>{content.length}/{MAX_CONTENT_LENGTH}</div>

        <label className={styles.label}>
          방문 예정일 <span className={styles.required}>*</span>
        </label>
        <div className={styles.dateInputBox} onClick={() => setCalendarOpen(true)}>
          <input
            type="text"
            value={visitDates.length > 0 ? `${visitDates.length}개 선택됨` : '날짜를 선택해주세요'}
            placeholder="날짜를 선택해주세요"
            readOnly
          />
          <img src="/assets/arrow.svg" alt="달력" className={styles.calendarIcon} />
        </div>
        {visitDates.length > 0 && (
          <div className={styles.selectedDates}>
            {visitDates.map((date) => (
              <div key={date} className={styles.dateTag}>
                <span>{formatDateDisplay(date)}</span>
                <button
                  className={styles.removeDateBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveDate(date);
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <label className={styles.label}>
          모집 인원 <span className={styles.required}>*</span>
        </label>
        <div className={styles.numberInputWrapper}>
          <button
            type="button"
            className={styles.numberButton}
            onClick={() => setRecruitmentTotal(Math.max(1, recruitmentTotal - 1))}
            disabled={recruitmentTotal <= 1}
          >
            −
          </button>
          <input
            type="number"
            min="1"
            value={recruitmentTotal}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 1;
              setRecruitmentTotal(Math.max(1, value));
            }}
            className={styles.numberInput}
            readOnly
          />
          <button
            type="button"
            className={styles.numberButton}
            onClick={() => setRecruitmentTotal(recruitmentTotal + 1)}
          >
            +
          </button>
        </div>

        <label className={styles.label}>
          모집 기간 (일) <span className={styles.required}>*</span>
        </label>
        <div className={styles.numberInputWrapper}>
          <button
            type="button"
            className={styles.numberButton}
            onClick={() => setRecruitmentPeriodDays(Math.max(1, recruitmentPeriodDays - 1))}
            disabled={recruitmentPeriodDays <= 1}
          >
            −
          </button>
          <input
            type="number"
            min="1"
            value={recruitmentPeriodDays}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 1;
              setRecruitmentPeriodDays(Math.max(1, value));
            }}
            className={styles.numberInput}
            readOnly
          />
          <button
            type="button"
            className={styles.numberButton}
            onClick={() => setRecruitmentPeriodDays(recruitmentPeriodDays + 1)}
          >
            +
          </button>
        </div>

        <label className={styles.label}>
          선호 성별 <span className={styles.optional}>(선택)</span>
        </label>
        <div className={styles.genderWrap}>
          <button
            className={`${styles.genderBtn} ${preferredGender === 'ANY' ? styles.selected : ''}`}
            onClick={() => setPreferredGender('ANY')}
          >
            성별 무관
          </button>
          <button
            className={`${styles.genderBtn} ${preferredGender === 'MALE' ? styles.selected : ''}`}
            onClick={() => setPreferredGender('MALE')}
          >
            남성
          </button>
          <button
            className={`${styles.genderBtn} ${preferredGender === 'FEMALE' ? styles.selected : ''}`}
            onClick={() => setPreferredGender('FEMALE')}
          >
            여성
          </button>
        </div>

        <label className={styles.label}>
          선호 연령 <span className={styles.optional}>(선택)</span>
        </label>
        <div className={styles.ageWrap}>
          <div className={styles.ageInputGroup}>
            <input
              type="number"
              min="0"
              max="100"
              value={preferredMinAge || ''}
              onChange={(e) => setPreferredMinAge(e.target.value ? parseInt(e.target.value) : null)}
              placeholder="최소"
              className={styles.ageInput}
            />
            <span className={styles.ageSeparator}>~</span>
            <input
              type="number"
              min="0"
              max="100"
              value={preferredMaxAge || ''}
              onChange={(e) => setPreferredMaxAge(e.target.value ? parseInt(e.target.value) : null)}
              placeholder="최대"
              className={styles.ageInput}
            />
            <span className={styles.ageUnit}>세</span>
          </div>
          <button
            className={styles.clearAgeBtn}
            onClick={() => {
              setPreferredMinAge(null);
              setPreferredMaxAge(null);
            }}
          >
            초기화
          </button>
        </div>

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

      {/* 로딩 오버레이 */}
      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingContent}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingText}>게시글과 채팅방을 생성하는 중...</p>
            <p className={styles.loadingSubtext}>잠시만 기다려주세요</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingPotWritePage;

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
  const [eventSearchKeyword, setEventSearchKeyword] = useState('');

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

    // 이미 선택된 날짜면 제거, 아니면 추가
    if (visitDates.includes(dateStr)) {
      setVisitDates(visitDates.filter(d => d !== dateStr));
    } else {
      setVisitDates([...visitDates, dateStr].sort());
    }
  };

  // 날짜 선택 에러 핸들러
  const handleDateError = (message: string) => {
    alert(message);
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

  // 축제 목록 필터링 (검색어 기준)
  const filteredEvents = events.filter(event => {
    if (!eventSearchKeyword.trim()) return true;
    const keyword = eventSearchKeyword.toLowerCase();
    return (
      event.title.toLowerCase().includes(keyword) ||
      (event.category && event.category.toLowerCase().includes(keyword))
    );
  });

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

    let postData: any = null;
    
    try {
      setLoading(true);

      // 1. 게시글 생성
      postData = {
        eventId: selectedEvent.eventId,
        title: title.trim(),
        content: content.trim(),
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

      // 데이터 유효성 검사
      if (!postData.title || postData.title.length === 0) {
        alert('제목을 입력해주세요.');
        setLoading(false);
        return;
      }
      if (!postData.content || postData.content.length === 0) {
        alert('내용을 입력해주세요.');
        setLoading(false);
        return;
      }
      if (!postData.visitDates || postData.visitDates.length === 0) {
        alert('방문 예정일을 최소 1개 이상 선택해주세요.');
        setLoading(false);
        return;
      }
      if (!postData.eventId) {
        alert('축제를 선택해주세요.');
        setLoading(false);
        return;
      }

      console.log('게시글 생성 요청 데이터:', postData);
      const postResponse = await axiosInstance.post('/api/auth/user/posts', postData);

      console.log('동행 게시글 등록 성공:', postResponse.data);
      
      // API가 postId를 반환하지 않으므로, 작성한 게시글을 찾기 위해 게시글 목록 조회
      let createdPostId: number | null = null;
      
      // 게시글이 DB에 저장되는 시간을 고려하여 재시도 로직 추가
      const findCreatedPost = async (retryCount = 0, maxRetries = 3): Promise<number | null> => {
        try {
          // 첫 시도가 아니면 잠시 대기 (500ms씩 증가)
          if (retryCount > 0) {
            await new Promise(resolve => setTimeout(resolve, 500 * retryCount));
            console.log(`게시글 찾기 재시도 ${retryCount}/${maxRetries}...`);
          }
          
          const postsListResponse = await axiosInstance.get('/api/auth/user/posts');
          console.log('게시글 목록 조회 응답:', postsListResponse.data);
          
          const postsList = postsListResponse.data?.data?.content || postsListResponse.data?.content || [];
          console.log('게시글 목록 개수:', postsList.length);
          
          // 제목과 내용이 일치하는 게시글 찾기
          const matchedPost = postsList.find((p: any) => 
            p.title === title.trim() && 
            p.content === content.trim() &&
            p.eventId === selectedEvent.eventId
          );
          
          if (matchedPost) {
            console.log('✅ 생성된 게시글 ID 찾음:', matchedPost.postId);
            return matchedPost.postId;
          }
          
          // 제목으로만 찾기 (내용이 잘리거나 수정될 수 있으므로)
          const titleMatchedPost = postsList.find((p: any) => 
            p.title === title.trim() && 
            p.eventId === selectedEvent.eventId
          );
          
          if (titleMatchedPost) {
            console.log('✅ 생성된 게시글 ID 찾음 (제목 매칭):', titleMatchedPost.postId);
            return titleMatchedPost.postId;
          }
          
          // 재시도
          if (retryCount < maxRetries) {
            return await findCreatedPost(retryCount + 1, maxRetries);
          }
          
          console.error('생성된 게시글을 찾을 수 없습니다.');
          console.error('찾으려는 게시글 정보:', { title: title.trim(), eventId: selectedEvent.eventId });
          console.error('현재 게시글 목록 (최근 3개):', postsList.slice(0, 3));
          return null;
        } catch (listError) {
          console.error('게시글 목록 조회 실패:', listError);
          if (retryCount < maxRetries) {
            return await findCreatedPost(retryCount + 1, maxRetries);
          }
          return null;
        }
      };
      
      createdPostId = await findCreatedPost();

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

      // createdPostId가 있을 때만 채팅방 생성
      if (createdPostId) {
        try {
          // category가 없거나 빈 문자열인 경우 기본값 설정
          const category = selectedEvent.category || '기타';
          
          const chatResponse = await axiosInstance.post('/api/auth/user/companion-chatrooms', {
            name: chatRoomName,
            information: content.length > 100 ? content.substring(0, 100) + '...' : content,
            category: category,
            eventDate: eventDate,
            createdFrom: 'POST',
            createdFromId: createdPostId,
          });

          console.log('채팅방 생성 성공:', chatResponse.data);
          alert('동행 모집 게시글이 등록되었고, 단체 채팅방이 생성되었습니다!');
        } catch (chatError: any) {
          console.error('채팅방 생성 실패:', chatError);
          console.error('채팅방 생성 실패 상세:', chatError.response?.data);
          // 채팅방 생성 실패해도 게시글은 등록되었으므로 경고만 표시
          const chatErrorMessage = chatError.response?.data?.message || '채팅방 생성에 실패했습니다.';
          alert(`게시글은 등록되었지만 채팅방 생성에 실패했습니다: ${chatErrorMessage}`);
        }
      } else {
        console.error('게시글 ID를 찾을 수 없어 채팅방을 생성하지 못했습니다.');
        alert('게시글은 등록되었지만 채팅방 생성에 실패했습니다. (게시글 ID를 찾을 수 없음)');
      }

      navigate('/meetingpot');
    } catch (error: any) {
      console.error('동행 게시글 등록 실패:', error);
      console.error('에러 응답 상세:', error.response?.data);
      console.error('요청 데이터:', postData);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || '게시글 등록에 실패했습니다. 다시 시도해주세요.';
      alert(`게시글 등록 실패: ${errorMessage}`);
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
            <div className={styles.eventSelectorContainer}>
              {/* 축제 검색 입력 */}
              <div className={styles.eventSearchBox}>
                <input
                  type="text"
                  placeholder="축제 이름 또는 카테고리로 검색..."
                  value={eventSearchKeyword}
                  onChange={(e) => setEventSearchKeyword(e.target.value)}
                  className={styles.eventSearchInput}
                />
              </div>
              
              {/* 축제 목록 (스크롤 가능) */}
              <div className={styles.eventList}>
                {events.length === 0 ? (
                  <div className={styles.emptyEvent}>로딩 중...</div>
                ) : filteredEvents.length === 0 ? (
                  <div className={styles.emptyEvent}>검색 결과가 없습니다.</div>
                ) : (
                  filteredEvents.map((event) => (
                    <div
                      key={event.eventId}
                      className={styles.eventItem}
                      onClick={() => {
                        // 축제 데이터 검증
                        if (!event.eventId) {
                          alert('유효하지 않은 축제입니다.');
                          return;
                        }
                        if (!event.title || event.title.trim() === '') {
                          alert('축제 제목이 없습니다.');
                          return;
                        }
                        console.log('선택된 축제:', event);
                        setSelectedEvent(event);
                      }}
                    >
                      <img
                        src={event.mainImg || '/assets/default-card.jpg'}
                        alt={event.title}
                        className={styles.eventThumbnail}
                      />
                      <div className={styles.eventItemInfo}>
                        <p className={styles.eventItemTitle}>{event.title}</p>
                        <p className={styles.eventItemCategory}>{event.category || '기타'}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
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
            placeholder="축제를 선택하면 자동으로 생성됩니다"
            readOnly
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
          onError={handleDateError}
          minDate={new Date()} // 오늘 이후만 선택 가능 (동행모집 글쓰기)
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

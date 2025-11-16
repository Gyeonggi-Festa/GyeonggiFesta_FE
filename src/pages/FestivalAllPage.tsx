import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import CalendarModal from '../components/CalendarModal';
import EventCard from '../components/EventCard';
import axiosInstance from '../api/axiosInstance';
import styles from './css/FestivalAllPage.module.css';
import { DAYS_KR, getWeekDays } from '../utils/alldateUtils';
import BottomNav from '../components/BottomNav';

interface EventType {
    eventId: number;
    category: string;
    title: string;
    isFree: string;
    startDate: string;
    endDate: string;
    mainImg: string;
  }
  const categories = [
    '전체', '교육', '행사', '전시', '공연'
  ];


export default function FestivalAllPage() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [events, setEvents] = useState<EventType[]>([]);
  const weekDates = getWeekDays(selectedDate); // 월~일 등 일주일치
  const [selectedCategory, setSelectedCategory] = useState(
    categoryParam && categories.includes(categoryParam) ? categoryParam : '전체'
  );
  
  const [showSearch, setShowSearch] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const filteredEvents = (events || []).filter((event) => {
    // 카테고리 필터
    const categoryMatch = selectedCategory === '전체' || event.category === selectedCategory;
    
    // 검색 키워드 필터 (안전하게 처리)
    const keywordMatch = searchKeyword === '' || 
      (event.title && event.title.toString().toLowerCase().includes(searchKeyword.toLowerCase()));
    
    return categoryMatch && keywordMatch;
  });

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axiosInstance.get('/api/auth/user/event', {
          params: {
            startDate: formatDate(selectedDate),
            endDate: formatDate(selectedDate),
            page: 1,
            size: 2000,
          },
        });
        // 안전하게 배열 처리
        const eventsData = res.data?.data?.content;
        setEvents(Array.isArray(eventsData) ? eventsData : []);
      } catch (err) {
        console.error('행사 불러오기 실패:', err);
        setEvents([]); // 에러 발생 시 빈 배열로 설정
      }
    };
    fetchEvents();
  }, [selectedDate]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <img src="/assets/slash.svg" alt="뒤로가기" onClick={() => window.history.back()} />
        <span className={styles.monthText}>
            {selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일
            <img src="/assets/below.svg" alt="날짜 선택" onClick={() => setCalendarOpen(true)} />
        </span>

        <div className={styles["search-area"]}>
            <button
                onClick={() => {
                if (showSearch) setSearchKeyword('');
                setShowSearch(prev => !prev);
                }}
                className={styles["search-toggle"]}
            >
                {showSearch ? '취소' : <img src="/assets/search.svg" alt="검색" />}
            </button>
            </div>

            
      </div>
      {showSearch && (
                <input
                    type="text"
                    placeholder="관심사 혹은 키워드를 입력하세요"
                    className={styles["search-input"]}
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                />
            )}

      <div className={styles.dateSelector}>
                {weekDates.map((date) => {
                    const isSelected = date.toDateString() === selectedDate.toDateString();
                    return (
                    <button
                        key={date.toDateString()}
                        className={`${styles.dateButton} ${isSelected ? styles.selected : ''}`}
                        onClick={() => setSelectedDate(date)}
                    >
                        <div className={styles.dayLabel}>{DAYS_KR[date.getDay()]}</div>
                        <div className={styles.dateLabel}>{date.getDate()}</div>
                    </button>
                    );
                })}
        </div>
            <div className={styles.categorySection}>
        <div className={styles.categoryTitle}>카테고리</div>
        <div className={styles.categoryTabs}>
            {categories.map((cat) => (
            <button
                key={cat}
                className={`${styles.categoryTab} ${selectedCategory === cat ? styles.activeTab : ''}`}
                onClick={() => setSelectedCategory(cat)}
            >
                {cat}
            </button>
            ))}
        </div>
        </div>

      

      <div className={styles.cardList}>
      {filteredEvents.map((event) => (
        <EventCard
            key={event.eventId}
            category={event.category}
            title={event.title}
            location={event.isFree === "Y" ? "무료" : "유료"}
            dateRange={`${event.startDate} ~ ${event.endDate}`}
            mainImg={event.mainImg}
            eventId={event.eventId}
            onClick={() => {
            window.location.href = `/fest/detail?eventId=${event.eventId}`;
            }}
        />
        ))}

      </div>

      {calendarOpen && (
        <CalendarModal
          onClose={() => setCalendarOpen(false)}
          onSelectDate={(date) => {
            setSelectedDate(date);
            setCalendarOpen(false);
          }}
        />
      )}
      <BottomNav/>
    </div>
  );
}
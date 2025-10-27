// ../utils/dateUtils.ts

export const DAYS_KR = ['일', '월', '화', '수', '목', '금', '토'];

// 오늘 기준으로 -2일부터 +4일까지 일주일 날짜 배열 반환
export const getWeekDays = (today: Date): Date[] => {
  const dates: Date[] = [];
  for (let i = -3; i <= 3; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }
  return dates;
};

// 날짜가 주어진 시작~종료 범위 안에 있는지 확인
export const isDateInRange = (date: Date, startStr: string, endStr: string): boolean => {
  const start = new Date(startStr);
  const end = new Date(endStr);

  const target = new Date(date.toDateString());
  const startDate = new Date(start.toDateString());
  const endDate = new Date(end.toDateString());

  return target >= startDate && target <= endDate;
};

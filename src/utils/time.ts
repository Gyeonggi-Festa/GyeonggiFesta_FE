// 상대 시간 계산 유틸 함수
export const getRelativeTime = (input: string): string => {
    const now = new Date();
    const past = new Date(input);
    const diff = Math.floor((now.getTime() - past.getTime()) / 1000); // 초 차이
  
    if (isNaN(past.getTime())) return input; // 파싱 실패 시 원래 문자열 반환
  
    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    if (diff < 172800) return '어제';
    return past.toLocaleDateString('ko-KR'); // ex. 2025. 5. 1.
  };
  
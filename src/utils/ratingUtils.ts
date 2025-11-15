// src/utils/ratingUtils.ts

/**
 * eventId를 기반으로 1.0~5.0 사이의 일관된 랜덤 rating 생성
 * 같은 eventId는 항상 같은 rating을 반환
 */
export const generateRating = (eventId: number): number => {
  // eventId를 시드로 사용하여 일관된 랜덤 값 생성
  const seed = eventId * 9301 + 49297; // 간단한 해시 함수
  const normalized = (seed % 400) / 100; // 0.0 ~ 3.99 범위
  const rating = 1.0 + normalized; // 1.0 ~ 4.99 범위
  return Math.round(rating * 10) / 10; // 소수점 첫째 자리까지 반올림
};

/**
 * rating이 없을 때 사용할 기본 rating 생성
 */
export const getRating = (eventId: number, rating?: number | null): number => {
  if (rating !== undefined && rating !== null) {
    return rating;
  }
  return generateRating(eventId);
};


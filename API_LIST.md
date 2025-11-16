# API 목록 및 사용 목적

## 이벤트/축제 관련 API

### GET `/api/auth/user/event`
- **사용 위치**: MainpageLogin.tsx, AIRecommendPage.tsx, MainTopCard.tsx, FestivalAllPage.tsx, UpcomingEvents.tsx, MeetingPotWritePage.tsx, PopularPage.tsx
- **목적**: 날짜별/인기순/전체 축제 목록 조회

### GET `/api/auth/user/event/recommend`
- **사용 위치**: AIRecommendPage.tsx, MainTopCard.tsx
- **목적**: AI 추천 축제 목록 조회

### GET `/api/auth/user/event/${eventId}`
- **사용 위치**: FestivalDetail.tsx
- **목적**: 특정 축제 상세 정보 조회

### GET `/api/auth/user/event/favorite`
- **사용 위치**: ScrapEventsPage.tsx
- **목적**: 사용자가 스크랩한 축제 목록 조회

### GET `/api/auth/user/event/likes`
- **사용 위치**: LikedEventsPage.tsx
- **목적**: 사용자가 좋아요한 축제 목록 조회

### POST `/api/auth/user/event/like/${eventId}`
- **사용 위치**: FestivalDetail.tsx, FestivalCard.tsx
- **목적**: 축제 좋아요 추가

### DELETE `/api/auth/user/event/like/${eventId}`
- **사용 위치**: FestivalDetail.tsx, FestivalCard.tsx
- **목적**: 축제 좋아요 취소

### POST `/api/auth/user/event/favorite/${eventId}`
- **사용 위치**: FestivalDetail.tsx
- **목적**: 축제 스크랩 추가

### DELETE `/api/auth/user/event/favorite/${eventId}`
- **사용 위치**: FestivalDetail.tsx
- **목적**: 축제 스크랩 취소

## 게시글/동행 모집 관련 API

### GET `/api/auth/user/posts`
- **사용 위치**: MeetingPotPage.tsx
- **목적**: 동행 모집 게시글 목록 조회

### GET `/api/auth/user/posts/${postId}`
- **사용 위치**: MeetingPotDetailPage.tsx, ChatList.tsx
- **목적**: 동행 모집 게시글 상세 정보 조회

### POST `/api/auth/user/posts`
- **사용 위치**: MeetingPotWritePage.tsx
- **목적**: 동행 모집 게시글 생성

## 채팅방 관련 API

### GET `/api/auth/user/my-chatrooms`
- **사용 위치**: ChatList.tsx, MeetingPotDetailPage.tsx
- **목적**: 사용자가 참여한 채팅방 목록 조회

### GET `/api/auth/user/chatrooms`
- **사용 위치**: ChatList.tsx
- **목적**: 전체 단체 채팅방 목록 조회

### GET `/api/auth/user/chatrooms/${roomId}/owner`
- **사용 위치**: ChatRoom.tsx
- **목적**: 채팅방 방장 여부 확인

### GET `/api/auth/user/chat/rooms/${roomId}/messages`
- **사용 위치**: ChatRoom.tsx
- **목적**: 채팅방 메시지 목록 조회

### POST `/api/auth/user/chatrooms`
- **사용 위치**: CommentSection.tsx, CreateGroupChat.tsx
- **목적**: 일반 채팅방 또는 단체 채팅방 생성

### POST `/api/auth/user/companion-chatrooms`
- **사용 위치**: MeetingPotWritePage.tsx
- **목적**: 동행 모집 게시글 연동 채팅방 생성

### POST `/api/auth/user/chatrooms/${chatRoomId}/join`
- **사용 위치**: GroupChatItem.tsx, MeetingPotDetailPage.tsx
- **목적**: 채팅방 참여

### POST `/api/auth/user/chatrooms/invite`
- **사용 위치**: CommentSection.tsx
- **목적**: 채팅방에 사용자 초대

### PATCH `/api/auth/user/chatrooms/name`
- **사용 위치**: ChatRoom.tsx
- **목적**: 채팅방 이름 수정

### DELETE `/api/auth/user/chatrooms/${roomId}`
- **사용 위치**: ChatRoom.tsx
- **목적**: 채팅방 삭제 (방장만 가능)

### DELETE `/api/auth/user/chatrooms/${roomId}/exit`
- **사용 위치**: ChatRoom.tsx
- **목적**: 채팅방 나가기

## 리뷰 관련 API

### GET `/api/auth/user/events/${eventId}/reviews`
- **사용 위치**: ReviewPage.tsx
- **목적**: 특정 축제의 리뷰 목록 조회

### GET `/api/auth/user/my-reviews`
- **사용 위치**: MyReviewPage.tsx
- **목적**: 사용자가 작성한 리뷰 목록 조회

### POST `/api/auth/user/reviews`
- **사용 위치**: ReviewWritePage.tsx
- **목적**: 리뷰 작성

### DELETE `/api/auth/user/reviews/${reviewId}`
- **사용 위치**: ReviewItem.tsx
- **목적**: 리뷰 삭제

### GET `/api/auth/user/event/comment`
- **사용 위치**: ReviewSection.tsx, CommentSection.tsx
- **목적**: 축제 댓글 목록 조회

### POST `/api/auth/user/event/comment`
- **사용 위치**: CommentModal.tsx
- **목적**: 축제 댓글 작성

## 사용자 정보 관련 API

### GET `/api/auth/user/info`
- **사용 위치**: MyPage.tsx, EditProfilePage.tsx, AuthRedirect.tsx
- **목적**: 사용자 정보 조회

### PATCH `/api/auth/user/feature`
- **사용 위치**: EditProfilePage.tsx
- **목적**: 사용자 프로필 정보 수정

### DELETE `/api/auth/user/exit`
- **사용 위치**: DeleteAccountPage.tsx
- **목적**: 회원 탈퇴

## 인증 관련 API

### GET `/api/auth/all-user/email/${email}`
- **사용 위치**: RegisterPage.tsx
- **목적**: 이메일 중복 확인

### POST `/api/auth/semi/feature`
- **사용 위치**: RegisterPage.tsx
- **목적**: 회원가입 (추가 정보 입력)

## 파일 업로드 관련 API

### GET `/api/auth/user/post/presigned`
- **사용 위치**: ReviewWritePage.tsx
- **목적**: S3 프리사인드 URL 발급 (이미지 업로드용)

## 주차장 관련 API

### GET `/api/auth/user/parking/map/${city}`
- **사용 위치**: ParkingMap.tsx
- **목적**: 도시별 주차장 지도 정보 조회

### GET `/api/auth/user/parking/detail/${city}/${parkingId}`
- **사용 위치**: ParkingMap.tsx
- **목적**: 특정 주차장 상세 정보 조회


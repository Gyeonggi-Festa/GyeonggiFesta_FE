## 📌 Summary
ex) 
회원 탈퇴 페이지의 UI를 구현하고 실제 탈퇴 기능을 API와 연동했습니다.
## 🔍 Key Changes
ex)
**탈퇴 UI 구현**: 사용자가 탈퇴 전 안내사항을 확인하고 사유를 입력할 수 있는 UI를 구성했습니다.
**API 연동**: axiosInstance를 사용하여 탈퇴 요청을 보내고, 성공 시 토큰 삭제 및 페이지 이동 처리를 추가했습니다.
**UX 개선**: 탈퇴 버튼 클릭 시 window.confirm으로 재확인을 받고, 처리 중 중복 클릭 방지(Loading state)를 적용했습니다.

## 📎 References
ex)
이슈 번호: #4

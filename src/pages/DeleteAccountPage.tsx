import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import styles from './css/DeleteAccountPage.module.css';
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

const DeleteAccountPage: React.FC = () => {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!window.confirm("정말로 계정을 삭제하시겠습니까?\n삭제 후 복구가 불가능합니다.")) {
      return;
    }

    setIsLoading(true);

    try {
      // 디버깅: 요청 정보 출력
      const token = localStorage.getItem('access_token');
      console.log('🔍 탈퇴 요청 시작');
      console.log('📍 엔드포인트:', 'https://api.gyeonggifesta.site/api/auth/user/withdraw');
      console.log('🔑 토큰 존재 여부:', !!token);
      console.log('📝 탈퇴 사유:', reason || '없음');

      // DELETE 메소드로 요청
      const response = await axiosInstance.delete('/api/auth/user/withdraw', {
        data: reason ? { reason } : undefined,
      });

      console.log('✅ 탈퇴 응답 성공:', response);

      // API 응답 구조에 맞게 확인: { "code": "GEN-000", "status": 200 }
      if (response.status === 200 && response.data?.code === 'GEN-000') {
        alert('계정이 성공적으로 삭제되었습니다.');
        // 토큰 제거
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        // 메인 페이지로 이동
        navigate('/', { replace: true });
      } else {
        alert('탈퇴 처리에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error: any) {
      console.error('❌ 탈퇴 요청 실패:', error);
      console.error('📍 요청 URL:', error.config?.url);
      console.error('📍 전체 URL:', error.config?.baseURL + error.config?.url);
      console.error('🔧 요청 메서드:', error.config?.method);
      console.error('📦 요청 데이터:', error.config?.data);
      console.error('🔑 요청 헤더:', error.config?.headers);
      console.error('📥 응답 상태:', error.response?.status);
      console.error('📥 응답 데이터:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || '서버 오류로 탈퇴에 실패했습니다.';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <PageHeader title="탈퇴하기" />

      <div className={styles.content}>
        <p className={styles.sorry}>
          서비스에 만족을 드리지 못해<br />
          대단히 죄송합니다.
        </p>

        <p className={styles.request}>
          탈퇴 사유를 남겨 주시면 서비스 개선에<br />
          더욱 힘쓰겠습니다.
        </p>

        <div className={styles.noticeSection}>
          <p className={styles.noticeTitle}>탈퇴 전 꼭 읽어주세요.</p>
          <ul className={styles.noticeList}>
            <li>탈퇴 후 7일간 재가입이 불가능합니다.</li>
            <li>탈퇴 시 계정의 모든 정보는 삭제되며 재가입 시에도 복구되지 않습니다.</li>
          </ul>
        </div>

        <textarea
          className={styles.reasonInput}
          placeholder="탈퇴 사유를 입력해주세요 (선택)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={500}
        />

        <button
          className={styles.deleteButton}
          onClick={handleDelete}
          disabled={isLoading}
        >
          {isLoading ? '처리 중...' : '계정 삭제하기'}
        </button>
      </div>
    </div>
  );
};

export default DeleteAccountPage;

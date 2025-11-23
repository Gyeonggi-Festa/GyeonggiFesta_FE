import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './css/LoginFailedPage.module.css';

const LoginFailedPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 모든 인증 관련 데이터 제거
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('member_id');
    localStorage.removeItem('verify_id');
  }, []);

  const handleRetry = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          <span className={styles.icon}>⚠️</span>
        </div>
        
        <h1 className={styles.title}>로그인에 실패했습니다</h1>
        
        <p className={styles.message}>
          카카오 로그인 처리 중 문제가 발생했습니다.<br />
          다시 시도해주세요.
        </p>

        <button 
          className={styles.retryButton}
          onClick={handleRetry}
        >
          다시 로그인하기
        </button>
      </div>
    </div>
  );
};

export default LoginFailedPage;


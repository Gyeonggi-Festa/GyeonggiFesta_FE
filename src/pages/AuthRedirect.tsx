import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthRedirect = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      alert('인가 코드가 없습니다.');
      navigate('/');
      return;
    }

    const exchangeCodeForToken = async () => {
      try {
        const response = await axios.post(
          `https://13.125.224.67.nip.io/api/token/exchange?code=${code}`,
          null,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const { accessToken, refreshToken, role, verifyId } = response.data.data;
        console.log('User role:', role);

        // 토큰 저장
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        localStorage.setItem('verify_id', verifyId);

        // 역할에 따라 이동
        if (role === 'ROLE_SEMI_USER') {
          navigate('/register');
        } else if (role === 'ROLE_USER') {
          navigate('/mainpage');
        } else {
          alert('알 수 없는 사용자 역할입니다.');
          navigate('/');
        }
      } catch (error: any) {
        console.error('토큰 교환 실패:', error);
        const errorMessage =
          error.response?.data?.message || '로그인 처리 중 오류가 발생했습니다.';
        alert(errorMessage);
        navigate('/');
      }
    };

    exchangeCodeForToken();
  }, [searchParams, navigate]);

  return (
    <div style={styles.container}>
      <div style={styles.loader}></div>
      <p style={styles.text}>로그인 처리 중입니다. 잠시만 기다려주세요...</p>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#ffffff',
  },
  loader: {
    width: '48px',
    height: '48px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3977F4',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  text: {
    marginTop: '20px',
    fontSize: '16px',
    fontWeight: 500,
    color: '#373737',
  },
};

// 인라인 스타일에 애니메이션을 추가하기 위해 스타일 시트에 주입
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default AuthRedirect;

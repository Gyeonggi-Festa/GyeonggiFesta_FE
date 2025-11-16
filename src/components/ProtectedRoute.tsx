import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    const memberId = localStorage.getItem('member_id');

    if (!accessToken && !memberId) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const accessToken = localStorage.getItem('access_token');
  const memberId = localStorage.getItem('member_id');

  // 인증 정보가 없으면 아무것도 렌더링하지 않음 (리다이렉트 중)
  if (!accessToken && !memberId) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;


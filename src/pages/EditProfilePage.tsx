import React, { useEffect, useState } from 'react';
import GenderSelectNone from '../components/GenderSelectNone';
import EmailInputNone from '../components/EmailInputNone';
import NicknameInput from '../components/NicknameInput';
import useUserStore from '../store/userStore';
import styles from './css/RegisterPage.module.css';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import PageHeader from '../components/PageHeader';

const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { nickname, email, gender, setUserInfo } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 페이지 로드 시 사용자 정보 가져오기
    const fetchUserProfile = async () => {
      try {
        const response = await axiosInstance.get('/api/auth/user/info');
        if (response.status === 200) {
          const userData = response.data.data;

          setUserInfo({
            nickname: userData.username,
            email: userData.email,
            gender: userData.gender,
            birth: { year: '', month: '', day: '' }, // birthday 없음
          });
        }
      } catch (error) {
        console.error('프로필 정보 로드 실패:', error);
        alert('프로필 정보를 불러오는데 실패했습니다.');
      }
    };

    fetchUserProfile();
  }, [setUserInfo]);

  const isNicknameFilled = nickname.trim() !== '';
  const isFormValid = isNicknameFilled; // 닉네임만 필수

  const handleSubmit = async () => {
    if (!isFormValid) return;

    setIsLoading(true);

    try {
      const requestBody = {
        username: nickname,
        gender,
        email,
      };

      const response = await axiosInstance.patch('/api/auth/user/feature', requestBody);

      if (response.status === 200) {
        alert('프로필이 성공적으로 수정되었습니다.');
        navigate('/mypage');
      } else {
        alert('수정에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error: any) {
      console.error('프로필 수정 실패:', error);
      const errorMessage = error.response?.data?.message || '프로필 수정 중 오류가 발생했습니다.';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <PageHeader title="프로필 수정" />
      <h1 className={styles.title}>프로필 수정</h1>

      <NicknameInput />
      <EmailInputNone />
      <GenderSelectNone />

      <button
        className={styles.submitButton}
        disabled={!isFormValid || isLoading}
        onClick={handleSubmit}
      >
        {isLoading ? '수정 중...' : '수정 완료'}
      </button>
    </div>
  );
};

export default EditProfilePage;

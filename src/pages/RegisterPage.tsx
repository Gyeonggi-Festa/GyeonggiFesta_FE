import React, { useState } from 'react';
import BirthSelect from '../components/BirthSelect';
import GenderSelect from '../components/GenderSelect';
import EmailInput from '../components/EmailInput';
import NicknameInput from '../components/NicknameInput';
import useUserStore from '../store/userStore';
import TermsAgreementModal from '../components/TermsAgreementModal';
import styles from './css/RegisterPage.module.css';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const RegisterPage: React.FC = () => {
  const { nickname, email, gender, birth } = useUserStore();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [registerCheck, setRegisterCheck] = useState({ terms1: false, terms2: false });
  const [emailChecked, setEmailChecked] = useState(false);
  const [emailCheckMessage, setEmailCheckMessage] = useState('');

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const isBirthFilled = birth.year !== '' && birth.month !== '' && birth.day !== '';
  const isGenderFilled = gender !== '';
  const isEmailValid = isValidEmail(email);
  const isNicknameFilled = nickname.trim() !== '';

  const isFormValid = isBirthFilled && isGenderFilled && isEmailValid && isNicknameFilled && emailChecked;

  const handleEmailCheck = async () => {
    try {
      await axiosInstance.get(`/api/auth/all-user/email/${email}`);
      setEmailCheckMessage('사용 가능한 이메일입니다.');
      setEmailChecked(true);
    } catch (err: any) {
      if (err.response?.status === 400) {
        setEmailCheckMessage('이미 사용 중인 이메일이 있습니다.');
      } else {
        setEmailCheckMessage('이메일 확인 중 오류가 발생했습니다.');
      }
      setEmailChecked(false);
      console.error('이메일 중복 확인 실패:', err);
    }
  };

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async () => {
    try {
      const birthday = `${birth.year}-${birth.month.padStart(2, '0')}-${birth.day.padStart(2, '0')}`;

      const requestBody = {
        username: nickname,
        birthday,
        gender,
        email,
      };

      const response = await axiosInstance.post('/api/auth/semi/feature', requestBody);
      const { accessToken, refreshToken } = response.data.data;

      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);

      navigate('/mainpage');
    } catch (error) {
      console.error('회원가입 실패:', error);
      alert('회원가입 처리 중 오류가 발생했습니다.');
    }
  };

  const handleConfirmClick = () => {
    handleModalOpen();
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>입력한 정보를 확인해주세요.</h1>

      {isBirthFilled && isGenderFilled && isEmailValid && emailChecked && <NicknameInput />}
      {isBirthFilled && isGenderFilled && (
        <div className={styles.emailSection}>
          <EmailInput />
          <button className={`${styles.emailCheckButton} ${emailChecked ? styles.valid : ''}`} onClick={handleEmailCheck}>중복확인</button>
        </div>
      )}
      {emailCheckMessage && <p className={styles.emailCheckMessage}>{emailCheckMessage}</p>}

      {isBirthFilled && <GenderSelect />}
      <BirthSelect />

      <button 
        className={styles.submitButton} 
        disabled={!isFormValid}
        onClick={handleConfirmClick}
      >
        확인
      </button>

      <TermsAgreementModal
        isOpen={isModalOpen}
        onRequestClose={handleModalClose}
        handleSubmit={handleSubmit}
        registerCheck={registerCheck}
        setRegisterCheck={setRegisterCheck}
      />
    </div>
  );
};

export default RegisterPage;

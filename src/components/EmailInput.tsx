import React, { useState } from 'react';
import useUserStore from '../store/userStore';
import styles from './css/EmailInput.module.css';

const EmailInput: React.FC = () => {
    const {email, setEmail} = useUserStore();
    const [errorMessage, setErrorMessage] = useState('');

    const validateEmail = (value: string) => {
        // 이메일 정규식: 문자열@도메인 형식
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);
        
        // 입력값이 있을 때만 유효성 검사
        if (value.trim() !== '') {
            if (!validateEmail(value)) {
                setErrorMessage('올바른 이메일 형식을 입력해주세요. (예: example@gmail.com)');
            } else {
                setErrorMessage('');
            }
        } else {
            setErrorMessage('');
        }
    };

    return (
        <div className={styles.wrapper}>
            <label className={styles.label}>이메일</label>
            <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                className={styles.input}
                placeholder="example@gmail.com"
                pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                required/>
            {errorMessage && (
                <span style={{ color: 'red', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    {errorMessage}
                </span>
            )}
        </div>
    );
};

export default EmailInput;

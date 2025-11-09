import React from 'react';
import useUserStore from '../store/userStore';
import styles from './css/EmailInput.module.css';

const EmailInputNone: React.FC = () => {
    const {email} = useUserStore();

    return (
        <div className={styles.wrapper}>
            <label className={styles.label}>이메일</label>
            <input
                type="email"
                value={email}
                disabled  // 👉 입력 비활성화
                className={styles.input}
                placeholder="이메일 입력"
            />


        </div>
    );
};

export default EmailInputNone;

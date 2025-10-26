import React from 'react';
import useUserStore from '../store/userStore';
import styles from './css/EmailInput.module.css';

const EmailInput: React.FC = () => {
    const {email, setEmail} = useUserStore();

    return (
        <div className={styles.wrapper}>
            <label className={styles.label}>이메일</label>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                placeholder="이메일 입력"/>

        </div>
    );
};

export default EmailInput;

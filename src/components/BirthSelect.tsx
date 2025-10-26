import React from 'react';
import useUserStore from '../store/userStore';
import styles from './css/BirthSelect.module.css';
import {generateOptions} from '../utils/generateOptions';

const BirthSelect: React.FC = () => {
    const {birth, setBirth} = useUserStore();

    const years = generateOptions(100, 2024);
    const months = generateOptions(12, 0, true);
    const days = generateOptions(31, 0, true);

    const handleBirthChange = (key : 'year' | 'month' | 'day', value : string) => {
        setBirth({
            ...birth,
            [key]: value
        });
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.selectGroup}>
                <label className={styles.label}>생년</label>
                <select
                    value={birth.year}
                    onChange={(e) => handleBirthChange('year', e.target.value)}
                    className={styles.select}>
                    <option value="">년도</option>
                    {years.map((y) => (<option key={y} value={y}>{y}</option>))}
                </select>
            </div>

            <div className={styles.selectGroup}>
                <label className={styles.label}>월</label>
                <select
                    value={birth.month}
                    onChange={(e) => handleBirthChange('month', e.target.value)}
                    className={styles.select}>
                    <option value="">월 </option>
                    {months.map((m) => (<option key={m} value={m}>{m}</option>))}
                </select>
            </div>

            <div className={styles.selectGroup}>
                <label className={styles.label}>일</label>
                <select
                    value={birth.day}
                    onChange={(e) => handleBirthChange('day', e.target.value)}
                    className={styles.select}>
                    <option value="">일</option>
                    {days.map((d) => (<option key={d} value={d}>{d}</option>))}
                </select>
            </div>
        </div>
    );
};

export default BirthSelect;

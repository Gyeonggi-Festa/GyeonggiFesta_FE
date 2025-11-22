import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './css/CreateGroupChat.module.css';
import axiosInstance from '../api/axiosInstance';
const MAX_NAME_LENGTH = 24;
const MAX_DESC_LENGTH = 500;

const categoryList = [
      '전체', '교육', '행사', '전시', '공연'
];

const CreateGroupChat: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const isFormValid = name && description && selectedCategory;
  const handleSubmit = async () => {
    try {
      const response = await axiosInstance.post('/api/auth/user/chatrooms', {
        name,
        type: 'GROUP',
        information: description,
        category: selectedCategory,
        createdFrom: 'GROUP', // 단체 채팅방에서 생성된 것임을 명시
      });
  
      console.log('채팅방 생성 성공:', response.data);
  
      // 생성 완료 후 채팅 목록 페이지로 이동
      navigate('/chat');
    } catch (error) {
      console.error('채팅방 생성 실패:', error);
      alert('채팅방 생성에 실패했습니다. 다시 시도해주세요.');
    }
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img
          src="/assets/x.svg"
          alt="닫기"
          className={styles.closeIcon}
          onClick={() => navigate('/chat')}
        />
      </div>

      <h2 className={styles.title}>어떤 채팅방을 만들까요?</h2>

      <label className={styles.label}>채팅방 이름 (필수)</label>
      <div className={styles.inputBox}>
        <input
          type="text"
          maxLength={MAX_NAME_LENGTH}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름이 짧을수록 이해하기 쉬워요"
        />
      </div>
      <div className={styles.charCount}>{name.length}/{MAX_NAME_LENGTH}</div>

      <label className={styles.label}>카테고리 (필수)</label>
      <div className={styles.categoryWrap}>
        {categoryList.map((cat) => (
          <button
            key={cat}
            className={`${styles.categoryBtn} ${selectedCategory === cat ? styles.selected : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <label className={styles.labels}>채팅방 소개</label>
      <textarea
        className={styles.textarea}
        maxLength={MAX_DESC_LENGTH}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={`• 어떤 사람과 대화하고 싶으신가요?\n• 지켜야 할 규칙, 공지 사항 등을 안내해 주세요.\n• 설정에서 언제든지 바꿀 수 있어요.`}
      />
      <div className={styles.charCount}>{description.length}/{MAX_DESC_LENGTH}</div>

      <button
        className={`${styles.submitBtn} ${isFormValid ? styles.active : ''}`}
        disabled={!isFormValid}
        onClick={handleSubmit} 
      >
        채팅방 만들기
      </button>
    </div>
  );
};

export default CreateGroupChat;
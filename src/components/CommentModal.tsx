import { useState } from 'react';
import styles from './css/CommentModal.module.css';
import axiosInstance from '../api/axiosInstance';

interface CommentModalProps {
  eventId: string;
  parentCommentId?: number; // optional
  onClose: () => void;
  onSubmitSuccess?: () => void;
}


export default function CommentModal({ eventId,parentCommentId, onClose, onSubmitSuccess }: CommentModalProps) {
  const [comment, setComment] = useState('');

  const handleSubmit = async () => {
    if (!comment.trim()) return;

    try {
      await axiosInstance.post('/api/auth/user/event/comment', {
        eventId,
        content: comment.trim(),
        ...(parentCommentId && { parentCommentId }), // 조건부 포함
      });
      
      onSubmitSuccess?.();
      onClose();
    } catch (error) {
      console.error('댓글 등록 실패:', error);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()} // ✅ 모달 내부 클릭은 이벤트 버블링 차단
      >
        <button className={styles.closeButton} onClick={onClose}>✕</button>
        <h2 className={styles.modalTitle}>
          {parentCommentId ? '답글 작성' : '댓글 작성'}
        </h2>
        <textarea
          className={styles.textarea}
          placeholder={`행사에 대해 기대하는 점
동행 구하기
욕설, 비방, 명예훼손성 표현은 누군가에게 상처가 될 수 있습니다.`}
          maxLength={80}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <div className={styles.footer}>
          <span className={styles.charCount}>{comment.length}/80</span>
          <button className={styles.submitButton} onClick={handleSubmit}>
            작성하기
          </button>
        </div>
      </div>
    </div>
  );
}
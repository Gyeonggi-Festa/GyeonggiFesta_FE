import React from 'react';
import styles from './css/SuccessModal.module.css';
import { motion } from 'framer-motion';

interface SuccessModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  message,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.modal}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.content}>
          <div className={styles.iconWrapper}>
            <div className={styles.checkIcon}>✓</div>
          </div>
          <p className={styles.message}>{message}</p>
        </div>
        
        <button className={styles.confirmButton} onClick={onClose}>
          확인
        </button>
      </motion.div>
    </motion.div>
  );
};

export default SuccessModal;


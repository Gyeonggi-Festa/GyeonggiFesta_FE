import styles from "./css/Mainpage.module.css";
import { motion } from "framer-motion";

const MainPage = () => {
    const handleKakaoLogin = () => {
        window.location.href = "https://13.125.224.67.nip.io/oauth2/authorization/kakao";
    };

    return (
        <div className={styles.container}>
            <img src="/assets/mainBG.png" alt="메인 배경 이미지" className={styles.mainImage} />

            {/* 타이틀 애니메이션 */}
            <motion.div
                className={styles.titleContainer}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0 }}
            ></motion.div>

            {/* 텍스트 애니메이션 */}
            <motion.p
                className={styles.joinText}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.2 }}
            >
                ⚡ 3초만에 빠른 가입 ⚡
            </motion.p>

            {/* 버튼 애니메이션 */}
            <motion.button
                className={styles.kakaoButton}
                onClick={handleKakaoLogin}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.0, duration: 0.2 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <img src="/assets/kakao.svg" alt="카카오 아이콘" className={styles.kakaoIcon} />
                <p className={styles.kakoText}>카카오로 빠르게 시작하기</p>
            </motion.button>
        </div>
    );
};

export default MainPage;

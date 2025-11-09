import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './css/TermsPage.module.css';

const TermsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img
          src="/assets/slash.svg"
          alt="뒤로가기"
          className={styles.icon}
          onClick={() => navigate(-1)}
        />
        <h2 className={styles.title}>개인정보 처리방침</h2>
      </div>

      <div className={styles.content}>
        <p className={styles.intro}>
          ‘Gyeonggi Festa’는 아래의 목적으로 개인정보를 수집∙이용합니다. 회원의 소중한 개인정보를 보호하고,
          안전하게 서비스를 제공하기 위해 최선을 다하겠습니다. 아래 내용을 충분히 읽으신 후 동의 여부를 결정해 주세요.
        </p>

        <h3 className={styles.sectionTitle}>수집∙이용 목적별 안내</h3>

        {[
          {
            title: '회원가입 및 로그인',
            fields: '카카오톡 ID, 생년월일, 성별, 닉네임, 이메일',
            duration: '회원 탈퇴 시 즉시 삭제',
          },
          {
            title: 'AI 기반 맞춤형 행사 추천',
            fields: '검색 이력, 스크랩, 카테고리 관심사',
            duration: '회원 탈퇴 시 즉시 삭제',
          },
          {
            title: '축제 동행인 채팅 서비스',
            fields: '채팅 메시지 내용, 채팅방 참여 기록',
            duration: '회원 탈퇴 시 즉시 삭제',
          },
          {
            title: '고객 문의 및 지원 응대',
            fields: '문의 내용, 이메일, 닉네임',
            duration: '3년간 보관 후 삭제',
          },
          {
            title: '유료 서비스 환불 처리 (해당 시)',
            fields: '은행명, 계좌번호',
            duration: '5년간 보관 후 삭제 (전자상거래법 준수)',
          },
        ].map((item, idx) => (
          <div key={idx} className={styles.card}>
            <h4>{item.title}</h4>
            <p><strong>수집 항목:</strong> {item.fields}</p>
            <p><strong>보관 기간:</strong> {item.duration}</p>
          </div>
        ))}

        <p className={styles.notice}>
          귀하는 위 개인정보 수집 및 이용에 대해 동의를 거부할 권리가 있습니다. 단,
          <strong> 동의하지 않을 경우 ‘Gyeonggi Festa’의 회원가입, AI 추천, 동행 채팅 등 서비스 이용이 제한될 수 있습니다.</strong>
        </p>

        <h3 className={styles.sectionTitle}>개인정보 처리 책임자</h3>
        <p>오준석</p>

        <h3 className={styles.sectionTitle}>문의 오픈 채팅</h3>
        <p>
          <a href="https://open.kakao.com/o/sXpLyXuh" target="_blank" rel="noopener noreferrer">
            https://open.kakao.com/o/sXpLyXuh
          </a>
        </p>

        <p className={styles.updateNote}>* 본 개인정보 처리방침은 2025년 5월 1일부터 적용됩니다.</p>
      </div>
    </div>
  );
};

export default TermsPage;
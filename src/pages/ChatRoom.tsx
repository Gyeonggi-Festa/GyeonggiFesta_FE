// src/pages/ChatRoom.tsx
import React, { useState, useRef, useEffect } from 'react';
import styles from './css/ChatRoom.module.css';
import ChatMessage from '../components/ChatMessage';
import { useParams, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

import {
  connectStomp,
  sendChatMessage,
  disconnectStomp,
  subscribeToRoom,
  sendEnterMessage,
  sendLeaveMessage,
  sendReadMessage,
} from '../utils/socket';
import axiosInstance from '../api/axiosInstance';

interface ChatMessageData {
  id: number;
  sender: 'me' | 'other';
  message: string;
  time: string;
}
interface RawMessage {
  messageId: number;
  senderVerifyId?: string;
  senderId?: number;
  memberId?: number;
  content: string;
  createdAt: string;
}

interface WebSocketMessage {
  messageId?: number;
  chatRoomId: number;
  senderId?: number;
  senderName?: string;
  senderVerifyId?: string;
  memberId?: number;
  memberName?: string;
  content?: string;
  type?: 'TEXT' | 'IMAGE' | 'FILE';
  eventType?: 'JOIN' | 'LEAVE';
  createdAt?: string;
  timestamp?: string;
  isDeleted?: boolean;
  mediaUrl?: string;
}
const ChatRoom: React.FC = () => {
  const [focused, setFocused] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const chatBodyRef = useRef<HTMLDivElement | null>(null);
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  const subscribedRef = useRef(false);
  const stompConnectedRef = useRef(false); // STOMP 연결 상태 추적
  const location = useLocation();

  const { roomTitle, participantCount } = location.state || {};
  const [isOwner, setIsOwner] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // 햄버거 메뉴 열림 상태
  const [myMemberId, setMyMemberId] = useState<number | null>(null); // 내 memberId 상태
  
  useEffect(() => {
    const initializeChatRoom = async () => {
      if (!roomId) {
        console.error('roomId가 없습니다.');
        return;
      }
      
      // memberId는 localStorage에서 가져오기
      const storedMemberId = localStorage.getItem('member_id');
      const myMemberIdNum = storedMemberId ? Number(storedMemberId) : null;
      setMyMemberId(myMemberIdNum);
      
      // memberInfo API는 선택적으로 호출 (실패해도 계속 진행)
      try {
        console.log(`채팅방 멤버 정보 요청: roomId=${roomId}`);
        const response = await axiosInstance.get(`/api/auth/user/chatrooms/${roomId}/memberInfo`);
        console.log('멤버 정보 응답:', response.data);
        
        const members = response.data.data;
        
        if (members && members.length > 0) {
          // 현재 사용자의 정보 찾기 (배열의 첫 번째 요소가 현재 사용자)
          const currentUserInfo = members[0];
          
          if (currentUserInfo) {
            if (currentUserInfo.memberId) {
              setMyMemberId(currentUserInfo.memberId);
              localStorage.setItem('member_id', String(currentUserInfo.memberId));
            }
            if (currentUserInfo.role) {
              setIsOwner(currentUserInfo.role === 'OWNER');
            }
          }
        }
      } catch (error: any) {
        console.warn('멤버 정보 가져오기 실패 (계속 진행):', error);
        // 404나 다른 에러가 발생해도 계속 진행
      }
      
      // memberId가 있으면 메시지와 소켓 설정
      const finalMemberId = myMemberIdNum || (localStorage.getItem('member_id') ? Number(localStorage.getItem('member_id')) : null);
      if (finalMemberId) {
        await fetchMessages(finalMemberId);
        await setupWebSocket(finalMemberId);
      } else {
        // memberId가 없어도 소켓 연결은 시도 (로그인 없이 접근 가능하도록)
        await setupWebSocket(null);
      }
    };
    
    if (roomId) {
      initializeChatRoom();
    }
    
    // 컴포넌트 언마운트 시 정리
    return () => {
      if (roomId && stompConnectedRef.current) {
        console.log('🛑 채팅방 나가기 - STOMP 정리 시작');
        sendLeaveMessage(Number(roomId));
        disconnectStomp();
        stompConnectedRef.current = false;
      }
    };
  }, [roomId]);

  const fetchMessages = async (memberId: number | null) => {
    try {
      const response = await axiosInstance.get<{ data: { content: RawMessage[] } }>(
        `/api/auth/user/chat/rooms/${roomId}/messages`
      );
    
      const sortedMessages: ChatMessageData[] = response.data.data.content
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .map((msg) => {
          // memberId로 본인 메시지 판별
          const isMyMessage = memberId !== null && (
            msg.memberId === memberId || 
            msg.senderId === memberId
          );
          return {
            id: msg.messageId,
            sender: isMyMessage ? 'me' : 'other',
            message: msg.content,
            time: new Date(msg.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          };
        });
    
      setMessages(sortedMessages);
    } catch (error) {
      console.error('메시지 불러오기 실패:', error);
    }
  };
  
  const setupWebSocket = async (memberId: number | null) => {
    if (!roomId) return;
    
    try {
      if (subscribedRef.current) return;
      subscribedRef.current = true;
      
      // 1. 소켓 연결
      await connectStomp();
      stompConnectedRef.current = true; // STOMP 연결 완료 표시
      console.log('✅ STOMP 연결 완료');
      console.log('🔍 현재 사용자 정보:', {
        memberId: memberId || localStorage.getItem('member_id'),
        roomId: roomId,
      });
      
      // 2. 채팅방 입장 소켓 메시지 전송
      sendEnterMessage(Number(roomId));
      
      // 3. 채팅방 join API 호출 (토큰만 보내면 됨)
      try {
        await axiosInstance.post(`/api/auth/user/chatrooms/${roomId}/join`);
        console.log('✅ 채팅방 입장 완료');
      } catch (joinError: any) {
        console.error('채팅방 입장 실패:', joinError);
        // join 실패해도 소켓 연결은 유지
      }
      
      // 4. 채팅방 입장 시 읽음 처리
      setTimeout(() => {
        sendReadMessage(Number(roomId));
      }, 500);
      
      subscribeToRoom(Number(roomId), (message) => {
        const body: WebSocketMessage = JSON.parse(message.body);
        console.log('📨 WebSocket 메시지 수신:', body);
        
        // 입장/퇴장 이벤트 처리
        if (body.eventType === 'JOIN') {
          console.log(`👋 ${body.memberName}님이 입장했습니다.`);
          // 필요시 UI에 입장 메시지 표시
          return;
        }
        
        if (body.eventType === 'LEAVE') {
          console.log(`👋 ${body.memberName}님이 퇴장했습니다.`);
          // 필요시 UI에 퇴장 메시지 표시
          return;
        }
        
        // 일반 채팅 메시지 처리
        if (!body.messageId || !body.content) {
          console.warn('⚠️ 메시지 ID 또는 내용이 없습니다:', body);
          return;
        }
        
        // 이미지/파일 메시지 처리
        let displayContent = body.content;
        if (body.type === 'IMAGE' && body.mediaUrl) {
          displayContent = `[이미지: ${body.mediaUrl}]`;
        } else if (body.type === 'FILE' && body.mediaUrl) {
          displayContent = `[파일: ${body.content}]`;
        }
        
        // memberId로 본인 메시지 판별
        const storedMemberId = memberId || (localStorage.getItem('member_id') ? Number(localStorage.getItem('member_id')) : null);
        const isMyMessage = storedMemberId !== null && (
          body.memberId === storedMemberId ||
          body.senderId === storedMemberId
        );
        
        console.log('💬 메시지 발신자 정보:', {
          senderId: body.senderId,
          memberId: body.memberId,
          senderVerifyId: body.senderVerifyId,
          senderName: body.senderName,
          myMemberId: storedMemberId,
          isMyMessage: isMyMessage,
        });
        
        setMessages((prev) => [
          ...prev,
          {
            id: body.messageId!,
            sender: isMyMessage ? 'me' : 'other',
            message: displayContent,
            time: new Date(body.createdAt || body.timestamp || new Date()).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        ]);
        
        // 다른 사람의 메시지를 받으면 읽음 처리
        if (!isMyMessage && roomId) {
          setTimeout(() => {
            sendReadMessage(Number(roomId));
          }, 300);
        }
      });
    } catch (error) {
      console.error('WebSocket 연결 실패:', error);
      subscribedRef.current = false; // 연결 실패 시 재시도 가능하도록
      stompConnectedRef.current = false;
    }
  };

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim() || !roomId) return;
    sendChatMessage(Number(roomId), inputValue, 'TEXT');
    setInputValue('');
  };

  return (
    <div>
      <div className={styles['chat-header']}>
        <img
          src="/assets/slash.svg"
          alt="뒤로가기"
          className={styles['header-icon']}
          onClick={() => {
            if (roomId && stompConnectedRef.current) {
              sendLeaveMessage(Number(roomId));
              disconnectStomp();
            }
            navigate('/chat');
          }}
        />
        <div className={styles['header-title']}>
        <div className={styles['room-name']}>
          {roomTitle}
          {isOwner && (
            <img
              src="/assets/edit.svg"
              alt="이름 수정"
              className={styles['edit-icon']}
              onClick={async () => {
                const newName = prompt('새 채팅방 이름을 입력하세요', roomTitle);
                if (!newName || newName === roomTitle) return;

                try {
                  await axiosInstance.patch('/api/auth/user/chatrooms/name', {
                    chatRoomId: Number(roomId),
                    name: newName,
                  });
                  alert('채팅방 이름이 수정되었습니다.');
                  // 화면에 즉시 반영
                  location.state.roomTitle = newName; // 기존 state 수정
                  navigate('.', { replace: true, state: { ...location.state, roomTitle: newName } });
                } catch (err) {
                  console.error('이름 수정 실패:', err);
                  alert('이름 수정에 실패했습니다.');
                }
              }}
            />
          )}
        </div>

          <div className={styles['participant-info']}>
            <img
              src="/assets/person.svg"
              alt="인원수"
              className={styles['person-icon']}
            />
            <span className={styles['participant-count']}>
              {participantCount}명
            </span>
          </div>
        </div>
        <img
          src="/assets/hambuger.svg"
          alt="메뉴"
          className={styles['header-icon']}
          onClick={() => setMenuOpen(prev => !prev)}
        />
      </div>

      <div className={styles['chat-body']} ref={chatBodyRef}>
        {messages.map((chat) => (
          <ChatMessage
            key={chat.id}
            sender={chat.sender}
            message={chat.message}
            time={chat.time}
          />
        ))}
      </div>

      <div className={styles['chat-input-container']}>
        <div
          className={`${styles['chat-input-box']} ${
            focused || inputValue.length > 0 ? styles['focused'] : ''
          }`}
          onClick={() => setFocused(true)}
        >
          <textarea
            placeholder="메세지를 입력해주세요.."
            className={styles['chat-input']}
            rows={1}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${target.scrollHeight}px`;
            }}
          />
          <div
            className={`${styles['send-button']} ${
              focused || inputValue.length > 0 ? styles['active'] : ''
            }`}
            onClick={handleSend}
          >
            <img
              src={
                focused || inputValue.length > 0
                  ? '/assets/send-active.svg'
                  : '/assets/send-icon.svg'
              }
              alt="send"
              className={styles['send-icon']}
            />
          </div>
        </div>
      </div>
      {menuOpen && (
  <div className={styles['menu-popup']}>
    {isOwner ? (
          <button
            onClick={async () => {
              try {
                await axiosInstance.delete(`/api/auth/user/chatrooms/${roomId}`);
                alert('채팅방이 삭제되었습니다.');
                navigate('/chat');
              } catch (err) {
                console.error('채팅방 삭제 실패:', err);
              }
            }}
          >
            채팅방 삭제
          </button>
        ) : (
          <button
            onClick={async () => {
              try {
                await axiosInstance.delete(`/api/auth/user/chatrooms/${roomId}/exit`);
                alert('채팅방에서 나갔습니다.');
                navigate('/chat');
              } catch (err) {
                console.error('채팅방 나가기 실패:', err);
              }
            }}
          >
            채팅방 나가기
          </button>
        )}
      </div>
    )}
    </div>
    
  );
};

export default ChatRoom;
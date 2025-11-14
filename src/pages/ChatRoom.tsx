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
  senderVerifyId: string;
  content: string;
  createdAt: string;
}

interface WebSocketMessage {
  messageId: number;
  chatRoomId: number;
  senderId: number;
  senderName: string;
  senderVerifyId?: string; // 선택적으로 추가 (서버 응답에 따라)
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE';
  createdAt: string;
  isDeleted: boolean;
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
  const [verifyId, setVerifyId] = useState<string>(''); // verifyId 상태 추가
  
  useEffect(() => {
    const fetchMemberInfo = async () => {
      if (!roomId) {
        console.error('roomId가 없습니다.');
        return;
      }
      
      try {
        console.log(`채팅방 멤버 정보 요청: roomId=${roomId}`);
        const response = await axiosInstance.get(`/api/auth/user/chatrooms/${roomId}/memberInfo`);
        console.log('멤버 정보 응답:', response.data);
        
        const members = response.data.data;
        
        if (!members || members.length === 0) {
          console.error('멤버 정보가 비어있습니다.');
          alert('채팅방 정보를 불러올 수 없습니다.');
          navigate('/chat');
          return;
        }
        
        // 현재 사용자의 정보 찾기 (배열의 첫 번째 요소가 현재 사용자)
        const currentUserInfo = members[0];
        
        if (currentUserInfo) {
          setVerifyId(currentUserInfo.verifyId);
          setIsOwner(currentUserInfo.role === 'OWNER');
          await fetchMessages(currentUserInfo.verifyId);
          await setupWebSocket(currentUserInfo.verifyId);
        }
      } catch (error: any) {
        console.error('방장 여부 확인 실패:', error);
        
        if (error?.response?.status === 404) {
          alert('존재하지 않는 채팅방이거나 접근 권한이 없습니다.');
          navigate('/chat');
        } else if (error?.response?.status === 401) {
          alert('로그인이 필요합니다.');
          navigate('/login');
        } else {
          alert('채팅방 정보를 불러오는 중 오류가 발생했습니다.');
        }
      }
    };
    
    if (roomId) {
      fetchMemberInfo();
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

  const fetchMessages = async (verifyId: string) => {
    try {
      const response = await axiosInstance.get<{ data: { content: RawMessage[] } }>(
        `/api/auth/user/chat/rooms/${roomId}/messages`
      );
    
      const sortedMessages: ChatMessageData[] = response.data.data.content
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .map((msg) => ({
          id: msg.messageId,
          sender: msg.senderVerifyId === verifyId ? 'me' : 'other', // 수정: 본인 메시지는 'me'
          message: msg.content,
          time: new Date(msg.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        }));
    
      setMessages(sortedMessages);
    } catch (error) {
      console.error('메시지 불러오기 실패:', error);
    }
  };
  
  const setupWebSocket = async (verifyId: string) => {
    if (!roomId) return;
    
    try {
      if (subscribedRef.current) return;
      subscribedRef.current = true;
      
      await connectStomp();
      stompConnectedRef.current = true; // STOMP 연결 완료 표시
      console.log('✅ STOMP 연결 완료');
      
      sendEnterMessage(Number(roomId));
      subscribeToRoom(Number(roomId), (message) => {
        const body: WebSocketMessage = JSON.parse(message.body);
        console.log('📨 WebSocket 메시지 수신:', body);
        
        // 이미지/파일 메시지 처리
        let displayContent = body.content;
        if (body.type === 'IMAGE' && body.mediaUrl) {
          displayContent = `[이미지: ${body.mediaUrl}]`;
        } else if (body.type === 'FILE' && body.mediaUrl) {
          displayContent = `[파일: ${body.content}]`;
        }
        
        // verifyId나 senderName으로 본인 메시지 판별
        const isMyMessage = body.senderVerifyId 
          ? body.senderVerifyId === verifyId 
          : body.senderName === localStorage.getItem('username'); // 또는 다른 방법
        
        setMessages((prev) => [
          ...prev,
          {
            id: body.messageId,
            sender: isMyMessage ? 'me' : 'other',
            message: displayContent,
            time: new Date(body.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        ]);
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
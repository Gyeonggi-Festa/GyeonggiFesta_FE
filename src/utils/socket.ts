// src/utils/socket.ts
import SockJS from 'sockjs-client';
import { CompatClient, Stomp, IFrame ,IMessage } from '@stomp/stompjs';

let stompClient: CompatClient | null = null;

export const connectStomp = (): Promise<CompatClient> => {
  return new Promise((resolve, reject) => {
    const accessToken = localStorage.getItem('access_token');
    const socket = new SockJS('https://api.gyeonggifesta.site/ws-stomp');
    stompClient = Stomp.over(socket);

    stompClient.connect(
      { Authorization: `Bearer ${accessToken}` },
      () => {
        console.log('✅ WebSocket 연결 성공');
        resolve(stompClient!);
      },
      (error: IFrame) => {
        console.error('❌ WebSocket 연결 실패', error);
        reject(error);
      }
    );
  });
};

export const sendEnterMessage = (chatRoomId: number) => {
  if (!stompClient || !stompClient.connected) {
    console.warn('⚠️ 입장 메시지 전송 실패: STOMP 클라이언트가 연결되지 않았습니다.');
    return;
  }

  console.log(`📨 채팅방 ${chatRoomId} 입장 메시지 전송`);
  stompClient.send(`/app/chat/room/${chatRoomId}/enter`, {}, '');
};

// ✅ 퇴장 메시지 전송 함수 추가
export const sendLeaveMessage = (chatRoomId: number) => {
  if (!stompClient || !stompClient.connected) {
    console.warn('⚠️ 퇴장 메시지 전송 실패: STOMP 클라이언트가 연결되지 않았습니다.');
    return;
  }

  stompClient.send(`/app/chat/room/${chatRoomId}/leave`, {}, '');
};

// ✅ 읽음 처리 함수 추가
export const sendReadMessage = (chatRoomId: number) => {
  if (!stompClient || !stompClient.connected) {
    console.warn('⚠️ 읽음 처리 실패: STOMP 클라이언트가 연결되지 않았습니다.');
    return;
  }

  stompClient.send(`/app/chat/room/${chatRoomId}/read`, {}, '');
  console.log(`✅ 채팅방 ${chatRoomId} 읽음 처리 완료`);
};

// ✅ 연결 해제 함수 (옵션)
export const disconnectStomp = () => {
  if (stompClient && stompClient.connected) {
    stompClient.disconnect(() => {
      console.log('🛑 WebSocket 연결 종료');
    });
  }
};

// src/utils/socket.ts 내부에 추가
export const sendChatMessage = (
  chatRoomId: number,
  content: string,
  type: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT',
  tempS3Key: string | null = null
) => {
  if (!stompClient || !stompClient.connected) {
    console.warn('⚠️ 채팅 메시지 전송 실패: STOMP 클라이언트가 연결되지 않았습니다.');
    return;
  }

  // tempS3Key가 null이 아닐 때만 포함
  const messagePayload: {
    chatRoomId: number;
    content: string;
    type: string;
    tempS3Key?: string;
  } = {
    chatRoomId,
    content,
    type,
  };

  if (tempS3Key) {
    messagePayload.tempS3Key = tempS3Key;
  }

  console.log('📤 메시지 전송:', messagePayload);
  stompClient.send(
    '/app/chat/message',
    {},
    JSON.stringify(messagePayload)
  );
};
export const subscribeToRoom = (
  chatRoomId: number,
  callback: (message: IMessage) => void
) => {
  if (!stompClient || !stompClient.connected) return;
  return stompClient.subscribe(`/topic/chat/room/${chatRoomId}`, callback);
};
import { io } from 'socket.io-client';

const SOCKET_URL = ('http://localhost:5000/api').replace('/api', '');

export const socket = io(SOCKET_URL, {
  withCredentials: true, 
  autoConnect: false, 
});

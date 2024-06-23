import {io, Socket} from 'socket.io-client';
import store from '../redux/store';
import config from '../../config';

let socket: Socket;

const SocketService = {
  connect: () => {
    const token = store.getState().auth.user?.token;
    if (token) {
      socket = io(config.socketBaseURL, {
        query: {
          access_token: token
        },
        transports: ['websocket']
      });

      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });

    }
  },
  disconnect: () => {
    if (socket) socket.disconnect();
  },
  on: (event: string, callback: (data: any) => void) => {
    if (socket) socket.on(event, callback);
  },
  emit: (event: string, data: any) => {
    if (socket) socket.emit(event, data);
  },
};

export default SocketService;

import { GameData } from '../Game/types';

export type MessageSeverity = 'info' | 'success' | 'warning' | 'error';

export interface MessageState {
  message?: string;
  title?: string;
  severity?: MessageSeverity;
  show: boolean;
}

export interface UserInvite {
  show: boolean;
  from?: string;
  gameId?: string;
}

export interface UserData {
  id: string;
  username: string;
  email: string;
  emailVerified: boolean;
  displayName: string;
  avatar: string;
}

export interface UserGames {
  completedGames: {
    id: string;
    name: string;
    createdAt: string;
  }[];
  activeGames: {
    id: string;
    name: string;
    createdAt: string;
    startedAt: string;
  }[];
}

export interface User {
  isAuthenticated: boolean;
  loading: boolean;
  user: UserData;
}

export enum Types {
  'CREATE_MESSAGE',
  'CLEAR_NOTIFICATION',
  'CLOSE_NOTIFICATION',
  'UPDATE_AVAILABLE',
  'AUTHENTICATE_USER',
  'UPDATE_USER',
  'USER_INVITE',
  'ACCEPT_INVITE',
  'CLEAR_INVITE',
  'PLAY_AGAIN',
  'CLEAR_PLAY_AGAIN_DATA',
  'UPDATE_WORLD',
  'LOADING',
  'USER_INTERACTION',
  'SET_USER_STATE',
}

export interface AppAction {
  type: Types;
  payload?: any;
}

export interface World {
  onlineUsers: number;
}

export enum UserStatus {
  'AVAILABLE',
  'BUSY',
  'OFFLINE',
}

export interface AppState {
  lastInteraction: number;
  userStatus: UserStatus;
  notifications: MessageState;
  userInvite: UserInvite;
  updateAvailable: boolean;
  user: User;
  loading: boolean;
  playAgain?: GameData;
  world: World;
}

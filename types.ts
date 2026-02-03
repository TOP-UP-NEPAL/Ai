
export enum GameType {
  FREE_FIRE = 'Free Fire',
  PUBG = 'PUBG Mobile',
  MLBB = 'Mobile Legends'
}

export enum OrderStatus {
  PENDING = 'Pending',
  PROCESSING = 'Processing',
  COMPLETED = 'Completed',
  REJECTED = 'Rejected'
}

export interface User {
  email: string;
  name: string;
}

export interface Order {
  id: string;
  uid: string;
  username: string;
  game: GameType;
  price: string;
  amount: number;
  transactionId: string;
  screenshotUrl?: string;
  status: OrderStatus;
  userEmail: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  type?: 'text' | 'form_data' | 'form_payment' | 'qr_display' | 'verification_result';
  imageUrl?: string;
}

export enum FlowPhase {
  LOGIN = 'LOGIN',
  INQUIRY = 'INQUIRY',
  SELECTION = 'SELECTION',
  DATA_COLLECTION = 'DATA_COLLECTION',
  PAYMENT_SELECTION = 'PAYMENT_SELECTION',
  PAYMENT = 'PAYMENT',
  VERIFICATION = 'VERIFICATION',
  FINALIZED = 'FINALIZED'
}

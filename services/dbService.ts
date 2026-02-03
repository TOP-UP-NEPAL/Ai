
import { Order } from '../types';

const DB_URL = 'https://merotopup-np-default-rtdb.firebaseio.com';

export const dbService = {
  saveOrder: async (order: Order): Promise<void> => {
    try {
      // Saving to orders/pending as requested
      const response = await fetch(`${DB_URL}/orders/pending.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      if (!response.ok) throw new Error('Failed to save to Firebase');
    } catch (error) {
      console.error('Firebase Save Error:', error);
      // Fallback to local storage if network fails
      const existing = localStorage.getItem('mero_topup_orders');
      const orders = existing ? JSON.parse(existing) : [];
      orders.push(order);
      localStorage.setItem('mero_topup_orders', JSON.stringify(orders));
    }
  },

  getOrdersByUid: async (uid: string): Promise<Order[]> => {
    try {
      const response = await fetch(`${DB_URL}/orders/pending.json`);
      if (!response.ok) throw new Error('Failed to fetch from Firebase');
      const data = await response.json();
      if (!data) return [];
      
      return Object.values(data).filter((o: any) => o.uid === uid) as Order[];
    } catch (error) {
      console.error('Firebase Fetch Error:', error);
      const existing = localStorage.getItem('mero_topup_orders');
      const orders: Order[] = existing ? JSON.parse(existing) : [];
      return orders.filter(o => o.uid === uid);
    }
  },

  getLastOrderByEmail: async (email: string): Promise<Order | null> => {
    const response = await fetch(`${DB_URL}/orders/pending.json`);
    const data = await response.json();
    if (!data) return null;
    const orders = Object.values(data).filter((o: any) => o.userEmail === email) as Order[];
    return orders.sort((a, b) => b.timestamp - a.timestamp)[0] || null;
  }
};

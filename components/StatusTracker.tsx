
import React, { useState } from 'react';
import { dbService } from '../services/dbService';
import { Order, OrderStatus } from '../types';

const StatusTracker: React.FC = () => {
  const [uid, setUid] = useState('');
  const [results, setResults] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleTrack = async () => {
    if (!uid.trim()) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const orders = await dbService.getOrdersByUid(uid);
      setResults(orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 'text-yellow-400 bg-yellow-400/10';
      case OrderStatus.PROCESSING: return 'text-blue-400 bg-blue-400/10';
      case OrderStatus.COMPLETED: return 'text-green-400 bg-green-400/10';
      case OrderStatus.REJECTED: return 'text-red-400 bg-red-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  return (
    <div className="max-w-2xl mx-auto glass-panel rounded-2xl p-6 mt-8 border border-indigo-500/20 shadow-xl">
      <h2 className="gaming-font text-xl text-indigo-400 mb-6 flex items-center gap-2">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        TRACK YOUR ORDER
      </h2>
      
      <div className="flex gap-2 mb-8">
        <input
          type="text"
          value={uid}
          onChange={(e) => setUid(e.target.value)}
          placeholder="Enter Player UID..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button
          onClick={handleTrack}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-8 py-3 rounded-xl transition-all font-bold"
        >
          {loading ? 'SEARCHING...' : 'TRACK'}
        </button>
      </div>

      <div className="space-y-4">
        {results.length > 0 ? (
          results.map((order) => (
            <div key={order.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-indigo-400 font-bold gaming-font">{order.game}</h3>
                  <p className="text-xs text-slate-500">Order ID: {order.id}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">UID</p>
                  <p className="text-slate-200 font-mono">{order.uid}</p>
                </div>
                <div>
                  <p className="text-slate-500">Username</p>
                  <p className="text-slate-200">{order.username}</p>
                </div>
                <div>
                  <p className="text-slate-500">Amount</p>
                  <p className="text-slate-200">{order.price}</p>
                </div>
                <div>
                  <p className="text-slate-500">Date</p>
                  <p className="text-slate-200">{new Date(order.timestamp).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))
        ) : hasSearched && !loading ? (
          <div className="text-center py-8 text-slate-500">
            <p>No orders found for this UID. Start a chat above to top up!</p>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-600 border border-dashed border-slate-800 rounded-xl">
            <p>Your recent order history will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusTracker;

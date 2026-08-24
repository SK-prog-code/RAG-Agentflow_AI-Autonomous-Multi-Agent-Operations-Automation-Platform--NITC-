import { useState, useEffect } from 'react';
import { X, Bell, CheckCircle2, AlertTriangle, AlertCircle, Info, Check } from 'lucide-react';
import api from '../../services/api';
import { getSocket } from '../../services/socket';

export default function NotificationDrawer({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data.data.notifications || []);
      setUnreadCount(res.data.data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on('notification:new', handleNewNotification);
    socket.on('notification:broadcast', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
      socket.off('notification:broadcast', handleNewNotification);
    };
  }, []);

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/all/read');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'escalation':
      case 'failure':
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-brand-400" />
              <h2 className="text-base font-semibold text-slate-100">Live Notifications</h2>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-brand-500/20 text-brand-400 rounded-full border border-brand-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition"
                  title="Mark all as read"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark read</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="text-center py-12 text-slate-500 text-sm">Loading alerts...</div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <Bell className="w-10 h-10 mx-auto mb-2 text-slate-600 stroke-[1.5]" />
                <p className="text-sm">No notifications yet</p>
                <span className="text-xs text-slate-600">Events and escalations will appear here.</span>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item._id}
                  className={`p-3 rounded-lg border transition ${
                    item.isRead
                      ? 'bg-slate-900/40 border-slate-800 text-slate-400'
                      : 'bg-slate-800/80 border-slate-700 text-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5">{getIcon(item.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-slate-100 truncate">{item.title}</h4>
                        <span className="text-[10px] text-slate-500 whitespace-nowrap ml-2">
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs mt-1 text-slate-300 leading-relaxed break-words">{item.message}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/50 text-[11px] text-slate-500 flex items-center justify-between">
            <span>NIT Calicut Agentflow_AI System</span>
            <span>Real-Time Monitoring Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}

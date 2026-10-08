import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Clock, FileCheck, AlertCircle, Sparkles } from 'lucide-react';
import { NotificationItem } from '../types';
import { markNotificationAsRead } from '../services/dataService';
import { playNotificationTone } from '../utils/sound';

interface NotificationBellProps {
  notifications: NotificationItem[];
  userRole: 'admin_pusat' | 'panitia_wilayah';
  userRegionId?: string;
  onSelectReport?: (reportId: string) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  notifications,
  userRole,
  userRegionId,
  onSelectReport,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter notifications relevant to current user role and region
  const filteredNotifications = notifications.filter((notif) => {
    if (notif.targetRole === 'all') return true;
    if (userRole === 'admin_pusat') {
      return notif.targetRole === 'admin_pusat';
    } else {
      if (notif.targetRole === 'panitia_wilayah') {
        return !notif.targetRegionId || notif.targetRegionId === userRegionId;
      }
      return false;
    }
  });

  const unreadCount = filteredNotifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenToggle = () => {
    if (!isOpen && unreadCount > 0) {
      playNotificationTone('pop');
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAllRead = async () => {
    playNotificationTone('success');
    for (const notif of filteredNotifications) {
      if (!notif.isRead) {
        await markNotificationAsRead(notif.id);
      }
    }
  };

  const displayList = filter === 'unread' 
    ? filteredNotifications.filter(n => !n.isRead) 
    : filteredNotifications;

  const getNotifIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'new_report':
        return <AlertCircle className="w-4 h-4 text-emerald-600" />;
      case 'report_verified':
        return <FileCheck className="w-4 h-4 text-teal-600" />;
      case 'revision_needed':
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'target_alert':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpenToggle}
        className="relative p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors shadow-xs"
        aria-label="Notifikasi Real-time"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-150 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 bg-gradient-to-r from-teal-900 to-emerald-800 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-emerald-300" />
              <div>
                <h4 className="font-semibold text-sm">Notifikasi Otomatis</h4>
                <p className="text-xs text-emerald-100">
                  {unreadCount > 0 ? `${unreadCount} laporan butuh tindakan` : 'Semua laporan terpantau'}
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs flex items-center gap-1 text-emerald-200 hover:text-white bg-white/10 hover:bg-white/20 px-2 py-1 rounded-lg transition"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Baca Semua
              </button>
            )}
          </div>

          <div className="flex border-b border-slate-100 px-3 py-1.5 bg-slate-50 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                filter === 'all' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Semua ({filteredNotifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                filter === 'unread' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Belum Dibaca ({unreadCount})
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {displayList.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">
                <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
                Tidak ada notifikasi saat ini
              </div>
            ) : (
              displayList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    markNotificationAsRead(item.id);
                    if (item.reportId && onSelectReport) {
                      onSelectReport(item.reportId);
                      setIsOpen(false);
                    }
                  }}
                  className={`p-3.5 transition-colors cursor-pointer hover:bg-slate-50 flex items-start space-x-3 ${
                    !item.isRead ? 'bg-emerald-50/50' : ''
                  }`}
                >
                  <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                    !item.isRead ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {getNotifIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs truncate ${!item.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {item.title}
                      </p>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
                      {item.message}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{item.createdAt}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-500">
              ⚡ Notifikasi terkirim otomatis secara instan via Firestore real-time
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

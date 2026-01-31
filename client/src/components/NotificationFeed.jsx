import React from 'react';
import { Bell, Wifi, WifiOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { useNotifications } from "../context/NotificationContext"; // Import hook

const NotificationFeed = ({ limit }) => {
  const { notifications, connectionStatus } = useNotifications();

  const displayNotifications = limit ? notifications.slice(0, limit) : notifications;

  return (
    <div className="w-full bg-slate-900 text-slate-100 flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-white/5 bg-black/20 shrink-0">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Real-time Feed
        </span>
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-medium transition-colors ${
          connectionStatus === 'Connected' 
            ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' 
            : 'text-amber-400 bg-amber-400/10 border-amber-400/20'
        }`}>
          {connectionStatus === 'Connected' ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {connectionStatus}
        </div>
      </div>

      {/* List */}
      <div className="p-2 space-y-2 overflow-y-auto custom-scrollbar flex-1 min-h-0">
        {displayNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-zinc-500">
                <Bell className="w-8 h-8 opacity-20 mb-2" />
                <p className="text-sm">No notifications</p>
            </div>
        ) : (
            displayNotifications.map((notif, index) => (
                <div key={notif.id || index} className="group flex gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                   <div className="mt-0.5 shrink-0">
                      {notif.type === 'error' ? <AlertCircle className="w-4 h-4 text-red-400" /> : <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                   </div>
                   <div className="flex flex-col gap-1 w-full">
                      <p className="text-sm text-zinc-200">{notif.message}</p>
                      <span className="text-[10px] text-zinc-500">
                        {notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString() : 'Just now'}
                      </span>
                   </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};

export default NotificationFeed;
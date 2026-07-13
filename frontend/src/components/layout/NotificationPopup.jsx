import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";
import { apiFetch } from "../../services/api";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { io } from "socket.io-client";

const NotificationPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef(null);
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const data = await apiFetch("/notifications");
      return Array.isArray(data) ? data : [];
    },
    enabled: !!user,
  });

  const unreadCount = notifications.filter((n) => !n.isread).length;

  const markAsReadMutation = useMutation({
    mutationFn: (id) =>
      apiFetch(`/notifications/${id}/read`, {
        method: "PUT",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      console.error("Lỗi:", error);
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () =>
      apiFetch("/notifications/read-all", {
        method: "PUT",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      console.error("Lỗi:", error);
    },
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Socket.IO Real-time Listener
  useEffect(() => {
    if (!user) return;

    // Kết nối tới server
    const socket = io("http://localhost:8080");

    // Tham gia room dành riêng cho user này
    const userId = user.userId || user.userid;
    socket.emit("join-room", userId);

    // Lắng nghe sự kiện thông báo mới
    socket.on("new_notification", (newNotification) => {
      console.log("Nhận được thông báo realtime:", newNotification);
      // Buộc TanStack Query fetch lại danh sách thông báo
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });

    return () => {
      socket.disconnect();
    };
  }, [user, queryClient]);

  const markAsRead = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    markAsReadMutation.mutate(id);
  };

  const markAllAsRead = async () => {
    markAllAsReadMutation.mutate();
  };

  if (!user) return null;

  return (
    <div
      className="relative"
      ref={popupRef}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div
        className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center cursor-pointer active:scale-95 transition-all border border-primary/30 hover:bg-primary/20 relative"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-gray-900">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 transform origin-top-right transition-all">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
            <h3 className="font-semibold text-gray-800 dark:text-white">
              Thông báo
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary hover:text-primary-dark font-medium transition-colors"
              >
                Đánh dấu đã đọc tất cả
              </button>
            )}
          </div>

          <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
            {Array.isArray(notifications) && notifications.length > 0 ? (
              notifications.slice(0, 5).map((notif) => (
                <div
                  key={notif.notificationid}
                  className={`p-4 border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors flex gap-3 cursor-pointer ${!notif.isread ? "bg-primary/5 dark:bg-primary/10" : ""}`}
                >
                  <div
                    className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${!notif.isread ? "bg-primary" : "bg-transparent"}`}
                  ></div>
                  <div className="flex-1">
                    <p
                      className={`text-sm ${!notif.isread ? "font-semibold text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}
                    >
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {notif.body}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>
                        {notif.createdat
                          ? formatDistanceToNow(new Date(notif.createdat), {
                              addSuffix: true,
                              locale: vi,
                            })
                          : "Vừa xong"}
                      </span>
                    </div>
                  </div>
                  {!notif.isread && (
                    <button
                      onClick={(e) => markAsRead(notif.notificationid, e)}
                      className="text-gray-400 hover:text-primary transition-colors flex-shrink-0 self-center"
                      title="Đánh dấu đã đọc"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500 text-sm flex flex-col items-center">
                <Bell className="w-8 h-8 mb-2 opacity-20" />
                <p className="font-semibold text-gray-700 dark:text-gray-200">
                  Chưa có thông báo nào
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Lịch đặt sân, ưu đãi và cập nhật mới sẽ hiển thị tại đây.
                </p>
              </div>
            )}
          </div>

          <Link
            to="/notifications"
            onClick={() => setIsOpen(false)}
            className="block text-center p-3 text-sm font-medium text-primary hover:bg-primary/5 transition-colors border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/80"
          >
            Xem tất cả thông báo
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationPopup;

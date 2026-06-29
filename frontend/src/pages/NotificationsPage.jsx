import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, Clock, CheckCircle } from "lucide-react";
import useAuthStore from "../store/useAuthStore";
import { apiFetch } from "../services/api";
import { formatDistanceToNow, format } from "date-fns";
import { vi } from "date-fns/locale";
import Header from "../components/layout/Header";

const NotificationsPage = () => {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading: loading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const data = await apiFetch("/notifications");
      return Array.isArray(data) ? data : [];
    },
    enabled: !!user,
  });

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

  const markAsRead = async (id) => {
    markAsReadMutation.mutate(id);
  };

  const markAllAsRead = async () => {
    markAllAsReadMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#001f24]">
      <Header />
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Thông báo của bạn</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Cập nhật những tin tức và thay đổi mới nhất</p>
              </div>
            </div>
            {notifications.some(n => !n.isread) && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors font-medium text-sm"
              >
                <CheckCircle className="w-4 h-4" />
                Đánh dấu đã đọc tất cả
              </button>
            )}
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {loading ? (
              <div className="p-12 text-center text-gray-500 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.notificationid}
                  className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors flex gap-4 ${!notif.isread ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                >
                  <div className={`flex-shrink-0 w-3 h-3 mt-1.5 rounded-full ${!notif.isread ? 'bg-primary shadow-[0_0_10px_rgba(225,255,81,0.5)]' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className={`text-base ${!notif.isread ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                        {notif.title}
                      </h3>
                      {!notif.isread && (
                        <button
                          onClick={() => markAsRead(notif.notificationid)}
                          className="text-gray-400 hover:text-primary transition-colors flex-shrink-0"
                          title="Đánh dấu đã đọc"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mt-2 whitespace-pre-line text-sm leading-relaxed">
                      {notif.body}
                    </p>
                    <div className="flex items-center gap-3 mt-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{notif.createdat ? formatDistanceToNow(new Date(notif.createdat), { addSuffix: true, locale: vi }) : "Vừa xong"}</span>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {notif.createdat && format(new Date(notif.createdat), "HH:mm - dd/MM/yyyy")}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-16 text-center text-gray-500 flex flex-col items-center">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <Bell className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Chưa có thông báo nào</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">
                  Khi có tin tức mới, cập nhật lịch đặt sân hoặc ưu đãi, chúng sẽ xuất hiện tại đây.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;

"use client";

import { useEffect, useState } from "react";
import { Package, Bell, AlertCircle } from "lucide-react";
import { api } from "@/app/lib/api";

interface Notification {
    id: number;
    user_id: number;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
    updated_at: string;
}

export default function NotificationPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setError("");

            const { data } = await api.get("/sql/notifications");

            setNotifications(data?.data || []);
        } catch (err: any) {
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to load notifications"
            );
        } finally {
            setLoading(false);
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const now = new Date().getTime();
        const created = new Date(dateString).getTime();

        const diff = Math.floor((now - created) / 1000);

        if (diff < 60) return "Just now";

        const mins = Math.floor(diff / 60);
        if (mins < 60) return `${mins} minute${mins > 1 ? "s" : ""} ago`;

        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;

        const days = Math.floor(hrs / 24);
        return `${days} day${days > 1 ? "s" : ""} ago`;
    };

    return (
        <div className="w-full h-full py-4">
            {/* Header */}
            <div className="mb-4 ">
                <h1 className="text-3xl  font-[600] text-[#101828]">
                    Notifications
                </h1>
            </div>

            {/* Loading */}
            {loading && (
                <div className="space-y-4">
                    {Array.from({ length: 6 }).map((_, idx) => (
                        <div
                            key={idx}
                            className="h-[90px] rounded-2xl border border-red-200 bg-red-50 animate-pulse"
                        />
                    ))}
                </div>
            )}

            {/* Error */}
            {!loading && error && (
                <div className="flex flex-col items-center justify-center py-16">
                    <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
                    <p className="text-red-600 font-medium">{error}</p>

                    <button
                        onClick={fetchNotifications}
                        className="mt-4 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Empty */}
            {!loading && !error && notifications.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20">
                    <Bell className="h-14 w-14 text-gray-300 mb-3" />

                    <h3 className="text-lg font-semibold text-gray-700">
                        No Notifications Found
                    </h3>

                    <p className="text-gray-500 mt-1">
                        You don't have any notifications yet.
                    </p>
                </div>
            )}

            {/* Notification List */}
            {!loading && !error && notifications.length > 0 && (
                <div className="space-y-4">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className="
                rounded-[12px]
                border-[1px]
                border-[#FF1111]
                bg-[#FFF1F1]
                p-2
                
                transition-all
                duration-200
                hover:bg-[#FFF0F0]
                hover:shadow-sm
                
              "
                        >
                            {/* Mobile */}
                            <div className="flex flex-col gap-3 md:hidden">
                                <div className="flex items-start gap-3 flex-col p-2">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white border border-gray-100">
                                        <Package className="h-5 w-5 text-gray-600" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <h3 className="text-[12px] font-[400] text-[#FF0000] truncate">
                                                    {notification.title}
                                                </h3>

                                                {!notification.is_read && (
                                                    <span className="h-2.5 w-2.5 rounded-full bg-red-500 shrink-0" />
                                                )}
                                            </div>

                                            <span className="text-[10px] text-[#949494] font-[400] whitespace-nowrap shrink-0">
                                                {formatTimeAgo(notification.created_at)}
                                            </span>
                                        </div>

                                        <p
                                            className="
      mt-1
      text-sm
      text-[#8B8B8B]
      overflow-wrap
      w-full
    "
                                        >
                                            {notification.message
                                                .replace(/\n/g, " ")
                                                .replace(/\s+/g, " ")
                                                .trim()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Desktop */}
                            <div className="hidden md:flex gap-4">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white border border-gray-100">
                                    <Package className="h-4 w-4 text-gray-600" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="text-[12px] font-[400] text-[#FF0000]">
                                                {notification.title}
                                            </h3>

                                            {!notification.is_read && (
                                                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                                            )}
                                        </div>

                                        <span className="text-[10px] text-[#949494] whitespace-nowrap">
                                            {formatTimeAgo(notification.created_at)}
                                        </span>
                                    </div>

                                    <p
                                        className="text-[10px] text-[#949494] font-[400]"
                                    >
                                        {notification.message
                                            .replace(/\n/g, " ")
                                            .replace(/\s+/g, " ")
                                            .trim()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
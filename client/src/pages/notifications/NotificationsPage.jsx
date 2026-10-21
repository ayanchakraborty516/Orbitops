import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { notificationApi } from '../../api/notificationApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Card, CardHeader, CardBody } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  Clock,
  ArrowRight,
  CheckCircle2,
  Rocket,
} from 'lucide-react';

export function NotificationsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success } = useToast();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.list(),
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      success('All notifications marked as read.');
    },
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const handleNotificationClick = (notif) => {
    if (!notif.isRead) {
      markReadMutation.mutate(notif._id);
    }
    if (notif.link) {
      navigate(notif.link);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-stone-300/80 dark:border-stone-800">
        <div>
          <div className="text-[10px] font-mono tracking-widest uppercase text-terracotta-600 dark:text-terracotta-400 mb-1">
            DISPATCH // SIGNALS
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-medium tracking-tight text-charcoal-900 dark:text-stone-100 flex items-center gap-3">
            <Bell className="w-6 h-6 text-terracotta-600 dark:text-terracotta-400 stroke-[1.5]" />
            Notifications Center
          </h1>
          <p className="text-xs text-charcoal-600 dark:text-stone-400 mt-1 max-w-xl">
            Operational alerts, issue assignment pings, and release rollouts.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            icon={CheckCheck}
            isLoading={markAllReadMutation.isPending}
            onClick={() => markAllReadMutation.mutate()}
          >
            Mark All as Read ({unreadCount})
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <Card>
        <CardBody className="p-0 divide-y divide-stone-200 dark:divide-stone-800">
          {isLoading ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center text-xs text-charcoal-500 dark:text-stone-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2 stroke-[1.5]" />
              <p className="font-serif font-medium text-charcoal-900 dark:text-stone-200 text-sm">All caught up</p>
              <p className="text-charcoal-500 dark:text-stone-400 mt-0.5">No unhandled operational notifications in this workspace.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif._id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 flex items-start justify-between gap-4 cursor-pointer transition-colors ${
                  !notif.isRead
                    ? 'bg-stone-100/90 dark:bg-[#1E201C] hover:bg-stone-200/60 dark:hover:bg-[#252822] border-l-2 border-l-terracotta-600 dark:border-l-terracotta-500'
                    : 'hover:bg-stone-100/50 dark:hover:bg-[#1A1C18]'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <span
                    className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                      !notif.isRead ? 'bg-terracotta-600 dark:bg-terracotta-400' : 'bg-transparent'
                    }`}
                  />
                  <div>
                    <h4 className="text-xs font-semibold text-charcoal-900 dark:text-stone-100">
                      {notif.title}
                    </h4>
                    <p className="text-xs text-charcoal-600 dark:text-stone-400 mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[10px] font-mono text-charcoal-500 dark:text-stone-400 mt-1 inline-block">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={notif.isRead ? 'default' : 'primary'} size="xs" className="font-mono">
                    {notif.isRead ? 'READ' : 'NEW'}
                  </Badge>
                  {notif.link && <ArrowRight className="w-4 h-4 text-charcoal-400 dark:text-stone-500 stroke-[1.5]" />}
                </div>
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default NotificationsPage;

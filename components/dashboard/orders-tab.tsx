'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Loader2,
  Package,
  CheckCircle,
  Truck,
  Clock,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  MapPin,
  User,
  Phone,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/booking';
import { bookingsApi } from '@/lib/api';
import { Booking, BookingStatus } from '@/types';
import { formatCurrency } from '@/lib/utils/format';
import { useTranslation } from '@/hooks';

const statusFlow: BookingStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'on-the-way',
  'delivered',
  'completed',
];

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatDateDisplay(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayKey = formatDateKey(today);
  const tomorrowKey = formatDateKey(tomorrow);

  if (dateStr === todayKey) return 'Today';
  if (dateStr === tomorrowKey) return 'Tomorrow';

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

function getWeekRange(baseDate: Date): { start: Date; end: Date } {
  const start = new Date(baseDate);
  start.setDate(start.getDate() - start.getDay() + 1); // Monday
  const end = new Date(start);
  end.setDate(end.getDate() + 6); // Sunday
  return { start, end };
}

function getDaysInRange(start: Date, end: Date): string[] {
  const days: string[] = [];
  const current = new Date(start);
  while (current <= end) {
    days.push(formatDateKey(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

export function OrdersTab() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      const response = await bookingsApi.getProviderBookings();
      setBookings(response.bookings);
    } catch (error) {
      toast.error(t('dashboardOrders', 'failedToLoadOrders'));
    } finally {
      setIsLoading(false);
    }
  }

  const handleUpdateStatus = async (booking: Booking) => {
    const currentIndex = statusFlow.indexOf(booking.status);
    if (currentIndex === -1 || currentIndex >= statusFlow.length - 1) return;

    const nextStatus = statusFlow[currentIndex + 1];
    setUpdatingId(booking._id);

    try {
      const response = await bookingsApi.updateStatus(booking._id, nextStatus);
      setBookings((prev) =>
        prev.map((b) => (b._id === booking._id ? response.booking : b))
      );
      toast.success(t('dashboardOrders', 'orderUpdated', { status: nextStatus }));
    } catch (error) {
      toast.error(t('dashboardOrders', 'failedToUpdate'));
    } finally {
      setUpdatingId(null);
    }
  };

  const nextStatusLabel: Record<string, string> = {
    pending: t('dashboardOrders', 'confirmOrder'),
    confirmed: t('dashboardOrders', 'startPreparing'),
    preparing: t('dashboardOrders', 'outForDelivery'),
    'on-the-way': t('dashboardOrders', 'markDelivered'),
    delivered: t('dashboardOrders', 'complete'),
  };

  // Week navigation
  const baseDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  }, [weekOffset]);

  const { start: weekStart, end: weekEnd } = useMemo(
    () => getWeekRange(baseDate),
    [baseDate]
  );

  const weekDays = useMemo(
    () => getDaysInRange(weekStart, weekEnd),
    [weekStart, weekEnd]
  );

  // Group bookings by delivery date
  const bookingsByDate = useMemo(() => {
    const map: Record<string, Booking[]> = {};
    for (const b of bookings) {
      const key = formatDateKey(new Date(b.deliveryDate));
      if (!map[key]) map[key] = [];
      map[key].push(b);
    }
    // Sort each day's bookings by time
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => a.deliveryTime.localeCompare(b.deliveryTime));
    }
    return map;
  }, [bookings]);

  // Count bookings per groupId for multi-day badge
  const groupCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const b of bookings) {
      if (b.groupId) {
        counts[b.groupId] = (counts[b.groupId] || 0) + 1;
      }
    }
    return counts;
  }, [bookings]);

  const weekLabel = `${weekStart.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })} – ${weekEnd.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;

  const todayKey = formatDateKey(new Date());

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setWeekOffset((w) => w - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-center">
          <h3 className="font-semibold flex items-center justify-center gap-2">
            <CalendarDays className="h-5 w-5" />
            {t('dashboardOrders', 'deliverySchedule')}
          </h3>
          <p className="text-sm text-text-light">{weekLabel}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setWeekOffset((w) => w + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Quick jump to today */}
      {weekOffset !== 0 && (
        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setWeekOffset(0)}
            className="text-primary"
          >
            {t('dashboardOrders', 'jumpToThisWeek')}
          </Button>
        </div>
      )}

      {/* Day-by-day view */}
      <div className="space-y-6">
        {weekDays.map((dayKey) => {
          const dayBookings = bookingsByDate[dayKey] || [];
          const isToday = dayKey === todayKey;
          const activeCount = dayBookings.filter(
            (b) => !['completed', 'cancelled'].includes(b.status)
          ).length;
          const deliveredCount = dayBookings.filter(
            (b) => b.status === 'completed' || b.status === 'delivered'
          ).length;

          return (
            <div key={dayKey}>
              {/* Day header */}
              <div
                className={`flex items-center justify-between rounded-lg px-4 py-3 mb-3 ${
                  isToday
                    ? 'bg-primary/10 border border-primary/20'
                    : 'bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`text-center leading-tight ${
                      isToday ? 'text-primary' : 'text-text-dark'
                    }`}
                  >
                    <p className="text-xs uppercase tracking-wide font-medium">
                      {new Date(dayKey + 'T00:00:00').toLocaleDateString('en-US', {
                        weekday: 'short',
                      })}
                    </p>
                    <p className="text-2xl font-bold">
                      {new Date(dayKey + 'T00:00:00').getDate()}
                    </p>
                  </div>
                  <div>
                    <p className={`font-medium ${isToday ? 'text-primary' : ''}`}>
                      {formatDateDisplay(dayKey)}
                    </p>
                    {dayBookings.length > 0 && (
                      <p className="text-xs text-text-light">
                        {dayBookings.length} {t('bookings', 'orders')}
                        {activeCount > 0 && ` · ${activeCount} ${t('dashboardOrders', 'active')}`}
                        {deliveredCount > 0 && ` · ${deliveredCount} ${t('dashboardOrders', 'delivered')}`}
                      </p>
                    )}
                  </div>
                </div>
                {dayBookings.length > 0 && (
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {formatCurrency(
                        dayBookings.reduce((s, b) => s + b.pricing.total, 0)
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Bookings for this day */}
              {dayBookings.length === 0 ? (
                <p className="text-sm text-text-light pl-4 pb-2">{t('dashboardOrders', 'noOrders')}</p>
              ) : (
                <div className="space-y-3 pl-2">
                  {dayBookings.map((booking) => (
                    <OrderCard
                      key={booking._id}
                      booking={booking}
                      isUpdating={updatingId === booking._id}
                      onUpdateStatus={handleUpdateStatus}
                      groupDayCount={booking.groupId ? groupCounts[booking.groupId] : undefined}
                      nextStatusLabel={nextStatusLabel}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Order Card ───

interface OrderCardProps {
  booking: Booking;
  isUpdating: boolean;
  onUpdateStatus: (booking: Booking) => void;
  groupDayCount?: number;
  nextStatusLabel: Record<string, string>;
}

function OrderCard({ booking, isUpdating, onUpdateStatus, groupDayCount, nextStatusLabel }: OrderCardProps) {
  const isTerminal = ['completed', 'cancelled'].includes(booking.status);
  const { t } = useTranslation();
  const customer = booking.userId as unknown as {
    name?: string;
    email?: string;
    phone?: string;
  };

  return (
    <Card className={isTerminal ? 'opacity-60' : ''}>
      <CardContent className="p-4 space-y-3">
        {/* Header: order id + time + status */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium">
                #{booking._id.slice(-6).toUpperCase()}
              </p>
              <span className="text-sm font-medium text-primary flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {booking.deliveryTime}
              </span>
              {groupDayCount && groupDayCount > 1 && (
                <Badge variant="outline" className="text-xs">
                  {t('booking', 'dayOrder', { count: groupDayCount })}
                </Badge>
              )}
            </div>
            {/* Customer info */}
            {customer?.name && (
              <div className="flex items-center gap-3 mt-1 text-sm text-text-light">
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {customer.name}
                </span>
                {customer.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    {customer.phone}
                  </span>
                )}
              </div>
            )}
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <Separator />

        {/* Items */}
        <div className="space-y-1 text-sm">
          {booking.items.map((item, i) => (
            <div key={i} className="flex justify-between">
              <span>
                {item.quantity}x {item.name}
              </span>
              <span className="text-text-light">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <Separator />

        {/* Delivery info + total + action */}
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            {booking.deliveryType === 'delivery' ? (
              <p className="text-sm text-text-light flex items-start gap-1">
                <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <span className="truncate">
                  {booking.deliveryAddress?.street || 'No address'}
                </span>
              </p>
            ) : (
              <p className="text-sm text-text-light flex items-center gap-1">
                <Package className="h-3.5 w-3.5" />
                {t('common', 'pickup')}
              </p>
            )}
            <p className="font-semibold mt-1">
              {formatCurrency(booking.pricing.total)}
            </p>
          </div>

          {!isTerminal && (
            <Button
              size="sm"
              onClick={() => onUpdateStatus(booking)}
              disabled={isUpdating}
              className="flex-shrink-0"
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {booking.status === 'on-the-way' ? (
                    <Truck className="mr-1 h-4 w-4" />
                  ) : (
                    <CheckCircle className="mr-1 h-4 w-4" />
                  )}
                  {nextStatusLabel[booking.status]}
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

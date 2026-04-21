'use client';

import { Badge } from '@/components/ui/badge';
import { BookingStatus } from '@/types';
import { useTranslation } from '@/hooks';

interface StatusBadgeProps {
  status: BookingStatus;
}

const statusVariants: Record<BookingStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  confirmed: 'default',
  preparing: 'default',
  'on-the-way': 'default',
  delivered: 'default',
  completed: 'outline',
  cancelled: 'destructive',
};

const statusLabelKeys: Record<BookingStatus, string> = {
  pending: 'pending',
  confirmed: 'confirmed',
  preparing: 'preparing',
  'on-the-way': 'onTheWay',
  delivered: 'delivered',
  completed: 'completed',
  cancelled: 'cancelled',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation();
  const variant = statusVariants[status] || 'secondary';
  const labelKey = statusLabelKeys[status];
  const label = labelKey ? t('status', labelKey as 'pending' | 'confirmed' | 'preparing' | 'onTheWay' | 'delivered' | 'completed' | 'cancelled') : status;

  return (
    <Badge variant={variant} className="capitalize">
      {label}
    </Badge>
  );
}

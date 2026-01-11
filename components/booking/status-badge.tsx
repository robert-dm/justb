'use client';

import { Badge } from '@/components/ui/badge';
import { BookingStatus } from '@/types';

interface StatusBadgeProps {
  status: BookingStatus;
}

const statusConfig: Record<
  BookingStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  pending: { label: 'Pending', variant: 'secondary' },
  confirmed: { label: 'Confirmed', variant: 'default' },
  preparing: { label: 'Preparing', variant: 'default' },
  'on-the-way': { label: 'On the Way', variant: 'default' },
  delivered: { label: 'Delivered', variant: 'default' },
  completed: { label: 'Completed', variant: 'outline' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: 'secondary' };

  return (
    <Badge variant={config.variant} className="capitalize">
      {config.label}
    </Badge>
  );
}

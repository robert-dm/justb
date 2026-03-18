'use client';

import { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { bookingsApi } from '@/lib/api';
import { Booking } from '@/types';
import { useTranslation } from '@/hooks';

interface ReviewDialogProps {
  booking: Booking;
  open: boolean;
  onClose: () => void;
  onSubmit: (booking: Booking) => void;
}

export function ReviewDialog({
  booking,
  open,
  onClose,
  onSubmit,
}: ReviewDialogProps) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      toast.error(t('review', 'selectRating'));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await bookingsApi.addReview(booking._id, {
        rating,
        comment: comment.trim() || undefined,
      });
      toast.success(t('review', 'reviewSubmitted'));
      onSubmit(response.booking);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('review', 'failedToSubmit'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const provider = booking.providerId;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('review', 'title')}</DialogTitle>
          <DialogDescription>
            {t('review', 'description', { businessName: provider.businessName })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-text-light">
              {rating === 1 && t('review', 'poor')}
              {rating === 2 && t('review', 'fair')}
              {rating === 3 && t('review', 'good')}
              {rating === 4 && t('review', 'veryGood')}
              {rating === 5 && t('review', 'excellent')}
            </p>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">{t('review', 'commentLabel')}</Label>
            <Textarea
              id="comment"
              placeholder={t('review', 'commentPlaceholder')}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              {t('common', 'cancel')}
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('review', 'submitting')}
                </>
              ) : (
                t('review', 'submitReview')
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

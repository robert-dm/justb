'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Trash2,
  ShoppingBag,
  Loader2,
  UtensilsCrossed,
  MapPin,
  ArrowLeft,
  ArrowRight,
  Clock,
  Building2,
  Plus,
  X,
  CalendarDays,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { QuantityControl } from '@/components/menu';
import { useCartStore, useCartItemCount, useIsAuthenticated } from '@/stores';
import { bookingsApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils/format';
import { DeliveryType, DeliveryDay } from '@/types';

type Step = 'cart' | 'confirm';

const TIME_SLOTS = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00',
];

function getMinDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function getNextDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export function CartSheet() {
  const router = useRouter();
  const { t } = useTranslation();
  const isAuthenticated = useIsAuthenticated();
  const cartItemCount = useCartItemCount();
  const {
    items,
    provider,
    searchAddress,
    updateQuantity,
    removeItem,
    clearCart,
    getSubtotal,
    getDeliveryFee,
    getTotal,
    setDeliveryInfo,
    setSearchAddress,
  } = useCartStore();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('cart');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');
  const [days, setDays] = useState<DeliveryDay[]>([{ date: '', time: '' }]);
  const [apt, setApt] = useState(searchAddress?.apt || '');
  const [floor, setFloor] = useState(searchAddress?.floor || '');
  const [notes, setNotes] = useState(searchAddress?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const minDate = getMinDate();
  const hasDelivery = provider?.serviceType?.delivery ?? true;
  const hasPickup = provider?.serviceType?.pickup ?? false;

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setStep('cart');
      setErrors({});
    }
  };

  const handleContinue = () => {
    if (!isAuthenticated) {
      toast.error(t('cart', 'pleaseLogin'));
      setOpen(false);
      router.push('/login');
      return;
    }
    if (items.length === 0) {
      toast.error(t('cart', 'cartEmpty'));
      return;
    }
    setStep('confirm');
  };

  // ─── Day management ───

  const updateDay = useCallback(
    (index: number, field: keyof DeliveryDay, value: string) => {
      setDays((prev) => prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[`day_${index}_date`];
        delete next[`day_${index}_time`];
        return next;
      });
    },
    []
  );

  const addDay = useCallback(() => {
    setDays((prev) => {
      const lastDay = prev[prev.length - 1];
      const nextDate = lastDay?.date ? getNextDate(lastDay.date) : '';
      const sameTime = lastDay?.time || '';
      return [...prev, { date: nextDate, time: sameTime }];
    });
  }, []);

  const removeDay = useCallback((index: number) => {
    setDays((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }, []);

  const addConsecutiveDays = useCallback((count: number) => {
    setDays((prev) => {
      const firstDay = prev[0];
      if (!firstDay?.date || !firstDay?.time) {
        toast.error(t('cart', 'setFirstDay'));
        return prev;
      }
      const newDays: DeliveryDay[] = [firstDay];
      let currentDate = firstDay.date;
      for (let i = 1; i < count; i++) {
        currentDate = getNextDate(currentDate);
        newDays.push({ date: currentDate, time: firstDay.time });
      }
      return newDays;
    });
  }, []);

  // ─── Validation ───

  const validateConfirm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (deliveryType === 'delivery' && !searchAddress?.street) {
      newErrors.address = t('cart', 'searchAddressFirst');
    }

    const seenDates = new Set<string>();
    days.forEach((day, i) => {
      if (!day.date) newErrors[`day_${i}_date`] = t('common', 'required');
      if (!day.time) newErrors[`day_${i}_time`] = t('common', 'required');
      if (day.date && day.date < minDate) newErrors[`day_${i}_date`] = t('cart', 'mustBeTomorrow');
      if (day.date && seenDates.has(day.date)) newErrors[`day_${i}_date`] = t('cart', 'duplicateDate');
      if (day.date) seenDates.add(day.date);
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Checkout ───

  const handleCheckout = async () => {
    if (!validateConfirm()) return;

    setIsSubmitting(true);

    try {
      if (searchAddress) {
        setSearchAddress({ ...searchAddress, apt, floor, notes });
      }

      const fullAddress = [
        searchAddress?.street,
        apt && `Apt ${apt}`,
        floor && `Floor ${floor}`,
      ]
        .filter(Boolean)
        .join(', ');

      const deliveryAddress =
        deliveryType === 'delivery' ? { street: fullAddress, notes } : undefined;

      const orderItems = items.map((item) => ({
        menuItemId: item.menuItemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      const pricing = {
        subtotal: getSubtotal(),
        deliveryFee: getDeliveryFee(),
        tax: 0,
        total: getTotal(),
      };

      if (days.length === 1) {
        // Single day: use the regular endpoint
        setDeliveryInfo({
          type: deliveryType,
          date: days[0].date,
          time: days[0].time,
          address: deliveryAddress,
        });

        const response = await bookingsApi.create({
          providerId: provider!._id,
          items: orderItems,
          deliveryDate: days[0].date,
          deliveryTime: days[0].time,
          deliveryType,
          deliveryAddress,
          pricing,
        });

        toast.success(t('cart', 'orderCreated'));
        setOpen(false);
        setStep('cart');
        router.push(`/checkout?booking=${response.booking._id}`);
      } else {
        // Multi-day: use the bulk endpoint
        const response = await bookingsApi.createBulk({
          providerId: provider!._id,
          items: orderItems,
          days,
          deliveryType,
          deliveryAddress,
          pricing,
        });

        toast.success(t('cart', 'ordersCreated', { count: response.bookings.length }));
        setOpen(false);
        setStep('cart');
        router.push(`/checkout?group=${response.groupId}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('cart', 'failedToCreate'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalForAllDays = getTotal() * days.length;

  // ─── Empty state ───
  const renderEmpty = () => (
    <div className="flex flex-1 flex-col items-center justify-center text-center px-5">
      <ShoppingBag className="h-16 w-16 text-muted-foreground" />
      <p className="mt-4 text-lg font-medium text-text-dark">{t('cart', 'emptyCart')}</p>
      <p className="mt-1 text-sm text-text-light">
        {t('cart', 'emptyCartDesc')}
      </p>
      <Button
        variant="outline"
        className="mt-6"
        onClick={() => {
          setOpen(false);
          router.push('/providers');
        }}
      >
        {t('common', 'browseMenu')}
      </Button>
    </div>
  );

  // ─── Step 1: Cart items ───
  const renderCart = () => (
    <div className="flex flex-1 flex-col overflow-hidden">
      {provider && (
        <p className="px-5 pb-3 text-sm text-text-light">
          {t('common', 'from')}{' '}
          <span className="font-medium text-text-dark">{provider.businessName}</span>
        </p>
      )}

      <div className="flex-1 overflow-y-auto px-5">
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.menuItemId} className="flex items-center gap-3">
              <div className="h-14 w-14 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                    <UtensilsCrossed className="h-5 w-5 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-sm text-text-light">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
              <QuantityControl
                quantity={item.quantity}
                onIncrease={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                onDecrease={() => updateQuantity(item.menuItemId, item.quantity - 1)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="border-t bg-background px-5 py-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-text-light">{t('cart', 'subtotalItems', { count: cartItemCount })}</span>
          <span className="font-medium">{formatCurrency(getSubtotal())}</span>
        </div>
        <Button className="w-full" size="lg" onClick={handleContinue}>
          {t('cart', 'continue')}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  // ─── Step 2: Confirmation ───
  const renderConfirm = () => (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-5 space-y-5">
        {/* Back */}
        <button
          onClick={() => { setStep('cart'); setErrors({}); }}
          className="inline-flex items-center gap-1 text-sm text-text-light hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('cart', 'editItems')}
        </button>

        {/* Order summary */}
        <div className="rounded-lg border p-3 space-y-2">
          <p className="text-xs font-medium text-text-light uppercase tracking-wide">
            {t('cart', 'orderSummary')}
          </p>
          {items.map((item) => (
            <div key={item.menuItemId} className="flex items-center gap-2">
              <div className="h-8 w-8 flex-shrink-0 rounded overflow-hidden bg-muted">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <UtensilsCrossed className="h-3 w-3 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <span className="flex-1 text-sm truncate">{item.name}</span>
              <span className="text-xs text-text-light">x{item.quantity}</span>
              <span className="text-sm font-medium">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        {/* Delivery type */}
        <div>
          <Label className="text-sm font-medium">{t('cart', 'deliveryType')}</Label>
          <Select value={deliveryType} onValueChange={(v: DeliveryType) => setDeliveryType(v)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {hasDelivery && <SelectItem value="delivery">{t('common', 'delivery')}</SelectItem>}
              {hasPickup && <SelectItem value="pickup">{t('common', 'pickup')}</SelectItem>}
            </SelectContent>
          </Select>
        </div>

        {/* Delivery address */}
        {deliveryType === 'delivery' && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">{t('cart', 'deliveryAddress')}</Label>
            <div className="flex items-start gap-2 rounded-lg bg-muted/50 border p-3">
              <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                {searchAddress?.street ? (
                  <p className="text-sm text-text-dark">{searchAddress.street}</p>
                ) : (
                  <p className="text-sm text-destructive">
                    {t('cart', 'noAddressSet')}
                  </p>
                )}
              </div>
            </div>
            {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-text-light">
                  <Building2 className="inline h-3 w-3 mr-1" />
                  {t('cart', 'aptUnit')}
                </Label>
                <Input placeholder={t('cart', 'aptPlaceholder')} value={apt} onChange={(e) => setApt(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-text-light">{t('cart', 'floor')}</Label>
                <Input placeholder={t('cart', 'floorPlaceholder')} value={floor} onChange={(e) => setFloor(e.target.value)} className="mt-1" />
              </div>
            </div>

            <div>
              <Label className="text-xs text-text-light">{t('cart', 'deliveryNotes')}</Label>
              <Textarea
                placeholder={t('cart', 'deliveryNotesPlaceholder')}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="mt-1 resize-none"
              />
            </div>
          </div>
        )}

        {/* ─── Delivery days ─── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              {t('cart', 'deliveryDays')}
            </Label>
            {days.length < 14 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addDay}
                className="h-7 text-xs text-primary"
              >
                <Plus className="h-3 w-3 mr-1" />
                {t('cart', 'addDay')}
              </Button>
            )}
          </div>

          {/* Quick add buttons */}
          {days.length === 1 && (
            <div className="flex gap-2">
              {[3, 5, 7].map((n) => (
                <Button
                  key={n}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => addConsecutiveDays(n)}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  {`${n} ${t('common', 'days')}`}
                </Button>
              ))}
            </div>
          )}

          {/* Day rows */}
          <div className="space-y-2">
            {days.map((day, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center gap-2">
                  {/* Day label */}
                  <span className="text-xs font-medium text-text-light w-6 text-center flex-shrink-0">
                    {index + 1}
                  </span>

                  {/* Date */}
                  <Input
                    type="date"
                    min={minDate}
                    value={day.date}
                    onChange={(e) => updateDay(index, 'date', e.target.value)}
                    className={`h-9 text-sm flex-1 ${errors[`day_${index}_date`] ? 'border-destructive' : ''}`}
                  />

                  {/* Time */}
                  <Select
                    value={day.time}
                    onValueChange={(v) => updateDay(index, 'time', v)}
                  >
                    <SelectTrigger
                      className={`h-9 w-24 text-sm flex-shrink-0 ${errors[`day_${index}_time`] ? 'border-destructive' : ''}`}
                    >
                      <SelectValue placeholder={t('cart', 'time')} />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map((slot) => (
                        <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Remove */}
                  {days.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 flex-shrink-0 text-text-light hover:text-destructive"
                      onClick={() => removeDay(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Date display + errors */}
                <div className="pl-8 flex gap-3">
                  {day.date && !errors[`day_${index}_date`] && (
                    <span className="text-xs text-text-light">{formatShortDate(day.date)}</span>
                  )}
                  {errors[`day_${index}_date`] && (
                    <span className="text-xs text-destructive">{errors[`day_${index}_date`]}</span>
                  )}
                  {errors[`day_${index}_time`] && (
                    <span className="text-xs text-destructive">{errors[`day_${index}_time`]}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {days.length > 1 && (
            <p className="text-xs text-text-light bg-muted/50 rounded p-2">
              {t('cart', 'multiDayNote', { count: days.length })}
            </p>
          )}
        </div>
      </div>

      {/* Bottom: pricing + place order */}
      <div className="border-t bg-background px-5 py-4 space-y-3">
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-text-light">{t('common', 'perDay')}</span>
            <span>{formatCurrency(getTotal())}</span>
          </div>
          {days.length > 1 && (
            <div className="flex justify-between text-sm">
              <span className="text-text-light">x {days.length} {t('common', 'days')}</span>
              <span>{formatCurrency(totalForAllDays)}</span>
            </div>
          )}
          {deliveryType === 'delivery' && (
            <div className="flex justify-between text-xs text-text-light">
              <span>{t('cart', 'includesDeliveryFee', { fee: formatCurrency(getDeliveryFee()) })}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-semibold text-base">
            <span>{t('common', 'total')}</span>
            <span>{formatCurrency(totalForAllDays)}</span>
          </div>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={handleCheckout}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {days.length > 1 ? t('cart', 'creatingOrders', { count: days.length }) : t('cart', 'creatingOrder')}
            </>
          ) : days.length > 1 ? (
            t('cart', 'placeOrders', { count: days.length, total: formatCurrency(totalForAllDays) })
          ) : (
            t('cart', 'placeOrder', { total: formatCurrency(getTotal()) })
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <button className="relative">
          <ShoppingBag className="h-6 w-6 text-text-dark transition-colors hover:text-primary" />
          {cartItemCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
              {cartItemCount}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-md p-0">
        <SheetHeader className="px-5 pt-5 pb-0">
          <SheetTitle className="flex items-center justify-between">
            <span>{step === 'cart' ? t('cart', 'yourOrder') : t('cart', 'confirmOrder')}</span>
            {step === 'cart' && items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0
          ? renderEmpty()
          : step === 'cart'
            ? renderCart()
            : renderConfirm()}
      </SheetContent>
    </Sheet>
  );
}

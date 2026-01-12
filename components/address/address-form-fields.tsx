'use client';

import { UseFormRegister } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddressFormFieldsProps {
  register: UseFormRegister<any>;
  errors?: any;
  namePrefix?: string;
  disabled?: boolean;
}

/**
 * Standard address form fields that integrate with React Hook Form
 *
 * Includes: street, city, state, zipCode, country, and hidden coordinates fields
 */
export function AddressFormFields({
  register,
  errors,
  namePrefix = 'address',
  disabled = false,
}: AddressFormFieldsProps) {
  // Helper to get nested error
  const getError = (field: string) => {
    if (!errors) return undefined;

    const parts = `${namePrefix}.${field}`.split('.');
    let error: any = errors;

    for (const part of parts) {
      if (error?.[part]) {
        error = error[part];
      } else {
        return undefined;
      }
    }

    return error?.message;
  };

  return (
    <div className="space-y-4">
      {/* Street Address */}
      <div>
        <Label htmlFor={`${namePrefix}.street`}>
          Street Address
        </Label>
        <Input
          id={`${namePrefix}.street`}
          {...register(`${namePrefix}.street` as any)}
          placeholder="123 Main St"
          disabled={disabled}
          className="mt-1.5"
        />
        {getError('street') && (
          <p className="text-sm text-destructive mt-1">{getError('street')}</p>
        )}
      </div>

      {/* City and State */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`${namePrefix}.city`}>
            City
          </Label>
          <Input
            id={`${namePrefix}.city`}
            {...register(`${namePrefix}.city` as any)}
            placeholder="San Francisco"
            disabled={disabled}
            className="mt-1.5"
          />
          {getError('city') && (
            <p className="text-sm text-destructive mt-1">{getError('city')}</p>
          )}
        </div>

        <div>
          <Label htmlFor={`${namePrefix}.state`}>
            State/Province
          </Label>
          <Input
            id={`${namePrefix}.state`}
            {...register(`${namePrefix}.state` as any)}
            placeholder="CA"
            disabled={disabled}
            className="mt-1.5"
          />
          {getError('state') && (
            <p className="text-sm text-destructive mt-1">{getError('state')}</p>
          )}
        </div>
      </div>

      {/* ZIP Code and Country */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`${namePrefix}.zipCode`}>
            ZIP / Postal Code
          </Label>
          <Input
            id={`${namePrefix}.zipCode`}
            {...register(`${namePrefix}.zipCode` as any)}
            placeholder="94102"
            disabled={disabled}
            className="mt-1.5"
          />
          {getError('zipCode') && (
            <p className="text-sm text-destructive mt-1">{getError('zipCode')}</p>
          )}
        </div>

        <div>
          <Label htmlFor={`${namePrefix}.country`}>
            Country
          </Label>
          <Input
            id={`${namePrefix}.country`}
            {...register(`${namePrefix}.country` as any)}
            placeholder="United States"
            disabled={disabled}
            className="mt-1.5"
          />
          {getError('country') && (
            <p className="text-sm text-destructive mt-1">{getError('country')}</p>
          )}
        </div>
      </div>

      {/* Hidden coordinate fields for form submission */}
      <input
        type="hidden"
        {...register(`${namePrefix}.coordinates.lat` as any, { valueAsNumber: true })}
      />
      <input
        type="hidden"
        {...register(`${namePrefix}.coordinates.lng` as any, { valueAsNumber: true })}
      />
    </div>
  );
}

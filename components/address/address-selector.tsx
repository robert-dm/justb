'use client';

import { useCallback } from 'react';
import { Control, UseFormSetValue, UseFormWatch, UseFormRegister } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { AddressMapPicker, AddressWithCoordinates } from './address-map-picker';
import { AddressFormFields } from './address-form-fields';

interface AddressSelectorProps {
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  register: UseFormRegister<any>;
  errors?: any;
  namePrefix?: string;
  disabled?: boolean;
  showMap?: boolean;
  defaultCenter?: { lat: number; lng: number };
}

/**
 * High-level component that combines AddressMapPicker and AddressFormFields
 *
 * Manages synchronization between map interactions and form state via React Hook Form.
 * When the map is updated, it updates all form fields via setValue.
 */
export function AddressSelector({
  control,
  setValue,
  watch,
  register,
  errors,
  namePrefix = 'address',
  disabled = false,
  showMap = true,
  defaultCenter,
}: AddressSelectorProps) {
  // Watch the entire address object
  const addressValue: AddressWithCoordinates = watch(namePrefix) || {};

  /**
   * Handle changes from the map picker
   * Updates all form fields via setValue
   */
  const handleMapChange = useCallback(
    (newAddress: AddressWithCoordinates) => {
      // Update all address fields
      if (newAddress.street !== undefined) {
        setValue(`${namePrefix}.street` as any, newAddress.street, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }

      if (newAddress.city !== undefined) {
        setValue(`${namePrefix}.city` as any, newAddress.city, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }

      if (newAddress.state !== undefined) {
        setValue(`${namePrefix}.state` as any, newAddress.state, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }

      if (newAddress.zipCode !== undefined) {
        setValue(`${namePrefix}.zipCode` as any, newAddress.zipCode, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }

      if (newAddress.country !== undefined) {
        setValue(`${namePrefix}.country` as any, newAddress.country, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }

      // Update coordinates
      if (newAddress.coordinates) {
        setValue(`${namePrefix}.coordinates.lat` as any, newAddress.coordinates.lat, {
          shouldDirty: true,
          shouldValidate: true,
        });
        setValue(`${namePrefix}.coordinates.lng` as any, newAddress.coordinates.lng, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    },
    [setValue, namePrefix]
  );

  return (
    <div className="space-y-6">
      {/* Map Section */}
      {showMap && (
        <div>
          <Label className="text-base mb-3 block">Location</Label>
          <p className="text-sm text-muted-foreground mb-3">
            Search for an address or click on the map to select your location.
          </p>
          <AddressMapPicker
            value={addressValue}
            onChange={handleMapChange}
            disabled={disabled}
            defaultCenter={defaultCenter}
          />
        </div>
      )}

      {/* Address Form Fields */}
      <div>
        <Label className="text-base mb-3 block">Address Details</Label>
        <AddressFormFields
          register={register}
          errors={errors}
          namePrefix={namePrefix}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

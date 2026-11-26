import React from 'react';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { TextField, TextFieldProps } from './TextField';

interface Props<T extends FieldValues>
  extends Omit<TextFieldProps, 'value' | 'onChangeText'> {
  control: Control<T>;
  name: FieldPath<T>;
  /** Optional input mask / normaliser applied on every keystroke. */
  transform?: (v: string) => string;
}

/** react-hook-form + TextField glue used by every form (section 3.1). */
export function FormField<T extends FieldValues>({
  control,
  name,
  transform,
  ...rest
}: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { value, onChange, onBlur },
        fieldState: { error },
      }) => (
        <TextField
          value={value == null ? '' : String(value)}
          onChangeText={v => onChange(transform ? transform(v) : v)}
          onBlur={onBlur}
          error={error?.message}
          {...rest}
        />
      )}
    />
  );
}

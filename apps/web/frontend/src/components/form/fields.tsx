"use client";

import type { ReactNode } from "react";
import { ChevronIcon } from "@/components/icons";

type FieldPrimitiveProps = {
  id: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
};

export function FieldLabel({ id, label, required, optional }: FieldPrimitiveProps) {
  return (
    <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">
      {label}
      {required ? (
        <span className="text-primary" aria-hidden="true"> *</span>
      ) : null}
      {optional ? <span className="font-normal text-muted"> (optional)</span> : null}
    </label>
  );
}

export function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm font-medium text-danger">
      {error}
    </p>
  );
}

export function FieldWrapper({ id, error, children }: { id: string; error?: string; children: ReactNode }) {
  return (
    <div>
      {children}
      <FieldError id={id} error={error} />
    </div>
  );
}

type BaseInputProps = FieldPrimitiveProps & {
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  className?: string;
};

export function TextInput({
  id,
  name,
  label,
  required,
  optional,
  error,
  value,
  onChange,
  onBlur,
  type = "text",
  autoComplete,
  placeholder,
  className = "",
}: BaseInputProps & { type?: string; autoComplete?: string; placeholder?: string }) {
  return (
    <FieldWrapper id={id} error={error}>
      <FieldLabel id={id} label={label} required={required} optional={optional} />
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`field ${className}`}
      />
    </FieldWrapper>
  );
}

export function Select({
  id,
  name,
  label,
  required,
  optional,
  error,
  value,
  onChange,
  onBlur,
  options,
  placeholder = "Select an option",
  className = "",
}: BaseInputProps & { options: readonly string[]; placeholder?: string }) {
  return (
    <FieldWrapper id={id} error={error}>
      <FieldLabel id={id} label={label} required={required} optional={optional} />
      <div className="relative">
        <select
          id={id}
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`field appearance-none pr-10 ${className}`}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronIcon className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
      </div>
    </FieldWrapper>
  );
}

export function TextArea({
  id,
  name,
  label,
  required,
  optional,
  error,
  value,
  onChange,
  onBlur,
  rows = 5,
  placeholder,
  className = "",
}: BaseInputProps & { rows?: number; placeholder?: string }) {
  return (
    <FieldWrapper id={id} error={error}>
      <FieldLabel id={id} label={label} required={required} optional={optional} />
      <textarea
        id={id}
        name={name}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`field resize-y ${className}`}
      />
    </FieldWrapper>
  );
}

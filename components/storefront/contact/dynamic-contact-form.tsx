"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, Loader2 } from "lucide-react";

import {
  initialContactFormActionState,
  submitContactAction,
} from "@/app/(storefront)/contacto/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import type {
  StorefrontContactForm,
  StorefrontContactFormField,
  StorefrontContactFormValue,
} from "@/lib/storefront-api";

type ContactFormInputValue = StorefrontContactFormValue | "";
export type ContactFormValues = Record<string, ContactFormInputValue>;
export type ContactFormFieldErrors = Partial<Record<string, string>>;

type DynamicContactFormProps = {
  contactForm: StorefrontContactForm;
  className?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function getOrderedContactFormFields(
  fields: StorefrontContactFormField[],
): StorefrontContactFormField[] {
  return [...fields].sort((left, right) => left.order - right.order);
}

export function getRenderableContactFormFields(
  fields: StorefrontContactFormField[],
): StorefrontContactFormField[] {
  return getOrderedContactFormFields(fields).filter((field) => field.type !== "hidden");
}

export function buildContactFormInitialValues(
  fields: StorefrontContactFormField[],
): ContactFormValues {
  return getOrderedContactFormFields(fields).reduce<ContactFormValues>((values, field) => {
    if (field.defaultValue !== undefined) {
      values[field.key] = field.defaultValue;
      return values;
    }

    values[field.key] = field.type === "checkbox" ? false : "";
    return values;
  }, {});
}

function isBlankValue(value: ContactFormInputValue): boolean {
  return value === null || value === "" || (typeof value === "string" && value.trim() === "");
}

function getStringValue(value: ContactFormInputValue): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function isValidSelectOption(field: StorefrontContactFormField, value: string): boolean {
  return Boolean(field.options?.some((option) => option.value === value));
}

function validateStringField(
  field: StorefrontContactFormField,
  value: string,
): string | null {
  const validation = field.validation;

  if (field.type === "email" && value && !EMAIL_PATTERN.test(value)) {
    return "Ingresá un email válido.";
  }

  if (field.type === "select" && value && !isValidSelectOption(field, value)) {
    return "Seleccioná una opción válida.";
  }

  if (validation?.minLength !== undefined && value.length < validation.minLength) {
    return `Ingresá al menos ${validation.minLength} caracteres.`;
  }

  if (validation?.maxLength !== undefined && value.length > validation.maxLength) {
    return `Ingresá hasta ${validation.maxLength} caracteres.`;
  }

  if (validation?.pattern) {
    try {
      if (value && !new RegExp(validation.pattern).test(value)) {
        return "El formato no es válido.";
      }
    } catch {
      return null;
    }
  }

  return null;
}

function validateNumberField(
  field: StorefrontContactFormField,
  value: ContactFormInputValue,
): string | null {
  if (isBlankValue(value)) {
    return null;
  }

  const numberValue = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numberValue)) {
    return "Ingresá un número válido.";
  }

  if (field.validation?.min !== undefined && numberValue < field.validation.min) {
    return `Ingresá un valor mayor o igual a ${field.validation.min}.`;
  }

  if (field.validation?.max !== undefined && numberValue > field.validation.max) {
    return `Ingresá un valor menor o igual a ${field.validation.max}.`;
  }

  return null;
}

export function validateContactFormValues(
  fields: StorefrontContactFormField[],
  values: ContactFormValues,
): ContactFormFieldErrors {
  const errors: ContactFormFieldErrors = {};

  for (const field of getOrderedContactFormFields(fields)) {
    if (field.type === "hidden") {
      continue;
    }

    const value = values[field.key] ?? "";

    if (field.type === "checkbox") {
      if (field.required && value !== true) {
        errors[field.key] = "Este campo es obligatorio.";
      }
      continue;
    }

    if (field.required && isBlankValue(value)) {
      errors[field.key] = "Este campo es obligatorio.";
      continue;
    }

    if (field.type === "number") {
      const numberError = validateNumberField(field, value);
      if (numberError) {
        errors[field.key] = numberError;
      }
      continue;
    }

    const stringError = validateStringField(field, getStringValue(value));
    if (stringError) {
      errors[field.key] = stringError;
    }
  }

  return errors;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button className="h-11 w-full rounded-full px-6 sm:w-auto" type="submit" disabled={pending}>
      {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
      {pending ? "Enviando..." : label}
    </Button>
  );
}

function FieldMessage({ id, message }: { id: string; message: string | undefined }) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} className="text-sm font-medium text-destructive">
      {message}
    </p>
  );
}

function FieldHelper({ id, helperText }: { id: string; helperText: string | undefined }) {
  if (!helperText) {
    return null;
  }

  return (
    <p id={id} className="text-sm leading-6 text-muted-foreground">
      {helperText}
    </p>
  );
}

export function DynamicContactForm({ contactForm, className }: DynamicContactFormProps) {
  const [state, formAction] = useActionState(
    submitContactAction,
    initialContactFormActionState,
  );
  const fields = useMemo(
    () => getRenderableContactFormFields(contactForm.fields),
    [contactForm.fields],
  );
  const initialValues = useMemo(
    () => buildContactFormInitialValues(contactForm.fields),
    [contactForm.fields],
  );
  const [values, setValues] = useState<ContactFormValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<ContactFormFieldErrors>({});

  useEffect(() => {
    setValues(initialValues);
    setFieldErrors({});
  }, [initialValues]);

  useEffect(() => {
    if (state.status === "success") {
      setValues(initialValues);
      setFieldErrors({});
    }
  }, [initialValues, state.status]);

  function setFieldValue(key: string, value: ContactFormInputValue) {
    setValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
    setFieldErrors((currentErrors) => {
      if (!currentErrors[key]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[key];
      return nextErrors;
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const nextErrors = validateContactFormValues(contactForm.fields, values);

    if (Object.keys(nextErrors).length > 0) {
      event.preventDefault();
      setFieldErrors(nextErrors);
    }
  }

  return (
    <section className={cn("grid gap-5", className)}>
      <div className="grid gap-2">
        <h2 className="text-2xl font-black text-foreground">
          {contactForm.title ?? "Escribinos"}
        </h2>
        {contactForm.description ? (
          <p className="text-sm leading-6 text-muted-foreground">{contactForm.description}</p>
        ) : null}
      </div>

      <form className="grid gap-4" action={formAction} onSubmit={handleSubmit} noValidate>
        {fields.map((field) => {
          const inputId = `contact-${field.id}`;
          const errorId = `${inputId}-error`;
          const helperId = `${inputId}-helper`;
          const hasError = Boolean(fieldErrors[field.key]);
          const describedBy = [
            field.helperText ? helperId : null,
            hasError ? errorId : null,
          ].filter(Boolean).join(" ") || undefined;
          const label = field.label ?? field.key;
          const inputClassName = cn(
            "h-11 rounded-md border-border bg-background text-sm",
            hasError ? "border-destructive focus-visible:ring-destructive/20" : null,
          );

          if (field.type === "textarea") {
            return (
              <div key={field.id} className="grid gap-2">
                <label className="text-sm font-semibold text-foreground" htmlFor={inputId}>
                  {label}
                  {field.required ? <span className="text-destructive"> *</span> : null}
                </label>
                <textarea
                  id={inputId}
                  name={field.key}
                  className={cn(
                    "min-h-32 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    hasError ? "border-destructive focus-visible:ring-destructive/20" : null,
                  )}
                  placeholder={field.placeholder}
                  value={getStringValue(values[field.key] ?? "")}
                  aria-invalid={hasError}
                  aria-describedby={describedBy}
                  onChange={(event) => {
                    setFieldValue(field.key, event.target.value);
                  }}
                />
                <FieldHelper id={helperId} helperText={field.helperText} />
                <FieldMessage id={errorId} message={fieldErrors[field.key]} />
              </div>
            );
          }

          if (field.type === "select") {
            return (
              <div key={field.id} className="grid gap-2">
                <label className="text-sm font-semibold text-foreground" htmlFor={inputId}>
                  {label}
                  {field.required ? <span className="text-destructive"> *</span> : null}
                </label>
                <select
                  id={inputId}
                  name={field.key}
                  className={cn(
                    "h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    hasError ? "border-destructive focus-visible:ring-destructive/20" : null,
                  )}
                  value={getStringValue(values[field.key] ?? "")}
                  aria-invalid={hasError}
                  aria-describedby={describedBy}
                  onChange={(event) => {
                    setFieldValue(field.key, event.target.value);
                  }}
                >
                  <option value="">{field.placeholder ?? "Seleccioná una opción"}</option>
                  {(field.options ?? []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <FieldHelper id={helperId} helperText={field.helperText} />
                <FieldMessage id={errorId} message={fieldErrors[field.key]} />
              </div>
            );
          }

          if (field.type === "checkbox") {
            return (
              <div key={field.id} className="grid gap-2">
                <input type="hidden" name={field.key} value="false" />
                <label className="flex items-start gap-3 text-sm font-semibold text-foreground">
                  <input
                    className="mt-1 size-4 rounded border-border text-primary"
                    type="checkbox"
                    name={field.key}
                    value="true"
                    checked={values[field.key] === true}
                    aria-invalid={hasError}
                    aria-describedby={describedBy}
                    onChange={(event) => {
                      setFieldValue(field.key, event.target.checked);
                    }}
                  />
                  <span>
                    {label}
                    {field.required ? <span className="text-destructive"> *</span> : null}
                  </span>
                </label>
                <FieldHelper id={helperId} helperText={field.helperText} />
                <FieldMessage id={errorId} message={fieldErrors[field.key]} />
              </div>
            );
          }

          return (
            <div key={field.id} className="grid gap-2">
              <label className="text-sm font-semibold text-foreground" htmlFor={inputId}>
                {label}
                {field.required ? <span className="text-destructive"> *</span> : null}
              </label>
              <Input
                id={inputId}
                name={field.key}
                className={inputClassName}
                type={
                  field.type === "email" ? "email" : field.type === "number" ? "number" : "text"
                }
                inputMode={field.type === "phone" ? "tel" : field.type === "number" ? "decimal" : undefined}
                autoComplete={field.type === "email" ? "email" : field.type === "phone" ? "tel" : undefined}
                placeholder={field.placeholder}
                value={getStringValue(values[field.key] ?? "")}
                aria-invalid={hasError}
                aria-describedby={describedBy}
                min={field.type === "number" ? field.validation?.min : undefined}
                max={field.type === "number" ? field.validation?.max : undefined}
                minLength={field.type !== "number" ? field.validation?.minLength : undefined}
                maxLength={field.type !== "number" ? field.validation?.maxLength : undefined}
                pattern={field.validation?.pattern}
                onChange={(event) => {
                  setFieldValue(field.key, event.target.value);
                }}
              />
              <FieldHelper id={helperId} helperText={field.helperText} />
              <FieldMessage id={errorId} message={fieldErrors[field.key]} />
            </div>
          );
        })}

        <div className="grid gap-3 pt-2 sm:flex sm:items-center sm:justify-between">
          <SubmitButton label={contactForm.submitLabel ?? "Enviar consulta"} />
          <div className="min-h-6 text-sm" aria-live="polite">
            {state.status === "success" ? (
              <span className="inline-flex items-center gap-2 font-semibold text-foreground">
                <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
                {state.message ?? contactForm.successMessage ?? "Consulta enviada."}
              </span>
            ) : null}
            {state.status === "error" ? (
              <span className="font-medium text-destructive">{state.message}</span>
            ) : null}
          </div>
        </div>
      </form>
    </section>
  );
}

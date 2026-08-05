"use client";

import { useRef, useState } from "react";
import { TextInput } from "@/components/form/fields";
import { FormCard } from "@/components/form/FormCard";
import { FormSuccessCard } from "@/components/form/FormSuccessCard";
import { buildBody, mailtoHref } from "@/components/form/mailto";

type Values = {
  name: string;
  email: string;
};

type Errors = Partial<Record<keyof Values, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialValues: Values = { name: "", email: "" };

function validateField(field: keyof Values, value: string): string | undefined {
  switch (field) {
    case "name":
      return value.trim() ? undefined : "Please enter your name.";
    case "email":
      if (!value.trim()) return "Please enter your work email.";
      if (!EMAIL_RE.test(value.trim())) return "That email doesn't look right. Try name@company.com";
      return undefined;
    default:
      return undefined;
  }
}

function validate(values: Values): Errors {
  const errors: Errors = {};
  (Object.keys(initialValues) as Array<keyof Values>).forEach((field) => {
    const error = validateField(field, values[field]);
    if (error) errors[field] = error;
  });
  return errors;
}

export function TrialForm() {
  const [values, setValues] = useState<Values>(initialValues);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function setField(field: keyof Values, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function handleBlur(field: keyof Values) {
    const error = validateField(field, values[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);

    const firstInvalid = (Object.keys(nextErrors) as Array<keyof Values>).find(
      (field) => nextErrors[field],
    );
    if (firstInvalid) {
      formRef.current
        ?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)
        ?.focus();
      return;
    }

    const subject = `Trial access: ${values.name.trim()}`;
    const body = buildBody([
      `Name: ${values.name.trim()}`,
      `Email: ${values.email.trim()}`,
    ]);
    window.location.href = mailtoHref({ to: "sales@veracity.dev", subject, body });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <FormSuccessCard
        eyebrow="START YOUR TRIAL"
        note="14 DAYS · NO CREDIT CARD"
        heading="Almost there."
        fallbackEmail="sales@veracity.dev"
      >
        We&apos;ll send your 14-day trial credentials to{" "}
        <span className="font-semibold text-ink">{values.email}</span>. Each trial is set up by
        hand, so expect credentials within one business day. If your email client opened a draft,
        just hit send and we&apos;ll take it from there.
      </FormSuccessCard>
    );
  }

  return (
    <FormCard id="trial-form" eyebrow="START YOUR TRIAL" note="14 DAYS · NO CREDIT CARD">
      <form ref={formRef} onSubmit={handleSubmit} noValidate className="px-5 py-6 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextInput
            id="trial-name"
            name="name"
            label="Full name"
            required
            autoComplete="name"
            value={values.name}
            onChange={(value) => setField("name", value)}
            onBlur={() => handleBlur("name")}
            error={errors.name}
          />
          <TextInput
            id="trial-email"
            name="email"
            label="Work email"
            required
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={values.email}
            onChange={(value) => setField("email", value)}
            onBlur={() => handleBlur("email")}
            error={errors.email}
          />
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button type="submit" className="btn btn-primary">
            Start my free trial
          </button>
          <p className="text-sm font-medium text-muted">
            We reply to every request — usually within one business day.
          </p>
        </div>
      </form>
    </FormCard>
  );
}

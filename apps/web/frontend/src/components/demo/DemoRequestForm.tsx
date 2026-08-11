"use client";

import { useRef, useState } from "react";
import { Select, TextArea, TextInput } from "@/components/form/fields";
import { FormCard } from "@/components/form/FormCard";
import { FormSuccessCard } from "@/components/form/FormSuccessCard";
import { buildBody, mailtoHref } from "@/components/form/mailto";
import { submitLead } from "@/lib/lead";
import { demoItems } from "@/components/about/about-data";

const COMPANY_SIZES = ["10-50", "51-200", "201-500", "500+"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIME_WINDOWS = ["Morning (9 AM - 12 PM)", "Afternoon (12-3 PM)", "Late afternoon (3-6 PM)"];
const TIMEZONES = ["UTC", "GMT", "Eastern Time (ET)", "Central Time (CT)", "Mountain Time (MT)", "Pacific Time (PT)", "Central European Time (CET)", "India Standard Time (IST)", "Australian Eastern Time (AET)"];

type Values = {
  name: string;
  email: string;
  company: string;
  companySize: string;
  coverage: string;
  day: string;
  window: string;
  timezone: string;
  notes: string;
};

type Errors = Partial<Record<keyof Values, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialValues: Values = {
  name: "",
  email: "",
  company: "",
  companySize: "",
  coverage: "",
  day: "",
  window: "",
  timezone: "",
  notes: "",
};

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

export function DemoRequestForm() {
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

    const who = values.company.trim() || values.name.trim();
    const when = [values.day, values.window, values.timezone].filter(Boolean).join(", ");
    const subject = `Demo request: ${who}${when ? ` - ${when}` : ""}`;
    const body = buildBody([
      `Name: ${values.name.trim()}`,
      `Email: ${values.email.trim()}`,
      values.company.trim() ? `Company: ${values.company.trim()}` : null,
      values.companySize ? `Company size: ${values.companySize}` : null,
      values.coverage ? `Coverage focus: ${values.coverage}` : null,
      when ? `Preferred time: ${when}` : null,
      values.notes.trim() ? `Notes: ${values.notes.trim()}` : null,
    ]);

    // Primary delivery: open the visitor's mail client with a pre-filled
    // draft. They hit send in their client - no blocking network call.
    window.location.href = mailtoHref({ to: "sales@veracity.dev", subject, body });
    // Best-effort background capture for our own records. Never awaited, so
    // a slow/failed capture never delays the visitor's mail draft.
    void submitLead({
      kind: "demo",
      name: values.name.trim(),
      email: values.email.trim(),
      company: values.company.trim(),
      companySize: values.companySize,
      coverage: values.coverage,
      preferredTime: when,
      notes: values.notes.trim(),
    });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <FormSuccessCard
        eyebrow="BOOK A DEMO"
        note="30 MINUTES · LIVE"
        heading="We&apos;ll find you a time."
        fallbackEmail="sales@veracity.dev"
      >
        We&apos;ll reply to{" "}
        <span className="font-semibold text-ink">{values.email}</span> with a few available slots
        within one business day.
        <p className="mt-4">
          If your email client opened a draft, just hit send - either way, your request is on its
          way.
        </p>
      </FormSuccessCard>
    );
  }

  return (
    <FormCard id="demo-form" eyebrow="BOOK A DEMO" note="30 MINUTES · LIVE">
      <form ref={formRef} onSubmit={handleSubmit} noValidate className="px-5 py-6 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextInput
            id="demo-name"
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
            id="demo-email"
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
          <TextInput
            id="demo-company"
            name="company"
            label="Company"
            optional
            autoComplete="organization"
            value={values.company}
            onChange={(value) => setField("company", value)}
          />
          <Select
            id="demo-size"
            name="companySize"
            label="Company size"
            optional
            options={COMPANY_SIZES}
            value={values.companySize}
            onChange={(value) => setField("companySize", value)}
          />
          <div className="sm:col-span-2">
            <Select
              id="demo-coverage"
              name="coverage"
              label="What should we focus on?"
              optional
              placeholder="Full overview"
              options={demoItems}
              value={values.coverage}
              onChange={(value) => setField("coverage", value)}
            />
          </div>
          <Select
            id="demo-day"
            name="day"
            label="Preferred day"
            optional
            placeholder="Any day"
            options={DAYS}
            value={values.day}
            onChange={(value) => setField("day", value)}
          />
          <Select
            id="demo-window"
            name="window"
            label="Time of day"
            optional
            placeholder="Any time"
            options={TIME_WINDOWS}
            value={values.window}
            onChange={(value) => setField("window", value)}
          />
          <div className="sm:col-span-2">
            <Select
              id="demo-timezone"
              name="timezone"
              label="Your timezone"
              optional
              placeholder="Select a timezone"
              options={TIMEZONES}
              value={values.timezone}
              onChange={(value) => setField("timezone", value)}
            />
          </div>
          <div className="sm:col-span-2">
            <TextArea
              id="demo-notes"
              name="notes"
              label="Anything else we should know?"
              optional
              rows={4}
              placeholder="e.g. We're a 40-person remote product team evaluating screenshot monitoring on Growth."
              value={values.notes}
              onChange={(value) => setField("notes", value)}
            />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button type="submit" className="btn btn-primary">
            Request a demo
          </button>
          <p className="text-sm font-medium text-muted">
            We reply to every request - usually within one business day.
          </p>
        </div>
      </form>
    </FormCard>
  );
}
